// ========================
// CONSULTATION SESSION
// ========================
export type SessionResponse = {
    consultanSessionId: string;
    appointmentId: string;
    doctorId: string;
    memberId: string;
    startedAt: string | null;
    endedAt: string | null;
    status: string;
    userJoined: boolean;
    doctorJoined: boolean;
    note: string | null;
    doctorNote: string | null;
};

export type JoinSessionRequest = {
    role: string; // VD: "Doctor" hoặc "Member"
};

export type AttachPrescriptionRequest = {
    prescriptionId: string;
};