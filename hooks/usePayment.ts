import * as PaymentApi from "@/apis/payment.api";
import { CreatePaymentRequest } from "@/types/Payment";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Alert, Linking } from "react-native";

export function useCreatePayment() {
    return useMutation({
        mutationFn: (data: CreatePaymentRequest) => PaymentApi.createPayment(data),
        onSuccess: (res) => {
            if (res.success && res.data?.paymentUrl) {
                // Tự động mở trình duyệt để thanh toán
                Linking.openURL(res.data.paymentUrl);
            } else {
                Alert.alert("Lỗi thanh toán", res.message || "Không thể tạo liên kết thanh toán.");
            }
        },
        onError: (error: any) => Alert.alert("Lỗi kết nối", error?.message),
    });
}

// Hook kiểm tra trạng thái đơn hàng (Polling)
export function useGetPaymentStatus(orderCode: number | undefined) {
    return useQuery({
        queryKey: ["payment-status", orderCode],
        queryFn: async () => {
            if (!orderCode) return null;
            const res = await PaymentApi.getPaymentInfo(orderCode);
            if (!res.success) throw new Error(res.message);
            return res.data;
        },
        enabled: !!orderCode,
        refetchInterval: (query) => {
            // Tự động fetch lại sau mỗi 3 giây nếu trạng thái vẫn là PENDING
            return query.state.data?.status === "PENDING" ? 3000 : false;
        }
    });
}