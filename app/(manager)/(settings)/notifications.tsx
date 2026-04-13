import dayjs from "dayjs";
import "dayjs/locale/vi";
import relativeTime from "dayjs/plugin/relativeTime";
import { useRouter } from "expo-router";
import {
    ArrowLeft,
    BellOff,
    Calendar,
    CheckCheck,
    Clock,
    Info,
    MessageSquare,
    Video,
    Zap
} from "lucide-react-native";
import React, { useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Modal,
    Pressable,
    RefreshControl,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
    useGetUserNotifications,
    useMarkAllNotificationsAsRead,
    useMarkNotificationAsRead,
} from "@/hooks/useNotification";
import { NotificationData } from "@/types/Notification";

dayjs.extend(relativeTime);
dayjs.locale("vi");

// ─── Notification type config ────────────────────────────────────
const TYPE_CONFIG: Record<string, { icon: any; color: string; bg: string; label: string }> = {
    REMINDER: { icon: Clock, color: "#F59E0B", bg: "#FEF3C7", label: "Nhắc nhở" },
    APPOINTMENT: { icon: Calendar, color: "#6366F1", bg: "#EDE9FE", label: "Lịch hẹn" },
    CHAT: { icon: MessageSquare, color: "#0EA5E9", bg: "#E0F2FE", label: "Tin nhắn" },
    SESSION: { icon: Video, color: "#10B981", bg: "#D1FAE5", label: "Phòng khám" },
    SYSTEM: { icon: Info, color: "#0EA5E9", bg: "#E0F2FE", label: "Hệ thống" },
    DEFAULT: { icon: Zap, color: "#8B5CF6", bg: "#F5F3FF", label: "Thông báo" },
};

export function getTypeConfig(type: string, title?: string) {
    const notifType = type?.toUpperCase() || '';
    const notifTitle = title?.toUpperCase() || '';

    const isChatGroup = ['NEW_CHAT_MESSAGE'].includes(notifType);
    const isSessionGroup = ['SESSION_STARTED', 'SESSION_IN_PROGRESS', 'SESSION_ENDED', 'SESSION_TIMEOUT', 'GUARDIAN_SESSION_INVITE'].includes(notifType);
    const isAppointmentGroup = [
        'NEW_APPOINTMENT', 'APPOINTMENT_UPDATE', 'APPOINTMENT_CANCELLED', 'UPCOMING_APPOINTMENT'
    ].includes(notifType) || notifType.includes('APPOINTMENT') || notifTitle.includes('LỊCH');

    if (isChatGroup) return TYPE_CONFIG["CHAT"];
    if (isSessionGroup) return TYPE_CONFIG["SESSION"];
    if (isAppointmentGroup) return TYPE_CONFIG["APPOINTMENT"];

    return TYPE_CONFIG[notifType] ?? TYPE_CONFIG["DEFAULT"];
}

