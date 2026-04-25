export type AvailableSlotResponse = {
    availabilityId: string;
    time: string;
    displayTime: string;
    isBooked: boolean;
};

export type CreateAppointmentRequest = {
    doctorId: string;
    memberId: string;
    availabilityId: string;
    appointmentDate: string;  // "YYYY-MM-DD"
    appointmentTime: string;  // "HH:mm"
    notes?: string;
};

export type RescheduleAppointmentRequest = {
    availabilityId: string;
    appointmentDate: string;
    appointmentTime: string;
};

export type CancelAppointmentRequest = {
    reason: string;
};

export type AppointmentResponse = {
    appointmentId: string;
    doctorId: string;
    doctorName?: string | null;
    doctorAvatar?: string | null;
    clinicId?: string;
    clinicName?: string;
    memberId: string;
    memberName?: string | null;
    availabilityId: string;
    appointmentDate: string;
    appointmentTime?: string;
    status: string;           // "Pending" | "Approved" | "Cancelled" | "Completed"
    paymentStatus: string;    // "Pending" | "Paid" | "Refunded" | "RefundCompleted"
    cancelReason?: string | null;
    amount?: number;
    consultationSessionId?: string;
    createdAt: string;
};

export type AppointmentPaymentResponse = {
    appointment: AppointmentResponse;
    checkoutUrl: string;
    orderCode: number;
    qrCode?: string;
};

export type AppointmentFilterRequest = {
    status?: string;
    fromDate?: string;
    toDate?: string;
    pageNumber?: number;
    pageSize?: number;
};
export type AppointmentDetailResponse = {
    appointmentId: string;
    appointmentDate: string;
    appointmentTime: string;
    status: string;
    paymentStatus: string;
    cancelReason: string | null;
    amount?: number;
    createdAt: string;

    // Thông tin Phòng khám
    clinicId?: string;
    clinicName?: string;

    // Thông tin Bác sĩ
    doctorId: string;
    doctorName: string | null;
    doctorAvatar: string | null;
    specialty: string | null;

    // Thông tin Bệnh nhân
    memberId: string;
    memberName: string | null;
    memberAvatar: string | null;
    memberGender: string | null;
    memberDateOfBirth: string | null;

    // Thông tin Phiên tư vấn
    consultationSessionId?: string;
    consultationSessionStatus?: string;
    recordingUrl?: string;
};