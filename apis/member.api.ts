// apis/member.api.ts
import { BaseResponse } from "@/types/APIResponse";
import { CreateDependentRequest, FamilyMember, GenerateLoginCodeResponse } from "@/types/Member";
import { axiosClient } from "./client";

// 1. Tạo thành viên phụ thuộc (Dependent)
export async function createDependentMember(data: CreateDependentRequest): Promise<BaseResponse<any>> {
    try {
        const res = await axiosClient.post(`/api/v1/members/create-dependent-member`, data);
        return res.data;
    } catch (error: any) {
        if (error.response && error.response.data) return error.response.data;
        throw error;
    }
}

// 2. Tạo mã QR đăng nhập cho thành viên phụ thuộc
export async function generateDependentLoginCode(memberId: string): Promise<BaseResponse<GenerateLoginCodeResponse>> {
    try {
        // Chú ý: memberId được truyền qua query params (?memberId=...)
        const res = await axiosClient.post(`/api/v1/members/generate-dependent-logincode?memberId=${memberId}`, {});
        return res.data;
    } catch (error: any) {
        if (error.response && error.response.data) return error.response.data;
        throw error;
    }
}

// 3. Lấy chi tiết một thành viên
export async function getMemberById(id: string): Promise<BaseResponse<FamilyMember>> {
    try {
        const res = await axiosClient.get(`/api/v1/members/${id}`);
        return res.data;
    } catch (error: any) {
        if (error.response && error.response.data) return error.response.data;
        throw error;
    }
}

// 4. Cập nhật thông tin thành viên (multipart/form-data)
export async function updateMember(id: string, formData: FormData): Promise<BaseResponse<any>> {
    try {
        const res = await axiosClient.put(`/api/v1/members/${id}`, formData, {
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

// 5. Xóa thành viên khỏi gia đình (Remove - Soft delete / Unlink)
export async function removeMember(id: string): Promise<BaseResponse<any>> {
    try {
        const res = await axiosClient.put(`/api/v1/members/remove/${id}`, {});
        return res.data;
    } catch (error: any) {
        if (error.response && error.response.data) return error.response.data;
        throw error;
    }
}

// 6. Xóa vĩnh viễn thành viên (Delete - Hard delete)
export async function deleteMember(id: string): Promise<BaseResponse<any>> {
    try {
        const res = await axiosClient.delete(`/api/v1/members/delete/${id}`);
        return res.data;
    } catch (error: any) {
        if (error.response && error.response.data) return error.response.data;
        throw error;
    }
}