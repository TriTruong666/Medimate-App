import { BaseResponse } from "@/types/APIResponse";
import {
    AppointmentResponse,
    AvailableSlotResponse,
    CancelAppointmentRequest,
    CreateAppointmentRequest
} from "@/types/Appointment";
import { axiosClient } from "./client";

// Lấy các khung giờ trống của bác sĩ
export async function getDoctorAvailableSlots(doctorId: string, date: string): Promise<BaseResponse<AvailableSlotResponse[]>> {
    try {
        const res = await axiosClient.get(`/api/v1/appointments/doctors/${doctorId}/available-slots`, {
            params: { date }
        });
        return res.data;
    } catch (error: any) {
        if (error.response?.data) return error.response.data;
        throw error;
    }
}

// Đặt lịch khám mới
export async function createAppointment(data: CreateAppointmentRequest): Promise<BaseResponse<AppointmentResponse>> {
    try {
        const res = await axiosClient.post("/api/v1/appointments", data);
        return res.data;
    } catch (error: any) {
        if (error.response?.data) return error.response.data;
        throw error;
    }
}

// Hủy lịch khám
export async function cancelAppointment(appointmentId: string, data: CancelAppointmentRequest): Promise<BaseResponse<AppointmentResponse>> {
    try {
        const res = await axiosClient.put(`/api/v1/appointments/${appointmentId}/cancel`, data);
        return res.data;
    } catch (error: any) {
        if (error.response?.data) return error.response.data;
        throw error;
    }
}