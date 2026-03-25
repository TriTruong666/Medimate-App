// ========================
// CHI TIẾT THUỐC TRONG LỊCH
// ========================
export type ScheduleDetailItemResponse = {
    detailId: string;
    prescriptionMedicineId?: string | null;
    medicineName: string;
    dosage: string;
    instructions: string;
    startDate: string;
    endDate?: string | null;
};

// ========================
// LỊCH UỐNG THUỐC (SCHEDULE)
// ========================
export type ScheduleResponse = {
    scheduleId: string;
    memberId: string;
    memberName: string;
    scheduleName: string; // VD: "Buổi sáng", "Buổi trưa"
    timeOfDay: string; // VD: "08:00:00"
    isActive: boolean;
    createdAt: string;
    scheduleDetails: ScheduleDetailItemResponse[]; // 1 Lịch chứa N loại thuốc
};

// --- REQUEST DTOs ---

export type ScheduleItemRequest = {
    medicineName: string;
    dosage: string;
    frequency?: string;
    specificTimes: string; // VD: "08:00, 20:00"
    startDate: string;
    endDate?: string | null;
    instructions?: string;
};

export type CreateBulkScheduleRequest = {
    prescriptionId?: string | null;
    schedules: ScheduleItemRequest[];
};

export type UpdateScheduleRequest = {
    scheduleName: string;
    timeOfDay: string;
    endDate?: string | null;
};

export type UpdateScheduleDetailRequest = {
    dosage: string;
    startDate: string;
    endDate?: string | null;
};


// ========================
// NHẮC NHỞ (REMINDER)
// ========================
export type ReminderResponse = {
    reminderId: string;
    scheduleId: string;
    memberId: string;
    memberName: string;
    scheduleName: string;
    reminderTime: string;
    endTime?: string | null;
    status: string; // "Pending", "Taken", "Skipped"...
    medicines: ScheduleDetailItemResponse[]; // Nhắc nhở giờ chứa MẢNG các thuốc cần uống
};

export type UpdateReminderActionRequest = {
    status: string;
    notes?: string | null;
    actualTime?: string | null;
};