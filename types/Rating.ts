export type RatingRequest = {
    score: number;   // Từ 1 - 5
    comment: string; // Nội dung đánh giá
};

export type RatingResponse = {
    ratingId: string;
    sessionId: string;
    score: number;
    comment: string;
    createdAt: string;
    // Bổ sung thêm các trường thường có trong response danh sách
    userName?: string;
    userAvatar?: string;
};