import * as ChatApi from "@/apis/chat.api";
import { UploadFile } from "@/types/Chat";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// ─── 1. Hook lấy chi tiết Session ───
export function useGetSessionDetails(sessionId: string | undefined, isDoctorRequest: boolean = false) {
    return useQuery({
        queryKey: ["session-details", sessionId, isDoctorRequest],
        queryFn: async () => {
            if (!sessionId) throw new Error("Missing Session ID");
            const res = await ChatApi.getSessionDetails(sessionId, isDoctorRequest);
            if (!res.success) throw new Error(res.message);
            return res.data;
        },
        enabled: !!sessionId,
    });
}

// ─── 2. Hook lấy danh sách Message ───
export function useGetMessages(sessionId: string | undefined) {
    return useQuery({
        queryKey: ["chat-messages", sessionId],
        queryFn: async () => {
            if (!sessionId) throw new Error("Missing Session ID");
            const res = await ChatApi.getMessages(sessionId);
            if (!res.success) throw new Error(res.message);
            return res.data;
        },
        enabled: !!sessionId,
        // Tuỳ chọn: refetchInterval: 3000 -> Nếu bạn muốn app tự gọi lại API mỗi 3s để cập nhật tin nhắn mới (Polling)
    });
}

// ─── 3. Hook Gửi tin nhắn ───
export function useSendMessage() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ sessionId, content, file }: { sessionId: string; content: string; file?: UploadFile }) =>
            ChatApi.sendMessage(sessionId, content, file),
        onSuccess: (data, variables) => {
            // Gửi xong thì làm mới lại danh sách tin nhắn và chi tiết phiên chat
            queryClient.invalidateQueries({ queryKey: ["chat-messages", variables.sessionId] });
            queryClient.invalidateQueries({ queryKey: ["session-details", variables.sessionId] });
        }
    });
}

// ─── 4. Hook đánh dấu đã đọc ───
export function useMarkMessagesAsRead() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (sessionId: string) => ChatApi.markMessagesAsRead(sessionId),
        onSuccess: (_, sessionId) => {
            // Cập nhật lại UI UnreadCount về 0
            queryClient.invalidateQueries({ queryKey: ["session-details", sessionId] });
            queryClient.invalidateQueries({ queryKey: ["chat-messages", sessionId] });
        }
    });
}