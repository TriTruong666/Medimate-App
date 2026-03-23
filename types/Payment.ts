// types/Payment.ts



// ========================
// PAYMENT
// ========================

// Request tạo link thanh toán
export type CreatePaymentRequest = {
    packageId: string;
    familyId: string;
    buyerName: string;
    buyerEmail: string;
    buyerPhone: string;
    returnUrl: string;
    cancelUrl: string;
};

// Response trả về link thanh toán (PayOS/VNPay...)
export type CreatePaymentResponse = {
    paymentUrl: string;
    orderCode: number;
    qrCode: string;
    message: string;
};

// Chi tiết trạng thái đơn hàng
export type PaymentInfoResponse = {
    orderCode: number;
    amount: number;
    description: string;
    status: string; // "PENDING", "PAID", "CANCELLED"
    createdAt: string;
    paidAt?: string | null;
    transactionId?: string | null;
};