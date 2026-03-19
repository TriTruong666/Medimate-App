// types/Health.ts

// Type cho một bệnh lý / tình trạng sức khỏe
export type HealthCondition = {
    conditionId: string;
    conditionName: string;
    description: string;
    diagnosedDate: string; // ISO 8601
    status: string; // VD: "Đang điều trị"
};

// Type cho Hồ sơ sức khỏe chi tiết của một thành viên
export type HealthProfile = {
    healthProfileId: string;
    memberId: string;
    bloodType: string;
    height: number;
    weight: number;
    bmi: number;
    insuranceNumber: string;
    conditions: HealthCondition[];
};

// Type cho Tổng quan sức khỏe của cả gia đình
export type FamilyHealthSummary = {
    memberId: string;
    fullName: string;
    avatarUrl: string | null;
    hasProfile: boolean;
    bloodType: string | null;
    bmi: number | null;
    activeConditionsCount: number;
    conditions: HealthCondition[];
};

// Request Body dùng chung cho Tạo mới (POST) và Cập nhật (PUT) Hồ sơ sức khỏe
export type UpsertHealthProfileRequest = {
    bloodType: string;
    height: number;
    weight: number;
    insuranceNumber: string;
};

// Request Body dùng chung cho Thêm mới (POST) và Cập nhật (PUT) Bệnh lý
export type UpsertConditionRequest = {
    conditionName: string;
    description: string;
    diagnosedDate: string; // ISO 8601
    status: string;
};