import * as AIModelService from '@/apis/aiModel.api';
import * as RAGService from '@/apis/rag.api';
import type { RAGChatRequest } from '@/types/RAGChat';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useFetch } from '../useFetch';

export function useChatWithAI() {
    return useMutation({
        mutationFn: (data: RAGChatRequest) => RAGService.chatWithAI(data),
    });
}

export function useGetAIModels() {
    // Python RAG server trả về AIModel[] trực tiếp, không wrap BaseResponse
    // nên dùng useQuery thả thành thay vì useFetch
    const { data, isLoading, isError, error, refetch } = useQuery({
        queryKey: ['ai-models'],
        queryFn: () => AIModelService.getAIModelList({ skip: 0, limit: 50 }),
        staleTime: 5 * 60 * 1000, // 5 phút cache
    });
    return { data: data ?? [], isLoading, isError, error, refetch };
}
