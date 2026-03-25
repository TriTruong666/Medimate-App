// hooks/useAuth.ts
import * as AuthApi from "@/apis/auth.api";
import { useToast } from "@/stores/toastStore";
import {
  LoginDependentRequest,
  LoginRequest,
  RegisterRequest,
  VerifyOtpRequest,
} from "@/types/Auth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";

export function useLoginUser() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: (data: LoginRequest) => AuthApi.loginUser(data),
    onSuccess: async (res) => {
      if (res.success && res.data?.token) {
        await SecureStore.setItemAsync("accessToken", res.data.token);
        queryClient.invalidateQueries({ queryKey: ["families"] });
        toast.success("Đăng nhập thành công", "Chào mừng bạn quay trở lại!");
        router.replace("/(manager)/(home)" as any);
      } else {
        toast.error(
          "Đăng nhập thất bại",
          "Tài khoản hoặc mật khẩu không đúng."
        );
      }
    },
    onError: (error: any) => {
      toast.error(
        "Lỗi kết nối",
        error?.message || "Không thể kết nối đến máy chủ."
      );
    },
  });
}

export function useRegisterUser() {
  const toast = useToast();
  return useMutation({
    mutationFn: async (data: RegisterRequest) => AuthApi.registerUser(data),
    onSuccess: (res, variables) => {
      if (res.success) {
        toast.success(
          "Đăng ký thành công",
          "Vui lòng kiểm tra email để lấy mã xác thực."
        );
        // Có thể navigate sang trang OTP ở đây nếu muốn
      } else {
        toast.error(
          "Lỗi đăng ký",
          res.message || "Đăng ký thất bại. Vui lòng thử lại."
        );
      }
    },
    onError: (error: any) => {
      toast.error(
        "Lỗi kết nối",
        error?.message || "Không thể kết nối đến máy chủ."
      );
    },
  });
}

export function useVerifyOtp() {
  const toast = useToast();
  return useMutation({
    mutationFn: async (data: VerifyOtpRequest) => AuthApi.verifyOtp(data),
    onSuccess: (res) => {
      if (res.success) {
        toast.success(
          "Xác thực thành công",
          "Bạn có thể đăng nhập ngay bây giờ."
        );
        router.replace("/(auth)/login");
      } else {
        toast.error(
          "Lỗi xác thực",
          res.message || "Mã xác thực không chính xác."
        );
      }
    },
    onError: (error: any) => {
      toast.error(
        "Lỗi kết nối",
        error?.message || "Không thể kết nối đến máy chủ."
      );
    },
  });
}

export function useLoginDependent() {
  const toast = useToast();
  return useMutation({
    mutationFn: async (data: LoginDependentRequest) =>
      AuthApi.loginDependent(data),
    onSuccess: async (res) => {
      if (res.success && res.data?.token) {
        await SecureStore.setItemAsync("accessToken", res.data.token);
        toast.success("Đăng nhập thành công", "Chào mừng thành viên gia đình!");
        router.replace("/(member)/index" as any);
      } else {
        toast.error(
          "Lỗi xác thực",
          res.message || "Mã QR không hợp lệ hoặc đã hết hạn."
        );
      }
    },
    onError: (error: any) => {
      toast.error(
        "Lỗi kết nối",
        error?.message || "Không thể kết nối đến máy chủ."
      );
    },
  });
}

export function useLogoutUser() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: AuthApi.logoutUser,
    onSuccess: async (res) => {
      if (res.success) {
        await SecureStore.deleteItemAsync("accessToken");
        queryClient.clear();
        toast.success("Đăng xuất thành công", "Hẹn gặp lại bạn!");
        router.replace("/welcome");
      } else {
        toast.error("Lỗi", res.message || "Đăng xuất thất bại.");
      }
    },
    onError: (error: any) => {
      toast.error(
        "Lỗi kết nối",
        error?.message || "Không thể kết nối đến máy chủ."
      );
    },
  });
}
