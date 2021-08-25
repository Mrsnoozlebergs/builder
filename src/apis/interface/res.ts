export enum ErrorCode {
    // user
    USER_IS_EXITS = 1001,
    USER_NOT_EXITS,
    USER_PHONE_IS_NOT_VALID,
    USER_PASSWORD_IS_NOT_VALID,
    USER_CHECK_FAIL,
    USER_LOGOUT_FAIL,

    // page
    PAGE_NOT_EXITS = 2001,
    PAGE_EXCEED_MAX_LENGTH = 2002,

    // setting

    // schema
    SCHEMA_NOT_EXITS = 4001,

    // inner
    INNER_ERROR = 9001,
    FORBIDDEN_ACCESS = 9002,
    UID_NOT_VALID = 9003,
    DELETE_FAILED,
    ADD_FAILED,
    UPDATE_FAILED,
    GET_FAILED
}

export const ErrorCodeMsg: {
    [key in ErrorCode]: string;
} = {
    // user
    [ErrorCode.USER_IS_EXITS]: '用户已存在',
    [ErrorCode.USER_NOT_EXITS]: '用户不存在',
    [ErrorCode.USER_PHONE_IS_NOT_VALID]: '电话号码非法',
    [ErrorCode.USER_PASSWORD_IS_NOT_VALID]: '密码格式非法',
    [ErrorCode.USER_CHECK_FAIL]: '账号或密码错误',
    [ErrorCode.USER_LOGOUT_FAIL]: '退出登录失败',

    // page
    [ErrorCode.PAGE_NOT_EXITS]: '页面不存在',
    [ErrorCode.PAGE_EXCEED_MAX_LENGTH]: '页面数量超出上限',

    // setting

    // schema
    [ErrorCode.SCHEMA_NOT_EXITS]: 'schema不存在',

    // inner
    [ErrorCode.INNER_ERROR]: '服务器内部错误',
    [ErrorCode.FORBIDDEN_ACCESS]: '未登录/禁止访问',
    [ErrorCode.UID_NOT_VALID]: 'uid 非法',
    [ErrorCode.DELETE_FAILED]: '删除失败',
    [ErrorCode.GET_FAILED]: '获取失败',
    [ErrorCode.ADD_FAILED]: '添加失败',
    [ErrorCode.UPDATE_FAILED]: '更新失败',
}

export enum ResponseCode {
    SUCCESS,
    FAILURE
}
