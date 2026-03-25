// app/(manager)/calendar.tsx
import dayjs from "dayjs";
import "dayjs/locale/vi";
import {
  Activity,
  ArrowLeft,
  Calendar as CalendarIcon,
  ChevronRight,
  Clock,
  Plus,
  User,
  Users,
} from "lucide-react-native";
import { MotiView } from "moti";
import React, { useState } from "react";
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
import { useGetFamilySchedules } from "@/hooks/useSchedule";
import { ScheduleResponse } from "@/types/Schedule";

dayjs.locale("vi");

export default function MedicationCalendarScreen() {
  const [selectedFamily, setSelectedFamily] = useState<{
    id: string;
    name: string;
  } | null>(null);

  // 1. APIs
  const {
    data: families,
    isLoading: loadingFamilies,
    isError: errorFamilies,
    refetch: refetchFamilies,
  } = useGetFamilies();

  if (selectedFamily) {
    return (
      <FamilyPrescriptionView
        familyId={selectedFamily.id}
        familyName={selectedFamily.name}
        onBack={() => setSelectedFamily(null)}
      />
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <ManagerHeader subtitle="Lịch trình dùng thuốc" />

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
                  setSelectedFamily({
                    id: family.familyId,
                    name: family.familyName,
                  })
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

// Sub-component hiển thị danh sách đơn thuốc của 1 gia đình
function FamilyPrescriptionView({
  familyId,
  familyName,
  onBack,
}: {
  familyId: string;
  familyName: string;
  onBack: () => void;
}) {
  const {
    data: schedules,
    isLoading,
    isError,
    refetch,
  } = useGetFamilySchedules(familyId);

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <View className="px-6 py-4 flex-row items-center gap-x-4 border-b-2 border-black/5">
        <Pressable
          onPress={onBack}
          className="w-12 h-12 bg-white border-2 border-black rounded-2xl items-center justify-center shadow-sm active:bg-gray-100"
        >
          <ArrowLeft size={24} color="#000" strokeWidth={3} />
        </Pressable>
        <View className="flex-1">
          <Text className="text-xl font-space-bold text-black" numberOfLines={1}>
            {familyName}
          </Text>
          <Text className="text-xs font-space-bold text-gray-400 uppercase tracking-widest">
            ĐƠN THUỐC GIA ĐÌNH
          </Text>
        </View>
      </View>

      <ScrollView
        className="flex-1 px-6 pt-6"
        contentContainerStyle={{ paddingBottom: 150 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="mb-8">
          <Text className="text-4xl text-black font-space-bold tracking-tighter">
            Lịch trình
          </Text>
          <Text className="text-[17px] text-gray-500 mt-2 font-space-medium leading-relaxed">
            Danh sách các loại thuốc đang sử dụng cho thành viên trong nhóm.
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
              Hãy thêm đơn thuốc cho các thành viên để bắt đầu theo dõi.
            </Text>
          </View>
        ) : (
          <View className="gap-y-6">
            {schedules?.map((schedule, index) => (
              <MemberPrescriptionCard
                key={schedule.scheduleId}
                schedule={schedule}
                index={index}
              />
            ))}
          </View>
        )}

        {/* Floating Add Button */}
        <Pressable className="bg-[#FFD700] border-2 border-black rounded-[28px] p-6 flex-row items-center justify-center gap-x-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none mt-10">
          <Plus size={28} color="#000" strokeWidth={3} />
          <Text className="text-xl text-black font-space-bold uppercase tracking-wider">
            Thêm đơn thuốc
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function MemberPrescriptionCard({
  schedule,
  index,
}: {
  schedule: ScheduleResponse;
  index: number;
}) {
  const times = (schedule.specificTimes || "").split(",").map((t) => t.trim());

  return (
    <MotiView
      from={{ opacity: 0, translateY: 15 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: "timing", duration: 400, delay: index * 100 }}
      className="bg-white border-2 border-black rounded-[32px] p-6 shadow-md active:bg-gray-50 active:translate-y-0.5 active:shadow-sm"
    >
      <View className="flex-row items-center justify-between mb-5">
        <View className="flex-row items-center flex-1 gap-x-4">
          <View
            className="w-16 h-16 rounded-[24px] border-2 border-black items-center justify-center shadow-sm"
            style={{
              backgroundColor: index % 2 === 0 ? "#D9AEF6" : "#A3E6A1",
            }}
          >
            <User size={32} color="#000" strokeWidth={2.5} />
          </View>
          <View className="flex-1 pr-2">
            <Text className="text-xl text-black font-space-bold" numberOfLines={1}>
              {schedule.memberName}
            </Text>
            <View className="flex-row items-center mt-1 gap-x-1.5">
              <Activity size={14} color="#6B7280" />
              <Text className="text-sm text-gray-500 font-space-medium">
                Schedules ID: {schedule.scheduleId.slice(0, 8)}
              </Text>
            </View>
          </View>
          {!schedule.isActive && (
            <View className="bg-gray-100 px-2 py-1 rounded-lg border border-black/10">
              <Text className="text-[10px] font-space-bold text-gray-500">
                TẠM DỪNG
              </Text>
            </View>
          )}
        </View>
      </View>

      <View className="bg-gray-50 border-2 border-black rounded-2xl p-4 mb-4">
        <View className="flex-row items-center gap-x-2 mb-2">
          <View className="bg-black px-2 py-0.5 rounded-md">
            <Text className="text-[10px] font-space-bold text-white uppercase">
              Thuốc đang sử dụng
            </Text>
          </View>
        </View>
        <Text className="text-[17px] font-space-bold text-black leading-tight mb-1">
          {schedule.medicineName}
        </Text>
        <Text className="text-sm font-space-medium text-gray-600">
          {schedule.dosage}
        </Text>
      </View>

      <View className="flex-row items-center gap-x-3 mb-5">
        <Clock size={18} color="#000" strokeWidth={2.5} />
        <View className="flex-1 flex-row flex-wrap gap-2">
          {times.map((time, idx) => (
            <View
              key={idx}
              className="bg-white border-2 border-black rounded-xl px-3 py-1 shadow-sm"
            >
              <Text className="text-xs font-space-bold">{time}</Text>
            </View>
          ))}
        </View>
      </View>

      <View className="flex-row items-center justify-between pt-5 border-t-2 border-black/5">
        <View className="flex-row items-center gap-x-2">
          <CalendarIcon size={14} color="#6B7280" />
          <Text className="text-xs font-space-bold text-gray-500">
            {dayjs(schedule.startDate).format("DD/MM")} -{" "}
            {schedule.endDate ? dayjs(schedule.endDate).format("DD/MM") : "N/A"}
          </Text>
        </View>
        
        <Pressable className="bg-black px-5 py-3 rounded-xl flex-row items-center gap-x-2 active:opacity-80">
          <Text className="text-white font-space-bold text-xs uppercase tracking-wider">
            Chi tiết
          </Text>
          <ChevronRight size={16} color="#FFF" strokeWidth={3} />
        </Pressable>
      </View>
    </MotiView>
  );
}


