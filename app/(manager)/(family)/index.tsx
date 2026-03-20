import { useCreatePersonalFamily, useDeleteFamily, useGetFamilies } from "@/hooks/useFamily";
// Giả định bạn có hook useCreateSharedFamily (hoặc tên tương tự) trong useFamily.ts
// Nhớ import đúng tên hook tạo nhóm gia đình mà bạn đã viết nhé!
import { useCreateSharedFamily } from "@/hooks/useFamily";
import { useRouter } from "expo-router";
import { ChevronRight, Edit3, Plus, Trash2, User, Users, X } from "lucide-react-native";
import React, { useState } from "react";
import { ActivityIndicator, Alert, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ManagerHeader from "../../../components/ManagerHeader";

export default function FamilyListScreen() {
    const router = useRouter();

    // 1. APIs
    const { data: families, isLoading } = useGetFamilies();
    const { mutate: deleteFamily } = useDeleteFamily();
    const { mutate: createPersonal, isPending: isCreatingPersonal } = useCreatePersonalFamily();

    // Thêm Hook tạo gia đình dùng chung (Shared Family)
    const { mutate: createShared, isPending: isCreatingShared } = useCreateSharedFamily();

    // 2. States cho Popup
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [newFamilyName, setNewFamilyName] = useState("");

    // 3. Logic kiểm tra hồ sơ cá nhân
    const hasPersonalFamily = families?.some(family => family.type === "Personal");

    // 4. Logic Xóa Gia đình
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

    // 5. Logic Tạo Gia đình
    const handleCreateFamily = () => {
        if (!newFamilyName.trim()) return;

        // Truyền thẳng chuỗi string vào thay vì truyền object {}
        createShared(
            newFamilyName.trim(),
            {
                onSuccess: () => {
                    setNewFamilyName("");
                    setIsModalVisible(false);
                }
            }
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

                {/* 1️⃣ TẠO HỒ SƠ CÁ NHÂN */}
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
                                onPress={() => router.push({ pathname: "/(manager)/(family)/family-members", params: { familyId: family.familyId } } as any)}
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
                                        {/* SỬA GIA ĐÌNH (Chỉ Shared) */}
                                        {family.type === 'Shared' && (
                                            <Pressable
                                                onPress={(e) => { e.stopPropagation(); router.push({ pathname: "/(manager)/(family)/edit", params: { id: family.familyId } } as any); }}
                                                className="w-10 h-10 bg-gray-100 border-2 border-black rounded-xl items-center justify-center active:bg-gray-200"
                                            >
                                                <Edit3 size={18} color="#000" />
                                            </Pressable>
                                        )}

                                        {/* XÓA GIA ĐÌNH (Chỉ Shared) */}
                                        {family.type === 'Shared' && (
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

                {/* 3️⃣ TẠO GIA ĐÌNH MỚI (MỞ POPUP) */}
                <Pressable
                    onPress={() => setIsModalVisible(true)}
                    className="bg-[#FFD700] border-2 border-black rounded-[32px] p-5 flex-row items-center justify-center shadow-md active:opacity-90 mt-2 mb-10"
                >
                    <Plus size={24} color="#000" strokeWidth={2.5} />
                    <Text className="text-lg text-black font-space-bold ml-2">TẠO GIA ĐÌNH MỚI</Text>
                </Pressable>
            </ScrollView>

            {/* 🌟 MODAL (POPUP) TẠO GIA ĐÌNH MỚI 🌟 */}
            <Modal
                visible={isModalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setIsModalVisible(false)}
            >
                {/* Vùng nền đen mờ, bấm vào đây cũng đóng modal được */}
                <Pressable
                    className="flex-1 bg-black/60 justify-center items-center px-6"
                    onPress={() => setIsModalVisible(false)}
                >
                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                        className="w-full"
                    >
                        {/* Ngăn Pressable cha nhận sự kiện khi bấm vào trong form */}
                        <Pressable
                            className="bg-white border-2 border-black rounded-[32px] p-6 shadow-lg w-full"
                            onPress={(e) => e.stopPropagation()}
                        >
                            {/* Nút đóng góc phải */}
                            <Pressable
                                onPress={() => setIsModalVisible(false)}
                                className="absolute top-4 right-4 w-8 h-8 bg-gray-100 rounded-full items-center justify-center border border-black/10 active:bg-gray-200 z-10"
                            >
                                <X size={18} color="#000" />
                            </Pressable>

                            <View className="items-center mb-6 mt-2">
                                <View className="w-16 h-16 bg-[#FFD700] border-2 border-black rounded-2xl items-center justify-center mb-4">
                                    <Users size={32} color="#000" />
                                </View>
                                <Text className="text-2xl text-black font-space-bold text-center">Tạo nhóm gia đình</Text>
                                <Text className="text-sm text-gray-500 font-space-medium text-center mt-2 leading-5">
                                    Tạo một không gian chung để mời người thân cùng quản lý sức khỏe.
                                </Text>
                            </View>

                            <View className="mb-6">
                                <Text className="text-sm font-space-bold text-black mb-2 ml-2 uppercase tracking-wider">Tên gia đình</Text>
                                <View className="px-5 py-4 rounded-[24px] border-2 border-black bg-gray-50">
                                    <TextInput
                                        value={newFamilyName}
                                        onChangeText={setNewFamilyName}
                                        placeholder="VD: Gia đình nhà Cam..."
                                        className="text-lg text-black font-space-bold"
                                        autoFocus={true} // Tự động mở bàn phím
                                    />
                                </View>
                            </View>

                            {/* Các nút hành động trong Modal */}
                            <View className="flex-row gap-3">
                                <Pressable
                                    onPress={() => setIsModalVisible(false)}
                                    className="flex-1 py-4 rounded-[24px] border-2 border-black bg-white items-center justify-center active:bg-gray-100"
                                >
                                    <Text className="text-base font-space-bold text-black">Hủy</Text>
                                </Pressable>

                                <Pressable
                                    onPress={handleCreateFamily}
                                    disabled={isCreatingShared || !newFamilyName.trim()}
                                    className={`flex-1 py-4 rounded-[24px] border-2 border-black bg-black items-center justify-center ${isCreatingShared || !newFamilyName.trim() ? "opacity-70" : "active:opacity-80"}`}
                                >
                                    {isCreatingShared ? (
                                        <ActivityIndicator color="#FFF" />
                                    ) : (
                                        <Text className="text-base font-space-bold text-white">Tạo nhóm</Text>
                                    )}
                                </Pressable>
                            </View>

                        </Pressable>
                    </KeyboardAvoidingView>
                </Pressable>
            </Modal>

        </SafeAreaView>
    );
}