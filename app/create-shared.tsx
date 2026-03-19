// app/families/create-shared.tsx
import { useCreateSharedFamily } from "@/hooks/useFamily";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, Text, TextInput, View } from "react-native";

export default function CreateSharedScreen() {
    const [familyName, setFamilyName] = useState("");
    const { mutate: createShared, isPending } = useCreateSharedFamily();

    const handleCreate = () => {
        if (!familyName.trim()) return;
        createShared(familyName.trim());
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            className="flex-1 bg-[#F8FAFA]"
        >
            <View className="flex-1 px-6 pt-16">
                {/* Nút Back */}
                <Pressable
                    onPress={() => router.back()}
                    className="w-10 h-10 bg-white rounded-full items-center justify-center shadow-sm mb-8 border border-gray-100"
                >
                    <Feather name="arrow-left" size={20} color="black" />
                </Pressable>

                {/* Title */}
                <View className="mb-8">
                    <Text className="text-3xl font-extrabold text-[#1F2937] mb-4">
                        Tạo nhóm Gia đình
                    </Text>
                    <Text className="text-gray-500 text-base leading-6">
                        Đặt một cái tên thật ý nghĩa cho nhóm để bắt đầu kết nối các thành viên nhé.
                    </Text>
                </View>

                {/* Input Card (Màu Vàng Pastel) */}
                <View className="bg-[#FEF3C7] rounded-[32px] p-6 mb-10 border border-[#FDE68A]">
                    <View className="flex-row justify-between items-center mb-2">
                        <Text className="text-[#D97706] font-bold text-xs tracking-widest uppercase">
                            Tên gia đình
                        </Text>
                        <MaterialCommunityIcons name="home-heart" size={20} color="#D97706" />
                    </View>
                    <TextInput
                        className="text-xl text-[#1F2937] font-bold py-2"
                        placeholder="Gia đình Hạnh Phúc..."
                        placeholderTextColor="#FCD34D"
                        value={familyName}
                        onChangeText={setFamilyName}
                        autoFocus
                    />
                </View>

                {/* Nút Tạo */}
                <Pressable
                    onPress={handleCreate}
                    disabled={isPending || !familyName.trim()}
                    className={`w-full bg-[#D97706] rounded-full py-5 flex-row items-center justify-center shadow-lg ${(isPending || !familyName.trim()) ? 'opacity-70' : 'active:opacity-90'
                        }`}
                >
                    {isPending ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <>
                            <Text className="text-white font-bold text-lg mr-2">Tạo nhóm ngay</Text>
                            <Feather name="arrow-right" size={20} color="white" />
                        </>
                    )}
                </Pressable>

                {/* Tips */}
                <View className="mt-8 flex-row items-start px-4">
                    <Feather name="info" size={16} color="#9CA3AF" />
                    <Text className="text-gray-400 text-xs ml-2 leading-5">
                        Sau khi tạo, bạn sẽ nhận được một mã tham gia (Join Code) để gửi cho người thân của mình.
                    </Text>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
}