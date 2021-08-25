import { Provide, Inject } from "@midwayjs/decorator";
import { FaaSContext } from '@midwayjs/faas';
import Response from "../utils/response";
import Exception from "../exception/exception";
import { ErrorCode } from "../interface/res";
import Redis from "../utils/redis";

const WHITLE_LIST = [
  '/api/user/login',
  '/api/user/register',
  '/api/page/getPageByPageEnterId'
];

@Provide('filter')
export default class Filter {
  @Inject()
  redis: Redis;

  resolve() {
    return async (ctx: FaaSContext, next: any) => {
      const headers = ctx.headers;
      const token = headers?.token ?? '';
      const url = headers?.url ?? '/';

      if (WHITLE_LIST.includes(url)) {
        return await next();
      }

      if ((!token || token.trim() === '')) {
        ctx.status = 403;
        ctx.body = Response.failure(Exception.create(ErrorCode.FORBIDDEN_ACCESS));
        return;
      } else {
        const userInfo = await this.redis.getValue(token);
        if (!userInfo) {
          ctx.status = 403;
          ctx.body = Response.failure(Exception.create(ErrorCode.FORBIDDEN_ACCESS));
          return;
        } else {
          try {
            ctx.userInfo = userInfo;
            const info = JSON.parse(userInfo);
            // 更新过期时间
            await this.redis.updateExpireTime(token);
            await this.redis.updateExpireTime(info.userPhone);
          } catch (err) {
            console.log('err: ', err);
            ctx.status = 500;
            ctx.body = Response.failure(Exception.innerError());
            return;
          }
        }
      }

      await next();
    }
  }
}