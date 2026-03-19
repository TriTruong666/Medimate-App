

// Type cho API GET /api/v1/families (image_10.png)
export type FamilyData = {
    familyId: string;
    familyName: string;
    type: "Shared" | "Personal"; // Dựa trên Swagger
    joinCode: string;
    isOpenJoin: boolean;
    memberCount: number;
    createdAt: string;
};

// Type cho API GET /api/v1/families/{id}/subscription (image_11.png)
export type SubscriptionData = {
    subscriptionId: string;
    packageName: string; // VD: "Freemium"
    startDate: string;
    endDate: string;
    status: "Active" | "Inactive"; // Dựa trên Swagger
    remainingOcrCount: number;
    remainingConsultantCount: number;
    ocrLimit: number;
    consultantLimit: number;
};

export type UpdateFamilyRequest = {
    familyName: string;
    isOpenJoin: boolean;
};