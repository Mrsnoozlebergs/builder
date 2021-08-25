import '@midwayjs/faas';

declare module '@midwayjs/faas' {
  interface FaaSContext {
    userInfo: string;
    uid: string;
  }
}