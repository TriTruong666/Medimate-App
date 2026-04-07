import { BasePaginatedResponse, BaseResponse } from "@/types/APIResponse";
import { TransactionFilterRequest, TransactionItemResponse, UpdateStatusRequest } from "@/types/Payment";
import { axiosClient } from "./client";

// Lấy danh sách giao dịch của 1 user
export async function getTransactionsByUserId(
    userId: string,
    params: TransactionFilterRequest
): Promise<BasePaginatedResponse<TransactionItemResponse[]>> {
    try {
        const res = await axiosClient.get(`/api/v1/transactions/user/${userId}`, { params });
        return res.data;
    } catch (error: any) {
        if (error.response?.data) return error.response.data;
        throw error;
    }
}

// Lấy chi tiết một giao dịch
export async function getTransactionDetail(
    transactionId: string
): Promise<BaseResponse<any>> { // Replace any with the actual type if exported
    try {
        const res = await axiosClient.get(`/api/v1/transactions/${transactionId}`);
        return res.data;
    } catch (error: any) {
        if (error.response?.data) return error.response.data;
        throw error;
    }
}

// Cập nhật trạng thái Transaction (khi kẹt mạng, hủy)
export async function updateTransactionStatus(transactionId: string, data: UpdateStatusRequest): Promise<BaseResponse<boolean>> {
    try {
        const res = await axiosClient.put(`/api/v1/transactions/${transactionId}/status`, data);
        return res.data;
    } catch (error: any) {
        if (error.response?.data) return error.response.data;
        throw error;
    }
}