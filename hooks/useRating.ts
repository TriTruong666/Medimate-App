import * as RatingApi from "@/apis/rating.api";
import { RatingRequest } from "@/types/Rating";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

/**
 * Kiểm tra xem phiên khám đó đã được đánh giá chưa.
 * Trả về RatingResponse nếu đã đánh giá, null nếu chưa (HTTP 404).
 */
export function useGetRatingBySession(sessionId: string | undefined) {
    return useQuery({
        queryKey: ["rating-by-session", sessionId],
        queryFn: async () => {
            if (!sessionId) return null;
            const res = await RatingApi.getRatingBySession(sessionId);
            // 404 = chưa đánh giá → trả null thay vì throw
            if (!res.success) return null;
            return res.data ?? null;
        },
        enabled: !!sessionId,
        staleTime: 1000 * 60 * 5, // 5 phút - ít thay đổi
    });
}

/**
 * Hook tạo đánh giá mới cho một phiên khám.
 * Sau khi thành công: invalidate cache rating + doctor-ratings để cập nhật điểm trung bình.
 */
export function useCreateRating(sessionId: string | undefined) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: RatingRequest) => {
            if (!sessionId) throw new Error("Thiếu sessionId");
            return RatingApi.createRating(sessionId, data);
        },
        onSuccess: (res) => {
            if (res.success && res.data) {
                // Invalidate để card biết là đã rated
                queryClient.invalidateQueries({ queryKey: ["rating-by-session", sessionId] });
                // Invalidate doctor detail để cập nhật averageRating
                queryClient.invalidateQueries({ queryKey: ["doctor"] });
                // Invalidate danh sách bác sĩ (index page)
                queryClient.invalidateQueries({ queryKey: ["doctors"] });
                // Invalidate reviews section trong doctor_detail
                queryClient.invalidateQueries({ queryKey: ["doctor-reviews"] });
                queryClient.invalidateQueries({ queryKey: ["doctor-ratings"] });
            }
        },
    });
}

/**
 * Hook lấy danh sách đánh giá của bác sĩ (dùng cho trang Profile bác sĩ)
 */
export function useGetDoctorRatings(doctorId: string | undefined) {
    return useQuery({
        queryKey: ["doctor-ratings", doctorId],
        queryFn: async () => {
            if (!doctorId) return [];
            const res = await RatingApi.getDoctorRatings(doctorId);
            if (!res.success) throw new Error(res.message);
            return res.data ?? [];
        },
        enabled: !!doctorId,
    });
}

/**
 * Hook xóa đánh giá
 */
export function useDeleteRating() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (ratingId: string) => RatingApi.deleteRating(ratingId),
        onSuccess: (res) => {
            if (res.success) {
                queryClient.invalidateQueries({ queryKey: ["doctor-ratings"] });
                queryClient.invalidateQueries({ queryKey: ["rating-by-session"] });
            }
        },
    });
}