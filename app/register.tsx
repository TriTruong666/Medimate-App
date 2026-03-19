// app/register.tsx
import { useRegisterUser } from "@/hooks/useAuth";
import { Feather } from "@expo/vector-icons";
import { Link, router } from "expo-router";
import React, { useState } from "react";
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from "react-native";

export default function RegisterScreen() {
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const { mutate: register, isPending } = useRegisterUser();

    const handleRegister = () => {
        if (!fullName || !email || !phone || !password) return; // Nên thêm toast báo lỗi thiếu thông tin

        register({
            fullName: fullName.trim(),
            email: email.trim(),
            phoneNumber: phone.trim(),
            password: password,
        });
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            className="flex-1 bg-[#F8FAFA]"
        >
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
                <View className="flex-1 px-6 pt-12 pb-8">

                    {/* Header */}
                    <View className="flex-row items-center justify-between mb-8">
                        <Pressable
                            onPress={() => router.back()}
                            className="w-10 h-10 bg-white rounded-full items-center justify-center shadow-sm border border-gray-100"
                        >
                            <Feather name="arrow-left" size={20} color="black" />
                        </Pressable>
                        <Text className="text-gray-400 font-bold text-xs tracking-widest uppercase">
                            BƯỚC 1/3
                        </Text>
                    </View>

                    {/* Title */}
                    <View className="mb-8 relative">
                        <Text className="text-4xl font-extrabold text-[#1F2937] leading-tight">
                            Xin chào,{"\n"}tạo hồ sơ mới.
                        </Text>
                        <Text className="text-gray-500 mt-3 text-sm leading-6 pr-10">
                            Để chúng tôi có thể nhắc nhở uống thuốc đúng giờ.
                        </Text>
                        <View className="absolute top-0 right-0 w-16 h-16 bg-[#E1F8ED] rounded-full opacity-60" />
                    </View>

                    {/* Form Inputs */}
                    <View className="space-y-4 mb-8">

                        {/* Họ và Tên (Màu Vàng) */}
                        <View className="bg-[#FEF9C3] rounded-3xl p-5">
                            <View className="flex-row justify-between items-center mb-1">
                                <Text className="text-[#CA8A04] font-bold text-xs tracking-widest uppercase">Họ và tên</Text>
                                <Feather name="user" size={16} color="#CA8A04" />
                            </View>
                            <TextInput
                                className="text-base text-[#1F2937] font-medium py-1"
                                placeholder="Nguyễn Văn A"
                                placeholderTextColor="#FDE047"
                                value={fullName}
                                onChangeText={setFullName}
                            />
                        </View>

                        {/* Email (Màu Xanh dương) */}
                        <View className="bg-[#EBF3FF] rounded-3xl p-5">
                            <View className="flex-row justify-between items-center mb-1">
                                <Text className="text-[#3B82F6] font-bold text-xs tracking-widest uppercase">Email</Text>
                                <Feather name="mail" size={16} color="#3B82F6" />
                            </View>
                            <TextInput
                                className="text-base text-[#1F2937] font-medium py-1"
                                placeholder="name@email.com"
                                placeholderTextColor="#93C5FD"
                                keyboardType="email-address"
                                autoCapitalize="none"
                                value={email}
                                onChangeText={setEmail}
                            />
                        </View>

                        {/* Số điện thoại (Màu Xanh lá) */}
                        <View className="bg-[#E1F8ED] rounded-3xl p-5">
                            <View className="flex-row justify-between items-center mb-1">
                                <Text className="text-[#059669] font-bold text-xs tracking-widest uppercase">SĐT</Text>
                                <Feather name="phone" size={16} color="#059669" />
                            </View>
                            <TextInput
                                className="text-base text-[#1F2937] font-medium py-1"
                                placeholder="09xx..."
                                placeholderTextColor="#6EE7B7"
                                keyboardType="phone-pad"
                                value={phone}
                                onChangeText={setPhone}
                            />
                        </View>

                        {/* Mật khẩu (Màu Hồng) */}
                        <View className="bg-[#FCE7F3] rounded-3xl p-5">
                            <View className="flex-row justify-between items-center mb-1">
                                <Text className="text-[#E11D48] font-bold text-xs tracking-widest uppercase">Mật khẩu</Text>
                                <Pressable onPress={() => setShowPassword(!showPassword)}>
                                    <Feather name={showPassword ? "eye" : "eye-off"} size={16} color="#E11D48" />
                                </Pressable>
                            </View>
                            <TextInput
                                className="text-base text-[#1F2937] font-medium py-1"
                                placeholder="••••••••"
                                placeholderTextColor="#F9A8D4"
                                secureTextEntry={!showPassword}
                                value={password}
                                onChangeText={setPassword}
                            />
                        </View>

                    </View>

                    {/* Nút Tạo tài khoản */}
                    <Pressable
                        onPress={handleRegister}
                        disabled={isPending}
                        className={`bg-[#86EFAC] rounded-full py-4 flex-row items-center justify-center space-x-2 ${isPending ? 'opacity-70' : 'active:opacity-80'}`}
                    >
                        {isPending ? (
                            <ActivityIndicator color="#065F46" />
                        ) : (
                            <>
                                <Text className="text-[#065F46] font-bold text-lg mr-2">Tạo tài khoản</Text>
                                <Feather name="arrow-right" size={20} color="#065F46" />
                            </>
                        )}
                    </Pressable>

                    {/* Footer */}
                    <View className="mt-8 items-center">
                        <View className="flex-row mb-4">
                            <Text className="text-gray-500">Đã có tài khoản? </Text>
                            <Link href="/login" asChild>
                                <Pressable>
                                    <Text className="text-[#111827] font-extrabold underline">Đăng nhập ngay</Text>
                                </Pressable>
                            </Link>
                        </View>
                        <View className="flex-row items-center space-x-4">
                            <Text className="text-gray-400 text-xs">Điều khoản</Text>
                            <View className="w-1 h-1 bg-gray-300 rounded-full mx-3" />
                            <Text className="text-gray-400 text-xs">Bảo mật</Text>
                        </View>
                    </View>

                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}