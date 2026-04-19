import { authSessionAtom, kickOutAtom } from "@/stores/authStore";
import { usePopup } from "@/stores/popupStore";
import { useToast } from "@/stores/toastStore";
import * as signalR from "@microsoft/signalr";
import { useQueryClient } from "@tanstack/react-query";
import * as SecureStore from "expo-secure-store";
import { getDefaultStore, useAtomValue } from "jotai";
import { useEffect, useRef, useState } from "react";
import { AppState, AppStateStatus, Platform } from "react-native";

let connection: signalR.HubConnection | null = null;

/**
 * Lấy connection hiện tại (read-only) để component tự đăng ký listener
 */
export function getSignalRConnection() {
    return connection;
}

/**
 * Đăng ký lắng nghe tin nhắn mới theo sessionId cụ thể.
 * Trả về hàm unsubscribe để gọi trong cleanup của useEffect.
 *
 * @param sessionId - ID phiên chat cần lắng nghe
 * @param callback  - Hàm nhận message data khi có tin mới
 */
export function subscribeChatMessages(
    sessionId: string,
    callback: (data: any) => void
): () => void {
    if (!connection) return () => {};

    const handler = (data: any) => {
        // So sánh cả 2 dạng field name (camelCase & PascalCase) vì server có thể gửi khác nhau
        const incomingSessionId = data?.sessionId ?? data?.SessionId ?? data?.ConsultanSessionId ?? data?.consultanSessionId;
        if (incomingSessionId === sessionId) {
            callback(data);
        }
    };

    connection.on("ReceiveMessage", handler);

    return () => {
        connection?.off("ReceiveMessage", handler);
    };
}
const base_net_url = process.env.EXPO_PUBLIC_NET_API_URL;

