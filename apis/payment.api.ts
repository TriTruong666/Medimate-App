// apis/payment.api.ts
import { BaseResponse } from "@/types/APIResponse";
import {
    CreatePaymentRequest,
    CreatePaymentResponse,
    PaymentInfoResponse
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

export function getMembershipPackages() {
    throw new Error("Function not implemented.");
}
