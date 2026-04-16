import type { AIModel, AIModelListParams } from '@/types/RAGAIModel';
import { axiosRAGClient } from './client';

// RAG Python server trả về array trực tiếp, không wrap BaseResponse
export async function getAIModelList(params?: AIModelListParams): Promise<AIModel[]> {
    const res = await axiosRAGClient.get('api/v1/ai-models', { params });
    // Nếu backend wrap trong data field thì lấy res.data.data, fallback res.data
    return Array.isArray(res.data) ? res.data : (res.data?.data ?? res.data);
}
