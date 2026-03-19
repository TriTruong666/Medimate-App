// apis/health.api.ts
import { BaseResponse } from "@/types/APIResponse";
import {
    FamilyHealthSummary,
    HealthCondition,
    HealthProfile,
    UpsertConditionRequest,
    UpsertHealthProfileRequest
} from "@/types/Health";
import { axiosClient } from "./client";

// ======================= HEALTH PROFILE =======================

// Lấy hồ sơ sức khỏe của 1 thành viên
export async function getHealthProfile(memberId: string): Promise<BaseResponse<HealthProfile>> {
    try {
        const res = await axiosClient.get(`/api/v1/health/member/${memberId}`);
        return res.data;
    } catch (error: any) {
        if (error.response?.data) return error.response.data;
        throw error;
    }
}

// Lấy tổng quan sức khỏe của cả gia đình
export async function getFamilyHealthProfiles(familyId: string): Promise<BaseResponse<FamilyHealthSummary[]>> {
    try {
        const res = await axiosClient.get(`/api/v1/health/family/${familyId}`);
        return res.data;
    } catch (error: any) {
        if (error.response?.data) return error.response.data;
        throw error;
    }
}

// Tạo mới hồ sơ sức khỏe cho thành viên
export async function createHealthProfile(memberId: string, data: UpsertHealthProfileRequest): Promise<BaseResponse<any>> {
    try {
        const res = await axiosClient.post(`/api/v1/health/member/${memberId}`, data);
        return res.data;
    } catch (error: any) {
        if (error.response?.data) return error.response.data;
        throw error;
    }
}

// Cập nhật hồ sơ sức khỏe cho thành viên
export async function updateHealthProfile(memberId: string, data: UpsertHealthProfileRequest): Promise<BaseResponse<any>> {
    try {
        const res = await axiosClient.put(`/api/v1/health/member/${memberId}`, data);
        return res.data;
    } catch (error: any) {
        if (error.response?.data) return error.response.data;
        throw error;
    }
}

// ======================= CONDITIONS =======================

// Thêm bệnh lý mới cho thành viên
export async function addHealthCondition(memberId: string, data: UpsertConditionRequest): Promise<BaseResponse<any>> {
    try {
        const res = await axiosClient.post(`/api/v1/health/member/${memberId}/conditions`, data);
        return res.data;
    } catch (error: any) {
        if (error.response?.data) return error.response.data;
        throw error;
    }
}

// Lấy chi tiết một bệnh lý
export async function getHealthCondition(conditionId: string): Promise<BaseResponse<HealthCondition>> {
    try {
        const res = await axiosClient.get(`/api/v1/health/conditions/${conditionId}`);
        return res.data;
    } catch (error: any) {
        if (error.response?.data) return error.response.data;
        throw error;
    }
}

// Cập nhật bệnh lý
export async function updateHealthCondition(conditionId: string, data: UpsertConditionRequest): Promise<BaseResponse<any>> {
    try {
        const res = await axiosClient.put(`/api/v1/health/conditions/${conditionId}`, data);
        return res.data;
    } catch (error: any) {
        if (error.response?.data) return error.response.data;
        throw error;
    }
}

// Xóa bệnh lý
export async function deleteHealthCondition(conditionId: string): Promise<BaseResponse<any>> {
    try {
        const res = await axiosClient.delete(`/api/v1/health/conditions/${conditionId}`);
        return res.data;
    } catch (error: any) {
        if (error.response?.data) return error.response.data;
        throw error;
    }
}