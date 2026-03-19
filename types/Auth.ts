// types/Auth.ts
export type LoginRequest = {
    identifier: string; // Tương ứng với Email hoặc SĐT
    password: string;
    fcmToken?: string;  // Để nhận thông báo Push Notification (nếu có)
};

export type LoginResponse = {
    token: string;
    // Bạn có thể bổ sung thêm các trường khác nếu API trả về (VD: user info)
};

export type RegisterRequest = {
    fullName: string;
    email: string;
    phoneNumber: string;
    password: string;
};
export type VerifyOtpRequest = {
    email: string;
    verifyCode: string;
};

export type LoginDependentRequest = {
    qrData: string;
    fcmToken?: string; // Token quét được từ mã QR (VD: chuỗi 32 ký tự)
};