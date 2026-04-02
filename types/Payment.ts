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


export type PaymentFilterRequest = {
    searchTerm?: string;
    status?: string; // "Pending", "Success", "Failed"
    sortBy?: string;
    isDescending?: boolean;
    pageNumber?: number;
    pageSize?: number;
};

export type PaymentItemResponse = {
    paymentId: string;
    userId: string;
    userName: string;
    amount: number;
    paymentContent: string;
    status: string;
    createdAt: string;
};

// ========================
// CHI TIẾT GIAO DỊCH (TRANSACTION)
// ========================
export type TransactionDetailResponse = {
    transactionId: string;
    senderName: string;
    receiverName: string;
    transactionType: string;
    content: string;
    amount: number;
    transactionFee: number;
    totalAmount: number;
    transactionCode: string;
    paymentCode: string;
    appointmentDate: string | null;
    paymentMethod: string;
    paymentStatus: string;
};
export type UpdateStatusRequest = {
    status: string; // "SUCCESS" | "FAILED" | "CANCELLED" | "PENDING"
};

export type TransactionFilterRequest = {
    SearchTerm?: string;
    Type?: string;
    Status?: string;
    SortBy?: string;
    IsDescending?: boolean;
    PageNumber?: number;
    PageSize?: number;
};

export type TransactionItemResponse = {
    transactionId: string;
    transactionCode: string;
    transactionDate: string;
    transactionType: string;
    totalAmount: number;
    status: string;
};