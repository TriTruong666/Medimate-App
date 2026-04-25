// types/UserBank.ts

export type UserBankAccountResponse = {
    bankAccountId: string;
    bankName: string;
    accountNumber: string;
    accountHolder: string;
    createdAt?: string;
    updatedAt?: string;
};

export type UpsertUserBankAccountRequest = {
    bankName: string;
    accountNumber: string;
    accountHolder: string;
};
