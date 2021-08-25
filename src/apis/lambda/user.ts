import { User } from "../entity/user";
import UserMapper from '../mapper/UserMapper';
import { useContext, useInject } from '@midwayjs/hooks';
import Response from "../utils/response";
import Exception from "../exception/exception";
import { ErrorCode } from "../interface/res";
import crypto from 'crypto';
import Redis from '../utils/redis';
import * as uuid from 'uuid';
import { UserDTO } from "../interface/user";
import _ from 'lodash';
import UserService from "../service/userService";
import {parse} from "../utils/jsonHepler";

export async function register(user: User): Promise<Response<boolean>> {
  const logger = await useContext().logger;
  const userMapper = await useInject<UserMapper>(UserMapper);

  const user_id = uuid.v1();
  user.user_id = user_id;

  let hash = 0;
  // 计算 hash
  for (let i = 0; i < user_id.length; ++i) {
    hash += user_id.charCodeAt(i);
  }

  user.user_hash = hash;

  logger.info(`User:: user register start ${JSON.stringify(user)}`);

  const userFromSql = await userMapper.getUserByPhone(user.user_phone);

  if (userFromSql.length > 0) throw Exception.create(ErrorCode.USER_IS_EXITS);
  // 密码 md5 加密
  user.user_password = crypto.createHash('md5').update(user.user_password).digest('base64');

  const addResult = await userMapper.addUser(user);
  if (!addResult) throw Exception.innerError();

  logger.info(`User:: user register result ${JSON.stringify(addResult)}`);

  return Response.success<boolean>('成功', true);
}

export async function login(loginParams: {
  mobile?: string;
  captcha?: string;
  userName: string;
  password: string;
}): Promise<Response<UserDTO>> {
  const { userName, password } = loginParams;
  const userService = await useInject<UserService>(UserService);
  useContext().logger.info(`UserController ===== ${userName} login.`);
  const userDTO = await userService.login(userName, password);

  return Response.success<UserDTO>('登录成功!', userDTO);
}

/**
 * 退出登录
 * @returns {Promise<boolean>}
 */
export async function logout(): Promise<Response<boolean>> {
  const userService = await useInject<UserService>(UserService);
  const ctx = useContext();
  const userInfo = parse<UserDTO>(ctx.userInfo);
  ctx.logger.info(`UserController ${userInfo.userName} logout!`);
  const logoutResult = await userService.logout(ctx.headers.token);

  return logoutResult ?
    Response.success('退出登录成功!') :
    Response.failure(Exception.innerError());
}