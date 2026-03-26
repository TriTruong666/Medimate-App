import * as NotificationApi from "@/apis/notification.api";
import { useToast } from "@/stores/toastStore"; // Hoặc thư viện Toast bạn đang dùng (VD: react-native-toast-message)
import { UpdateNotificationSettingRequest } from "@/types/Notification";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Alert } from "react-native";

// ======================= QUERIES (GET) =======================

export function useGetFamilyNotificationSetting(familyId: string | undefined) {
    return useQuery({
        queryKey: ["notification-setting", familyId],
        queryFn: async () => {
            if (!familyId) throw new Error("Missing Family ID");
            const res = await NotificationApi.getFamilyNotificationSetting(familyId);
            if (!res.success) throw new Error(res.message);
            return res.data;
        },
        enabled: !!familyId,
    });
}

export function useGetUserNotifications() {
    return useQuery({
        queryKey: ["notifications"],
        queryFn: async () => {
            const res = await NotificationApi.getUserNotifications();
            if (!res.success) throw new Error(res.message);
            return res.data;
        },
    });
}

// ======================= MUTATIONS =======================

export function useUpdateFamilyNotificationSetting() {
    const queryClient = useQueryClient();
    const toast = useToast();

    return useMutation({
        mutationFn: ({ familyId, data }: { familyId: string; data: UpdateNotificationSettingRequest }) =>
            NotificationApi.updateFamilyNotificationSetting(familyId, data),
        onSuccess: (res) => {
            if (res.success) {
                queryClient.invalidateQueries({ queryKey: ["notification-setting"] });
                toast.success("Thành công", "Đã lưu cấu hình thông báo!");
            } else {
                toast.error("Lỗi", res.message || "Không thể cập nhật cấu hình.");
            }
        },
        onError: (error: any) => {
            toast.error("Lỗi", error?.message || "Lỗi kết nối máy chủ.");
        }
    });
}

export function useMarkNotificationAsRead() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (notificationId: string) => NotificationApi.markNotificationAsRead(notificationId),
        onSuccess: (res) => {
            if (res.success) {
                // Tự động làm mới danh sách thông báo khi đánh dấu đọc thành công
                queryClient.invalidateQueries({ queryKey: ["notifications"] });
            }
        },
        onError: (error: any) => {
            console.error("Lỗi khi đánh dấu đã đọc:", error);
        }
    });
}

export function useMarkAllNotificationsAsRead() {
    const queryClient = useQueryClient();
    const toast = useToast();

    return useMutation({
        mutationFn: () => NotificationApi.markAllNotificationsAsRead(),
        onSuccess: (res) => {
            if (res.success) {
                queryClient.invalidateQueries({ queryKey: ["notifications"] });
                toast.success("Thành công", "Đã đánh dấu đọc tất cả!");
            } else {
                Alert.alert("Lỗi", res.message || "Không thể đánh dấu đọc tất cả.");
            }
        },
        onError: (error: any) => {
            Alert.alert("Lỗi", error?.message || "Lỗi kết nối máy chủ.");
        }
    });
}