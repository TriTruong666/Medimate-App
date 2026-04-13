export type RatingRequest = {
    score: number;
    comment?: string;
    image?: any; // Thêm dòng này (để type là any vì React Native File object hơi đặc thù)
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