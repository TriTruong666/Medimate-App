// app/(manager)/calendar.tsx
import dayjs from "dayjs";
import 'dayjs/locale/vi';
import {
    Activity,
    Calendar as CalendarIcon,
    ChevronRight,
    ClipboardList,
    Clock,
    User
} from "lucide-react-native";
import { MotiView } from "moti";
import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import ManagerHeader from "@/components/ManagerHeader";
import { ScheduleResponse } from "@/types/Schedule";

dayjs.locale('vi');

// DỮ LIỆU MOCK ĐỂ DEMO UI (QUẢN LÝ ĐƠN THUỐC)
const MOCK_SCHEDULES: ScheduleResponse[] = [
    {
        scheduleId: "SCH-001",
        memberId: "MEM-01",
        memberName: "Nguyễn Văn Nam (Ông Nội)",
        medicineName: "Panadol 500mg, Amoxicillin 500",
        dosage: "1 viên mỗi loại, ngày 2 lần",
        specificTimes: "08:00, 20:00",
        startDate: dayjs().toISOString(),
        endDate: dayjs().add(7, 'day').toISOString(),
        isActive: true,
    },
    {
        scheduleId: "SCH-002",
        memberId: "MEM-02",
        memberName: "Trần Thị Tuyết (Bà Nội)",
        medicineName: "Vitamin C 1000mg, Calcium Tab",
        dosage: "1 viên sủi C, 1 viên canxi nén",
        specificTimes: "09:00",
        startDate: dayjs().toISOString(),
        endDate: dayjs().add(30, 'day').toISOString(),
        isActive: true,
    },
    {
        scheduleId: "SCH-003",
        memberId: "MEM-03",
        memberName: "Bé Bo (Cháu Nội)",
        medicineName: "Siro ho Prospan, Vitamin D3 Drops",
        dosage: "5ml siro, 2 giọt D3",
        specificTimes: "08:00, 18:00",
        startDate: dayjs().toISOString(),
        endDate: dayjs().add(5, 'day').toISOString(),
        isActive: true,
    },
    {
        scheduleId: "SCH-004",
        memberId: "MEM-04",
        memberName: "Lê Thanh Hằng (Mẹ)",
        medicineName: "Sắt Ferrum Plus, Axit Folic",
        dosage: "1 viên sắt sáng, 1 viên Folic tối",
        specificTimes: "06:00, 21:00",
        startDate: dayjs().subtract(5, 'day').toISOString(),
        endDate: dayjs().add(25, 'day').toISOString(),
        isActive: false, // Demo trạng thái tạm dừng
    }
];

