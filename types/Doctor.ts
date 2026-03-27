// ─── Doctor Types ──────────────────────────────────────────────

export type DoctorDetailResponse = {
    doctorId: string;
    fullName: string;
    specialty: string;
    currentHospital: string;
    licenseNumber: string;
    licenseImage: string;
    yearsOfExperience: number;
    bio: string;
    averageRating: number;
    totalReviews: number;
    status: string;       // "Active" | "Inactive"
    avatarUrl?: string;
    createdAt: string;
    userId: string;
};

export type DoctorListItem = {
    doctorId: string;
    fullName: string;
    specialty: string;
    currentHospital: string;
    yearsOfExperience: number;
    averageRating: number;
    totalReviews: number;
    avatarUrl?: string;
    status: string;
};

export type DoctorFilterRequest = {
    specialty?: string;
    name?: string;
    pageNumber?: number;
    pageSize?: number;
};

export type DoctorReviewResponse = {
    ratingId: string;
    sessionId: string;
    memberId: string;
    memberName?: string;
    memberAvatar?: string;
    score: number;         // 1–5
    comment: string;
    createdAt: string;
};

export type CreateDoctorReviewRequest = {
    sessionId: string;
    score: number;
    comment: string;
};

export type DoctorAvailabilityResponse = {
    doctorAvailabilityId: string;
    doctorId: string;
    dayOfWeek: string;    // "Monday" | "Tuesday" | ...
    startTime: string;    // "HH:mm"
    endTime: string;
    isActive: boolean;
};