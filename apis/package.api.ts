import { BaseResponse } from "@/types/APIResponse";
import { MembershipPackage } from "@/types/Package";
import { axiosClient } from "./client";

// --- PACKAGE APIs ---
export async function getMembershipPackages(): Promise<BaseResponse<MembershipPackage[]>> {
    try {
        const res = await axiosClient.get("/api/v1/membership-packages");
        return res.data;
    } catch (error: any) {
        if (error.response?.data) return error.response.data;
        throw error;
    }
}

export async function getPackageDetail(packageId: string): Promise<BaseResponse<MembershipPackage>> {
    try {
        const res = await axiosClient.get(`/api/v1/membership-packages/${packageId}`);
        return res.data;
    } catch (error: any) {
        if (error.response?.data) return error.response.data;
        throw error;
    }
}