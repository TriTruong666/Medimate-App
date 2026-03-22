// types/Schedule.ts

// ========================
// LỊCH UỐNG THUỐC (SCHEDULE)
// ========================

export type ScheduleResponse = {
    scheduleId: string;
    memberId: string;
    memberName: string;
    medicineName: string;
    dosage: string;
    specificTimes: string;
    startDate: string;
    endDate: string;
    isActive: boolean;
};

export type CreateScheduleRequest = {
    prescriptionMedicineId?: string | null;
    medicineName: string;
    dosage: string;
    frequency: string;
    specificTimes: string; // VD: "08:00,13:00,20:00"
    startDate: string; // ISO String
    endDate: string; // ISO String
    instructions?: string | null;
};

export type UpdateScheduleRequest = {
    medicineName: string;
    dosage: string;
    specificTimes: string;
    endDate: string; // Thường chỉ cho phép sửa ngày kết thúc
    instructions?: string | null;
};


// ========================
// NHẮC NHỞ (REMINDER)
// ========================

export type ReminderResponse = {
    reminderId: string;
    scheduleId: string;
    memberId: string;
    memberName: string;
    medicineName: string;
    dosage: string;
    reminderTime: string; // Thời gian cần uống
    endTime?: string | null; // Hạn chót để uống
    status: string; // VD: "Pending", "Taken", "Missed", "Skipped"
};

export type UpdateReminderActionRequest = {
    status: string; // Bắt buộc: "Taken", "Skipped"...
    notes?: string | null;
    actualTime?: string | null; // Thời gian thực tế uống (ISO String)
};