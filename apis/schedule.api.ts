// apis/schedule.api.ts
import { BaseResponse } from "@/types/APIResponse";
import {
    CreateScheduleRequest,
    ReminderResponse,
    ScheduleResponse,
    UpdateReminderActionRequest,
    UpdateScheduleRequest
} from "@/types/Schedule";
import { axiosClient } from "./client";

// ----------------------------------------------------
// QUẢN LÝ LỊCH (SCHEDULES)
// ----------------------------------------------------

// Lấy danh sách lịch của 1 thành viên
export async function getMemberSchedules(memberId: string): Promise<BaseResponse<ScheduleResponse[]>> {
    try {
        const res = await axiosClient.get(`/api/v1/members/${memberId}/schedules`);
        return res.data;
    } catch (error: any) {
        if (error.response?.data) return error.response.data;
        throw error;
    }
}

// Lấy danh sách lịch của cả gia đình
export async function getFamilySchedules(familyId: string): Promise<BaseResponse<ScheduleResponse[]>> {
    try {
        const res = await axiosClient.get(`/api/v1/families/${familyId}/schedules`);
        return res.data;
    } catch (error: any) {
        if (error.response?.data) return error.response.data;
        throw error;
    }
}

// Tạo lịch mới cho thành viên
export async function createSchedule(memberId: string, data: CreateScheduleRequest): Promise<BaseResponse<any>> {
    try {
        const res = await axiosClient.post(`/api/v1/members/${memberId}/schedules`, data);
        return res.data;
    } catch (error: any) {
        if (error.response?.data) return error.response.data;
        throw error;
    }
}

// Cập nhật lịch
export async function updateSchedule(scheduleId: string, data: UpdateScheduleRequest): Promise<BaseResponse<any>> {
    try {
        const res = await axiosClient.put(`/api/v1/schedules/${scheduleId}`, data);
        return res.data;
    } catch (error: any) {
        if (error.response?.data) return error.response.data;
        throw error;
    }
}

// Xóa lịch
export async function deleteSchedule(scheduleId: string): Promise<BaseResponse<any>> {
    try {
        const res = await axiosClient.delete(`/api/v1/schedules/${scheduleId}`);
        return res.data;
    } catch (error: any) {
        if (error.response?.data) return error.response.data;
        throw error;
    }
}

// ----------------------------------------------------
// QUẢN LÝ NHẮC NHỞ (REMINDERS)
// ----------------------------------------------------

// Lấy nhắc nhở trong ngày của 1 thành viên
export async function getMemberDailyReminders(memberId: string, date: string): Promise<BaseResponse<ReminderResponse[]>> {
    try {
        // date truyền vào format: YYYY-MM-DD
        const res = await axiosClient.get(`/api/v1/members/${memberId}/reminders/daily`, {
            params: { date }
        });
        return res.data;
    } catch (error: any) {
        if (error.response?.data) return error.response.data;
        throw error;
    }
}

// Lấy nhắc nhở trong ngày của cả gia đình
export async function getFamilyDailyReminders(familyId: string, date: string): Promise<BaseResponse<ReminderResponse[]>> {
    try {
        const res = await axiosClient.get(`/api/v1/families/${familyId}/reminders/daily`, {
            params: { date }
        });
        return res.data;
    } catch (error: any) {
        if (error.response?.data) return error.response.data;
        throw error;
    }
}

// Cập nhật trạng thái uống thuốc (Taken, Skipped...)
export async function updateReminderAction(reminderId: string, data: UpdateReminderActionRequest): Promise<BaseResponse<any>> {
    try {
        const res = await axiosClient.put(`/api/v1/reminders/${reminderId}/action`, data);
        return res.data;
    } catch (error: any) {
        if (error.response?.data) return error.response.data;
        throw error;
    }
}