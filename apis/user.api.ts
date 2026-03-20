// apis/user.api.ts
import { BaseResponse } from "@/types/APIResponse";
import { ChangePasswordRequest, DeleteUserRequest, UserData } from "@/types/User";
import { axiosClient } from "./client";
// 1. Lấy thông tin User hiện tại
export async function getMe(): Promise<BaseResponse<UserData>> {
    try {
        const res = await axiosClient.get(`/api/v1/users/me`);
        return res.data;
    } catch (error: any) {
        if (error.response && error.response.data) return error.response.data;
        throw error;
    }
}

// 2. Cập nhật thông tin cá nhân (multipart/form-data)
export async function updateMe(formData: FormData): Promise<BaseResponse<any>> {
    try {
        const res = await axiosClient.put(`/api/v1/users/me`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        return res.data;
    } catch (error: any) {
        if (error.response && error.response.data) return error.response.data;
        throw error;
    }
}

// 3. Đổi mật khẩu
export async function changePassword(data: ChangePasswordRequest): Promise<BaseResponse<any>> {
    try {
        const res = await axiosClient.put(`/api/v1/users/me/change-password`, data);
        return res.data;
    } catch (error: any) {
        if (error.response && error.response.data) return error.response.data;
        throw error;
    }
}

// 4. Xóa tài khoản
export async function deleteMe(data: DeleteUserRequest): Promise<BaseResponse<any>> {
    try {
        // Axios delete method hỗ trợ gửi data thông qua thuộc tính 'data' trong config
        const res = await axiosClient.delete(`/api/v1/users/me`, { data });
        return res.data;
    } catch (error: any) {
        if (error.response && error.response.data) return error.response.data;
        throw error;
    }
}