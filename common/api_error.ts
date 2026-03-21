import { AxiosError } from "axios";

type ApiErrorPayload = {
    code?: unknown;
    message?: string | null;
};

export const HttpStatusCode = {
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    SERVER_ERROR: 500,
} as const;

export const ApiErrorCode = {
    EMAIL_EXISTS: "EMAIL_EXISTS",
    PHONE_EXISTS: "PHONE_EXISTS",
    USER_NOT_FOUND: "USER_NOT_FOUND",
    MEMBERSHIP_PACKAGE_IN_USE: "MEMBERSHIP_PACKAGE_IN_USE",
    ACCESS_DENIED: "ACCESS_DENIED",
    TOKEN_INVALID: "TOKEN_INVALID",
    UNKNOWN: "UNKNOWN",
} as const;

export const ErrorCode = {
    ...HttpStatusCode,
    ...ApiErrorCode,
} as const;

export type HttpStatusCode =
    (typeof HttpStatusCode)[keyof typeof HttpStatusCode];
export type ApiErrorCode = (typeof ApiErrorCode)[keyof typeof ApiErrorCode];
export type ErrorCode = (typeof ErrorCode)[keyof typeof ErrorCode];

export const DEFAULT_HTTP_ERROR_MESSAGES: Record<HttpStatusCode, string> = {
    [HttpStatusCode.BAD_REQUEST]: "Dữ liệu gửi lên không hợp lệ.",
    [HttpStatusCode.UNAUTHORIZED]:
        "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.",
    [HttpStatusCode.FORBIDDEN]: "Bạn không có quyền thực hiện thao tác này.",
    [HttpStatusCode.NOT_FOUND]: "Không tìm thấy dữ liệu.",
    [HttpStatusCode.CONFLICT]: "Dữ liệu bị trùng hoặc xung đột.",
    [HttpStatusCode.SERVER_ERROR]: "Máy chủ đang gặp sự cố. Vui lòng thử lại.",
};

export const DEFAULT_API_ERROR_MESSAGES: Record<ApiErrorCode, string> = {
    [ApiErrorCode.EMAIL_EXISTS]: "Email này đã được sử dụng.",
    [ApiErrorCode.PHONE_EXISTS]: "Số điện thoại này đã được sử dụng.",
    [ApiErrorCode.USER_NOT_FOUND]: "Không tìm thấy người dùng.",
    [ApiErrorCode.MEMBERSHIP_PACKAGE_IN_USE]:
        "Không thể xóa gói vì đang có người dùng đăng ký.",
    [ApiErrorCode.ACCESS_DENIED]: "Bạn không có quyền thực hiện thao tác này.",
    [ApiErrorCode.TOKEN_INVALID]:
        "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.",
    [ApiErrorCode.UNKNOWN]: "Đã có lỗi xảy ra. Vui lòng thử lại.",
};

export function translateErrorMessage(
    code: unknown,
    message?: string | null,
): string {
    if (message && message.trim()) return message;

    if (typeof code === "string" && code in DEFAULT_API_ERROR_MESSAGES) {
        return DEFAULT_API_ERROR_MESSAGES[code as ApiErrorCode];
    }

    if (typeof code === "number" && code in DEFAULT_HTTP_ERROR_MESSAGES) {
        return DEFAULT_HTTP_ERROR_MESSAGES[code as HttpStatusCode];
    }

    return DEFAULT_API_ERROR_MESSAGES[ApiErrorCode.UNKNOWN];
}

export function getApiErrorMessage(error: unknown): string {
    if (error instanceof AxiosError) {
        const data = error.response?.data;
        const errorData = data?.error as ApiErrorPayload | undefined;

        const message = errorData?.message || data?.message;
        const code = errorData?.code ?? data?.code;

        return translateErrorMessage(code, message);
    }
    return "Không thể kết nối đến máy chủ. Vui lòng thử lại.";
}