import base from '../../../base.config.json';
import { join } from 'path';

module.exports = (appInfo: any) => {
  const exports = {} as any;

  exports.staticFile = {
    prefix: '/',
    dir: join(appInfo.baseDir, '../build'),
  };

  exports.orm = {
    type: 'mysql',
    host: '159.75.89.4',
    port: 3306,
    username: 'root',
    password: base.password,
    database: 'build',
    synchronize: false,
    logging: true,
  }

  exports.middleware = [
    'handleErrorMiddleware',
    'filter',
    'uidGenerator'
  ]

  return exports;
};
