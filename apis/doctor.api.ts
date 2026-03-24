import { BaseResponse } from "@/types/APIResponse";
import { DoctorAvailabilityResponse, DoctorDetailResponse, DoctorReviewResponse } from "@/types/Doctor";
import { axiosClient } from "./client";

export async function getDoctorDetail(doctorId: string): Promise<BaseResponse<DoctorDetailResponse>> {
    try {
        const res = await axiosClient.get(`/api/v1/doctors/${doctorId}`);
        return res.data;
    } catch (error: any) {
        if (error.response?.data) return error.response.data;
        throw error;
    }
}

export async function getDoctorReviews(doctorId: string): Promise<BaseResponse<DoctorReviewResponse[]>> {
    try {
        const res = await axiosClient.get(`/api/v1/doctors/${doctorId}/reviews`);
        return res.data;
    } catch (error: any) {
        if (error.response?.data) return error.response.data;
        throw error;
    }
}

export async function getDoctorAvailabilities(doctorId: string): Promise<BaseResponse<DoctorAvailabilityResponse[]>> {
    try {
        const res = await axiosClient.get(`/api/v1/doctor-availabilities/doctors/${doctorId}`);
        return res.data;
    } catch (error: any) {
        if (error.response?.data) return error.response.data;
        throw error;
    }
}