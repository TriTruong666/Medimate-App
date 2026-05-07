

// Type cho API GET /api/v1/families (image_10.png)
export type FamilyData = {
    familyId: string;
    familyName: string;
    type: "Shared" | "Personal";
    joinCode: string | null; // Cột này đã không còn dùng tới, để null an toàn
    isOpenJoin: boolean;
    familyAvatarUrl: string | null; // [NEW] Đã thêm Avatar
    memberCount: number;
    createdAt: string;
};

// Type cho API GET /api/v1/families/{id}/subscription (image_11.png)
export type SubscriptionData = {
    subscriptionId: string;
    packageName: string; // VD: "Freemium"
    startDate: string;
    endDate: string;
    status: "Active" | "Inactive" | "Cancelled" | "Expired";
    remainingOcrCount: number;
    ocrLimit: number;
    price?: number; // Giá gói (0 = Freemium)
};

export type UpdateFamilyRequest = {
    familyName?: string;
    isOpenJoin?: boolean;
    // Avatar có thể là File (Web) hoặc đối tượng chứa URI (React Native)
    familyAvatar?: any;
};