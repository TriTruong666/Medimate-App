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
    doctorName?: string;
    doctorSpecialty?: string;
    doctorAvatarUrl?: string;
    memberId: string;
    memberName?: string;
    availabilityId: string;
    appointmentDate: string;
    appointmentTime?: string;
    status: string;           // "Pending" | "Confirmed" | "Cancelled" | "Completed"
    notes?: string;
    cancelReason?: string | null;
    createdAt: string;
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
    cancelReason: string | null;
    createdAt: string;

    // Thông tin Bác sĩ
    doctorId: string;
    doctorName: string;
    doctorAvatar: string | null;
    specialty: string | null;

    // Thông tin Bệnh nhân
    memberId: string;
    memberName: string;
    memberAvatar: string | null;
    memberGender: string | null;
    memberDateOfBirth: string | null;
};