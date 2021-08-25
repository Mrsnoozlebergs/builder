import { ErrorCode, ErrorCodeMsg } from "../interface/res";

export default class Exception extends Error {
  private readonly _msg: string;
  private readonly _code: ErrorCode;
  public static ErrorCode: typeof ErrorCode = ErrorCode;

  constructor(code: ErrorCode, msg?: string) {
    super(msg);
    this._msg = msg || ErrorCodeMsg[code];
    this._code = code;
  }

  public get msg() {
    return this._msg;
  }

  public get code() {
    return this._code;
  }

  static create(code: ErrorCode, msg?: string) {
    return new Exception(code, msg);
  }

  static innerError() {
    return new Exception(ErrorCode.INNER_ERROR);
  }
}
