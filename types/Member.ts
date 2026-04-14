// types/Member.ts

export type CreateDependentRequest = {
    familyId: string;
    fullName: string;
    dateOfBirth: string; // Định dạng ISO 8601 (VD: 2026-03-19T18:51:48.597Z)
    gender: string;      // "Male" | "Female" | "Other"
};

export type GenerateLoginCodeResponse = {
    memberId: string;
    fullName: string;
    identityCode: string | null;
    qrCodeUrl: string;
};

export type FamilyMember = {
    memberId: string;
    userId: string | null; // Sẽ là null nếu là tài khoản phụ thuộc (Dependent)
    familyId: string;
    fullName: string;
    phoneNumber?: string;
    dateOfBirth: string;
    gender: "Male" | "Female" | "Other";
    role: "Owner" | "Member";
    avatarUrl: string | null;
    isActive: boolean;
    morningTime?: string;
    noonTime?: string;
    afternoonTime?: string;
    eveningTime?: string;
};