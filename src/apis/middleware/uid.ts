import { Provide } from '@midwayjs/decorator';
import { FaaSContext } from '@midwayjs/faas';
import * as uuid from 'uuid';

@Provide('uidGenerator')
export default class UidGenerator {
  resolve() {
    return async (ctx: FaaSContext, next: any) => {
      const cookies = ctx.cookies;
      const uid = cookies.get('uid');

      if (!uid) {
        const id = uuid.v4();
        cookies.set('uid', id, {
          path: '/',
          maxAge: 7 * 24 * 60 * 60 * 1000,
          expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          httpOnly: false,
          overwrite: false
        })
        ctx.uid = id;
      } else {
        ctx.uid = uid;
      }

      await next();
    }
  }
}