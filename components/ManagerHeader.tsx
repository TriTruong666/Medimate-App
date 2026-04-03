import { SkeletonPulsar } from "@/components/skeleton/SkeletonPulsar";
import { useGetMemberById } from "@/hooks/useMember";
import { useGetUserNotifications } from "@/hooks/useNotification";
import { useGetMe } from "@/hooks/useUser";
import { getDecodedToken } from "@/utils/token";
import { useRouter } from "expo-router";
import { Bell, MoreHorizontal } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { Image, Pressable, Text, View } from "react-native";

interface ManagerHeaderProps {
    subtitle?: string;
}

export default function ManagerHeader(_props: ManagerHeaderProps) {
    const router = useRouter();
    const [userId, setUserId] = useState<string | undefined>(undefined);
    const [memberId, setMemberId] = useState<string | undefined>(undefined);

    useEffect(() => {
        const fetchToken = async () => {
            const decoded = await getDecodedToken();
            if (decoded) {
                setUserId(decoded.Id);
                setMemberId(decoded.MemberId);
            }
        };
        fetchToken();
    }, []);

    // 1. Gọi hook lấy thông tin User (Chỉ chạy nếu có userId)
    const { data: userProfile, isLoading: isUserLoading } = useGetMe(!!userId);

    // 2. Gọi hook lấy thông tin Member (Chỉ chạy nếu KHÔNG có userId NHƯNG có memberId)
    const effectiveMemberId = (!userId && memberId) ? memberId : undefined;
    const { data: memberProfile, isLoading: isMemberLoading } = useGetMemberById(effectiveMemberId);

    // 3. Lấy số thông báo chưa đọc
    const { data: notifications } = useGetUserNotifications();
    const unreadCount = (notifications || []).filter(n => !n.isRead).length;

    // Dữ liệu cuối cùng để hiển thị
    const displayData = userId ? userProfile : memberProfile;
    const isLoading = userId ? isUserLoading : isMemberLoading;

    return (
        <View className="flex-row items-center justify-between px-6 pt-4 pb-4">
            {/* Left: Avatar + Name */}
            <View className="flex-row items-center gap-x-4">
                <View className="w-14 h-14 rounded-2xl bg-white items-center justify-center overflow-hidden border-2 border-black shadow-sm">
                    {isLoading ? (
                        <SkeletonPulsar className="w-full h-full bg-gray-100" />
                    ) : (
                        <Image
                            source={{ uri: displayData?.avatarUrl || "https://i.pravatar.cc/100" }}
                            className="w-14 h-14"
                            resizeMode="cover"
                        />
                    )}
                </View>

                <View>
                    {isLoading ? (
                        <SkeletonPulsar className="w-24 h-6 bg-gray-100 rounded-md mb-1" />
                    ) : (
                        <Text className="text-xl text-black font-space-bold">
                            {displayData?.fullName || "Người dùng"}
                        </Text>
                    )}
                </View>
            </View>

            {/* Right: Action Buttons */}
            <View className="flex-row items-center gap-x-3">
                {/* Bell button with unread badge */}
                <Pressable
                    onPress={() => router.push("/(manager)/(settings)/notifications" as any)}
                    className="w-12 h-12 rounded-2xl bg-white border-2 border-black items-center justify-center shadow-sm active:translate-y-0.5"
                    style={{ position: "relative" }}
                >
                    <Bell size={22} color="#000" strokeWidth={2} />
                    {unreadCount > 0 && (
                        <View style={{
                            position: "absolute",
                            top: -4,
                            right: -4,
                            minWidth: 18,
                            height: 18,
                            borderRadius: 9,
                            backgroundColor: "#6366F1",
                            borderWidth: 2,
                            borderColor: "#F9F6FC",
                            alignItems: "center",
                            justifyContent: "center",
                            paddingHorizontal: 3,
                        }}>
                            <Text style={{
                                fontFamily: "SpaceGrotesk_700Bold",
                                fontSize: 9,
                                color: "#FFF",
                                lineHeight: 12,
                            }}>
                                {unreadCount > 99 ? "99+" : unreadCount}
                            </Text>
                        </View>
                    )}
                </Pressable>

                <Pressable className="w-12 h-12 rounded-2xl bg-white border-2 border-black items-center justify-center shadow-sm active:translate-y-0.5">
                    <MoreHorizontal size={22} color="#000" strokeWidth={2} />
                </Pressable>
            </View>
        </View>
    );
}
