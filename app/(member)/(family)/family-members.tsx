import { useGetFamilyById, useGetFamilyMembers } from "@/hooks/useFamily";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSetAtom } from "jotai";
import {
  ArrowLeft,
  Eye,
  MoreHorizontal,
  Shield,
} from "lucide-react-native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import FamilyDropdown from "@/components/dropdown/FamilyDropdown";
import { showDropdownAtom } from "@/stores/dropdownStore";

const MemberListItem = ({ member, handleOpenMenu }: any) => {
  return (
    <View className="bg-white border-2 border-black rounded-[24px] overflow-hidden shadow-sm">
      <View className="p-4 flex-row items-center gap-x-4">
        <View className="w-14 h-14 rounded-2xl border-2 border-black overflow-hidden items-center justify-center bg-[#D9AEF6]">
          {member.avatarUrl ? (
            <Image source={{ uri: member.avatarUrl }} className="w-full h-full" resizeMode="cover" />
          ) : (
            <Text className="text-xl font-space-bold uppercase">{member.fullName.charAt(0)}</Text>
          )}
        </View>

        <View className="flex-1">
          <View className="flex-row items-center gap-x-1.5">
            <Text className="text-[16px] text-black font-space-bold" numberOfLines={1}>{member.fullName}</Text>
            {member.role === "Owner" && <Shield size={14} color="#FFD700" fill="#FFD700" />}
          </View>
          <Text className="text-sm text-gray-400 font-space-medium mt-0.5">
            {member.role === "Owner" ? "Quản lý" : "Thành viên"}
          </Text>
        </View>

        <Pressable
          onPress={(e) => handleOpenMenu(e, member.memberId, Boolean(member.userId))}
          className="w-10 h-10 bg-gray-100 border-2 border-black rounded-xl items-center justify-center active:bg-gray-200"
        >
          <MoreHorizontal size={20} color="#000" strokeWidth={2.5} />
        </Pressable>
      </View>
    </View>
  );
};

export default function MemberFamilyMembersScreen() {
  const router = useRouter();
  const { familyId } = useLocalSearchParams<{ familyId: string }>();
  const showDropdown = useSetAtom(showDropdownAtom);

  // Fetch dữ liệu
  const { data: family, isLoading: isLoadingFamily } =
    useGetFamilyById(familyId);
  const { data: members, isLoading: isLoadingMembers } =
    useGetFamilyMembers(familyId);

  const handleOpenMenu = (event: any, memberId: string, hasUserId: boolean) => {
    event.currentTarget.measure(
      (
        x: number,
        y: number,
        width: number,
        height: number,
        pageX: number,
        pageY: number
      ) => {
        showDropdown({
          anchorPosition: { top: pageY + height + 5, right: 25 },
          items: [
            {
              label: "Hồ sơ sức khoẻ",
              icon: Eye as any,
              color: "#D9AEF6",
              onPress: () =>
                router.push({
                  pathname: "/(member)/(family)/member",
                  params: { id: memberId },
                } as any),
            },
          ],
        });
      }
    );
  };

  if (isLoadingFamily || isLoadingMembers) {
    return (
      <SafeAreaView className="flex-1 bg-background justify-center items-center">
        <ActivityIndicator size="large" color="#000" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#F9F6FC]" edges={["top"]}>
      <View className="flex-row items-center justify-between px-5 pt-3 pb-4">
        <Pressable
          onPress={() => router.back()}
          className="w-12 h-12 bg-white border-2 border-black rounded-2xl items-center justify-center active:opacity-80 shadow-sm"
        >
          <ArrowLeft size={22} color="#000" strokeWidth={2.5} />
        </Pressable>

        <View className="items-center flex-1 mx-2">
          <Text
            className="text-xl text-black font-space-bold text-center"
            numberOfLines={1}
          >
            {family?.familyName || "Gia đình"}
          </Text>
          <Text className="text-[12px] text-gray-400 font-space-medium uppercase tracking-wider">
            {members?.length || 0} thành viên
          </Text>
        </View>
        
        {/* Placeholder for header spacing so title is centered */}
        <View className="w-12 h-12" />
      </View>

      <ScrollView
        className="flex-1 px-5 pt-4"
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="gap-4">
          {members?.map((member) => (
            <MemberListItem
              key={member.memberId}
              member={member}
              handleOpenMenu={handleOpenMenu}
            />
          ))}
        </View>
      </ScrollView>

      {/* Nhúng Modal Dropdown vào cuối màn hình */}
      <FamilyDropdown />
    </SafeAreaView>
  );
}
