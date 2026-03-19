import { useGetFamilyMembers } from "@/hooks/useFamily";
import { useGetFamilies } from "@/hooks/useHome";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Pressable, RefreshControl, ScrollView, Share, Text, View } from "react-native";

export default function ViewFamilyScreen() {
    // 1. Lấy thông tin gia đình
    const { data: families, refetch: refetchFamilies, isFetching: isFetchingFamilies } = useGetFamilies();
    const family = families?.[0];

    // 2. Lấy danh sách thành viên dựa trên familyId
    const { data: members, isLoading: isMembersLoading, refetch: refetchMembers } = useGetFamilyMembers(family?.familyId);

    const onRefresh = () => {
        refetchFamilies();
        if (family?.familyId) refetchMembers();
    };

    const onShare = async () => {
        if (!family?.joinCode) return;
        try {
            await Share.share({
                message: `Tham gia gia đình MediMate "${family.familyName}"! Mã code: ${family.joinCode}`,
            });
        } catch (error) { }
    };

    return (
        <View className="flex-1 bg-[#F8FAFA]">
            {/* Header Section */}
            <View className="px-6 pt-16 pb-6 bg-white flex-row items-center justify-between border-b border-gray-100 shadow-sm">
                <Pressable onPress={() => router.back()} className="w-10 h-10 bg-gray-50 rounded-full items-center justify-center">
                    <Feather name="arrow-left" size={20} color="black" />
                </Pressable>
                <Text className="text-lg font-bold text-[#1F2937]">{family?.familyName || "Gia đình"}</Text>
                <Pressable className="w-10 h-10 bg-gray-50 rounded-full items-center justify-center">
                    <Feather name="settings" size={20} color="#9CA3AF" />
                </Pressable>
            </View>

            <ScrollView
                className="flex-1"
                contentContainerStyle={{ padding: 24 }}
                refreshControl={<RefreshControl refreshing={isFetchingFamilies} onRefresh={onRefresh} tintColor="#059669" />}
            >
                {/* Join Code Card (Màu Mint) */}
                <View className="bg-[#E1F8ED] rounded-[32px] p-8 mb-8 border border-[#A7F3D0] items-center">
                    <Text className="text-[#059669] font-bold text-xs tracking-widest uppercase mb-3">Mã mời thành viên</Text>
                    <Text className="text-5xl font-black text-[#064E3B] tracking-[6px] mb-6">
                        {family?.joinCode || "------"}
                    </Text>
                    <Pressable
                        onPress={onShare}
                        className="bg-white px-8 py-3 rounded-full flex-row items-center shadow-sm active:opacity-80"
                    >
                        <Feather name="copy" size={16} color="#059669" />
                        <Text className="text-[#059669] font-bold ml-2">Sao chép & Gửi mã</Text>
                    </Pressable>
                </View>

                {/* Member List Header */}
                <View className="flex-row justify-between items-center mb-6">
                    <View>
                        <Text className="text-lg font-bold text-[#1F2937]">Thành viên</Text>
                        {/* <Text className="text-gray-400 text-xs">Hiện có {members. || 0} người</Text> */}
                    </View>
                    <MaterialCommunityIcons name="account-group" size={24} color="#9CA3AF" />
                </View>



                {/* Bottom Tip */}
                <View className="mt-10 items-center">
                    <Text className="text-gray-400 text-xs italic">Chỉ chủ hộ mới có quyền xóa thành viên</Text>
                </View>

            </ScrollView>
        </View>
    );
}