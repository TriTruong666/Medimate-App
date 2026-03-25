export type ChatSessionResponse = {
    sessionId: string;
    partnerName: string;
    partnerAvatar: string;
    status: string;
    lastMessage: string;
    lastMessageTime: string;
    unreadCount: number;
};

export type ChatMessageResponse = {
    messageId: string;
    sessionId: string;
    senderId: string;
    senderName: string;
    senderAvatar: string;
    senderType: number;
    content: string;
    attachmentUrl?: string | null;
    isRead: boolean;
    sendAt: string;
};