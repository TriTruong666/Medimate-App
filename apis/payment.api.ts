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
// Server trả về raw object { paymentUrl, orderCode, qrCode, message }
// KHÔNG bọc trong BaseResponse → tự wrap tại đây
export async function createPayment(data: CreatePaymentRequest): Promise<BaseResponse<CreatePaymentResponse>> {
    try {
        const res = await axiosClient.post("/api/v1/payment/create", data);
        const raw = res.data as CreatePaymentResponse & { message?: string };
        // Nếu có paymentUrl → thành công
        if (raw?.paymentUrl) {
            return { success: true, code: 200, data: raw, message: raw.message ?? "Payment link created successfully" };
        }
        // Trường hợp server đã bọc BaseResponse bình thường
        if (raw && "success" in raw) return raw as any;
        return { success: false, code: 400, message: (raw as any)?.message ?? "Tạo thanh toán thất bại" };
    } catch (error: any) {
        if (error.response?.data) return { success: false, code: error.response.status ?? 500, message: error.response.data?.message ?? "Lỗi kết nối" };
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
