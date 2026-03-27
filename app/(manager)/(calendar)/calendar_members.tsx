import { useGetFamilyMembers } from "@/hooks/useFamily";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, ChevronRight, User } from "lucide-react-native";
import React from "react";
import { ActivityIndicator, Image, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CalendarMembersScreen() {
    const router = useRouter();
    const { familyId, familyName } = useLocalSearchParams<{ familyId: string; familyName: string }>();

    // 1. Lấy danh sách thành viên trong gia đình
    const { data: members, isLoading, isError, refetch } = useGetFamilyMembers(familyId);

    return (
        <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
            {/* Header */}
            <View className="px-6 py-4 flex-row items-center gap-x-4 border-b-2 border-black/5">
                <Pressable
                    onPress={() => router.back()}
                    className="w-12 h-12 bg-white border-2 border-black rounded-2xl items-center justify-center shadow-sm active:bg-gray-100"
                >
                    <ArrowLeft size={24} color="#000" strokeWidth={3} />
                </Pressable>
                <View className="flex-1">
                    <Text className="text-xl font-space-bold text-black" numberOfLines={1}>
                        {familyName || "Gia đình"}
                    </Text>
                    <Text className="text-xs font-space-bold text-gray-400 uppercase tracking-widest">
                        CHỌN THÀNH VIÊN
                    </Text>
                </View>
            </View>

            <ScrollView
                className="flex-1 px-6 pt-6"
                contentContainerStyle={{ paddingBottom: 120 }}
                showsVerticalScrollIndicator={false}
            >
                <View className="mb-8">
                    <Text className="text-4xl text-black font-space-bold tracking-tighter">
                        Thành viên
                    </Text>
                    <Text className="text-[17px] text-gray-500 mt-2 font-space-medium leading-relaxed">
                        Chọn thành viên bạn muốn xem lịch trình dùng thuốc chi tiết.
                    </Text>
                </View>

                {isLoading ? (
                    <View className="py-20 items-center justify-center">
                        <ActivityIndicator size="large" color="#000" />
                        <Text className="mt-4 font-space-medium text-gray-500">Đang tải danh sách...</Text>
                    </View>
                ) : isError ? (
                    <View className="py-16 items-center justify-center bg-gray-50 border-2 border-black border-dashed rounded-[32px]">
                        <Text className="text-xl font-space-bold text-black mb-2">Đã xảy ra lỗi!</Text>
                        <Pressable
                            onPress={() => refetch()}
                            className="mt-4 bg-white border-2 border-black px-6 py-2 rounded-xl"
                        >
                            <Text className="font-space-bold uppercase">Thử lại</Text>
                        </Pressable>
                    </View>
                ) : members?.length === 0 ? (
                    <View className="py-16 items-center justify-center bg-[#F9F6FC] border-2 border-black border-dashed rounded-[32px]">
                        <Text className="text-xl font-space-bold text-black mb-2">Chưa có thành viên nào</Text>
                    </View>
                ) : (
                    <View className="gap-y-5">
                        {members?.map((member) => (
                            <Pressable
                                key={member.memberId}
                                onPress={() => {
                                    // Chuyển hướng đến trang lịch chi tiết của thành viên (Sẽ tạo sau hoặc cập nhật index)
                                    // Hiện tại ta có thể quay lại index với param memberId nếu muốn
                                    router.push({
                                        pathname: "/(manager)/(calendar)/member_schedule",
                                        params: {
                                            memberId: member.memberId,
                                            memberName: member.fullName,
                                            familyName: familyName,
                                            avatarUrl: member.avatarUrl || undefined
                                        }
                                    } as any);
                                }}
                                className="bg-white border-2 border-black rounded-[32px] p-6 shadow-md active:bg-gray-50 active:translate-y-0.5 active:shadow-sm"
                            >
                                <View className="flex-row items-center gap-x-4">
                                    <View className="w-16 h-16 rounded-[24px] border-2 border-black items-center justify-center shadow-sm bg-[#A3E6A1] overflow-hidden">
                                        {member.avatarUrl ? (
                                            <Image
                                                source={{ uri: member.avatarUrl }}
                                                className="w-full h-full"
                                                resizeMode="cover"
                                            />
                                        ) : (
                                            <User size={32} color="#000" strokeWidth={2.5} />
                                        )}
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-xl text-black font-space-bold" numberOfLines={1}>
                                            {member.fullName}
                                        </Text>
                                        <Text className="text-sm text-gray-500 font-space-medium">
                                            {member.role === "Owner" ? "Chủ gia đình" : "Thành viên"}
                                        </Text>
                                    </View>
                                    <ChevronRight size={24} color="#000" strokeWidth={3} />
                                </View>
                            </Pressable>
                        ))}
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}
