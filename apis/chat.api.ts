import { BaseResponse } from "@/types/APIResponse";
import { MessageDto, SessionDetailDto, UploadFile } from "@/types/Chat";
import { axiosClient } from "./client";

// ─── Lấy chi tiết phiên chat (Session Details) ─────────────────
export async function getSessionDetails(sessionId: string, isDoctorRequest: boolean = false): Promise<BaseResponse<SessionDetailDto>> {
    try {
        const res = await axiosClient.get(`/api/v1/chatdoctor/sessions/${sessionId}/details`, {
            params: { isDoctorRequest }
        });
        return res.data;
    } catch (error: any) {
        if (error.response?.data) return error.response.data;
        throw error;
    }
}

// ─── Lấy danh sách tin nhắn ────────────────────────────────────
export async function getMessages(sessionId: string): Promise<BaseResponse<MessageDto[]>> {
    try {
        const res = await axiosClient.get(`/api/v1/chatdoctor/sessions/${sessionId}/messages`);
        return res.data;
    } catch (error: any) {
        if (error.response?.data) return error.response.data;
        throw error;
    }
}

// ─── Đánh dấu tin nhắn đã đọc ──────────────────────────────────
export async function markMessagesAsRead(sessionId: string): Promise<BaseResponse<boolean>> {
    try {
        const res = await axiosClient.put(`/api/v1/chatdoctor/sessions/${sessionId}/messages/read`);
        return res.data;
    } catch (error: any) {
        if (error.response?.data) return error.response.data;
        throw error;
    }
}

// ─── Gửi tin nhắn (Có hỗ trợ đính kèm ảnh/file) ────────────────
export async function sendMessage(sessionId: string, content: string, file?: UploadFile): Promise<BaseResponse<MessageDto>> {
    try {
        const formData = new FormData();

        if (content) {
            formData.append("Content", content);
        }

        // Cấu trúc bắt buộc để React Native gửi file qua multipart/form-data
        if (file) {
            formData.append("AttachmentFile", {
                uri: file.uri,
                name: file.name,
                type: file.type,
            } as any);
        }

        const res = await axiosClient.post(
            `/api/v1/chatdoctor/sessions/${sessionId}/messages`,
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            }
        );
        return res.data;
    } catch (error: any) {
        if (error.response?.data) return error.response.data;
        throw error;
    }
}