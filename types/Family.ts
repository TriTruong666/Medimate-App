export type FamilyMember = {
    memberId: string;
    fullName: string;
    phoneNumber: string;
    role: string; // "Owner", "Member", v.v.
    avatarUrl?: string;
};