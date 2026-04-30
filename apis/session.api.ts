import { BaseResponse } from "@/types/APIResponse";
import { AttachPrescriptionRequest, JoinSessionRequest, SessionResponse } from "@/types/Session";
import { axiosClient } from "./client";

export async function getSessionByAppointmentId(appointmentId: string): Promise<BaseResponse<SessionResponse>> {
    try {
        const res = await axiosClient.get(`/api/v1/sessions/by-appointment/${appointmentId}`);
        return res.data;
    } catch (error: any) {
        if (error.response?.data) return error.response.data;
        throw error;
    }
}

export async function joinSession(sessionId: string, data: JoinSessionRequest): Promise<BaseResponse<SessionResponse>> {
    try {
        const res = await axiosClient.post(`/api/v1/sessions/${sessionId}/join`, data);
        return res.data;
    } catch (error: any) {
        if (error.response?.data) return error.response.data;
        throw error;
    }
}

export async function cancelNoShowSession(sessionId: string): Promise<BaseResponse<SessionResponse>> {
    try {
        const res = await axiosClient.put(`/api/v1/sessions/${sessionId}/cancel-no-show`);
        return res.data;
    } catch (error: any) {
        if (error.response?.data) return error.response.data;
        throw error;
    }
}

export async function endSession(sessionId: string): Promise<BaseResponse<SessionResponse>> {
    try {
        const res = await axiosClient.post(`/api/v1/sessions/${sessionId}/end`);
        return res.data;
    } catch (error: any) {
        if (error.response?.data) return error.response.data;
        throw error;
    }
}

export async function attachPrescriptionToSession(sessionId: string, data: AttachPrescriptionRequest): Promise<BaseResponse<SessionResponse>> {
    try {
        const res = await axiosClient.post(`/api/v1/sessions/${sessionId}/attach-prescription`, data);
        return res.data;
    } catch (error: any) {
        if (error.response?.data) return error.response.data;
        throw error;
    }
}

export async function getSessionRecordingUrl(sessionId: string): Promise<BaseResponse<string>> {
    try {
        const res = await axiosClient.get(`/api/v1/sessions/${sessionId}/recording`);
        return res.data;
    } catch (error: any) {
        if (error.response?.data) return error.response.data;
        throw error;
    }
}