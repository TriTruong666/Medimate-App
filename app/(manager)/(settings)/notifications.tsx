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
                <View style={{ width: 40, height: 4, backgroundColor: "#000", borderRadius: 2, alignSelf: "center", marginBottom: 24, opacity: 0.15 }} />

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
                <View style={{ backgroundColor: "#FFF", borderWidth: 2, borderColor: "#000", borderRadius: 16, padding: 16, marginBottom: 20 }}>
                    <Text style={{ fontFamily: "SpaceGrotesk_500Medium", fontSize: 15, color: "#374151", lineHeight: 22 }}>
                        {notification.message}
                    </Text>
                </View>

                {/* Timestamp */}
                <Text style={{ fontFamily: "SpaceGrotesk_500Medium", fontSize: 12, color: "#94A3B8", textAlign: "center" }}>
                    {dayjs(notification.createdAt).format("HH:mm — DD/MM/YYYY")}
                </Text>

                {/* Close btn */}
                <Pressable
                    onPress={onClose}
                    style={{
                        marginTop: 20,
                        backgroundColor: "#000",
                        borderRadius: 16,
                        paddingVertical: 16,
                        alignItems: "center",
                    }}
                >
                    <Text style={{ fontFamily: "SpaceGrotesk_700Bold", fontSize: 15, color: "#FFF", textTransform: "uppercase", letterSpacing: 1 }}>
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
                    backgroundColor: isRead ? "#FFF" : "#FFF",
                    borderWidth: isRead ? 2 : 2.5,
                    borderColor: isRead ? "rgba(0,0,0,0.18)" : "#000",
                    borderRadius: 20,
                    padding: 16,
                    marginBottom: 12,
                    opacity: isRead ? 0.55 : 1,
                    shadowColor: "#000",
                    shadowOffset: { width: pressed ? 0 : (isRead ? 1 : 3), height: pressed ? 0 : (isRead ? 1 : 4) },
                    shadowOpacity: pressed ? 0 : (isRead ? 0.15 : 1),
                    shadowRadius: 0,
                    elevation: pressed ? 0 : (isRead ? 1 : 4),
                    transform: [{ translateY: pressed ? 2 : 0 }],
                })}
            >
                {/* Top row: Icon + Title + Unread dot */}
                <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 12, marginBottom: 10, padding: 10 }}>
                    {/* Type Icon */}
                    <View style={{
                        width: 42, height: 42, borderRadius: 13,
                        backgroundColor: isRead ? "#F1F5F9" : cfg.bg,
                        borderWidth: 2, borderColor: isRead ? "rgba(0,0,0,0.12)" : "#000",
                        alignItems: "center", justifyContent: "center", flexShrink: 0
                    }}>
                        <IconComp size={19} color={isRead ? "#94A3B8" : cfg.color} strokeWidth={2.5} />
                    </View>

                    {/* Title + message */}
                    <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 3 }}>
                            <Text
                                style={{
                                    fontFamily: isRead ? "SpaceGrotesk_500Medium" : "SpaceGrotesk_700Bold",
                                    fontSize: 14,
                                    color: isRead ? "#64748B" : "#000",
                                    flex: 1,
                                    marginRight: 8,
                                }}
                                numberOfLines={1}
                            >
                                {item.title}
                            </Text>
                            {/* Unread dot */}
                            {!isRead && (
                                <View style={{
                                    width: 9, height: 9, borderRadius: 5,
                                    backgroundColor: "#6366F1",
                                    borderWidth: 1.5, borderColor: "#000",
                                    flexShrink: 0,
                                }} />
                            )}
                        </View>
                        <Text
                            style={{
                                fontFamily: "SpaceGrotesk_500Medium",
                                fontSize: 13,
                                color: isRead ? "#94A3B8" : "#374151",
                                lineHeight: 18,
                            }}
                            numberOfLines={2}
                        >
                            {item.message}
                        </Text>
                    </View>
                </View>

                {/* Divider */}
                <View style={{ height: 1, backgroundColor: isRead ? "rgba(0,0,0,0.05)" : "rgba(0,0,0,0.08)", marginBottom: 10 }} />

                {/* Bottom row: type badge / read status / time */}
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                    {/* Type + Read status */}
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                        <View style={{
                            backgroundColor: isRead ? "#F1F5F9" : cfg.bg,
                            paddingHorizontal: 8, paddingVertical: 3,
                            borderRadius: 7,
                            borderWidth: 1,
                            borderColor: isRead ? "rgba(0,0,0,0.1)" : cfg.color,
                        }}>
                            <Text style={{
                                fontFamily: "SpaceGrotesk_600SemiBold",
                                fontSize: 10,
                                color: isRead ? "#94A3B8" : cfg.color,
                                textTransform: "uppercase",
                            }}>
                                {cfg.label}
                            </Text>
                        </View>

                        {/* Read/Unread pill */}
                        <View style={{
                            backgroundColor: isRead ? "#F1F5F9" : "#EDE9FE",
                            paddingHorizontal: 8, paddingVertical: 3,
                            borderRadius: 7,
                            borderWidth: 1,
                            borderColor: isRead ? "rgba(0,0,0,0.08)" : "#6366F1",
                        }}>
                            <Text style={{
                                fontFamily: "SpaceGrotesk_600SemiBold",
                                fontSize: 10,
                                color: isRead ? "#94A3B8" : "#6366F1",
                                textTransform: "uppercase",
                            }}>
                                {isRead ? "Đã đọc" : "Chưa đọc"}
                            </Text>
                        </View>
                    </View>

                    {/* Timestamp */}
                    <Text style={{
                        fontFamily: "SpaceGrotesk_500Medium",
                        fontSize: 11,
                        color: isRead ? "#CBD5E1" : "#64748B",
                    }}>
                        {dayjs(item.createdAt).format("HH:mm · DD/MM")}
                    </Text>
                </View>
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
