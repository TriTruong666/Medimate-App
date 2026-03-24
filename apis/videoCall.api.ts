import { BaseResponse } from "@/types/APIResponse";
import { axiosClient } from "./client";

export async function getVideoCallToken(sessionId: string, role: string = "publisher"): Promise<BaseResponse<string>> {
    try {
        const res = await axiosClient.get(`/api/v1/video-call/token/${sessionId}`, {
            params: { role }
        });
        return res.data;
    } catch (error: any) {
        if (error.response?.data) return error.response.data;
        throw error;
    }
}