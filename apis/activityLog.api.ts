import { BaseResponse } from "@/types/APIResponse";
import { ActivityLogResponse } from "@/types/ActivityLog";
import { axiosClient } from "./client";

// Lấy lịch sử hoạt động của gia đình (Có phân trang)
export async function getFamilyActivityLogs(
    familyId: string,
    page: number = 1,
    pageSize: number = 20
): Promise<BaseResponse<ActivityLogResponse[]>> {
    try {
        const res = await axiosClient.get(`/api/v1/families/${familyId}/activity-logs`, {
            params: { page, pageSize }
        });
        return res.data;
    } catch (error: any) {
        if (error.response?.data) return error.response.data;
        throw error;
    }
}