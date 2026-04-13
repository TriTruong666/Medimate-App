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
    SYSTEM: { icon: Info, color: "#0EA5E9", bg: "#E0F2FE", label: "Hệ thống" },
    DEFAULT: { icon: Zap, color: "#8B5CF6", bg: "#F5F3FF", label: "Thông báo" },
};

function getTypeConfig(type: string) {
    return TYPE_CONFIG[type?.toUpperCase()] ?? TYPE_CONFIG["DEFAULT"];
}

// ─── Detail Modal ─────────────────────────────────────────────────
function NotificationDetailModal({
    notification,
    onClose,
}: {
    notification: NotificationData;
    onClose: () => void;
}) {
    const cfg = getTypeConfig(notification.type);
    const IconComp = cfg.icon;
    const router = useRouter();
    const notifType = (notification.type || '').toUpperCase();

    const handleNavigate = () => {
        onClose();
        if (notifType === 'APPOINTMENT') {
            setTimeout(() => router.push('/(manager)/(doctor)/appointments' as any), 300);
        }
    };

    return (
        <View style={{ flex: 1, justifyContent: "flex-end" }}>
            <Pressable
                style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)" }}
                onPress={onClose}
            />
            <View style={{
                backgroundColor: "#F9F6FC",
                borderTopLeftRadius: 32,
                borderTopRightRadius: 32,
                borderTopWidth: 3,
                borderColor: "#000",
                padding: 24,
                paddingBottom: 48,
            }}>
                {/* Handle bar */}
                <View style={{ width: 40, height: 4, backgroundColor: "#000", borderRadius: 2, alignSelf: "center", opacity: 0.15 }} />

                {/* Icon + Type badge */}
                <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 20 }}>
                    <View style={{
                        width: 52, height: 52, borderRadius: 16,
                        backgroundColor: cfg.bg,
                        borderWidth: 2, borderColor: "#000",
                        alignItems: "center", justifyContent: "center",
                        shadowColor: "#000", shadowOffset: { width: 3, height: 3 }, shadowOpacity: 1, shadowRadius: 0,
                    }}>
                        <IconComp size={24} color={cfg.color} strokeWidth={2.5} />
                    </View>
                    <View>
                        <View style={{
                            backgroundColor: cfg.bg, paddingHorizontal: 10, paddingVertical: 4,
                            borderRadius: 8, borderWidth: 1, borderColor: cfg.color, marginBottom: 4
                        }}>
                            <Text style={{ fontFamily: "SpaceGrotesk_700Bold", fontSize: 11, color: cfg.color, textTransform: "uppercase" }}>
                                {cfg.label}
                            </Text>
                        </View>
                        <Text style={{ fontFamily: "SpaceGrotesk_500Medium", fontSize: 12, color: "#94A3B8" }}>
                            {dayjs(notification.createdAt).fromNow()}
                        </Text>
                    </View>
                </View>

                {/* Title */}
                <Text style={{ fontFamily: "SpaceGrotesk_700Bold", fontSize: 20, color: "#000", marginBottom: 12, lineHeight: 26 }}>
                    {notification.title}
                </Text>

                {/* Message */}
                <View style={{ backgroundColor: "#FFF", borderWidth: 2, borderColor: "#000", borderRadius: 16, padding: 16 }}>
                    <Text style={{ fontFamily: "SpaceGrotesk_500Medium", fontSize: 15, color: "#374151", lineHeight: 22 }}>
                        {notification.message}
                    </Text>
                </View>

                {/* Timestamp */}
                <Text style={{ fontFamily: "SpaceGrotesk_500Medium", fontSize: 12, color: "#94A3B8", textAlign: "center" }}>
                    {dayjs(notification.createdAt).format("HH:mm — DD/MM/YYYY")}
                </Text>

                {/* Action CTA - chỉ hiện với loại APPOINTMENT */}
                {notifType === 'APPOINTMENT' && (
                    <Pressable
                        onPress={handleNavigate}
                        style={({ pressed }) => ({
                            marginTop: 16,
                            backgroundColor: '#6366F1',
                            borderRadius: 16,
                            paddingVertical: 14,
                            alignItems: 'center',
                            flexDirection: 'row',
                            justifyContent: 'center',
                            gap: 8,
                            borderWidth: 2,
                            borderColor: '#000',
                            shadowColor: '#000',
                            shadowOffset: { width: pressed ? 0 : 3, height: pressed ? 0 : 3 },
                            shadowOpacity: 1,
                            shadowRadius: 0,
                            elevation: pressed ? 0 : 3,
                            transform: [{ translateY: pressed ? 2 : 0 }],
                        })}
                    >
                        <Calendar size={16} color="#fff" strokeWidth={2.5} />
                        <Text style={{ fontFamily: 'SpaceGrotesk_700Bold', fontSize: 14, color: '#fff', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                            Xem lịch hẹn
                        </Text>
                    </Pressable>
                )}

                {/* Close btn */}
                <Pressable
                    onPress={onClose}
                    style={{
                        marginTop: notifType === 'APPOINTMENT' ? 10 : 20,
                        backgroundColor: notifType === 'APPOINTMENT' ? '#F8FAFC' : '#000',
                        borderRadius: 16,
                        paddingVertical: 16,
                        alignItems: 'center',
                        borderWidth: notifType === 'APPOINTMENT' ? 2 : 0,
                        borderColor: 'rgba(0,0,0,0.12)',
                    }}
                >
                    <Text style={{
                        fontFamily: "SpaceGrotesk_700Bold",
                        fontSize: 15,
                        color: notifType === 'APPOINTMENT' ? '#64748B' : '#FFF',
                        textTransform: "uppercase",
                        letterSpacing: 1,
                    }}>
                        Đóng
                    </Text>
                </Pressable>
            </View>
        </View>
    );
}

