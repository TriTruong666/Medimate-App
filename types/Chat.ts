

export type MessageDto = {
    messageId: string;
    sessionId: string;
    senderId: string;
    senderName: string;
    senderAvatar: string | null;
    senderType: number; // VD: 0 là User, 1 là Doctor
    content: string;
    attachmentUrl: string | null;
    isRead: boolean;
    sendAt: string;
};

export type SessionDetailDto = {
    sessionId: string;
    partnerName: string;
    partnerAvatar: string | null;
    status: string;
    lastMessage: string;
    lastMessageTime: string;
    unreadCount: number;
};

// Kiểu dữ liệu file dùng cho React Native (Expo ImagePicker/DocumentPicker)
export type UploadFile = {
    uri: string;
    name: string;
    type: string;
};