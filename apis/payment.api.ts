// apis/payment.api.ts
import { BasePaginatedResponse, BaseResponse } from "@/types/APIResponse";
import {
    CreatePaymentRequest,
    CreatePaymentResponse,
    PaymentFilterRequest,
    PaymentInfoResponse,
    PaymentItemResponse,
    TransactionDetailResponse
} from "@/types/Payment";
import { axiosClient } from "./client";





// --- PAYMENT APIs ---

// Tạo yêu cầu thanh toán mới
export async function createPayment(data: CreatePaymentRequest): Promise<BaseResponse<CreatePaymentResponse>> {
    try {
        const res = await axiosClient.post("/api/v1/payment/create", data);
        return res.data;
    } catch (error: any) {
        if (error.response?.data) return error.response.data;
        throw error;
    }
}

// Kiểm tra trạng thái đơn hàng theo mã code
export async function getPaymentInfo(orderCode: number): Promise<BaseResponse<PaymentInfoResponse>> {
    try {
        const res = await axiosClient.get(`/api/v1/payment/info/${orderCode}`);
        return res.data;
    } catch (error: any) {
        if (error.response?.data) return error.response.data;
        throw error;
    }
}

export async function getMyPayments(filter: PaymentFilterRequest): Promise<BasePaginatedResponse<PaymentItemResponse[]>> {
    try {
        const res = await axiosClient.get(`/api/v1/payment/me`, { params: filter });
        return res.data;
    } catch (error: any) {
        if (error.response?.data) return error.response.data;
        throw error;
    }
}

// Lấy chi tiết giao dịch (Sử dụng BaseResponse bình thường)
export async function getTransactionByPaymentId(paymentId: string): Promise<BaseResponse<TransactionDetailResponse>> {
    try {
        const res = await axiosClient.get(`/api/v1/transactions/payment/${paymentId}`);
        return res.data;
    } catch (error: any) {
        if (error.response?.data) return error.response.data;
        throw error;
    }
}
