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
import { useGetFamilyDailyReminders, useUpdateReminderAction } from "@/hooks/useSchedule";
import { useRouter } from "expo-router";
import { Clock } from "lucide-react-native";
import { Image } from "react-native";

dayjs.locale("vi");

function FamilyRemindersList({ familyId, familyName }: { familyId: string, familyName: string }) {
    const todayStr = dayjs().format("YYYY-MM-DD");
    const { data: reminders, isLoading, refetch } = useGetFamilyDailyReminders(familyId, todayStr);
    const { mutate: updateStatus, isPending: updating } = useUpdateReminderAction();

    if (isLoading) return <ActivityIndicator size="small" color="#000" className="my-2" />;
    if (!reminders || reminders.length === 0) return null;

    return (
        <View className="mb-6">
            <View className="flex-row items-center justify-between mb-3 pl-1">
                <Text className="text-lg font-space-bold text-black border-l-4 pl-2 border-[#D9AEF6]">
                    Gia đình {familyName}
                </Text>
            </View>
            <View className="gap-y-3">
                {reminders.map((reminder) => {
                    const isTaken = reminder.status === "Taken";

                    return (
                        <View key={reminder.reminderId} className="bg-white border-2 border-black rounded-[20px] p-4 shadow-sm flex-row items-center">
                            <View className="w-12 h-12 rounded-full border-2 border-black items-center justify-center mr-3" style={{ backgroundColor: isTaken ? "#A3E6A1" : "#FFD700" }}>
                                <Clock size={20} color="#000" strokeWidth={2.5} />
                            </View>
                            <View className="flex-1">
                                <Text className="text-xs font-space-bold text-gray-500 uppercase">Lúc {reminder.reminderTime}</Text>
                                <Text className="text-base font-space-bold text-black" numberOfLines={1}>{reminder.scheduleName}</Text>
                            </View>
                            <View>
                                {isTaken ? (
                                    <View className="bg-[#A3E6A1] px-3 py-1.5 rounded-lg border-2 border-black">
                                        <Text className="text-xs font-space-bold text-black uppercase">Đã uống</Text>
                                    </View>
                                ) : (
                                    <View className="bg-gray-100 px-3 py-1.5 rounded-lg border-2 border-black/10">
                                        <Text className="text-xs font-space-bold text-black opacity-50 uppercase">Chưa uống</Text>
                                    </View>
                                )}
                            </View>
                        </View>
                    );
                })}
            </View>
        </View>
    );
}

export default function MedicationCalendarScreen() {
    const router = useRouter();

    // 1. APIs - Lấy danh sách gia đình
    const {
        data: families,
        isLoading: loadingFamilies,
        isError: errorFamilies,
        refetch: refetchFamilies,
    } = useGetFamilies();
    const filteredFamilies = families?.filter((f) => f.type !== "Personal") || [];

    return (
        <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
            <ManagerHeader />

            <ScrollView
                className="flex-1 px-6 pt-6"
                contentContainerStyle={{ paddingBottom: 150 }}
                showsVerticalScrollIndicator={false}
            >
                <View className="mb-4">
                    <Text className="text-4xl text-black font-space-bold tracking-tighter">
                        Đơn thuốc
                    </Text>
                    <Text className="text-[17px] text-gray-500 mt-2 font-space-medium leading-relaxed">
                        Chọn một nhóm gia đình để xem và quản lý lịch trình uống thuốc.
                    </Text>
                </View>

                {/* 1️⃣ LỊCH HÔM NAY
                {filteredFamilies.length > 0 && (
                    <View className="mb-2 mt-4">
                        <Text className="text-xl font-space-bold text-black uppercase tracking-widest pl-1 mb-4">
                            Lịch hôm nay
                        </Text>
                        {filteredFamilies.map(f => (
                            <FamilyRemindersList key={f.familyId} familyId={f.familyId} familyName={f.familyName} />
                        ))}
                    </View>
                )} */}

                {/* 2️⃣ DANH SÁCH GIA ĐÌNH */}
                <View className="mb-6 mt-4 flex-row items-center justify-between">
                    <Text className="text-xl font-space-bold text-black uppercase tracking-widest pl-1">
                        Nhóm gia đình
                    </Text>
                    {filteredFamilies && (
                        <View className="bg-black px-3 py-1 rounded-lg border border-black">
                            <Text className="text-white font-space-bold text-xs">
                                {filteredFamilies.length}
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
                        {filteredFamilies?.map((family) => (
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
                                        className="w-16 h-16 rounded-[24px] border-2 border-black items-center justify-center shadow-sm overflow-hidden"
                                        style={{
                                            backgroundColor:
                                                family.type === "Personal" ? "#87CEFA" : "#D9AEF6",
                                        }}
                                    >
                                        {family.familyAvatarUrl ? (
                                            <Image
                                                source={{ uri: family.familyAvatarUrl }}
                                                className="w-full h-full"
                                                resizeMode="cover" // Đổi contentFit thành resizeMode
                                            />
                                        ) : family.type === "Personal" ? (
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
