// apis/medicationLog.api.ts
import { BaseResponse } from "@/types/APIResponse";
import { MedicationLogActionRequest, MedicationLogResponse } from "@/types/MedicationLog";
import { axiosClient } from "./client";

// 1. Ghi nhận hành động uống thuốc (Taken, Skipped...)
export async function logMedicationAction(data: MedicationLogActionRequest): Promise<BaseResponse<MedicationLogResponse>> {
    try {
        const res = await axiosClient.post(`/api/v1/medicationlogs/action`, data);
        return res.data;
    } catch (error: any) {
        if (error.response?.data) return error.response.data;
        throw error;
    }
}

// 2. Lấy lịch sử uống thuốc của 1 THÀNH VIÊN (có thể lọc theo ngày)
export async function getMemberMedicationLogs(
    memberId: string,
    startDate?: string,
    endDate?: string
): Promise<BaseResponse<MedicationLogResponse[]>> {
    try {
        const res = await axiosClient.get(`/api/v1/medicationlogs/member/${memberId}`, {
            params: { startDate, endDate } // Axios tự động bỏ qua param nếu undefined
        });
        return res.data;
    } catch (error: any) {
        if (error.response?.data) return error.response.data;
        throw error;
    }
}

// 3. Lấy lịch sử uống thuốc của TOÀN GIA ĐÌNH (dành cho Dashboard của chủ hộ)
export async function getFamilyMedicationLogs(
    familyId: string,
    startDate?: string,
    endDate?: string
): Promise<BaseResponse<MedicationLogResponse[]>> {
    try {
        const res = await axiosClient.get(`/api/v1/medicationlogs/family/${familyId}`, {
            params: { startDate, endDate }
        });
        return res.data;
    } catch (error: any) {
        if (error.response?.data) return error.response.data;
        throw error;
    }
}

// 4. Thống kê tỷ lệ tuân thủ (Adherence Rate) của 1 lịch uống thuốc
// Theo Swagger, data trả về là string (VD: "85.5%" hoặc một chuỗi JSON)
export async function getScheduleStats(scheduleId: string): Promise<BaseResponse<string>> {
    try {
        const res = await axiosClient.get(`/api/v1/medicationlogs/stats/${scheduleId}`);
        return res.data;
    } catch (error: any) {
        if (error.response?.data) return error.response.data;
        throw error;
    }
}