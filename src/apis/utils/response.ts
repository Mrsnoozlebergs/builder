import { ErrorCode, ResponseCode } from "../interface/res";
import Exception from "../exception/exception";

export default class Response<T = any> {
  public readonly data: T | null;
  public readonly success: ResponseCode;
  public readonly code: ErrorCode | undefined;
  public readonly msg: string | undefined;

  constructor(success: ResponseCode, data?: T | null, msg?: string, error?: Exception) {
    this.data = data || null;
    this.success = success;
    this.msg = msg;
    if (error) {
      this.code = error.code;
      this.msg = error.msg;
    }
  }

  public static success<T>(msg: string, data?: T): Response<T> {
    return new Response<T>(ResponseCode.SUCCESS, data, msg);
  }

  public static failure<T>(error: Exception, data?: T): Response<T> {
    return new Response<T>(ResponseCode.FAILURE, data, '', error);
  }
}
