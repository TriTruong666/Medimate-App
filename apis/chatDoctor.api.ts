import { BaseResponse } from "@/types/APIResponse";
import { ChatMessageResponse, ChatSessionResponse } from "@/types/ChatDoctor";
import { axiosClient } from "./client";

// Lấy danh sách phiên chat của gia đình
export async function getFamilyChatSessions(familyId: string): Promise<BaseResponse<ChatSessionResponse[]>> {
    try {
        const res = await axiosClient.get(`/api/v1/chatdoctor/families/${familyId}/sessions`);
        return res.data;
    } catch (error: any) {
        if (error.response?.data) return error.response.data;
        throw error;
    }
}

// Lấy nội dung tin nhắn trong 1 phiên chat
export async function getChatMessages(sessionId: string): Promise<BaseResponse<ChatMessageResponse[]>> {
    try {
        const res = await axiosClient.get(`/api/v1/chatdoctor/sessions/${sessionId}/messages`);
        return res.data;
    } catch (error: any) {
        if (error.response?.data) return error.response.data;
        throw error;
    }
}

// Gửi tin nhắn (Hỗ trợ upload File/Hình ảnh)
export async function sendChatMessage(sessionId: string, content: string, file?: any): Promise<BaseResponse<ChatMessageResponse>> {
    try {
        const formData = new FormData();
        if (content) formData.append("Content", content);
        if (file) formData.append("AttachmentFile", file);

        const res = await axiosClient.post(`/api/v1/chatdoctor/sessions/${sessionId}/messages`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return res.data;
    } catch (error: any) {
        if (error.response?.data) return error.response.data;
        throw error;
    }
}