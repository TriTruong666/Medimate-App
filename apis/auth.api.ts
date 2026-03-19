import { BaseResponse } from "@/types/APIResponse";
import { LoginDependentRequest, LoginRequest, LoginResponse, RegisterRequest, VerifyOtpRequest } from "@/types/Auth";
import { axiosClient } from "./client";

export async function loginUser(data: LoginRequest): Promise<BaseResponse<LoginResponse>> {
    try {
        const res = await axiosClient.post(`/api/v1/auth/login/user`, data);
        return res.data;
    } catch (error: any) {
        // Bắt lỗi 400/500 từ Backend và trả về object lỗi chuẩn để UI xử lý
        if (error.response && error.response.data) return error.response.data;
        throw error;
    }
}

export async function registerUser(data: RegisterRequest): Promise<BaseResponse<any>> {
    try {
        const res = await axiosClient.post(`/api/v1/auth/register`, data);
        return res.data;
    } catch (error: any) {
        if (error.response && error.response.data) return error.response.data;
        throw error;
    }
}

export async function verifyOtp(data: VerifyOtpRequest): Promise<BaseResponse<any>> {
    try {
        // Data bây giờ sẽ truyền đúng { email, verifyCode }
        const res = await axiosClient.post(`/api/v1/auth/verify-otp`, data);
        return res.data;
    } catch (error: any) {
        if (error.response && error.response.data) return error.response.data;
        throw error;
    }
}

export async function loginDependent(data: LoginDependentRequest): Promise<BaseResponse<any>> {
    try {
        const res = await axiosClient.post(`/api/v1/auth/login-dependent`, data);
        return res.data;
    } catch (error: any) {
        if (error.response && error.response.data) return error.response.data;
        throw error;
    }
}

export async function logoutUser(): Promise<BaseResponse<any>> {
    try {
        const res = await axiosClient.post(`/api/v1/auth/logout`, {});
        return res.data;
    } catch (error: any) {
        if (error.response && error.response.data) return error.response.data;
        throw error;
    }
}