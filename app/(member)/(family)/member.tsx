import { MemberDetailSkeleton } from "@/components/skeleton/MemberDetailSkeleton";
import { useGetFamilies, useGetFamilyMembers } from "@/hooks/useFamily";
import { useGetHealthProfile } from "@/hooks/useHealth";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
    ArrowLeft,
    FileText,
    HeartPulse,
} from "lucide-react-native";
import React from "react";
import { Image, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function MemberFamilyMemberDetailScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id: string }>();

    const { data: families, isLoading: isLoadingFamilies } = useGetFamilies();
    const familyId = families?.[0]?.familyId;

    // Fetch danh sách members trong gia đình thay vì getMemberById
    const { data: familyMembers, isLoading: isFetchingMembers } = useGetFamilyMembers(familyId);
    const member = familyMembers?.find((m: any) => m.memberId === id);

    const { data: healthProfile, isLoading: isFetchingHealth } = useGetHealthProfile(id);

    if (isLoadingFamilies || isFetchingMembers || isFetchingHealth) return <MemberDetailSkeleton />;
    if (!member) return null;

    const age = member.dateOfBirth ? new Date().getFullYear() - new Date(member.dateOfBirth).getFullYear() : "N/A";
    const dobFormatted = member.dateOfBirth ? new Date(member.dateOfBirth).toLocaleDateString('vi-VN') : "Chưa cập nhật";

    return (
        <SafeAreaView className="flex-1 bg-[#F9F6FC]" edges={["top"]}>
            <View className="flex-row items-center justify-between px-5 pt-3 pb-4">
                <Pressable onPress={() => router.back()} className="w-12 h-12 bg-white border-2 border-black rounded-2xl items-center justify-center active:opacity-80 shadow-sm"><ArrowLeft size={22} color="#000" strokeWidth={2.5} /></Pressable>
                <Text className="text-xl text-black font-space-bold">Hồ sơ chi tiết</Text>
                <View className="w-12 h-12" />
            </View>

            <ScrollView className="flex-1 px-5" contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
                {/* MEMBER HEADER */}
                <View className="items-center mb-6 mt-2">
                    <View className="w-24 h-24 rounded-[32px] border-4 border-black overflow-hidden mb-4 bg-[#A3E6A1] items-center justify-center shadow-sm">
                        {member.avatarUrl ? <Image source={{ uri: member.avatarUrl }} className="w-full h-full" resizeMode="cover" /> : <Text className="text-3xl font-space-bold uppercase text-black">{member.fullName.charAt(0)}</Text>}
                    </View>
                    <Text className="text-2xl text-black font-space-bold text-center">{member.fullName}</Text>
                    <Text className="text-sm text-gray-500 font-space-medium mt-1">{member.role === 'Owner' ? 'Chủ gia đình' : 'Thành viên'} • {age} tuổi</Text>
                </View>

                {/* PERSONAL INFO */}
                <View className="bg-white border-2 border-black rounded-[24px] p-5 mb-6 shadow-sm">
                    <Text className="text-lg text-black font-space-bold mb-4">Thông tin cá nhân</Text>
                    <View className="flex-row justify-between mb-3 border-b-2 border-black/5 pb-3"><Text className="text-sm text-gray-500 font-space-medium">Họ và Tên</Text><Text className="text-sm text-black font-space-bold">{member.fullName}</Text></View>
                    <View className="flex-row justify-between mb-3 border-b-2 border-black/5 pb-3"><Text className="text-sm text-gray-500 font-space-medium">Ngày sinh</Text><Text className="text-sm text-black font-space-bold">{dobFormatted}</Text></View>
                    <View className="flex-row justify-between"><Text className="text-sm text-gray-500 font-space-medium">Giới tính</Text><Text className="text-sm text-black font-space-bold">{member.gender === 'Male' ? 'Nam' : member.gender === 'Female' ? 'Nữ' : 'Khác'}</Text></View>
                </View>

                {/* HEALTH PROFILE */}
                <View className="bg-[#FFF3E0] border-2 border-black rounded-[24px] p-5 mb-6 shadow-sm">
                    <View className="flex-row items-center justify-between mb-4">
                        <View className="flex-row items-center gap-x-2"><FileText size={20} color="#000" strokeWidth={2.5} /><Text className="text-lg text-black font-space-bold">Hồ sơ sức khỏe</Text></View>
                    </View>
                    {healthProfile ? (
                        <View className="bg-white/50 rounded-2xl p-4 border border-black/10">
                            <View className="flex-row justify-between mb-2"><Text className="text-gray-600 font-space-medium">Chiều cao / Cân nặng</Text><Text className="text-black font-space-bold">{healthProfile.height}cm / {healthProfile.weight}kg</Text></View>
                            <View className="flex-row justify-between"><Text className="text-gray-600 font-space-medium">BMI / Nhóm máu</Text><Text className="text-black font-space-bold">{healthProfile.bmi?.toFixed(1) ?? "--"} / <Text className="text-red-500">{healthProfile.bloodType}</Text></Text></View>
                        </View>
                    ) : <Text className="text-sm text-gray-600 font-space-medium leading-5">Chưa có dữ liệu chiều cao, cân nặng.</Text>}
                </View>

                {/* HEALTH CONDITIONS */}
                <View className="bg-[#FFE4E1] border-2 border-black rounded-[24px] p-5 mb-6 shadow-sm">
                    <View className="flex-row items-center justify-between mb-4">
                        <View className="flex-row items-center gap-x-2"><HeartPulse size={20} color="#000" strokeWidth={2.5} /><Text className="text-lg text-black font-space-bold">Tình trạng bệnh lý</Text></View>
                    </View>
                    {!healthProfile ? <Text className="text-sm text-red-500 font-space-bold leading-5">Chưa có dữ liệu.</Text> : healthProfile.conditions?.length > 0 ? (
                        <View className="gap-3">{healthProfile.conditions.map((hc) => (
                            <View key={hc.conditionId} className="bg-white/60 rounded-2xl p-4 border border-black/10 flex-row justify-between items-center shadow-sm">
                                <View className="flex-1 mr-2"><Text className="text-black font-space-bold">{hc.conditionName}</Text><Text className="text-gray-600 font-space-medium text-xs mt-1" numberOfLines={1}>{hc.description}</Text></View>
                            </View>
                        ))}</View>
                    ) : <Text className="text-sm text-gray-600 font-space-medium leading-5">Chưa ghi nhận bệnh lý nền nào.</Text>}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
