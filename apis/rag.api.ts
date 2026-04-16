import type { BaseResponse } from '@/types/APIResponse';
import type { RAGChatRequest, RAGChatResponse } from '@/types/RAGChat';
import { axiosRAGClient } from './client';

// Python RAG server có thể trả về { answer: string } hoặc { data: { answer } }
// Normalize về BaseResponse để AIChatBubble dùng res?.data?.answer hoặc res?.answer
export async function chatWithAI(
    data: RAGChatRequest,
): Promise<BaseResponse<RAGChatResponse>> {
    const res = await axiosRAGClient.post('api/v1/chat/completion', data);
    const raw = res.data;

    // Nếu server đã wrap BaseResponse
    if (raw?.data?.answer !== undefined || raw?.success !== undefined) {
        return raw;
    }

    // Nếu server trả { answer: "..." } trực tiếp
    if (raw?.answer !== undefined) {
        return { success: true, code: 200, message: 'ok', data: { answer: raw.answer } };
    }

    return { success: true, code: 200, message: 'ok', data: raw };
}
