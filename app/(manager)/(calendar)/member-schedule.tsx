import { useGetMemberSchedules } from "@/hooks/useSchedule";
import { ScheduleResponse } from "@/types/Schedule";
import dayjs from "dayjs";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
    Activity,
    ArrowLeft,
    Calendar as CalendarIcon,
    ChevronRight,
    Clock,
    Plus
} from "lucide-react-native";
import { MotiView } from "moti";
import React from "react";
import {
    ActivityIndicator,
    Pressable,
    ScrollView,
    Text,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function MemberScheduleScreen() {
    const router = useRouter();
    const { memberId, memberName, familyName } = useLocalSearchParams<{
        memberId: string;
        memberName: string;
        familyName: string;
    }>();

    // 1. Lấy danh sách lịch trình của thành viên
    const { data: schedules, isLoading, isError, refetch } = useGetMemberSchedules(memberId);

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
                        {memberName || "Thành viên"}
                    </Text>
                    <Text className="text-xs font-space-bold text-gray-400 uppercase tracking-widest">
                        LỊCH TRÌNH CÁ NHÂN
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
                        Đơn thuốc
                    </Text>
                    <Text className="text-[17px] text-gray-500 mt-2 font-space-medium leading-relaxed">
                        Danh sách các loại thuốc đang sử dụng cho <Text className="text-black font-space-bold">{memberName}</Text>.
                    </Text>
                </View>

                {isLoading ? (
                    <View className="py-20 items-center justify-center">
                        <ActivityIndicator size="large" color="#000" />
                    </View>
                ) : isError ? (
                    <View className="py-16 items-center justify-center bg-gray-50 border-2 border-black border-dashed rounded-[32px]">
                        <Text className="text-xl font-space-bold text-black mb-2">Lỗi tải dữ liệu!</Text>
                        <Pressable
                            onPress={() => refetch()}
                            className="mt-4 bg-white border-2 border-black px-6 py-2 rounded-xl"
                        >
                            <Text className="font-space-bold uppercase">Thử lại</Text>
                        </Pressable>
                    </View>
                ) : schedules?.length === 0 ? (
                    <View className="py-16 items-center justify-center bg-gray-50 border-2 border-black border-dashed rounded-[32px]">
                        <Text className="text-xl font-space-bold text-black mb-2 text-center px-6">
                            Chưa có đơn thuốc nào
                        </Text>
                        <Text className="text-sm font-space-medium text-gray-500 text-center px-10">
                            Hãy thêm đơn thuốc để bắt đầu theo dõi quá trình sử dụng.
                        </Text>
                    </View>
                ) : (
                    <View className="gap-y-6">
                        {schedules?.map((schedule, index) => (
                            <ScheduleCard key={schedule.scheduleId} schedule={schedule} index={index} />
                        ))}
                    </View>
                )}

                {/* Floating Add Button */}
                <Pressable
                    onPress={() => router.push({ pathname: "/(manager)/(prescription)/add_manual_prescription", params: { memberId } } as any)}
                    className="bg-[#FFD700] border-2 border-black rounded-[28px] p-6 flex-row items-center justify-center gap-x-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none mt-10"
                >
                    <Plus size={28} color="#000" strokeWidth={3} />
                    <Text className="text-xl text-black font-space-bold uppercase tracking-wider">
                        Thêm đơn thuốc
                    </Text>
                </Pressable>
            </ScrollView>
        </SafeAreaView>
    );
}

function ScheduleCard({ schedule, index }: { schedule: ScheduleResponse; index: number }) {
    const times = (schedule.specificTimes || "").split(",").map((t) => t.trim());

    return (
        <MotiView
            from={{ opacity: 0, translateY: 15 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: "timing", duration: 400, delay: index * 100 }}
            className="bg-white border-2 border-black rounded-[32px] p-6 shadow-md"
        >
            <View className="flex-row items-center justify-between mb-5">
                <View className="flex-row items-center flex-1 gap-x-4">
                    <View
                        className="w-16 h-16 rounded-[24px] border-2 border-black items-center justify-center shadow-sm"
                        style={{ backgroundColor: index % 2 === 0 ? "#D9AEF6" : "#A3E6A1" }}
                    >
                        <Activity size={32} color="#000" strokeWidth={2.5} />
                    </View>
                    <View className="flex-1 pr-2">
                        <Text className="text-xl text-black font-space-bold" numberOfLines={1}>
                            {schedule.medicineName}
                        </Text>
                        <Text className="text-sm text-gray-500 font-space-medium">
                            {schedule.dosage}
                        </Text>
                    </View>
                    {!schedule.isActive && (
                        <View className="bg-red-100 px-2 py-1 rounded-lg border border-black/10">
                            <Text className="text-[10px] font-space-bold text-red-500">TẠM DỪNG</Text>
                        </View>
                    )}
                </View>
            </View>

            <View className="flex-row items-center gap-x-3 mb-5">
                <Clock size={18} color="#000" strokeWidth={2.5} />
                <View className="flex-1 flex-row flex-wrap gap-2">
                    {times.map((time, idx) => (
                        <View key={idx} className="bg-white border-2 border-black rounded-xl px-3 py-1 shadow-sm">
                            <Text className="text-xs font-space-bold">{time}</Text>
                        </View>
                    ))}
                </View>
            </View>

            <View className="flex-row items-center justify-between pt-5 border-t-2 border-black/5">
                <View className="flex-row items-center gap-x-2">
                    <CalendarIcon size={14} color="#6B7280" />
                    <Text className="text-xs font-space-bold text-gray-500">
                        {dayjs(schedule.startDate).format("DD/MM")} - {schedule.endDate ? dayjs(schedule.endDate).format("DD/MM") : "N/A"}
                    </Text>
                </View>

                <Pressable className="bg-black px-5 py-3 rounded-xl flex-row items-center gap-x-2 active:opacity-80">
                    <Text className="text-white font-space-bold text-xs uppercase tracking-wider">Chi tiết</Text>
                    <ChevronRight size={16} color="#FFF" strokeWidth={3} />
                </Pressable>
            </View>
        </MotiView>
    );
}
