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
    status: string;
    createdAt: string;
    userId: string;
};

export type DoctorReviewResponse = {
    ratingId: string;
    sessionId: string;
    memberId: string;
    score: number;
    comment: string;
    createdAt: string;
};

export type DoctorAvailabilityResponse = {
    doctorAvailabilityId: string;
    doctorId: string;
    dayOfWeek: string;
    startTime: string;
    endTime: string;
    isActive: boolean;
};