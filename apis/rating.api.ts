import { BaseResponse } from "@/types/APIResponse";
import { RatingRequest, RatingResponse } from "@/types/Rating";
import { axiosClient } from "./client";

/**
 * Tạo đánh giá cho một phiên khám (sessionId)
 */
export async function createRating(
    sessionId: string,
    data: RatingRequest
): Promise<BaseResponse<RatingResponse>> {
    try {
        const res = await axiosClient.post(`/api/v1/ratings/session/${sessionId}`, data);
        return res.data;
    } catch (error: any) {
        if (error.response?.data) return error.response.data;
        throw error;
    }
}

/**
 * Kiểm tra xem phiên khám đó đã được đánh giá chưa (trả về null nếu chưa)
 */
export async function getRatingBySession(sessionId: string): Promise<BaseResponse<RatingResponse>> {
    try {
        const res = await axiosClient.get(`/api/v1/ratings/session/${sessionId}`);
        return res.data;
    } catch (error: any) {
        if (error.response?.data) return error.response.data;
        throw error;
    }
}

/**
 * Lấy danh sách đánh giá của một bác sĩ
 */
export async function getDoctorRatings(doctorId: string): Promise<BaseResponse<RatingResponse[]>> {
    try {
        const res = await axiosClient.get(`/api/v1/ratings/doctor/${doctorId}`);
        return res.data;
    } catch (error: any) {
        if (error.response?.data) return error.response.data;
        throw error;
    }
}

/**
 * Lấy chi tiết một đánh giá
 */
export async function getRatingById(ratingId: string): Promise<BaseResponse<RatingResponse>> {
    try {
        const res = await axiosClient.get(`/api/v1/ratings/${ratingId}`);
        return res.data;
    } catch (error: any) {
        if (error.response?.data) return error.response.data;
        throw error;
    }
}

/**
 * Xóa một đánh giá
 */
export async function deleteRating(ratingId: string): Promise<BaseResponse<boolean>> {
    try {
        const res = await axiosClient.delete(`/api/v1/ratings/${ratingId}`);
        return res.data;
    } catch (error: any) {
        if (error.response?.data) return error.response.data;
        throw error;
    }
}