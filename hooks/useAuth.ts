// hooks/useAuth.ts
import * as AuthApi from "@/apis/auth.api";
import { authSessionAtom } from "@/stores/authStore";
import { useToast } from "@/stores/toastStore";
import {
  LoginDependentRequest,
  LoginRequest,
  RegisterRequest,
  VerifyOtpRequest,
} from "@/types/Auth";
import { jwtDecode } from "jwt-decode";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useSetAtom } from "jotai";

export function useLoginUser() {
  const queryClient = useQueryClient();
  const toast = useToast();
  const setSession = useSetAtom(authSessionAtom);

  return useMutation({
    mutationFn: (data: LoginRequest) => AuthApi.loginUser(data),
    onSuccess: async (res) => {
      if (res.success && res.data?.token) {
        await SecureStore.setItemAsync("accessToken", res.data.token);

        // Decode token và set session NGAY LẬP TỨC để AuthGuard không block
        try {
          const decoded = jwtDecode<{ Id?: string; MemberId?: string }>(res.data.token);
          if (decoded?.MemberId) {
            setSession({ memberId: decoded.MemberId, role: 'member' });
          } else if (decoded?.Id) {
            setSession({ id: decoded.Id, role: 'manager' });
          }
        } catch {
          setSession({ role: 'manager' });
        }

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
  const setSession = useSetAtom(authSessionAtom);
  return useMutation({
    mutationFn: async (data: LoginDependentRequest) =>
      AuthApi.loginDependent(data),
    onSuccess: async (res) => {
      if (res.success && res.data?.token) {
        await SecureStore.setItemAsync("accessToken", res.data.token);

        // Set session ngay lập tức
        try {
          const decoded = jwtDecode<{ Id?: string; MemberId?: string }>(res.data.token);
          if (decoded?.MemberId) {
            setSession({ memberId: decoded.MemberId, role: 'member' });
          } else {
            setSession({ role: 'member' });
          }
        } catch {
          setSession({ role: 'member' });
        }

        toast.success("Đăng nhập thành công", "Chào mừng thành viên gia đình!");
        router.replace("/(member)/(member-home)" as any);
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
