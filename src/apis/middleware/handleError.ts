import { Provide } from "@midwayjs/decorator";
import { FaaSContext } from '@midwayjs/faas';
import Response from "../utils/response";
import Exception from "../exception/exception";
import typeUtils from '../utils/type';

@Provide('handleErrorMiddleware')
export default class HandleErrorMiddleware {
  resolve() {
    return async (ctx: FaaSContext, next: any) => {
      const now = new Date();
      const logger = ctx.logger;
      try {
        logger.info(`request:: [${now.toLocaleString()}]\nUrl: ${ctx.headers?.url}\nMethod: ${ctx.method.toUpperCase()}\nstart params: ${JSON.stringify(
          (ctx.method.toLowerCase() === 'get' && ctx.request.pathParameters) ||
          (ctx.method.toLowerCase() === 'post' && ctx.request.body) ||
          ''
        )}`)
        await next();
      } catch (error) {
          if (typeUtils.getIsType<Exception>('Error')(error)) {
          logger.error?.(error.msg ?? error.message);
          ctx.body = error.code ? 
            Response.failure(Exception.create(error.code, error.msg)) :
            Response.failure(Exception.innerError());
          return;
        }
        return;
      } finally {
        const afterNow = new Date();
        logger.info(`request:: [${afterNow.toLocaleString()}] end result: ${JSON.stringify(ctx.body)} cost time ${afterNow.getTime() - now.getTime()}`)
      }
    }
  }
}
