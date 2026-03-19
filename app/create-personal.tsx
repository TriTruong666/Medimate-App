// app/families/create-personal.tsx
import { useCreatePersonalFamily } from "@/hooks/useFamily";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";

export default function CreatePersonalScreen() {
    const { mutate: createPersonal, isPending } = useCreatePersonalFamily();

    const handleCreate = () => {
        createPersonal();
    };

    return (
        <View className="flex-1 bg-[#F8FAFA] px-6 pt-16">
            {/* Nút Back */}
            <Pressable
                onPress={() => router.back()}
                className="w-10 h-10 bg-white rounded-full items-center justify-center shadow-sm mb-8 border border-gray-100"
            >
                <Feather name="arrow-left" size={20} color="black" />
            </Pressable>

            {/* Title */}
            <View className="mb-10">
                <Text className="text-3xl font-extrabold text-[#1F2937] mb-4">
                    Hồ sơ cá nhân
                </Text>
                <Text className="text-gray-500 text-base leading-6">
                    Hệ thống sẽ tự động khởi tạo không gian quản lý sức khỏe riêng tư cho bạn. Bạn có thể bắt đầu quét đơn thuốc và lên lịch nhắc nhở ngay sau khi tạo.
                </Text>
            </View>

            {/* Illustration Card */}
            <View className="bg-[#E5F0FF] rounded-[40px] p-10 items-center justify-center mb-12 border border-blue-100">
                <View className="w-20 h-20 bg-white rounded-full items-center justify-center shadow-sm">
                    <Feather name="shield" size={40} color="#3B82F6" />
                </View>
                <Text className="text-[#3B82F6] font-bold mt-6 text-center">
                    Riêng tư • Bảo mật • Cá nhân
                </Text>
            </View>

            {/* Nút Xác nhận tạo */}
            <Pressable
                onPress={handleCreate}
                disabled={isPending}
                className={`w-full bg-[#3B82F6] rounded-full py-5 flex-row items-center justify-center shadow-md ${isPending ? 'opacity-70' : 'active:opacity-90'}`}
            >
                {isPending ? (
                    <ActivityIndicator color="white" />
                ) : (
                    <>
                        <Text className="text-white font-bold text-lg mr-2">Bắt đầu ngay</Text>
                        <Feather name="check-circle" size={20} color="white" />
                    </>
                )}
            </Pressable>

            <Text className="text-gray-400 text-center mt-6 text-xs px-10">
                Bằng cách nhấn bắt đầu, bạn đồng ý với các điều khoản dịch vụ của MediMate.
            </Text>
        </View>
    );
}