// ─── Detail Modal (Tái sử dụng chung) ─────────────────────────
export function NotificationDetailModal({
    notification,
    onClose,
    onViewAppointment
}: {
    notification: NotificationData;
    onClose: () => void;
    onViewAppointment?: () => void;
}) {
    const cfg = getTypeConfig(notification.type, notification.title);
    const IconComp = cfg.icon;
    const notifType = (notification.type || '').toUpperCase();
    const notifTitle = (notification.title || '').toUpperCase();

    // 1. Phân loại Notification để linh hoạt nút bấm
    const isAppointmentGroup = [
        'NEW_APPOINTMENT', 'APPOINTMENT_UPDATE', 'APPOINTMENT_CANCELLED', 'UPCOMING_APPOINTMENT'
    ].includes(notifType);
    
    const isChatGroup = [
        'NEW_CHAT_MESSAGE'
    ].includes(notifType);

    const isSessionGroup = [
        'SESSION_STARTED', 'SESSION_IN_PROGRESS', 'SESSION_ENDED', 'SESSION_TIMEOUT', 'GUARDIAN_SESSION_INVITE'
    ].includes(notifType);

    const isFallbackAppointment = notifType.includes('APPOINTMENT') || notifTitle.includes('LỊCH');

    // Nếu thuộc bất kỳ nhóm tương tác nào, ta sẽ hiển thị CTA
    const showActionCTA = isAppointmentGroup || isChatGroup || isSessionGroup || isFallbackAppointment;

    // 2. Tùy chỉnh icon và nhãn của nút
    let ActionBtnIcon = Calendar;
    let actionLabel = "Xem lịch hẹn";
    let btnColor = "#6366F1"; // Tím mặc định

    if (isChatGroup) {
        ActionBtnIcon = MessageSquare;
        actionLabel = "Mở tin nhắn";
        btnColor = "#0EA5E9"; // Xanh dương
    } else if (isSessionGroup) {
        ActionBtnIcon = Video;
        actionLabel = "Xem phiên khám";
        btnColor = "#10B981"; // Xanh lá
    }

    const handleNavigate = () => {
        onClose();
        // Áp dụng chung cho rẽ nhánh Lịch hẹn/Session/Chat đều điều hướng qua route appointments
        if (showActionCTA && onViewAppointment) {
            setTimeout(() => onViewAppointment(), 300);
        }
    };

    return (
        <View style={{ flex: 1, justifyContent: "flex-end" }}>
            <Pressable
                style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)" }}
                onPress={onClose}
            />
            <View style={{ backgroundColor: "#F9F6FC", borderTopLeftRadius: 32, borderTopRightRadius: 32, borderTopWidth: 3, borderColor: "#000", padding: 24, paddingBottom: 48 }}>
                <View style={{ width: 40, height: 4, backgroundColor: "#000", borderRadius: 2, alignSelf: "center", opacity: 0.15 }} />

                <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 20 }}>
                    <View style={{ width: 52, height: 52, borderRadius: 16, backgroundColor: cfg.bg, borderWidth: 2, borderColor: "#000", alignItems: "center", justifyContent: "center", shadowColor: "#000", shadowOffset: { width: 3, height: 3 }, shadowOpacity: 1, shadowRadius: 0 }}>
                        <IconComp size={24} color={cfg.color} strokeWidth={2.5} />
                    </View>
                    <View>
                        <View style={{ backgroundColor: cfg.bg, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, borderWidth: 1, borderColor: cfg.color, marginBottom: 4 }}>
                            <Text style={{ fontFamily: "SpaceGrotesk_700Bold", fontSize: 11, color: cfg.color, textTransform: "uppercase" }}>{cfg.label}</Text>
                        </View>
                        <Text style={{ fontFamily: "SpaceGrotesk_500Medium", fontSize: 12, color: "#94A3B8" }}>{dayjs(notification.createdAt).fromNow()}</Text>
                    </View>
                </View>

                <Text style={{ fontFamily: "SpaceGrotesk_700Bold", fontSize: 20, color: "#000", marginBottom: 12, lineHeight: 26 }}>{notification.title}</Text>
                <View style={{ backgroundColor: "#FFF", borderWidth: 2, borderColor: "#000", borderRadius: 16, padding: 16 }}>
                    <Text style={{ fontFamily: "SpaceGrotesk_500Medium", fontSize: 15, color: "#374151", lineHeight: 22 }}>{notification.message}</Text>
                </View>
                <Text style={{ fontFamily: "SpaceGrotesk_500Medium", fontSize: 12, color: "#94A3B8", textAlign: "center", marginTop: 12 }}>{dayjs(notification.createdAt).format("HH:mm — DD/MM/YYYY")}</Text>

                {showActionCTA && (
                    <Pressable
                        onPress={handleNavigate}
                        className="active:opacity-80 active:translate-y-0.5"
                        style={{
                            marginTop: 16, backgroundColor: btnColor, borderRadius: 16,
                            paddingVertical: 14, alignItems: 'center', flexDirection: 'row',
                            justifyContent: 'center', gap: 8, borderWidth: 2, borderColor: '#000',
                            shadowColor: '#000', shadowOffset: { width: 3, height: 3 },
                            shadowOpacity: 1, shadowRadius: 0, elevation: 3,
                        }}
                    >
                        <ActionBtnIcon size={16} color="#fff" strokeWidth={2.5} />
                        <Text style={{ fontFamily: 'SpaceGrotesk_700Bold', fontSize: 14, color: '#fff', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                            {actionLabel}
                        </Text>
                    </Pressable>
                )}

                <Pressable onPress={onClose} style={{ marginTop: showActionCTA ? 10 : 20, backgroundColor: showActionCTA ? '#F8FAFC' : '#000', borderRadius: 16, paddingVertical: 16, alignItems: 'center', borderWidth: showActionCTA ? 2 : 0, borderColor: 'rgba(0,0,0,0.12)' }}>
                    <Text style={{ fontFamily: "SpaceGrotesk_700Bold", fontSize: 15, color: showActionCTA ? '#64748B' : '#FFF', textTransform: "uppercase", letterSpacing: 1 }}>Đóng</Text>
                </Pressable>
            </View>
        </View>
    );
}

