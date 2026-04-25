// apis/userBank.api.ts
import { BaseResponse } from "@/types/APIResponse";
import { UpsertUserBankAccountRequest, UserBankAccountResponse } from "@/types/UserBank";
import { axiosClient } from "./client";

export async function getUserBankAccount(): Promise<BaseResponse<UserBankAccountResponse>> {
    try {
        const res = await axiosClient.get(`/api/v1/user/bank-account`);
        return res.data;
    } catch (error: any) {
        if (error.response && error.response.data) return error.response.data;
        throw error;
    }
}

export async function createUserBankAccount(data: UpsertUserBankAccountRequest): Promise<BaseResponse<UserBankAccountResponse>> {
    try {
        const res = await axiosClient.post(`/api/v1/user/bank-account`, data);
        return res.data;
    } catch (error: any) {
        if (error.response && error.response.data) return error.response.data;
        throw error;
    }
}

export async function updateUserBankAccount(data: UpsertUserBankAccountRequest): Promise<BaseResponse<UserBankAccountResponse>> {
    try {
        const res = await axiosClient.put(`/api/v1/user/bank-account`, data);
        return res.data;
    } catch (error: any) {
        if (error.response && error.response.data) return error.response.data;
        throw error;
    }
}

export async function deleteUserBankAccount(): Promise<BaseResponse<any>> {
    try {
        const res = await axiosClient.delete(`/api/v1/user/bank-account`);
        return res.data;
    } catch (error: any) {
        if (error.response && error.response.data) return error.response.data;
        throw error;
    }
}
