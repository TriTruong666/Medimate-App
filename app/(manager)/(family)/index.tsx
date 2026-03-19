import { useCreatePersonalFamily, useDeleteFamily, useGetFamilies } from "@/hooks/useFamily";
import { useRouter } from "expo-router";
import { ChevronRight, Edit3, Plus, Trash2, User, Users } from "lucide-react-native";
import React from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ManagerHeader from "../../../components/ManagerHeader";

export default function FamilyListScreen() {
    const router = useRouter();

    // 1. APIs
    const { data: families, isLoading } = useGetFamilies();
    const { mutate: deleteFamily } = useDeleteFamily();
    const { mutate: createPersonal, isPending: isCreatingPersonal } = useCreatePersonalFamily();

    // 2. Logic kiểm tra hồ sơ cá nhân
    const hasPersonalFamily = families?.some(family => family.type === "Personal");

    // 3. Logic Xóa Gia đình
    const handleDelete = (id: string, name: string) => {
        Alert.alert(
            "Xóa gia đình",
            `Bạn có chắc chắn muốn xóa nhóm "${name}"? Mọi dữ liệu sẽ bị mất.`,
            [
                { text: "Hủy", style: "cancel" },
                { text: "Xóa vĩnh viễn", style: "destructive", onPress: () => deleteFamily(id) }
            ]
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
            <ManagerHeader subtitle="Quản lý gia đình" />

            <ScrollView className="flex-1 px-5 pt-4" contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
                <View className="mb-6">
                    <Text className="text-3xl text-black font-space-bold">Gia đình của bạn</Text>
                    <Text className="text-base text-gray-500 mt-2 font-space-regular">
                        Quản lý hồ sơ cá nhân và các nhóm gia đình.
                    </Text>
                </View>

                {/* 1️⃣ TẠO HỒ SƠ CÁ NHÂN (Chỉ hiện khi chưa có) */}
                {!isLoading && !hasPersonalFamily && (
                    <Pressable
                        onPress={() => createPersonal()}
                        disabled={isCreatingPersonal}
                        className="bg-[#A3E6A1] border-2 border-black rounded-[32px] p-5 mb-6 shadow-sm flex-row items-center justify-between active:opacity-80"
                    >
                        <View className="flex-row items-center flex-1">
                            <View className="w-12 h-12 bg-white rounded-2xl border-2 border-black items-center justify-center mr-4">
                                <User size={24} color="#000" strokeWidth={2} />
                            </View>
                            <View className="flex-1">
                                <Text className="text-lg text-black font-space-bold">Tạo hồ sơ cá nhân</Text>
                                <Text className="text-sm text-gray-700 font-space-medium mt-0.5">Không gian quản lý riêng của bạn</Text>
                            </View>
                        </View>
                        {isCreatingPersonal ? <ActivityIndicator color="#000" /> : <Plus size={24} color="#000" strokeWidth={2.5} />}
                    </Pressable>
                )}

                {/* 2️⃣ DANH SÁCH GIA ĐÌNH */}
                {isLoading ? (
                    <ActivityIndicator size="large" color="#000" className="mt-10" />
                ) : (
                    <View className="gap-4 mb-6">
                        {families?.map((family) => (
                            <Pressable
                                key={family.familyId}
                                // 👉 Click vào Card để XEM THÀNH VIÊN
                                onPress={() => router.push({ pathname: "/(manager)/(family)/members", params: { familyId: family.familyId } } as any)}
                                className="bg-white border-2 border-black rounded-[32px] p-5 shadow-sm active:bg-gray-50"
                            >
                                <View className="flex-row items-center justify-between mb-4">
                                    <View className="flex-row items-center flex-1">
                                        <View
                                            className="w-14 h-14 rounded-2xl border-2 border-black items-center justify-center mr-4"
                                            style={{ backgroundColor: family.type === 'Personal' ? '#87CEFA' : '#D9AEF6' }}
                                        >
                                            {family.type === 'Personal' ? <User size={28} color="#000" /> : <Users size={28} color="#000" />}
                                        </View>
                                        <View className="flex-1">
                                            <Text className="text-lg text-black font-space-bold" numberOfLines={1}>{family.familyName}</Text>
                                            <Text className="text-sm text-gray-500 font-space-medium mt-0.5">
                                                {family.memberCount} thành viên
                                            </Text>
                                        </View>
                                    </View>
                                </View>

                                {/* Các nút hành động */}
                                <View className="flex-row items-center justify-between pt-4 border-t-2 border-black/5">
                                    <View className="flex-row gap-2">
                                        {/* 👉 Nút SỬA GIA ĐÌNH */}
                                        <Pressable
                                            onPress={(e) => { e.stopPropagation(); router.push({ pathname: "/(manager)/(family)/edit", params: { id: family.familyId } } as any); }}
                                            className="w-10 h-10 bg-gray-100 border-2 border-black rounded-xl items-center justify-center active:bg-gray-200"
                                        >
                                            <Edit3 size={18} color="#000" />
                                        </Pressable>

                                        {/* Nút XÓA GIA ĐÌNH */}
                                        {family.type !== 'Personal' && (
                                            <Pressable
                                                onPress={(e) => { e.stopPropagation(); handleDelete(family.familyId, family.familyName); }}
                                                className="w-10 h-10 bg-[#FFA07A] border-2 border-black rounded-xl items-center justify-center active:opacity-80"
                                            >
                                                <Trash2 size={18} color="#000" />
                                            </Pressable>
                                        )}
                                    </View>
                                    <View className="flex-row items-center">
                                        <Text className="text-xs font-space-bold uppercase tracking-widest text-black mr-1">Xem</Text>
                                        <ChevronRight size={18} color="#000" strokeWidth={2} />
                                    </View>
                                </View>
                            </Pressable>
                        ))}
                    </View>
                )}

                {/* 3️⃣ TẠO GIA ĐÌNH MỚI */}
                <Pressable
                    // onPress={() => router.push("/(manager)/(family)/create-shared")}
                    className="bg-[#FFD700] border-2 border-black rounded-[32px] p-5 flex-row items-center justify-center shadow-md active:opacity-90 mt-2 mb-10"
                >
                    <Plus size={24} color="#000" strokeWidth={2.5} />
                    <Text className="text-lg text-black font-space-bold ml-2">TẠO GIA ĐÌNH MỚI</Text>
                </Pressable>
            </ScrollView>
        </SafeAreaView>
    );
}