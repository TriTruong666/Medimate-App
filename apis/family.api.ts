import { BaseResponse } from "@/types/APIResponse";
import { FamilyMember } from "@/types/Family";
import { axiosClient } from "./client";

// apis/family.api.ts
export async function createPersonalFamily(): Promise<BaseResponse<any>> {
    // Gửi request POST trống
    const res = await axiosClient.post(`/api/v1/families/personal`, {});
    return res.data;
}
export async function createSharedFamily(familyName: string): Promise<BaseResponse<any>> {
    // Gửi request POST kèm theo body là familyName
    const res = await axiosClient.post(`/api/v1/families/shared`, { familyName });
    return res.data;
}
export async function getMembersByFamilyId(familyId: string): Promise<BaseResponse<FamilyMember[]>> {
    // Khớp với ảnh image_c6f93e.png: /api/v1/members/family/{familyId}
    const res = await axiosClient.get(`/api/v1/members/family/${familyId}`);
    return res.data;
}