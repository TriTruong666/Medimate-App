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
        // 1. CHUYỂN ĐỔI JSON THÀNH FORM DATA
        const formData = new FormData();

        // Form Data chỉ nhận chuỗi (string) hoặc File (Blob), nên phải ép kiểu số sang chuỗi
        formData.append("Score", data.score.toString());

        if (data.comment) {
            formData.append("Comment", data.comment);
        }

        // Nếu sau này bạn có truyền ảnh (file) từ UI, bạn thêm logic này:
        if (data.image) {
            formData.append("Image", data.image as any);
        }

        // 2. GỬI ĐI VỚI HEADER MULTIPART
        const res = await axiosClient.post(`/api/v1/ratings/session/${sessionId}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

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