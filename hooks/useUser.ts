// hooks/useUser.ts
import * as UserApi from "@/apis/user.api";
import { ChangePasswordRequest, DeleteUserRequest } from "@/types/User";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { Alert } from "react-native";

export function useGetMe(enabled: boolean = true) {
    return useQuery({
        queryKey: ["user-me"],
        queryFn: async () => {
            const res = await UserApi.getMe();
            if (!res.success) throw new Error(res.message);
            return res.data;
        },
        enabled: enabled, // Cho phép bật/tắt hook này từ bên ngoài
    });
}

export function useUpdateMe() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (formData: FormData) => UserApi.updateMe(formData),
        onSuccess: (res) => {
            if (res.success) {
                queryClient.invalidateQueries({ queryKey: ["user-me"] });
                Alert.alert("Thành công", "Đã cập nhật thông tin cá nhân.");
            } else {
                Alert.alert("Lỗi", res.message || "Không thể cập nhật.");
            }
        },
        onError: (error: any) => Alert.alert("Lỗi kết nối", error?.message),
    });
}

export function useChangePassword() {
    return useMutation({
        mutationFn: (data: ChangePasswordRequest) => UserApi.changePassword(data),
        onSuccess: (res) => {
            if (res.success) {
                Alert.alert("Thành công", "Đổi mật khẩu thành công!");
            } else {
                Alert.alert("Lỗi", res.message || "Không thể đổi mật khẩu.");
            }
        },
        onError: (error: any) => Alert.alert("Lỗi kết nối", error?.message),
    });
}

export function useDeleteMe() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: DeleteUserRequest) => UserApi.deleteMe(data),
        onSuccess: async (res) => {
            if (res.success) {
                await SecureStore.deleteItemAsync("accessToken");
                queryClient.clear();
                Alert.alert("Đã xóa tài khoản", "Tài khoản của bạn đã được xóa thành công.", [
                    { text: "OK", onPress: () => router.replace("/welcome") }
                ]);
            } else {
                Alert.alert("Lỗi", res.message || "Không thể xóa tài khoản.");
            }
        },
        onError: (error: any) => Alert.alert("Lỗi kết nối", error?.message),
    });
}