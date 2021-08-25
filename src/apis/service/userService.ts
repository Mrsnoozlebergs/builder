import { Provide, Inject, Logger } from '@midwayjs/decorator';
import Exception from '../exception/exception';
import UserMapper from '../mapper/UserMapper';
import { ILogger } from '@midwayjs/logger';
import Redis from '../utils/redis';
import * as uuid from 'uuid';
import crypto from 'crypto';
import _ from 'lodash';
import { parse } from "../utils/jsonHepler";
import {ErrorCode} from "../interface/res";
import {User} from "../entity/user";
import { UserDTO } from '../interface/user';

@Provide()
class UserService {
  @Logger()
  public logger: ILogger;
  @Inject()
  private userMapper: UserMapper;
  @Inject()
  private redis: Redis;

  public async login(userName: string, password: string): Promise<UserDTO> {
    // 账号密码登录
    const userFromSql = await this.userMapper.getUserByUserName(userName);
    // 账号不存在
    if (_.isEmpty(userFromSql)) throw Exception.create(Exception.ErrorCode.USER_NOT_EXITS);
    if (crypto.createHash('md5')
      .update(password)
      .digest('base64') === userFromSql?.user_password
    ) {
      // 密码正确
      const token = await this.redis.getValue(userFromSql.user_phone);
      const userDto: UserDTO = {};
      userDto.id = userFromSql.id;
      userDto.userAuthority = userFromSql.user_authority;
      userDto.userId = userFromSql.user_id;
      userDto.userName = userFromSql.user_name;
      userDto.userPhone = userFromSql.user_phone;
      userDto.userHash = userFromSql.user_hash;
      // 如果token存在，则更新过期时间
      if (token) {
        await this.redis.updateExpireTime(userFromSql!.user_phone);
        await this.redis.updateExpireTime(token);
        userDto.token = token;
      }
      // 如果 token 不存在 或 过期, 重新生成 token
      else {
        const newToken = uuid.v1();
        this.redis.setValue(userFromSql!.user_phone, newToken);

        this.redis.setValue(newToken, JSON.stringify(userDto));
        userDto.token = newToken;
      }

      return userDto;
    } else {
      throw Exception.create(Exception.ErrorCode.USER_CHECK_FAIL);
    }
  }

  public async logout(token: string): Promise<boolean> {
    if (!token || token.trim() === '') {
      throw Exception.create(Exception.ErrorCode.USER_LOGOUT_FAIL);
    }
    const userInfo = await this.redis.getValue(token);
    if (!userInfo) {
      throw Exception.create(Exception.ErrorCode.USER_LOGOUT_FAIL);
    }
    const { userPhone } = parse<UserDTO>(userInfo);
    // 清除 token
    await this.redis.delete(token);
    if (userPhone) {
      await this.redis.delete(userPhone);
    }

    return true;
  }

  public async register(user: UserDTO): Promise<boolean> {
    const userId = uuid.v1();
    const userDo = new User();
    let hash = 0;
    // 计算hash
    for (let i = 0; i < userId.length; i++) {
      hash += userId.charCodeAt(i);
    }
    userDo.user_id = userId;
    userDo.user_hash = hash;
    userDo.user_name = user.userName!;
    userDo.user_phone = user.userPhone!;
    userDo.user_authority = user.userAuthority!;
    userDo.user_create_time = new Date();
    this.logger.info(`User:: user register start ${JSON.stringify(userDo)}`);

    const userFromSql = await this.userMapper.getUserByPhone(user.userPhone!);
    if (userFromSql.length > 0) throw Exception.create(ErrorCode.USER_IS_EXITS);
    // 密码 md5 加密
    userDo.user_password = crypto.createHash('md5').update(user.userPassword!).digest('base64');

    const addResult = await this.userMapper.addUser(userDo);
    if (!addResult) throw Exception.innerError();

    this.logger.info(`User:: user register result ${JSON.stringify(addResult)}`);

    return true;
  }
}

export default UserService;