import { BaseResponse } from "@/types/APIResponse";
import { NotificationData, NotificationSettingResponse, UpdateNotificationSettingRequest } from "@/types/Notification";
import { axiosClient } from "./client";

// ==========================================
// CÀI ĐẶT THÔNG BÁO
// ==========================================

// Lấy cài đặt thông báo của Gia đình
export async function getFamilyNotificationSetting(familyId: string): Promise<BaseResponse<NotificationSettingResponse>> {
    try {
        const res = await axiosClient.get(`/api/notification-settings/family/${familyId}`);
        return res.data;
    } catch (error: any) {
        if (error.response?.data) return error.response.data;
        throw error;
    }
}

// Cập nhật cài đặt thông báo của Gia đình
export async function updateFamilyNotificationSetting(familyId: string, data: UpdateNotificationSettingRequest): Promise<BaseResponse<NotificationSettingResponse>> {
    try {
        const res = await axiosClient.put(`/api/notification-settings/family/${familyId}`, data);
        return res.data;
    } catch (error: any) {
        if (error.response?.data) return error.response.data;
        throw error;
    }
}

// ==========================================
// QUẢN LÝ THÔNG BÁO
// ==========================================

// Lấy danh sách thông báo của User hiện tại
export async function getUserNotifications(memberId?: string): Promise<BaseResponse<NotificationData[]>> {
    try {
        const url = memberId
            ? `/api/v1/notifications/member/${memberId}`
            : `/api/v1/notifications`;

        const res = await axiosClient.get(url);
        return res.data;
    } catch (error: any) {
        if (error.response?.data) return error.response.data;
        throw error;
    }
}

// Đánh dấu 1 thông báo là đã đọc
export async function markNotificationAsRead(notificationId: string, memberId?: string): Promise<BaseResponse<boolean>> {
    try {
        const url = memberId
            ? `/api/v1/notifications/member/${memberId}/${notificationId}/read`
            : `/api/v1/notifications/${notificationId}/read`;

        const res = await axiosClient.put(url);
        return res.data;
    } catch (error: any) {
        if (error.response?.data) return error.response.data;
        throw error;
    }
}

// Đánh dấu TẤT CẢ thông báo là đã đọc
export async function markAllNotificationsAsRead(memberId?: string): Promise<BaseResponse<boolean>> {
    try {
        const url = memberId
            ? `/api/v1/notifications/member/${memberId}/read-all`
            : `/api/v1/notifications/read-all`;

        const res = await axiosClient.put(url);
        return res.data;
    } catch (error: any) {
        if (error.response?.data) return error.response.data;
        throw error;
    }
}