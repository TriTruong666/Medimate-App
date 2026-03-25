// ========================
// MEMBERSHIP PACKAGES
// ========================
export type MembershipPackage = {
    packageId: string;
    packageName: string;
    isActive: boolean;
    price: number;
    currency: string;
    durationDays: number;
    memberLimit: number;
    ocrLimit: number;
    consultantLimit: number;
    description: string;
    activeSubscriberCount: number;
};