import { authSessionAtom, kickOutAtom } from "@/stores/authStore";
import { usePopup } from "@/stores/popupStore";
import { useToast } from "@/stores/toastStore";
import * as signalR from "@microsoft/signalr";
import { useQueryClient } from "@tanstack/react-query";
import * as SecureStore from "expo-secure-store";
import { getDefaultStore, useAtomValue } from "jotai";
import { useEffect, useState } from "react";
import { AppState, AppStateStatus, Platform } from "react-native";

let connection: signalR.HubConnection | null = null;
const base_net_url = process.env.EXPO_PUBLIC_NET_API_URL;

export function useAppSignalR() {
    const queryClient = useQueryClient();
    const session = useAtomValue(authSessionAtom);
    const [isConnected, setIsConnected] = useState(false);
    const toast = useToast();
    const { open } = usePopup();

    useEffect(() => {
        let isMounted = true;

        const startConnection = async () => {
            if (!base_net_url) return;

            // Nếu đang có kết nối hoặc đang cố kết nối thì không làm gì
            if (connection && (connection.state === signalR.HubConnectionState.Connected || connection.state === signalR.HubConnectionState.Connecting || connection.state === signalR.HubConnectionState.Reconnecting)) {
                if (connection.state === signalR.HubConnectionState.Connected && isMounted) {
                    setIsConnected(true);
                }
                return;
            }

            const token = await SecureStore.getItemAsync("accessToken");
            if (!token) return;

            // Nếu chưa có kết nối hoàn toàn, tạo mới
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
                    .withAutomaticReconnect([0, 2000, 5000, 10000, 30000, 60000]) // Thêm thời gian retry để ổn định hơn
                    .configureLogging(signalR.LogLevel.Warning)
                    .build();

                // ===== Đăng ký Event Handlers =====

                connection.on("ReceiveNotification", (notif: any) => {
                    console.log("🔔 [SignalR] ReceiveNotification:", notif);
                    queryClient.invalidateQueries({ queryKey: ["notifications"] });
                    if (notif && notif.title) {
                        toast.success(notif.title, notif.message || "Bạn có thông báo mới");
                    }
                });

                connection.on("ReceiveNotificationUpdate", () => {
                    console.log("🔔 [SignalR] Dấu đọc thông báo update");
                    queryClient.invalidateQueries({ queryKey: ["notifications"] });
                });

                connection.on("AppointmentStatusUpdated", (data: any) => {
                    console.log("📅 [SignalR] AppointmentStatusUpdated:", data);
                    queryClient.invalidateQueries({ queryKey: ["my-appointments"] });
                    queryClient.invalidateQueries({ queryKey: ["appointment-detail"] });
                    queryClient.invalidateQueries({ queryKey: ["available-slots"] });
                    if (data && data.status) {
                        toast.success("Lịch khám cập nhật", `Trạng thái: ${data.status}`);
                    }
                });

                connection.on("ReceiveMessage", (data: any) => {
                    console.log("💬 [SignalR] ReceiveMessage:", data);
                    queryClient.invalidateQueries({ queryKey: ["chat-messages", data?.sessionId] });
                    queryClient.invalidateQueries({ queryKey: ["session-details"] });
                    if (data && data.senderName) {
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
                    console.log("🔴 [SignalR] ForceLogout received - Đang kick-out thiết bị này...");
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

                // Lifecycle Handlers
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
                    // LƯU Ý: KHÔNG GÁN connection = null Ở ĐÂY. Giữ nguyên để tự động / thủ công kết nối lại mà không mất Event handlers.
                });
            }

                // Tiến hành start logic (dùng chung cho cả tạo mới hoặc restart)
                if (connection.state === signalR.HubConnectionState.Disconnected) {
                    try {
                        await connection.start();
                        if (isMounted) setIsConnected(true);
                        console.log("🟢 [SignalR] Connected successfully.");
                    } catch (err: any) {
                        if (err?.message?.includes("stop() was called")) {
                            console.log("🟡 [SignalR] Start aborted gracefully by stop().");
                            return;
                        }
                        console.log("🔴 [SignalR] Connection Error: ", err);
                        // Để reconnect khi app active xử lý lại sau
                    }
                }
        };

        // Try to connect when the hook is mounted
        startConnection().catch(() => {});

        // ── Lắng nghe sự kiện thoát mở App (Background / Foreground) ──
        const appStateSubscription = AppState.addEventListener("change", (nextAppState: AppStateStatus) => {
            if (nextAppState === "active") {
                console.log("📱 [SignalR] App trở lại Foreground, kiểm tra kết nối...");
                if (!connection || connection.state === signalR.HubConnectionState.Disconnected) {
                    startConnection().catch(() => {});
                }
            }
        });

        return () => {
            isMounted = false;
            appStateSubscription.remove();
            
            if (connection && !session && connection.state !== signalR.HubConnectionState.Disconnected) {
                // Ignore stop unhandled rejections cleanly
                connection.stop().catch(() => {});
                connection = null;
            } else if (!session) {
                connection = null;
            }
        };
    }, [queryClient, session]);

    return { isConnected };
}

// Global Injector component
export function SignalRInjector() {
    useAppSignalR();
    return null;
}

