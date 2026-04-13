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

export function useGetUserNotifications(memberId?: string) {
    return useQuery({
        queryKey: ["notifications", memberId],
        queryFn: async () => {
            const res = await NotificationApi.getUserNotifications(memberId);
            if (!res.success) throw new Error(res.message);
            return res.data;
        },
    });
}

export function useMarkNotificationAsRead() {
    const queryClient = useQueryClient();

    return useMutation({
        // Khai báo rõ mutationFn nhận vào 1 Object
        mutationFn: ({ notificationId, memberId }: { notificationId: string; memberId?: string }) =>
            NotificationApi.markNotificationAsRead(notificationId, memberId),
        onSuccess: (res, variables) => {
            if (res.success) {
                queryClient.invalidateQueries({ queryKey: ["notifications", variables.memberId] });
            }
        },
    });
}

export function useMarkAllNotificationsAsRead() {
    const queryClient = useQueryClient();
    const toast = useToast();

    return useMutation({
        // Khai báo rõ mutationFn nhận vào string (memberId)
        mutationFn: (memberId?: string) => NotificationApi.markAllNotificationsAsRead(memberId),
        onSuccess: (res, memberId) => {
            if (res.success) {
                queryClient.invalidateQueries({ queryKey: ["notifications", memberId] });
                toast.success("Thành công", "Đã đánh dấu đọc tất cả!");
            } else {
                Alert.alert("Lỗi", res.message || "Không thể đánh dấu đọc tất cả.");
            }
        },
    });
}