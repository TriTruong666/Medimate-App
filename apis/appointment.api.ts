import { BasePaginatedResponse, BaseResponse } from "@/types/APIResponse";
import {
    AppointmentFilterRequest,
    AppointmentResponse,
    AvailableSlotResponse,
    CancelAppointmentRequest,
    CreateAppointmentRequest,
    RescheduleAppointmentRequest,
} from "@/types/Appointment";
import { axiosClient } from "./client";

// ─── Lấy khung giờ trống của bác sĩ theo ngày ─────────────────
export async function getDoctorAvailableSlots(
    doctorId: string,
    date: string  // "YYYY-MM-DD"
): Promise<BaseResponse<AvailableSlotResponse[]>> {
    try {
        const res = await axiosClient.get(`/api/v1/appointments/doctors/${doctorId}/available-slots`, {
            params: { date },
        });
        return res.data;
    } catch (error: any) {
        if (error.response?.data) return error.response.data;
        throw error;
    }
}

// ─── Đặt lịch khám mới ────────────────────────────────────────
export async function createAppointment(
    data: CreateAppointmentRequest
): Promise<BaseResponse<AppointmentResponse>> {
    try {
        const res = await axiosClient.post("/api/v1/appointments", data);
        return res.data;
    } catch (error: any) {
        if (error.response?.data) return error.response.data;
        throw error;
    }
}

// ─── Lấy danh sách lịch hẹn của member hiện tại ───────────────
export async function getMyAppointments(
    filter?: AppointmentFilterRequest
): Promise<BasePaginatedResponse<AppointmentResponse[]>> {
    try {
        const res = await axiosClient.get("/api/v1/appointments/me", { params: filter });
        return res.data;
    } catch (error: any) {
        if (error.response?.data) return error.response.data;
        throw error;
    }
}

// ─── Lấy chi tiết một lịch hẹn ────────────────────────────────
export async function getAppointmentDetail(
    appointmentId: string
): Promise<BaseResponse<AppointmentResponse>> {
    try {
        const res = await axiosClient.get(`/api/v1/appointments/${appointmentId}`);
        return res.data;
    } catch (error: any) {
        if (error.response?.data) return error.response.data;
        throw error;
    }
}

// ─── Đổi lịch hẹn sang khung giờ khác ────────────────────────
export async function rescheduleAppointment(
    appointmentId: string,
    data: RescheduleAppointmentRequest
): Promise<BaseResponse<AppointmentResponse>> {
    try {
        const res = await axiosClient.put(`/api/v1/appointments/${appointmentId}/reschedule`, data);
        return res.data;
    } catch (error: any) {
        if (error.response?.data) return error.response.data;
        throw error;
    }
}

// ─── Hủy lịch hẹn ─────────────────────────────────────────────
export async function cancelAppointment(
    appointmentId: string,
    data: CancelAppointmentRequest
): Promise<BaseResponse<AppointmentResponse>> {
    try {
        const res = await axiosClient.put(`/api/v1/appointments/${appointmentId}/cancel`, data);
        return res.data;
    } catch (error: any) {
        if (error.response?.data) return error.response.data;
        throw error;
    }
}

// ─── Xác nhận lịch hẹn (manager/admin) ────────────────────────
export async function confirmAppointment(
    appointmentId: string
): Promise<BaseResponse<AppointmentResponse>> {
    try {
        const res = await axiosClient.put(`/api/v1/appointments/${appointmentId}/status`);
        return res.data;
    } catch (error: any) {
        if (error.response?.data) return error.response.data;
        throw error;
    }
}