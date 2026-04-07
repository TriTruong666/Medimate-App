import * as TransactionApi from "@/apis/transaction.api";
import { TransactionFilterRequest, UpdateStatusRequest } from "@/types/Payment";
import { useMutation, useQuery } from "@tanstack/react-query";

export function useGetTransactionsByUserId(userId: string | undefined, filters: TransactionFilterRequest) {
    return useQuery({
        // Thêm các dependency vào queryKey để tự động refetch khi filter thay đổi
        queryKey: ["transactions", userId, filters],
        queryFn: async () => {
            if (!userId) throw new Error("Missing User ID");
            const res = await TransactionApi.getTransactionsByUserId(userId, filters);
            if (!res.success) throw new Error(res.message);
            return res.data; // Trả về PagedResult
        },
        enabled: !!userId,
    });
}

export function useGetTransactionDetail(transactionId: string | undefined, options?: { enabled?: boolean }) {
    return useQuery({
        queryKey: ["transactionDetail", transactionId],
        queryFn: async () => {
            if (!transactionId) throw new Error("Missing Transaction ID");
            const res = await TransactionApi.getTransactionDetail(transactionId);
            if (!res.success) throw new Error(res.message);
            return res.data; // Trả về TransactionDetailResponse
        },
        enabled: !!transactionId && (options?.enabled ?? true),
    });
}

export function useUpdateTransactionStatus() {
    return useMutation({
        mutationFn: ({ transactionId, data }: { transactionId: string; data: UpdateStatusRequest }) =>
            TransactionApi.updateTransactionStatus(transactionId, data),
    });
}