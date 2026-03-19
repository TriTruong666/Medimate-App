// hooks/useAuth.ts
import * as AuthApi from "@/apis/auth.api";
import { LoginDependentRequest, LoginRequest, RegisterRequest, VerifyOtpRequest } from "@/types/Auth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { Alert } from "react-native";

export function useLoginUser() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: LoginRequest) => AuthApi.loginUser(data),
        onSuccess: async (res) => {
            if (res.success && res.data?.token) {
                // Lưu token vào SecureStore
                await SecureStore.setItemAsync("accessToken", res.data.token);

                // Làm mới các query liên quan đến User/Family trước khi chuyển trang
                queryClient.invalidateQueries({ queryKey: ["families"] });

                // Chuyển sang Home và xóa lịch sử các màn hình trước đó
                router.replace("/home");
            } else {
                Alert.alert("Lỗi", res.message || "Đăng nhập thất bại");
            }
        },
        // ... onError giữ nguyên
    });
}

export function useRegisterUser() {
    return useMutation({
        mutationFn: async (data: RegisterRequest) => AuthApi.registerUser(data),
        onSuccess: (res, variables) => {
            if (res.success) {
                Alert.alert(
                    "Thành công",
                    "Đăng ký thành công! Vui lòng kiểm tra email để lấy mã xác thực.",
                    [
                        {
                            text: "Nhập mã OTP",
                            // Truyền luôn email sang màn OTP để không bắt user nhập lại
                            onPress: () => router.push({ pathname: "/verify-otp", params: { email: variables.email } })
                        }
                    ]
                );
            } else {
                Alert.alert("Lỗi", res.message || "Đăng ký thất bại. Vui lòng thử lại.");
            }
        },
        onError: (error: any) => {
            Alert.alert("Lỗi kết nối", error?.message || "Không thể kết nối đến máy chủ.");
        },
    });
}

export function useVerifyOtp() {
    return useMutation({
        mutationFn: async (data: VerifyOtpRequest) => AuthApi.verifyOtp(data),
        onSuccess: (res) => {
            if (res.success) {
                Alert.alert(
                    "Thành công",
                    "Xác thực tài khoản thành công! Bạn có thể đăng nhập ngay bây giờ.",
                    [{ text: "Đăng nhập", onPress: () => router.replace("/login") }]
                );
            } else {
                Alert.alert("Lỗi", res.message || "Mã xác thực không chính xác.");
            }
        },
        onError: (error: any) => {
            Alert.alert("Lỗi kết nối", error?.message || "Không thể kết nối đến máy chủ.");
        },
    });
}

export function useLoginDependent() {
    return useMutation({
        mutationFn: async (data: LoginDependentRequest) => AuthApi.loginDependent(data),
        onSuccess: async (res) => {
            if (res.success && res.data?.token) {
                await SecureStore.setItemAsync("accessToken", res.data.token);
                router.replace("/");
            } else {
                Alert.alert("Lỗi", res.message || "Mã QR không hợp lệ hoặc đã hết hạn.");
            }
        },
        onError: (error: any) => {
            Alert.alert("Lỗi kết nối", error?.message || "Không thể xác thực mã QR.");
        },
    });
}