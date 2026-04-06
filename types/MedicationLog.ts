// types/MedicationLog.ts

// Request body khi người dùng xác nhận uống/bỏ qua thuốc
export type MedicationLogActionRequest = {
    reminderId: string;
    status: string; // VD: "Taken" (Đã uống), "Skipped" (Bỏ qua), "Missed" (Quên)
    actualTime?: string | null; // Thời gian thực tế (ISO String), có thể null nếu Skipped/Missed
    notes?: string | null;
};

// Dữ liệu chi tiết của 1 bản ghi lịch sử
export type MedicationLogResponse = {
    logId: string;
    memberId: string;
    scheduleId: string;
    reminderId: string;
    medicineName: string;
    memberName: string;
    memberAvatarUrl?: string | null; // Avatar thành viên (nếu API trả về)
    logDate: string; // Ngày ghi nhận
    scheduledTime: string; // Giờ hẹn gốc
    actualTime?: string | null; // Giờ uống thực tế
    status: string;
    notes?: string | null;
};