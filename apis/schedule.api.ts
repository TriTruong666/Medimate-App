import { BaseResponse } from "@/types/APIResponse";
import {
    CreateBulkScheduleRequest,
    ReminderResponse,
    ScheduleResponse,
    UpdatePreferredTimesRequest,
    UpdateReminderActionRequest,
    UpdateScheduleDetailRequest,
    UpdateScheduleRequest
} from "@/types/Schedule";
import { axiosClient } from "./client";

// ----------------------------------------------------
// QUẢN LÝ LỊCH (SCHEDULES)
// ----------------------------------------------------

export async function getMemberSchedules(memberId: string): Promise<BaseResponse<ScheduleResponse[]>> {
    try {
        const res = await axiosClient.get(`/api/v1/members/${memberId}/schedules`);
        return res.data;
    } catch (error: any) {
        if (error.response?.data) return error.response.data;
        throw error;
    }
}

export async function getFamilySchedules(familyId: string): Promise<BaseResponse<ScheduleResponse[]>> {
    try {
        const res = await axiosClient.get(`/api/v1/families/${familyId}/schedules`);
        return res.data;
    } catch (error: any) {
        if (error.response?.data) return error.response.data;
        throw error;
    }
}

export async function getScheduleDetail(scheduleId: string): Promise<BaseResponse<ScheduleResponse>> {
    try {
        const res = await axiosClient.get(`/api/v1/schedules-detail/${scheduleId}`);
        return res.data;
    } catch (error: any) {
        if (error.response?.data) return error.response.data;
        throw error;
    }
}

// GỌI BULK CREATE API
export async function createBulkSchedules(memberId: string, data: CreateBulkScheduleRequest): Promise<BaseResponse<ScheduleResponse[]>> {
    try {
        const res = await axiosClient.post(`/api/v1/members/${memberId}/schedules/bulk`, data);
        return res.data;
    } catch (error: any) {
        if (error.response?.data) return error.response.data;
        throw error;
    }
}

// Cập nhật tên lịch và giờ báo thức
export async function updateSchedule(scheduleId: string, data: UpdateScheduleRequest): Promise<BaseResponse<any>> {
    try {
        const res = await axiosClient.put(`/api/v1/schedules/${scheduleId}`, data);
        return res.data;
    } catch (error: any) {
        if (error.response?.data) return error.response.data;
        throw error;
    }
}

// Cập nhật 1 loại thuốc bên trong lịch
export async function updateScheduleDetail(detailId: string, data: UpdateScheduleDetailRequest): Promise<BaseResponse<any>> {
    try {
        const res = await axiosClient.put(`/api/v1/schedule-details/${detailId}`, data);
        return res.data;
    } catch (error: any) {
        if (error.response?.data) return error.response.data;
        throw error;
    }
}

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

export async function getMemberDailyReminders(memberId: string, date: string): Promise<BaseResponse<ReminderResponse[]>> {
    try {
        const res = await axiosClient.get(`/api/v1/members/${memberId}/reminders/daily`, { params: { date } });
        return res.data;
    } catch (error: any) {
        if (error.response?.data) return error.response.data;
        throw error;
    }
}

export async function getFamilyDailyReminders(familyId: string, date: string): Promise<BaseResponse<ReminderResponse[]>> {
    try {
        const res = await axiosClient.get(`/api/v1/families/${familyId}/reminders/daily`, { params: { date } });
        return res.data;
    } catch (error: any) {
        if (error.response?.data) return error.response.data;
        throw error;
    }
}

export async function updateReminderAction(reminderId: string, data: UpdateReminderActionRequest): Promise<BaseResponse<any>> {
    try {
        const res = await axiosClient.put(`/api/v1/reminders/${reminderId}/action`, data);
        return res.data;
    } catch (error: any) {
        if (error.response?.data) return error.response.data;
        throw error;
    }
}

export async function snoozeReminder(reminderId: string, delayMinutes: number): Promise<BaseResponse<any>> {
    try {
        const res = await axiosClient.post(`/api/v1/reminders/${reminderId}/snooze`, delayMinutes, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        return res.data;
    } catch (error: any) {
        if (error.response?.data) return error.response.data;
        throw error;
    }
}

export async function updatePreferredTimes(
    memberId: string,
    data: UpdatePreferredTimesRequest
): Promise<BaseResponse<boolean>> {
    try {
        const res = await axiosClient.put(`/api/v1/members/${memberId}/preferred-times`, data);
        return res.data;
    } catch (error: any) {
        if (error.response?.data) return error.response.data;
        throw error;
    }
}