// components/ManagerHeader.tsx
import { useGetMemberById } from "@/hooks/useMember";
import { useGetMe } from "@/hooks/useUser";
import { getDecodedToken } from "@/utils/token";
import { Bell, MoreHorizontal } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Image, Pressable, Text, View } from "react-native";



interface ManagerHeaderProps {
    subtitle?: string;
}

export default function ManagerHeader({
    // subtitle = "Quản lý thuốc",
}: ManagerHeaderProps) {
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
    // Thủ thuật: Nếu có userId, ta truyền id là undefined để ngăn hook member chạy
    const effectiveMemberId = (!userId && memberId) ? memberId : undefined;
    const { data: memberProfile, isLoading: isMemberLoading } = useGetMemberById(effectiveMemberId);

    // Dữ liệu cuối cùng để hiển thị (Ưu tiên User, nếu không có thì lấy Member)
    const displayData = userId ? userProfile : memberProfile;
    const isLoading = userId ? isUserLoading : isMemberLoading;

    return (
        <View className="flex-row items-center justify-between px-6 pt-3 pb-4">
            {/* Left: Avatar + Name */}
            <View className="flex-row items-center">
                <View className="w-14 h-14 rounded-2xl bg-gray-200 items-center justify-center overflow-hidden border border-gray-300">
                    {isLoading ? (
                        <ActivityIndicator color="#888" />
                    ) : (
                        <Image
                            source={{ uri: displayData?.avatarUrl || "https://i.pravatar.cc/100" }}
                            className="w-14 h-14"
                            resizeMode="cover"
                        />
                    )}
                </View>

                <View className="ml-4">
                    {isLoading ? (
                        <View className="w-24 h-5 bg-gray-200 rounded-md mb-1" />
                    ) : (
                        <Text className="text-lg text-black font-space-bold">
                            {displayData?.fullName || "Người dùng"}
                        </Text>
                    )}
                    {/* <Text className="text-sm text-gray-500 font-space-regular mt-0.5">
                        {subtitle}
                    </Text> */}
                </View>
            </View>

            {/* Right: Action Buttons */}
            <View className="flex-row items-center gap-3">
                <Pressable className="w-12 h-12 rounded-2xl bg-gray-100 items-center justify-center active:opacity-70">
                    <Bell size={22} color="#000" strokeWidth={1.5} />
                </Pressable>
                <Pressable className="w-12 h-12 rounded-2xl bg-gray-100 items-center justify-center active:opacity-70">
                    <MoreHorizontal size={22} color="#000" strokeWidth={1.5} />
                </Pressable>
            </View>
        </View>
    );
}