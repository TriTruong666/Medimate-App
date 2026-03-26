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
export async function getUserNotifications(): Promise<BaseResponse<NotificationData[]>> {
    try {
        const res = await axiosClient.get(`/api/v1/notifications`);
        return res.data;
    } catch (error: any) {
        if (error.response?.data) return error.response.data;
        throw error;
    }
}

// Đánh dấu 1 thông báo là đã đọc
export async function markNotificationAsRead(notificationId: string): Promise<BaseResponse<boolean>> {
    try {
        const res = await axiosClient.put(`/api/v1/notifications/${notificationId}/read`);
        return res.data;
    } catch (error: any) {
        if (error.response?.data) return error.response.data;
        throw error;
    }
}

// Đánh dấu TẤT CẢ thông báo là đã đọc
export async function markAllNotificationsAsRead(): Promise<BaseResponse<boolean>> {
    try {
        const res = await axiosClient.put(`/api/v1/notifications/read-all`);
        return res.data;
    } catch (error: any) {
        if (error.response?.data) return error.response.data;
        throw error;
    }
}