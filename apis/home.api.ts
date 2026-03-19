// apis/home.api.ts
import { BaseResponse } from "@/types/APIResponse";
import { FamilyData, SubscriptionData } from "@/types/Home";
import { axiosClient } from "./client";

// API lấy danh sách gia đình (để check xem đã có hồ sơ chưa)
export async function getFamilies(): Promise<BaseResponse<FamilyData[]>> {
    const res = await axiosClient.get(`/api/v1/families`);
    return res.data;
}

// API lấy thông tin gói dịch vụ của một gia đình cụ thể
export async function getSubscription(familyId: string): Promise<BaseResponse<SubscriptionData>> {
    const res = await axiosClient.get(`/api/v1/families/${familyId}/subscription`);
    return res.data;
}