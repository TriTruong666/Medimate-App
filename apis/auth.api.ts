// apis/auth.api.ts
import { BaseResponse } from "@/types/APIResponse";
import { LoginDependentRequest, LoginRequest, LoginResponse, RegisterRequest, VerifyOtpRequest } from "@/types/Auth";
import { axiosClient } from "./client";

export async function loginUser(data: LoginRequest): Promise<BaseResponse<LoginResponse>> {
    const res = await axiosClient.post(`/api/v1/auth/login/user`, data);
    return res.data;
}




export async function registerUser(data: RegisterRequest): Promise<BaseResponse<any>> {
    const res = await axiosClient.post(`/api/v1/auth/register`, data);
    return res.data;
}
export async function verifyOtp(data: VerifyOtpRequest): Promise<BaseResponse<any>> {
    const res = await axiosClient.post(`/api/v1/auth/verify-otp`, data);
    return res.data;
}
export async function loginDependent(data: LoginDependentRequest): Promise<BaseResponse<any>> {
    // Thay đổi URL nếu Endpoint của bạn khác
    const res = await axiosClient.post(`/api/v1/auth/login-dependent`, data);
    return res.data;
}
