// types/User.ts

export type UserData = {
    userId: string;
    phoneNumber: string;
    fullName: string;
    email: string;
    dateOfBirth: string | null;
    gender: string | null;
    avatarUrl: string | null;
    isActive: boolean;
    role: string;
    createdAt: string;
};

export type ChangePasswordRequest = {
    oldPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
};

export type DeleteUserRequest = {
    password?: string;
};