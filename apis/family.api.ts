import { BaseResponse } from "@/types/APIResponse";
import { FamilyData, FamilyMember, SubscriptionData, UpdateFamilyRequest } from "@/types/Family";
import { axiosClient } from "./client";

export async function createPersonalFamily(): Promise<BaseResponse<any>> {
    try {
        const res = await axiosClient.post(`/api/v1/families/personal`, {});
        return res.data;
    } catch (error: any) {
        if (error.response && error.response.data) return error.response.data;
        throw error;
    }
}

export async function createSharedFamily(familyName: string): Promise<BaseResponse<any>> {
    try {
        const res = await axiosClient.post(`/api/v1/families/shared`, { familyName });
        return res.data;
    } catch (error: any) {
        if (error.response && error.response.data) return error.response.data;
        throw error;
    }
}

export async function getMembersByFamilyId(familyId: string): Promise<BaseResponse<FamilyMember[]>> {
    try {
        const res = await axiosClient.get(`/api/v1/members/family/${familyId}`);
        return res.data;
    } catch (error: any) {
        if (error.response && error.response.data) return error.response.data;
        throw error;
    }
}

export async function getFamilies(): Promise<BaseResponse<FamilyData[]>> {
    try {
        const res = await axiosClient.get(`/api/v1/families`);
        return res.data;
    } catch (error: any) {
        if (error.response && error.response.data) return error.response.data;
        throw error;
    }
}

export async function getSubscription(familyId: string): Promise<BaseResponse<SubscriptionData>> {
    try {
        const res = await axiosClient.get(`/api/v1/families/${familyId}/subscription`);
        return res.data;
    } catch (error: any) {
        if (error.response && error.response.data) return error.response.data;
        throw error;
    }
}

export async function getFamilyById(id: string): Promise<BaseResponse<FamilyData>> {
    try {
        const res = await axiosClient.get(`/api/v1/families/${id}`);
        return res.data;
    } catch (error: any) {
        if (error.response && error.response.data) return error.response.data;
        throw error;
    }
}

// Cập nhật thông tin gia đình
export async function updateFamily(id: string, data: UpdateFamilyRequest): Promise<BaseResponse<any>> {
    try {
        const res = await axiosClient.put(`/api/v1/families/${id}`, data);
        return res.data;
    } catch (error: any) {
        if (error.response && error.response.data) return error.response.data;
        throw error;
    }
}

// Xóa gia đình
export async function deleteFamily(id: string): Promise<BaseResponse<any>> {
    try {
        const res = await axiosClient.delete(`/api/v1/families/${id}`);
        return res.data;
    } catch (error: any) {
        if (error.response && error.response.data) return error.response.data;
        throw error;
    }
}