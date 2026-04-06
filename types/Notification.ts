// ========================
// CÀI ĐẶT THÔNG BÁO (NOTIFICATION SETTINGS)
// ========================
export type NotificationSettingResponse = {
    settingId: string;
    familyId: string;
    enablePushNotification: boolean;
    enableEmailNotification: boolean;
    enableSmsNotification: boolean;
    reminderAdvanceMinutes: number;
    enableFamilyAlert: boolean;
    customSetting: string | null;
    minimumHoursGap: number;
    maxDosesPerDay: number;
    missedDosesThreshold: number;
    updateAt: string;
};

export type UpdateNotificationSettingRequest = {
    enablePushNotification?: boolean;
    enableEmailNotification?: boolean;
    enableSmsNotification?: boolean;
    reminderAdvanceMinutes?: number;
    enableFamilyAlert?: boolean;
    customSetting?: string | null;
    minimumHoursGap?: number;
    maxDosesPerDay?: number;
    missedDosesThreshold?: number;
};

// ========================
// THÔNG BÁO (NOTIFICATIONS)
// ========================
export type NotificationData = {
    notificationId: string;
    title: string;
    message: string;
    type: string; // VD: "REMINDER", "SYSTEM", "APPOINTMENT"
    referenceId?: string | null; // Trỏ tới ID Lịch, ID Đơn thuốc... để khi bấm vào thông báo App biết chuyển màn hình
    isRead: boolean;
    createdAt: string;
};