export function useAppSignalR() {
    const queryClient = useQueryClient();
    const session = useAtomValue(authSessionAtom);
    const [isConnected, setIsConnected] = useState(false);
    const toast = useToast();
    const { open } = usePopup();

    useEffect(() => {
        let isMounted = true;

        // ── LOGOUT: Ngắt kết nối ngay lập tức khi session là null/undefined ──
        if (!session) {
            if (connection) {
                console.log("🔴 [SignalR] Session cleared (logout) — Stopping connection...");
                connection.stop().catch(() => {});
                connection = null;
            }
            if (isMounted) setIsConnected(false);
            // Trả về cleanup function rỗng (không cần AppState listener khi chưa login)
            return () => { isMounted = false; };
        }

        // ── LOGIN: Khởi tạo kết nối SignalR ───────────────────────────────────
        const startConnection = async () => {
            if (!base_net_url) return;

            // Nếu đang Connected / Connecting / Reconnecting thì không làm gì thêm
            if (connection && (
                connection.state === signalR.HubConnectionState.Connected ||
                connection.state === signalR.HubConnectionState.Connecting ||
                connection.state === signalR.HubConnectionState.Reconnecting
            )) {
                if (connection.state === signalR.HubConnectionState.Connected && isMounted) {
                    setIsConnected(true);
                }
                return;
            }

            const token = await SecureStore.getItemAsync("accessToken");
            if (!token) return;

            // Tạo connection mới nếu chưa có
            if (!connection) {
                let url = `${base_net_url}/hub/medimate`;
                if (Platform.OS === 'android' && url.includes('localhost')) {
                    url = url.replace('localhost', '10.0.2.2');
                }

                connection = new signalR.HubConnectionBuilder()
                    .withUrl(url, {
                        accessTokenFactory: async () => {
                            const tk = await SecureStore.getItemAsync("accessToken");
                            return tk || "";
                        },
                        skipNegotiation: true,
                        transport: signalR.HttpTransportType.WebSockets,
                    })
                    .withAutomaticReconnect([0, 2000, 5000, 10000, 30000, 60000])
                    .configureLogging(signalR.LogLevel.Warning)
                    .build();

                // ── Event Handlers ──────────────────────────────────────────────

                connection.on("ReceiveNotification", (notif: any) => {
                    console.log("🔔 [SignalR] ReceiveNotification:", notif);
                    queryClient.invalidateQueries({ queryKey: ["notifications"] });
                    if (notif?.title) {
                        toast.success(notif.title, notif.message || "Bạn có thông báo mới");
                    }
                });

                connection.on("ReceiveNotificationUpdate", () => {
                    console.log("🔔 [SignalR] ReceiveNotificationUpdate");
                    queryClient.invalidateQueries({ queryKey: ["notifications"] });
                });

                connection.on("AppointmentStatusUpdated", (data: any) => {
                    console.log("📅 [SignalR] AppointmentStatusUpdated:", data);
                    queryClient.invalidateQueries({ queryKey: ["my-appointments"] });
                    queryClient.invalidateQueries({ queryKey: ["appointment-detail"] });
                    queryClient.invalidateQueries({ queryKey: ["available-slots"] });
                    if (data?.status) {
                        toast.success("Lịch khám cập nhật", `Trạng thái: ${data.status}`);
                    }
                });

                connection.on("ReceiveMessage", (data: any) => {
                    console.log("💬 [SignalR] ReceiveMessage:", data);
                    queryClient.invalidateQueries({ queryKey: ["chat-messages", data?.sessionId] });
                    queryClient.invalidateQueries({ queryKey: ["session-details"] });
                    if (data?.senderName) {
                        toast.success(`Tin nhắn từ ${data.senderName}`, data.content || "[Hình ảnh đính kèm]");
                    }
                });

                connection.on("ReceiveMessageUpdate", () => {
                    console.log("💬 [SignalR] ReceiveMessageUpdate (Đã đọc)");
                    queryClient.invalidateQueries({ queryKey: ["chat-messages"] });
                    queryClient.invalidateQueries({ queryKey: ["session-details"] });
                });

                connection.on("ReceiveMedicationLogUpdate", () => {
                    console.log("💊 [SignalR] ReceiveMedicationLogUpdate");
                    queryClient.invalidateQueries({ queryKey: ["member-med-logs"] });
                    queryClient.invalidateQueries({ queryKey: ["family-med-logs"] });
                    queryClient.invalidateQueries({ queryKey: ["schedule-stats"] });
                    queryClient.invalidateQueries({ queryKey: ["member-reminders"] });
                    queryClient.invalidateQueries({ queryKey: ["family-reminders"] });
                });

                connection.on("ForceLogout", async (data: { message?: string } = {}) => {
                    console.log("🔴 [SignalR] ForceLogout — Stopping and clearing session...");
                    if (connection) {
                        try { await connection.stop(); } catch { /* ignore */ }
                        connection = null;
                    }
                    await SecureStore.deleteItemAsync("accessToken");
                    const store = getDefaultStore();
                    store.set(authSessionAtom, undefined);
                    const message = data?.message || "Tài khoản của bạn đã đăng nhập trên một thiết bị khác.";
                    store.set(kickOutAtom, { message, isKickedOut: true });
                });

                connection.on("GuardianSessionInvite", (data: {
                    sessionId: string; memberName: string; memberAvatarUrl?: string; doctorName: string; scheduledTime: string;
                }) => {
                    console.log("👨‍👩‍👦 [SignalR] GuardianSessionInvite:", data);
                    open({ type: 'guardian_invite', data });
                });

                connection.on("GuardianJoined", (data: {
                    sessionId: string; guardianName: string; memberName: string;
                }) => {
                    console.log("👤 [SignalR] GuardianJoined:", data);
                    toast.success(`${data.guardianName} đã tham gia`, `Người giám hộ của ${data.memberName} vừa vào phòng khám.`);
                    queryClient.invalidateQueries({ queryKey: ["session", data.sessionId] });
                });

                // Lifecycle
                connection.onreconnecting((err) => {
                    console.log("🟡 [SignalR] Reconnecting...", err);
                    if (isMounted) setIsConnected(false);
                });
                connection.onreconnected((id) => {
                    console.log("🟢 [SignalR] Reconnected. ConnectionId:", id);
                    if (isMounted) setIsConnected(true);
                });
                connection.onclose((err) => {
                    console.log("🔴 [SignalR] Connection closed.", err);
                    if (isMounted) setIsConnected(false);
                });
            }

            // Start với timeout 2 giây để tránh treo UI
            if (connection.state === signalR.HubConnectionState.Disconnected) {
                try {
                    console.log("⏳ [SignalR] Connecting (timeout 2s)...");

                    const startPromise = connection.start();
                    const timeoutPromise = new Promise<never>((_, reject) =>
                        setTimeout(() => reject(new Error("SignalR_Connection_Timeout")), 2000)
                    );

                    await Promise.race([startPromise, timeoutPromise]);

                    if (isMounted) setIsConnected(true);
                    console.log("🟢 [SignalR] Connected successfully.");
                } catch (err: any) {
                    if (err?.message === "SignalR_Connection_Timeout") {
                        console.log("🟡 [SignalR] Kết nối quá 2s, bỏ qua để tránh treo.");
                        return;
                    }
                    if (err?.message?.includes("stop() was called")) {
                        console.log("🟡 [SignalR] Start aborted by stop().");
                        return;
                    }
                    console.log("🔴 [SignalR] Connection Error:", err);
                }
            }
        };

        // Kết nối ngay khi hook mount / session thay đổi
        startConnection().catch(() => {});

        // Kết nối lại khi App quay về Foreground
        const appStateSubscription = AppState.addEventListener("change", (nextAppState: AppStateStatus) => {
            if (nextAppState === "active") {
                console.log("📱 [SignalR] App về Foreground, kiểm tra kết nối...");
                if (!connection || connection.state === signalR.HubConnectionState.Disconnected) {
                    startConnection().catch(() => {});
                }
            }
        });

        return () => {
            isMounted = false;
            appStateSubscription.remove();
        };
    }, [session]);  // Chỉ phụ thuộc session — đảm bảo disconnect ngay khi logout

    return { isConnected };
}

// Global Injector — mount 1 lần duy nhất trong _layout.tsx
export function SignalRInjector() {
    useAppSignalR();
    return null;
}

/**
 * Hook tiện ích cho component cần lắng nghe tin nhắn realtime của một session.
 * Tự động đăng ký/huỷ đăng ký khi sessionId hoặc callback thay đổi.
 */
export function useChatSignalR(
    sessionId: string | undefined,
    onNewMessage: (data: any) => void
) {
    const callbackRef = useRef(onNewMessage);
    callbackRef.current = onNewMessage; // Luôn dùng bản mới nhất, không cần re-subscribe

    useEffect(() => {
        if (!sessionId) return;

        // Dùng stable ref để tránh re-subscribe mỗi render
        const unsubscribe = subscribeChatMessages(sessionId, (data) => {
            callbackRef.current(data);
        });

        return unsubscribe;
    }, [sessionId]); // Chỉ re-subscribe khi sessionId thay đổi
}