// ─── Main Screen (USER / MANAGER) ───────────────────────────────────
export default function NotificationsScreen() {
    const router = useRouter();
    const [selected, setSelected] = useState<NotificationData | null>(null);

    // Không truyền param => Lấy thông báo của User
    const { data: notifications, isLoading, isFetching, refetch } = useGetUserNotifications();
    const { mutate: markAsRead } = useMarkNotificationAsRead();
    const { mutate: markAllRead, isPending: isMarkingAll } = useMarkAllNotificationsAsRead();

    const unreadCount = (notifications || []).filter(n => !n.isRead).length;

    const handlePressNotification = (item: NotificationData) => {
        if (!item.isRead) markAsRead({ notificationId: item.notificationId });
        setSelected(item);
    };

    const renderItem = ({ item }: { item: NotificationData }) => {
        const cfg = getTypeConfig(item.type, item.title);
        const isRead = item.isRead;
        const IconComp = cfg.icon;

        return (
            <Pressable onPress={() => handlePressNotification(item)} style={({ pressed }) => ({ backgroundColor: "#FFF", borderWidth: isRead ? 2 : 2.5, borderColor: isRead ? "rgba(0,0,0,0.15)" : "#000", borderRadius: 24, padding: 16, marginBottom: 16, opacity: isRead ? 0.7 : 1, shadowColor: "#000", shadowOffset: { width: pressed ? 0 : (isRead ? 1 : 4), height: pressed ? 0 : (isRead ? 1 : 4) }, shadowOpacity: 1, shadowRadius: 0, elevation: pressed ? 0 : (isRead ? 1 : 4), transform: [{ translateY: pressed ? 2 : 0 }] })}>
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                        <View style={{ backgroundColor: isRead ? "#F1F5F9" : cfg.bg, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, borderWidth: 1.5, borderColor: isRead ? "rgba(0,0,0,0.1)" : "#000" }}>
                            <Text style={{ fontFamily: "SpaceGrotesk_700Bold", fontSize: 10, color: isRead ? "#94A3B8" : cfg.color, textTransform: "uppercase" }}>{cfg.label}</Text>
                        </View>
                        <View style={{ backgroundColor: isRead ? "transparent" : "#6366F1", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, borderWidth: 1.5, borderColor: isRead ? "rgba(0,0,0,0.1)" : "#000" }}>
                            <Text style={{ fontFamily: "SpaceGrotesk_700Bold", fontSize: 10, color: isRead ? "#94A3B8" : "#FFF" }}>{isRead ? "ĐÃ ĐỌC" : "MỚI"}</Text>
                        </View>
                    </View>
                    <Text style={{ fontFamily: "SpaceGrotesk_500Medium", fontSize: 11, color: isRead ? "#94A3B8" : "#64748B" }}>{dayjs(item.createdAt).format("HH:mm · DD/MM")}</Text>
                </View>

                <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 14 }}>
                    <View style={{ width: 46, height: 46, borderRadius: 14, backgroundColor: isRead ? "#F8FAFC" : cfg.bg, borderWidth: 2, borderColor: isRead ? "rgba(0,0,0,0.12)" : "#000", alignItems: "center", justifyContent: "center" }}>
                        <IconComp size={20} color={isRead ? "#CBD5E1" : cfg.color} strokeWidth={2.5} />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={{ fontFamily: isRead ? "SpaceGrotesk_600SemiBold" : "SpaceGrotesk_700Bold", fontSize: 15, color: isRead ? "#64748B" : "#000", marginBottom: 4 }} numberOfLines={1}>{item.title}</Text>
                        <Text style={{ fontFamily: "SpaceGrotesk_500Medium", fontSize: 13, color: isRead ? "#94A3B8" : "#475569" }} numberOfLines={2}>{item.message}</Text>
                    </View>
                </View>
            </Pressable>
        );
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#F9F6FC" }} edges={["top"]}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingTop: 12, paddingBottom: 16 }}>
                <Pressable onPress={() => router.back()} style={{ width: 48, height: 48, backgroundColor: "#FFF", borderWidth: 2, borderColor: "#000", borderRadius: 18, alignItems: "center", justifyContent: "center" }}>
                    <ArrowLeft size={22} color="#000" strokeWidth={2.5} />
                </Pressable>
                <View style={{ alignItems: "center" }}>
                    <Text style={{ fontFamily: "SpaceGrotesk_700Bold", fontSize: 18, color: "#000", textTransform: "uppercase" }}>Thông báo</Text>
                    {unreadCount > 0 && <Text style={{ fontFamily: "SpaceGrotesk_500Medium", fontSize: 12, color: "#6366F1" }}>{unreadCount} chưa đọc</Text>}
                </View>
                <Pressable onPress={() => markAllRead(undefined)} disabled={isMarkingAll || unreadCount === 0} style={{ width: 48, height: 48, backgroundColor: unreadCount > 0 ? "#6366F1" : "#E5E7EB", borderWidth: 2, borderColor: "#000", borderRadius: 18, alignItems: "center", justifyContent: "center", opacity: isMarkingAll ? 0.6 : 1 }}>
                    {isMarkingAll ? <ActivityIndicator size="small" color="#FFF" /> : <CheckCheck size={20} color={unreadCount > 0 ? "#FFF" : "#9CA3AF"} strokeWidth={2.5} />}
                </Pressable>
            </View>

            <View style={{ flex: 1, paddingHorizontal: 20 }}>
                {isLoading ? (
                    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}><ActivityIndicator size="large" color="#000" /></View>
                ) : !notifications || notifications.length === 0 ? (
                    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                        <View style={{ width: 80, height: 80, borderRadius: 24, backgroundColor: "#E5E7EB", borderWidth: 2, borderColor: "#000", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                            <BellOff size={36} color="#9CA3AF" />
                        </View>
                        <Text style={{ fontFamily: "SpaceGrotesk_700Bold", fontSize: 16, color: "rgba(0,0,0,0.35)" }}>Chưa có thông báo nào</Text>
                    </View>
                ) : (
                    <FlatList data={notifications} keyExtractor={(item) => item.notificationId} renderItem={renderItem} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }} refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} tintColor="#000" />} />
                )}
            </View>

            <Modal visible={!!selected} transparent animationType="slide" onRequestClose={() => setSelected(null)}>
                {selected && (
                    <NotificationDetailModal
                        notification={selected}
                        onClose={() => setSelected(null)}
                        // Logic User: Chuyển hướng đến route Lịch trình của Bác Sĩ / Chủ hộ
                        onViewAppointment={() => router.push('/(manager)/(doctor)/appointments' as any)}
                    />
                )}
            </Modal>
        </SafeAreaView>
    );
}