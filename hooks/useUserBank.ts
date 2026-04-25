// hooks/useUserBank.ts
import * as UserBankApi from "@/apis/userBank.api";
import { UpsertUserBankAccountRequest } from "@/types/UserBank";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/stores/toastStore";

export function useGetUserBankAccount() {
    return useQuery({
        queryKey: ["user-bank-account"],
        queryFn: async () => {
            const res = await UserBankApi.getUserBankAccount();
            if (!res.success) throw new Error(res.message);
            return res.data; // Can be null if the user has no bank account setup yet
        },
    });
}

export function useCreateUserBankAccount() {
    const queryClient = useQueryClient();
    const toast = useToast();

    return useMutation({
        mutationFn: (data: UpsertUserBankAccountRequest) => UserBankApi.createUserBankAccount(data),
        onSuccess: (res) => {
            if (res.success) {
                queryClient.invalidateQueries({ queryKey: ["user-bank-account"] });
                toast.success("Thành công", "Đã thêm thông tin tài khoản ngân hàng!");
            } else {
                toast.error("Lỗi", res.message || "Không thể thêm tài khoản.");
            }
        },
        onError: (error: any) => toast.error("Lỗi kết nối", error?.message),
    });
}

export function useUpdateUserBankAccount() {
    const queryClient = useQueryClient();
    const toast = useToast();

    return useMutation({
        mutationFn: (data: UpsertUserBankAccountRequest) => UserBankApi.updateUserBankAccount(data),
        onSuccess: (res) => {
            if (res.success) {
                queryClient.invalidateQueries({ queryKey: ["user-bank-account"] });
                toast.success("Thành công", "Đã cập nhật thông tin tài khoản ngân hàng!");
            } else {
                toast.error("Lỗi", res.message || "Không thể cập nhật tài khoản.");
            }
        },
        onError: (error: any) => toast.error("Lỗi kết nối", error?.message),
    });
}

export function useDeleteUserBankAccount() {
    const queryClient = useQueryClient();
    const toast = useToast();

    return useMutation({
        mutationFn: () => UserBankApi.deleteUserBankAccount(),
        onSuccess: (res) => {
            if (res.success) {
                queryClient.invalidateQueries({ queryKey: ["user-bank-account"] });
                toast.success("Thành công", "Đã xóa thông tin tài khoản ngân hàng!");
            } else {
                toast.error("Lỗi", res.message || "Không thể xóa tài khoản.");
            }
        },
        onError: (error: any) => toast.error("Lỗi kết nối", error?.message),
    });
}
