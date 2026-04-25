import { BaseResponse } from "@/types/APIResponse";
import {
    AppointmentDetailResponse,
    AppointmentFilterRequest,
    AppointmentPaymentResponse,
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
): Promise<BaseResponse<AppointmentPaymentResponse>> {
    try {
        const res = await axiosClient.post("/api/v1/appointments", data);
        return res.data;
    } catch (error: any) {
        if (error.response?.data) return error.response.data;
        throw error;
    }
}

// ─── Hủy slot chưa thanh toán (tắt checkout giữa chừng) ─────────────────

// ─── Lấy danh sách lịch hẹn của member hiện tại ─────────────────
export async function getMyAppointments(
    filter?: AppointmentFilterRequest
): Promise<BaseResponse<AppointmentResponse[]>> {
    try {
        const res = await axiosClient.get("/api/v1/appointments", { params: filter });
        return res.data;
    } catch (error: any) {
        if (error.response?.data) return error.response.data;
        throw error;
    }
}

export async function getAppointmentById(
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
export async function getAppointmentDetail(appointmentId: string): Promise<BaseResponse<AppointmentDetailResponse>> {
    try {
        const res = await axiosClient.get(`/api/v1/appointments/detail/${appointmentId}`);
        return res.data;
    } catch (error: any) {
        if (error.response?.data) return error.response.data;
        throw error;
    }
}

export async function getMyMemberAppointments(): Promise<BaseResponse<AppointmentResponse[]>> {
    try {
        // Đúng theo ảnh Swagger: /api/v1/appointments/members/me
        const res = await axiosClient.get("/api/v1/appointments/members/me");
        return res.data;
    } catch (error: any) {
        if (error.response?.data) return error.response.data;
        throw error;
    }
}

export async function deleteUnpaidAppointment(appointmentId: string): Promise<BaseResponse<boolean>> {
    try {
        const res = await axiosClient.delete(`/api/v1/appointments/${appointmentId}/unpaid`);
        return res.data;
    } catch (error: any) {
        if (error.response?.data) return error.response.data;
        throw error;
    }
}