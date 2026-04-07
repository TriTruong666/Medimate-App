import { useEffect, useState } from "react";
import * as signalR from "@microsoft/signalr";
import * as SecureStore from "expo-secure-store";
import { useQueryClient } from "@tanstack/react-query";
import { Platform, AppState, AppStateStatus } from "react-native";
import { useAtomValue } from "jotai";
import { authSessionAtom } from "@/stores/authStore";
import { useToast } from "@/stores/toastStore";
import { usePopup } from "@/stores/popupStore";

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

            // Nếu đang có kết nối hoạt động thì không tạo lại
            if (connection && connection.state !== signalR.HubConnectionState.Disconnected) {
                if (connection.state === signalR.HubConnectionState.Connected && isMounted) {
                    setIsConnected(true);
                }
                return;
            }

            const token = await SecureStore.getItemAsync("accessToken");
            if (!token) return; // Do not connect if no token

            // Chuẩn hoá URL: android emulator thay localhost → 10.0.2.2
            let url = `${base_net_url}/hub/medimate`;
            if (Platform.OS === 'android' && url.includes('localhost')) {
                url = url.replace('localhost', '10.0.2.2');
            }

            connection = new signalR.HubConnectionBuilder()
                .withUrl(url, {
                    accessTokenFactory: () => token,
                    // Bắt buộc: bỏ qua negotiation, dùng WebSockets thuần
                    skipNegotiation: true,
                    transport: signalR.HttpTransportType.WebSockets,
                })
                .withAutomaticReconnect([0, 2000, 5000, 10000, 30000]) // Chiến lược retry: 0s, 2s, 5s, 10s, 30s
                .configureLogging(signalR.LogLevel.Warning)
                .build();

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
                // Invalidate các cache liên quan đến appointment để UI tải lại tự động
                queryClient.invalidateQueries({ queryKey: ["my-appointments"] });
                queryClient.invalidateQueries({ queryKey: ["appointment-detail"] });
                queryClient.invalidateQueries({ queryKey: ["available-slots"] });
                
                if (data && data.status) {
                    toast.success("Lịch khám cập nhật", `Trạng thái: ${data.status}`);
                }
            });

            // Lắng nghe Tin nhắn mới (Chat)
            connection.on("ReceiveMessage", (data: any) => {
                console.log("💬 [SignalR] ReceiveMessage:", data);
                queryClient.invalidateQueries({ queryKey: ["chat-messages", data?.sessionId] });
                queryClient.invalidateQueries({ queryKey: ["session-details"] });
                
                if (data && data.senderName) {
                    toast.success(`Tin nhắn từ ${data.senderName}`, data.content || "[Hình ảnh đính kèm]");
                }
            });

            // Lắng nghe Đánh dấu Đã đọc (Chat)
            connection.on("ReceiveMessageUpdate", () => {
                console.log("💬 [SignalR] ReceiveMessageUpdate (Đã đọc)");
                queryClient.invalidateQueries({ queryKey: ["chat-messages"] });
                queryClient.invalidateQueries({ queryKey: ["session-details"] });
            });

            // Lắng nghe Cập nhật Lịch sử Uống thuốc
            connection.on("ReceiveMedicationLogUpdate", () => {
                console.log("💊 [SignalR] ReceiveMedicationLogUpdate");
                queryClient.invalidateQueries({ queryKey: ["member-med-logs"] });
                queryClient.invalidateQueries({ queryKey: ["family-med-logs"] });
                queryClient.invalidateQueries({ queryKey: ["schedule-stats"] });
                queryClient.invalidateQueries({ queryKey: ["member-reminders"] });
                queryClient.invalidateQueries({ queryKey: ["family-reminders"] });
            });

            // ── Cuộc gọi 3 bên: Mời Guardian tham gia ─────────────────────────────
            connection.on("GuardianSessionInvite", (data: {
                sessionId: string;
                memberName: string;
                memberAvatarUrl?: string;
                doctorName: string;
                scheduledTime: string;
            }) => {
                console.log("👨‍👩‍👦 [SignalR] GuardianSessionInvite:", data);
                // Hiện popup mời ngay lập tức trong app
                open({
                    type: 'guardian_invite',
                    data: {
                        sessionId: data.sessionId,
                        memberName: data.memberName,
                        memberAvatarUrl: data.memberAvatarUrl,
                        doctorName: data.doctorName,
                        scheduledTime: data.scheduledTime,
                    },
                });
            });

            // ── Thông báo cho Bác sĩ khi Guardian vào ─────────────────────────────
            connection.on("GuardianJoined", (data: {
                sessionId: string;
                guardianName: string;
                memberName: string;
            }) => {
                console.log("👤 [SignalR] GuardianJoined:", data);
                toast.success(
                    `${data.guardianName} đã tham gia`,
                    `Người giám hộ của ${data.memberName} vừa vào phòng khám.`
                );
                queryClient.invalidateQueries({ queryKey: ["session", data.sessionId] });
            });

            try {
                if (connection.state === signalR.HubConnectionState.Disconnected) {
                    await connection.start();
                    if (isMounted) setIsConnected(true);
                    console.log("🟢 [SignalR] Connected successfully.");
                }

                // Đăng ký sự kiện mất kết nối để debug
                connection.onreconnecting((err) => console.log("🟡 [SignalR] Reconnecting...", err));
                connection.onreconnected((id) => {
                    console.log("🟢 [SignalR] Reconnected. ConnectionId:", id);
                    if (isMounted) setIsConnected(true);
                });
                connection.onclose((err) => {
                    console.log("🔴 [SignalR] Connection closed.", err);
                    if (isMounted) setIsConnected(false);
                    connection = null; // Reset để cho phép kết nối lại
                });
            } catch (err) {
                console.log("🔴 [SignalR] Connection Error: ", err);
                connection = null; // Reset nếu lỗi khởi tạo
            }
        };

        // Try to connect when the hook is mounted
        startConnection();

        // ── Lắng nghe sự kiện thoát mở App (Background / Foreground) ──
        const appStateSubscription = AppState.addEventListener("change", (nextAppState: AppStateStatus) => {
            if (nextAppState === "active") {
                console.log("📱 [SignalR] App trở lại Foreground, kiểm tra kết nối...");
                if (!connection || connection.state === signalR.HubConnectionState.Disconnected) {
                    startConnection();
                }
            }
        });

        return () => {
            isMounted = false;
            appStateSubscription.remove();
            // Dọn dẹp connection khi authSessionAtom đổi (thoát app/logout)
            if (connection && !session) {
                if (connection.state !== signalR.HubConnectionState.Disconnected) {
                    connection.stop().then(() => {
                         connection = null;
                         if (isMounted) setIsConnected(false);
                    }).catch(err => console.log("🔴 [SignalR] Stop Error: ", err));
                } else {
                    connection = null;
                }
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
