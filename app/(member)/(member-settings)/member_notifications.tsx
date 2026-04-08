import dayjs from "dayjs";
import "dayjs/locale/vi";
import relativeTime from "dayjs/plugin/relativeTime";
import { useLocalSearchParams, useRouter } from "expo-router";
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
    Pressable,
    RefreshControl,
    Text,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Giả sử bạn đã có các hook này trong useNotification.ts hoặc cần tạo mới dựa trên memberId
import {
    useGetUserNotifications,
    useMarkAllNotificationsAsRead, // Hook mới lấy theo MemberId
    useMarkNotificationAsRead,
} from "@/hooks/useNotification";
import { NotificationData } from "@/types/Notification";

dayjs.extend(relativeTime);
dayjs.locale("vi");

const TYPE_CONFIG: Record<string, { icon: any; color: string; bg: string; label: string }> = {
    REMINDER: { icon: Clock, color: "#F59E0B", bg: "#FEF3C7", label: "Nhắc nhở" },
    APPOINTMENT: { icon: Calendar, color: "#6366F1", bg: "#EDE9FE", label: "Lịch hẹn" },
    SYSTEM: { icon: Info, color: "#0EA5E9", bg: "#E0F2FE", label: "Hệ thống" },
    DEFAULT: { icon: Zap, color: "#8B5CF6", bg: "#F5F3FF", label: "Thông báo" },
};

function getTypeConfig(type: string) {
    return TYPE_CONFIG[type?.toUpperCase()] ?? TYPE_CONFIG["DEFAULT"];
}

export default function MemberNotificationsScreen() {
    const router = useRouter();
    // Lấy memberId và memberName từ route params
    const { memberId, memberName } = useLocalSearchParams<{ memberId: string; memberName: string }>();

    const [selected, setSelected] = useState<NotificationData | null>(null);

    // Lấy dữ liệu thông báo dành riêng cho Member này
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
                    marginBottom: 16,
                    opacity: isRead ? 0.7 : 1,
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
                <View className="flex-row items-center justify-between mb-3">
                    <View className="flex-row items-center gap-x-2">
                        <View style={{ backgroundColor: isRead ? "#F1F5F9" : cfg.bg, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, borderWidth: 1.5, borderColor: isRead ? "rgba(0,0,0,0.1)" : "#000" }}>
                            <Text style={{ fontFamily: "SpaceGrotesk_700Bold", fontSize: 10, color: isRead ? "#94A3B8" : cfg.color, textTransform: "uppercase" }}>
                                {cfg.label}
                            </Text>
                        </View>
                        {!isRead && (
                            <View className="w-2 h-2 rounded-full bg-red-500" />
                        )}
                    </View>
                    <Text className="text-[11px] font-space-medium text-gray-400">
                        {dayjs(item.createdAt).format("HH:mm · DD/MM")}
                    </Text>
                </View>

                <View className="flex-row gap-x-4">
                    <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: isRead ? "#F8FAFC" : cfg.bg, borderWidth: 2, borderColor: isRead ? "rgba(0,0,0,0.12)" : "#000", alignItems: "center", justifyContent: "center" }}>
                        <IconComp size={20} color={isRead ? "#CBD5E1" : cfg.color} strokeWidth={2.5} />
                    </View>
                    <View className="flex-1">
                        <Text style={{ fontFamily: isRead ? "SpaceGrotesk_600SemiBold" : "SpaceGrotesk_700Bold" }} className="text-[15px] mb-1" numberOfLines={1}>
                            {item.title}
                        </Text>
                        <Text className="text-[13px] font-space-medium text-gray-500" numberOfLines={2}>
                            {item.message}
                        </Text>
                    </View>
                </View>
            </Pressable>
        );
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#F9F6FC" }} edges={["top"]}>
            {/* Header Neo-Brutalism */}
            <View className="flex-row items-center justify-between px-5 pt-3 pb-5">
                <Pressable
                    onPress={() => router.back()}
                    className="w-12 h-12 bg-white border-2 border-black rounded-2xl items-center justify-center shadow-sm active:translate-y-0.5"
                >
                    <ArrowLeft size={22} color="#000" strokeWidth={2.5} />
                </Pressable>

                <View className="items-center">
                    <Text className="text-[10px] font-space-bold text-gray-400 uppercase tracking-widest mb-1">Thông báo của</Text>
                    <Text className="text-lg font-space-bold text-black uppercase" numberOfLines={1}>
                        {memberName || "Thành viên"}
                    </Text>
                </View>

                <Pressable
                    onPress={() => markAllRead()}
                    disabled={isMarkingAll || unreadCount === 0}
                    style={{ backgroundColor: unreadCount > 0 ? "#A3E6A1" : "#F3F4F6", opacity: isMarkingAll ? 0.6 : 1 }}
                    className="w-12 h-12 border-2 border-black rounded-2xl items-center justify-center shadow-sm"
                >
                    <CheckCheck size={20} color="#000" strokeWidth={2.5} />
                </Pressable>
            </View>

            {/* List Content */}
            <View className="flex-1 px-5">
                {isLoading ? (
                    <View className="flex-1 items-center justify-center">
                        <ActivityIndicator size="large" color="#000" />
                    </View>
                ) : !notifications || notifications.length === 0 ? (
                    <View className="flex-1 items-center justify-center">
                        <View className="w-20 h-20 bg-gray-100 rounded-3xl border-2 border-black items-center justify-center mb-4">
                            <BellOff size={32} color="#9CA3AF" />
                        </View>
                        <Text className="font-space-bold text-gray-400">Không có thông báo nào</Text>
                    </View>
                ) : (
                    <FlatList
                        data={notifications}
                        keyExtractor={(item) => item.notificationId}
                        renderItem={renderItem}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: 40 }}
                        refreshControl={
                            <RefreshControl refreshing={isFetching} onRefresh={refetch} tintColor="#000" />
                        }
                    />
                )}
            </View>

            {/* Detail Modal (Giữ nguyên logic của bạn) */}
            {/* ... Modal Code ... */}
        </SafeAreaView>
    );
}