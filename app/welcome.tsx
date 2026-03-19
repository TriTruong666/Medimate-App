import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Pressable, Text, View } from "react-native";

export default function WelcomeScreen() {
    return (
        <View className="flex-1 bg-[#F8FAFA] px-6 py-12">

            {/* Spacer để đẩy nội dung xuống giữa */}
            <View className="flex-1 justify-center items-center">

                {/* Top Icon */}
                <View className="w-16 h-16 bg-[#E5F0FF] rounded-full items-center justify-center mb-6">
                    <Feather name="plus" size={32} color="#3B82F6" />
                </View>

                {/* Title & Subtitle */}
                <Text className="text-3xl font-extrabold text-[#1F2937] mb-3 text-center">
                    Chào mừng bạn
                </Text>
                <Text className="text-gray-500 text-center mb-12 px-2 leading-6">
                    Vui lòng chọn phương thức đăng nhập để tiếp tục theo dõi sức khỏe.
                </Text>

                {/* Nút Đăng nhập bằng Tài khoản */}
                <Pressable
                    onPress={() => router.push("/login")}
                    className="w-full bg-white rounded-3xl p-5 flex-row items-center shadow-sm mb-4 border border-gray-50 active:opacity-70"
                >
                    <View className="w-12 h-12 bg-[#E5F0FF] rounded-full items-center justify-center mr-4">
                        <Feather name="key" size={20} color="#3B82F6" />
                    </View>
                    <View className="flex-1">
                        <Text className="text-[#1F2937] font-bold text-base mb-1">Đăng nhập Tài khoản</Text>
                        <Text className="text-gray-400 text-xs">Sử dụng email và mật khẩu</Text>
                    </View>
                    <Feather name="chevron-right" size={20} color="#9CA3AF" />
                </Pressable>

                {/* Nút Đăng nhập bằng QR Code */}
                <Pressable
                    onPress={() => router.push("/scan-qr")}
                    className="w-full bg-white rounded-3xl p-5 flex-row items-center shadow-sm border border-gray-50 active:opacity-70"
                >
                    <View className="w-12 h-12 bg-[#E1F8ED] rounded-full items-center justify-center mr-4">
                        <MaterialCommunityIcons name="qrcode-scan" size={20} color="#059669" />
                    </View>
                    <View className="flex-1">
                        <Text className="text-[#1F2937] font-bold text-base mb-1">Quét mã QR Code</Text>
                        <Text className="text-gray-400 text-xs">Đăng nhập nhanh không cần mật khẩu</Text>
                    </View>
                    <Feather name="chevron-right" size={20} color="#9CA3AF" />
                </Pressable>
            </View>

            {/* Footer */}
            <View className="mt-auto items-center pb-4">
                <View className="flex-row mb-6">
                    <Text className="text-gray-500">Chưa có tài khoản? </Text>
                    <Pressable onPress={() => router.push("/register")}>
                        <Text className="text-[#3B82F6] font-bold underline">Đăng ký ngay</Text>
                    </Pressable>
                </View>

                <Pressable className="flex-row items-center bg-white px-5 py-3 rounded-full shadow-sm border border-gray-50 active:opacity-70">
                    <Feather name="help-circle" size={16} color="#9CA3AF" />
                    <Text className="text-gray-500 font-medium ml-2 text-sm">Cần trợ giúp đăng nhập?</Text>
                </Pressable>
            </View>

        </View>
    );
}