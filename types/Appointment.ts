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
    appointmentDate: string; // ISO String
    appointmentTime: string; // Chuỗi giờ (VD: "08:00")
};

export type CancelAppointmentRequest = {
    reason: string;
};

export type AppointmentResponse = {
    appointmentId: string;
    doctorId: string;
    memberId: string;
    availabilityId: string;
    appointmentDate: string;
    status: string; // VD: "Pending", "Confirmed", "Cancelled"
    cancelReason?: string | null;
    createdAt: string;
};