export default function MedicationCalendarScreen() {
    return (
        <SafeAreaView className="flex-1 bg-[#F9F6FC]" edges={["top"]}>
            <ManagerHeader />

            <ScrollView
                className="flex-1 px-5"
                contentContainerStyle={{ paddingBottom: 120 }}
                showsVerticalScrollIndicator={false}
            >
                {/* Header Section - Minimalist */}
                <View className="mb-8 mt-4 flex-row items-center justify-between">
                    <View>
                        <Text className="text-3xl font-space-bold text-black uppercase tracking-tighter">
                            Quản lý đơn thuốc
                        </Text>
                        <Text className="text-gray-500 font-space-medium mt-1">
                            {MOCK_SCHEDULES.length} lộ trình đang thực hiện
                        </Text>
                    </View>
                    <View className="bg-black w-12 h-12 rounded-2xl items-center justify-center">
                        <ClipboardList size={22} color="#FFF" />
                    </View>
                </View>

                {/* Member Prescription List (Using Mock Data) */}
                <View className="gap-y-6">
                    {MOCK_SCHEDULES.map((schedule, index) => (
                        <MemberPrescriptionCard
                            key={schedule.scheduleId}
                            schedule={schedule}
                            index={index}
                        />
                    ))}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

interface MemberPrescriptionCardProps {
    schedule: ScheduleResponse;
    index: number;
}

function MemberPrescriptionCard({ schedule, index }: MemberPrescriptionCardProps) {
    const times = schedule.specificTimes.split(",").map(t => t.trim());

    return (
        <MotiView
            from={{ opacity: 0, translateY: 15 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 400, delay: index * 100 }}
            className="bg-white border-2 border-black rounded-[24px] overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
        >
            {/* Top Bar - Header Card */}
            <View className="bg-black px-5 py-3 flex-row items-center justify-between">
                <Text className="text-xs font-space-bold text-white uppercase tracking-widest">
                    ĐƠN THUỐC
                </Text>
                <View className={`w-2 h-2 rounded-full ${schedule.isActive ? 'bg-green-400' : 'bg-gray-300'}`} />
            </View>

            <View className="p-5">
                {/* Member Name Section */}
                <View className="flex-row items-center gap-x-3 mb-4">
                    <View className="w-12 h-12 rounded-full bg-gray-100 border-2 border-black/10 items-center justify-center">
                        <User size={20} color="#000" />
                    </View>
                    <View className="flex-1">
                        <Text className="text-lg font-space-bold text-black" numberOfLines={1}>
                            {schedule.memberName}
                        </Text>
                        <View className="flex-row items-center gap-x-1">
                            <Activity size={12} color="#888" />
                            <Text className="text-xs font-space-medium text-gray-500">Mã: {schedule.memberId}</Text>
                        </View>
                    </View>
                    {!schedule.isActive && (
                        <View className="bg-gray-200 px-2 py-0.5 rounded-lg border border-black/10">
                            <Text className="text-[10px] font-space-bold text-gray-500">TẠM DỪNG</Text>
                        </View>
                    )}
                </View>

                {/* Medicine Details - Focus on "Đơn" */}
                <View className="bg-gray-50 border-2 border-black rounded-2xl p-4 mb-4">
                    <View className="flex-row items-center gap-x-2 mb-2">
                        <View className="bg-black px-2 py-0.5 rounded-md">
                            <Text className="text-[10px] font-space-bold text-white uppercase">Thuốc đang sử dụng</Text>
                        </View>
                    </View>
                    <Text className="text-[17px] font-space-bold text-black leading-tight mb-1">
                        {schedule.medicineName}
                    </Text>
                    <Text className="text-sm font-space-medium text-gray-600">
                        {schedule.dosage}
                    </Text>
                </View>

                {/* Timing Grid */}
                <View className="flex-row items-center gap-x-3 border-t border-black/5 pt-4">
                    <View className="flex-row items-center gap-x-2">
                        <Clock size={16} color="#000" strokeWidth={2.5} />
                        <Text className="text-sm font-space-bold">Giờ uống:</Text>
                    </View>
                    <View className="flex-1 flex-row flex-wrap gap-2">
                        {times.map((time, idx) => (
                            <View key={idx} className="bg-white border-2 border-black rounded-xl px-2.5 py-1 shadow-sm">
                                <Text className="text-xs font-space-bold">{time}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Footer Action */}
                <Pressable className="mt-5 bg-black py-4 rounded-2xl flex-row items-center justify-center gap-x-2 active:opacity-90">
                    <Text className="text-white font-space-bold uppercase tracking-widest text-sm">Xem chi tiết đơn</Text>
                    <ChevronRight size={18} color="#FFF" />
                </Pressable>
            </View>

            {/* Bottom info strip */}
            <View className="px-5 py-3 bg-gray-50 border-t border-black/5 flex-row items-center justify-between">
                <View className="flex-row items-center gap-x-2">
                    <CalendarIcon size={14} color="#555" />
                    <Text className="text-[11px] font-space-bold text-gray-500">
                        {dayjs(schedule.startDate).format('DD.MM.YYYY')} - {dayjs(schedule.endDate).format('DD.MM.YYYY')}
                    </Text>
                </View>
                {schedule.isActive ? (
                    <View className="bg-green-100 px-2 py-0.5 rounded-lg border border-green-200">
                        <Text className="text-[10px] font-space-bold text-green-700 uppercase">Đang áp dụng</Text>
                    </View>
                ) : (
                    <View className="bg-red-50 px-2 py-0.5 rounded-lg border border-red-100">
                        <Text className="text-[10px] font-space-bold text-red-500 uppercase">Hết hiệu lực</Text>
                    </View>
                )}
            </View>
        </MotiView>
    );
}
