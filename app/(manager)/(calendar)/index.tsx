// app/(manager)/(calendar)/index.tsx
import dayjs from "dayjs";
import "dayjs/locale/vi";
import {
    ChevronRight,
    User, Users
} from "lucide-react-native";
import React from "react";
import {
    ActivityIndicator,
    Pressable,
    ScrollView,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import ManagerHeader from "@/components/ManagerHeader";
import { useGetFamilies } from "@/hooks/useFamily";
import { useRouter } from "expo-router";

dayjs.locale("vi");

export default function MedicationCalendarScreen() {
    const router = useRouter();

    // 1. APIs - Lấy danh sách gia đình
    const {
        data: families,
        isLoading: loadingFamilies,
        isError: errorFamilies,
        refetch: refetchFamilies,
    } = useGetFamilies();

    return (
        <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
            <ManagerHeader />

            <ScrollView
                className="flex-1 px-6 pt-6"
                contentContainerStyle={{ paddingBottom: 150 }}
                showsVerticalScrollIndicator={false}
            >
                <View className="mb-8">
                    <Text className="text-4xl text-black font-space-bold tracking-tighter">
                        Đơn thuốc
                    </Text>
                    <Text className="text-[17px] text-gray-500 mt-2 font-space-medium leading-relaxed">
                        Chọn một nhóm gia đình để xem và quản lý lịch trình uống thuốc.
                    </Text>
                </View>

                {/* 2️⃣ DANH SÁCH GIA ĐÌNH */}
                <View className="mb-6 flex-row items-center justify-between">
                    <Text className="text-xl font-space-bold text-black uppercase tracking-widest pl-1">
                        Nhóm gia đình
                    </Text>
                    {families && (
                        <View className="bg-black px-3 py-1 rounded-lg border border-black">
                            <Text className="text-white font-space-bold text-xs">
                                {families.length}
                            </Text>
                        </View>
                    )}
                </View>

                {loadingFamilies ? (
                    <View className="py-20 items-center justify-center">
                        <ActivityIndicator size="large" color="#000" />
                        <Text className="mt-4 font-space-medium text-gray-500">
                            Đang tải danh sách...
                        </Text>
                    </View>
                ) : errorFamilies ? (
                    <View className="py-16 items-center justify-center bg-gray-50 border-2 border-black border-dashed rounded-[32px]">
                        <Text className="text-xl font-space-bold text-black mb-2">Đã xảy ra lỗi!</Text>
                        <Pressable
                            onPress={() => refetchFamilies()}
                            className="mt-4 bg-white border-2 border-black px-6 py-2 rounded-xl"
                        >
                            <Text className="font-space-bold">THỬ LẠI</Text>
                        </Pressable>
                    </View>
                ) : (
                    <View className="gap-y-5">
                        {families?.map((family) => (
                            <Pressable
                                key={family.familyId}
                                onPress={() =>
                                    router.push({
                                        pathname: "/(manager)/(calendar)/calendar_members",
                                        params: {
                                            familyId: family.familyId,
                                            familyName: family.familyName,
                                        },
                                    } as any)
                                }
                                className="bg-white border-2 border-black rounded-[32px] p-6 shadow-md active:bg-gray-50 active:translate-y-0.5 active:shadow-sm"
                            >
                                <View className="flex-row items-center gap-x-4">
                                    <View
                                        className="w-16 h-16 rounded-[24px] border-2 border-black items-center justify-center shadow-sm"
                                        style={{
                                            backgroundColor:
                                                family.type === "Personal" ? "#87CEFA" : "#D9AEF6",
                                        }}
                                    >
                                        {family.type === "Personal" ? (
                                            <User size={32} color="#000" strokeWidth={2.5} />
                                        ) : (
                                            <Users size={32} color="#000" strokeWidth={2.5} />
                                        )}
                                    </View>
                                    <View className="flex-1">
                                        <Text
                                            className="text-xl text-black font-space-bold"
                                            numberOfLines={1}
                                        >
                                            {family.familyName}
                                        </Text>
                                        <Text className="text-sm text-gray-500 font-space-medium">
                                            {family.memberCount} thành viên
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
