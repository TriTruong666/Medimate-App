import { BasePaginatedResponse, BaseResponse } from "@/types/APIResponse";
import {
    CreateDoctorReviewRequest,
    DoctorAvailabilityResponse,
    DoctorDetailResponse,
    DoctorFilterRequest,
    DoctorListItem,
    DoctorReviewResponse,
} from "@/types/Doctor";
import { axiosClient } from "./client";

// ─── Lấy danh sách bác sĩ (có filter) ───────────────────────
export async function getDoctors(filter?: DoctorFilterRequest): Promise<BasePaginatedResponse<DoctorListItem[]>> {
    try {
        const res = await axiosClient.get("/api/v1/doctors", { params: filter });
        return res.data;
    } catch (error: any) {
        if (error.response?.data) return error.response.data;
        throw error;
    }
}

// ─── Lấy chi tiết một bác sĩ ────────────────────────────────
export async function getDoctorDetail(doctorId: string): Promise<BaseResponse<DoctorDetailResponse>> {
    try {
        const res = await axiosClient.get(`/api/v1/doctors/${doctorId}`);
        return res.data;
    } catch (error: any) {
        if (error.response?.data) return error.response.data;
        throw error;
    }
}

// ─── Lấy đánh giá của bác sĩ ─────────────────────────────────
export async function getDoctorReviews(doctorId: string): Promise<BaseResponse<DoctorReviewResponse[]>> {
    try {
        const res = await axiosClient.get(`/api/v1/doctors/${doctorId}/reviews`);
        return res.data;
    } catch (error: any) {
        if (error.response?.data) return error.response.data;
        throw error;
    }
}

// ─── Gửi đánh giá bác sĩ sau buổi tư vấn ────────────────────
export async function createDoctorReview(data: CreateDoctorReviewRequest): Promise<BaseResponse<DoctorReviewResponse>> {
    try {
        const res = await axiosClient.post("/api/v1/ratings", data);
        return res.data;
    } catch (error: any) {
        if (error.response?.data) return error.response.data;
        throw error;
    }
}

// ─── Lấy lịch làm việc của bác sĩ (theo ngày trong tuần) ─────
export async function getDoctorAvailabilities(doctorId: string): Promise<BaseResponse<DoctorAvailabilityResponse[]>> {
    try {
        const res = await axiosClient.get(`/api/v1/doctor-availabilities/doctors/${doctorId}`);
        return res.data;
    } catch (error: any) {
        if (error.response?.data) return error.response.data;
        throw error;
    }
}