// ─── Main Screen ──────────────────────────────────────────────────
export default function NotificationsScreen() {
    const router = useRouter();
    const [selected, setSelected] = useState<NotificationData | null>(null);

    const { data: notifications, isLoading, isFetching, refetch } = useGetUserNotifications();
    const { mutate: markAsRead } = useMarkNotificationAsRead();
    const { mutate: markAllRead, isPending: isMarkingAll } = useMarkAllNotificationsAsRead();

    const unreadCount = (notifications || []).filter(n => !n.isRead).length;

    const handlePressNotification = (item: NotificationData) => {
        if (!item.isRead) {
            markAsRead(item.notificationId);
        }
        setSelected(item);
    };

    const renderItem = ({ item }: { item: NotificationData }) => {
        const cfg = getTypeConfig(item.type);
        const IconComp = cfg.icon;
        const isRead = item.isRead;

        return (
            <Pressable
                onPress={() => handlePressNotification(item)}
                style={({ pressed }) => ({
                    backgroundColor: "#FFF",
                    borderWidth: isRead ? 2 : 2.5,
                    borderColor: isRead ? "rgba(0,0,0,0.15)" : "#000",
                    borderRadius: 24,
                    padding: 16,
                    marginBottom: 16, // Tạo khoảng cách giữa các card thay vì dùng Divider
                    opacity: isRead ? 0.7 : 1,

                    // Shadow
                    shadowColor: "#000",
                    shadowOffset: {
                        width: pressed ? 0 : (isRead ? 1 : 4),
                        height: pressed ? 0 : (isRead ? 1 : 4)
                    },
                    shadowOpacity: 1,
                    shadowRadius: 0,
                    elevation: pressed ? 0 : (isRead ? 1 : 4),
                    transform: [{ translateY: pressed ? 2 : 0 }],
                })}
            >
                {/* 1. HÀNG ĐẦU TIÊN: METADATA (Đã đọc/Chưa đọc & Thời gian) */}
                <View style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 12
                }}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                        {/* Badge Loại */}
                        <View style={{
                            backgroundColor: isRead ? "#F1F5F9" : cfg.bg,
                            paddingHorizontal: 8, paddingVertical: 3,
                            borderRadius: 8, borderWidth: 1.5, borderColor: isRead ? "rgba(0,0,0,0.1)" : "#000",
                        }}>
                            <Text style={{
                                fontFamily: "SpaceGrotesk_700Bold", fontSize: 10,
                                color: isRead ? "#94A3B8" : cfg.color, textTransform: "uppercase"
                            }}>
                                {cfg.label}
                            </Text>
                        </View>

                        {/* Badge Trạng thái Đọc */}
                        <View style={{
                            backgroundColor: isRead ? "transparent" : "#6366F1",
                            paddingHorizontal: 8, paddingVertical: 3,
                            borderRadius: 8, borderWidth: 1.5,
                            borderColor: isRead ? "rgba(0,0,0,0.1)" : "#000",
                        }}>
                            <Text style={{
                                fontFamily: "SpaceGrotesk_700Bold", fontSize: 10,
                                color: isRead ? "#94A3B8" : "#FFF"
                            }}>
                                {isRead ? "ĐÃ ĐỌC" : "MỚI"}
                            </Text>
                        </View>
                    </View>

                    {/* Thời gian đặt ở góc trên bên phải */}
                    <Text style={{
                        fontFamily: "SpaceGrotesk_500Medium", fontSize: 11,
                        color: isRead ? "#94A3B8" : "#64748B"
                    }}>
                        {dayjs(item.createdAt).format("HH:mm · DD/MM")}
                    </Text>
                </View>

                {/* 2. HÀNG NỘI DUNG CHÍNH */}
                <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 14 }}>
                    {/* Box Icon bên trái */}
                    <View style={{
                        width: 46, height: 46, borderRadius: 14,
                        backgroundColor: isRead ? "#F8FAFC" : cfg.bg,
                        borderWidth: 2, borderColor: isRead ? "rgba(0,0,0,0.12)" : "#000",
                        alignItems: "center", justifyContent: "center",
                    }}>
                        <IconComp size={20} color={isRead ? "#CBD5E1" : cfg.color} strokeWidth={2.5} />
                    </View>

                    {/* Tiêu đề và Nội dung */}
                    <View style={{ flex: 1 }}>
                        <Text style={{
                            fontFamily: isRead ? "SpaceGrotesk_600SemiBold" : "SpaceGrotesk_700Bold",
                            fontSize: 15, color: isRead ? "#64748B" : "#000",
                            marginBottom: 4, lineHeight: 20
                        }} numberOfLines={1}>
                            {item.title}
                        </Text>
                        <Text style={{
                            fontFamily: "SpaceGrotesk_500Medium",
                            fontSize: 13, color: isRead ? "#94A3B8" : "#475569",
                            lineHeight: 18,
                        }} numberOfLines={2}>
                            {item.message}
                        </Text>
                    </View>
                </View>
                {/* Divider */}
                <View style={{ height: 1, backgroundColor: isRead ? "rgba(0,0,0,0.05)" : "rgba(0,0,0,0.08)", marginBottom: 10 }} />
            </Pressable>
        );
    };


    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#F9F6FC" }} edges={["top"]}>
            {/* Header */}
            <View style={{
                flexDirection: "row", alignItems: "center", justifyContent: "space-between",
                paddingHorizontal: 20, paddingTop: 12, paddingBottom: 16,
            }}>
                <Pressable
                    onPress={() => router.back()}
                    style={{
                        width: 48, height: 48, backgroundColor: "#FFF",
                        borderWidth: 2, borderColor: "#000", borderRadius: 18,
                        alignItems: "center", justifyContent: "center",
                        shadowColor: "#000", shadowOffset: { width: 2, height: 2 }, shadowOpacity: 1, shadowRadius: 0,
                    }}
                >
                    <ArrowLeft size={22} color="#000" strokeWidth={2.5} />
                </Pressable>

                <View style={{ alignItems: "center" }}>
                    <Text style={{ fontFamily: "SpaceGrotesk_700Bold", fontSize: 18, color: "#000", textTransform: "uppercase", letterSpacing: -0.5 }}>
                        Thông báo
                    </Text>
                    {unreadCount > 0 && (
                        <Text style={{ fontFamily: "SpaceGrotesk_500Medium", fontSize: 12, color: "#6366F1" }}>
                            {unreadCount} chưa đọc
                        </Text>
                    )}
                </View>

                {/* Mark all read */}
                <Pressable
                    onPress={() => markAllRead()}
                    disabled={isMarkingAll || unreadCount === 0}
                    style={{
                        width: 48, height: 48,
                        backgroundColor: unreadCount > 0 ? "#6366F1" : "#E5E7EB",
                        borderWidth: 2, borderColor: "#000", borderRadius: 18,
                        alignItems: "center", justifyContent: "center",
                        shadowColor: "#000",
                        shadowOffset: unreadCount > 0 ? { width: 2, height: 2 } : { width: 0, height: 0 },
                        shadowOpacity: unreadCount > 0 ? 1 : 0,
                        shadowRadius: 0,
                        opacity: isMarkingAll ? 0.6 : 1,
                    }}
                >
                    {isMarkingAll
                        ? <ActivityIndicator size="small" color="#FFF" />
                        : <CheckCheck size={20} color={unreadCount > 0 ? "#FFF" : "#9CA3AF"} strokeWidth={2.5} />
                    }
                </Pressable>
            </View>

            {/* Content */}
            <View style={{ flex: 1, paddingHorizontal: 20 }}>
                {isLoading ? (
                    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                        <ActivityIndicator size="large" color="#000" />
                        <Text style={{ fontFamily: "SpaceGrotesk_500Medium", color: "#64748B", marginTop: 12 }}>
                            Đang tải thông báo...
                        </Text>
                    </View>
                ) : !notifications || notifications.length === 0 ? (
                    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                        <View style={{
                            width: 80, height: 80, borderRadius: 24, backgroundColor: "#E5E7EB",
                            borderWidth: 2, borderColor: "#000", alignItems: "center", justifyContent: "center",
                            marginBottom: 16,
                        }}>
                            <BellOff size={36} color="#9CA3AF" strokeWidth={1.5} />
                        </View>
                        <Text style={{ fontFamily: "SpaceGrotesk_700Bold", fontSize: 16, color: "rgba(0,0,0,0.35)" }}>
                            Chưa có thông báo nào
                        </Text>
                        <Text style={{ fontFamily: "SpaceGrotesk_500Medium", fontSize: 13, color: "#94A3B8", marginTop: 8, textAlign: "center" }}>
                            Các thông báo mới sẽ hiển thị tại đây
                        </Text>
                    </View>
                ) : (
                    <FlatList
                        data={notifications}
                        keyExtractor={(item) => item.notificationId}
                        renderItem={renderItem}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: 40, paddingTop: 4 }}
                        refreshControl={
                            <RefreshControl
                                refreshing={isFetching}
                                onRefresh={() => refetch()}
                                tintColor="#000"
                                colors={["#000"]}
                            />
                        }
                    />
                )}
            </View>

            {/* Detail Modal */}
            <Modal
                visible={!!selected}
                transparent
                animationType="slide"
                onRequestClose={() => setSelected(null)}
            >
                {selected && (
                    <NotificationDetailModal
                        notification={selected}
                        onClose={() => setSelected(null)}
                    />
                )}
            </Modal>
        </SafeAreaView>
    );
}
