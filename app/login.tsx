// app/login.tsx
import { useLoginUser } from "@/hooks/useAuth";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import { ActivityIndicator, KeyboardAvoidingView, Pressable, Text, TextInput, View } from "react-native";

export default function LoginScreen() {
    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    // Lấy hàm mutate từ Hook
    const { mutate: login, isPending } = useLoginUser();

    const handleLogin = () => {
        if (!identifier || !password) {
            return; // Có thể hiển thị Toast/Alert yêu cầu nhập đủ thông tin
        }
        console.log("URL API ĐANG GỌI:", process.env.EXPO_PUBLIC_NET_API_URL);
        // Gọi API
        login({
            identifier: identifier.trim(),
            password: password,
            fcmToken: "dummy_device_token", // Thay bằng token thật của thiết bị nếu có làm Push Notif
        });
    };

    return (
        <KeyboardAvoidingView behavior="padding" className="flex-1 bg-[#F8FAFA]">
            <View className="flex-1 px-6 pt-12 pb-8">

                {/* Header */}
                <View className="flex-row items-center mb-10">
                    <Pressable
                        onPress={() => router.back()}
                        className="w-10 h-10 bg-white rounded-full items-center justify-center shadow-sm"
                    >
                        <Feather name="arrow-left" size={20} color="black" />
                    </Pressable>
                    <Text className="flex-1 text-center text-gray-500 font-semibold mr-10 uppercase tracking-widest text-xs">
                        Đăng nhập
                    </Text>
                </View>

                {/* Title */}
                <View className="mb-10">
                    <Text className="text-4xl font-extrabold text-[#1F2937] leading-tight">
                        Chào mừng,{"\n"}trở lại!
                    </Text>
                    <Text className="text-gray-500 mt-3 text-base">
                        Để chúng tôi có thể nhắc nhở uống thuốc đúng giờ.
                    </Text>
                </View>

                {/* Form Inputs */}
                <View className="space-y-4 mb-8">

                    {/* Email Input */}
                    <View className="bg-[#E5F0FF] rounded-3xl p-5">
                        <View className="flex-row justify-between items-center mb-1">
                            <Text className="text-[#3B82F6] font-bold text-xs tracking-widest uppercase">
                                Email
                            </Text>
                            <Feather name="mail" size={16} color="#3B82F6" />
                        </View>
                        <TextInput
                            className="text-base text-gray-800 font-medium py-1"
                            placeholder="name@email.com"
                            placeholderTextColor="#93C5FD"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            value={identifier}
                            onChangeText={setIdentifier}
                        />
                    </View>

                    {/* Password Input */}
                    <View className="bg-[#FFE5F1] rounded-3xl p-5">
                        <View className="flex-row justify-between items-center mb-1">
                            <Text className="text-[#E11D48] font-bold text-xs tracking-widest uppercase">
                                Mật khẩu
                            </Text>
                            <Pressable onPress={() => setShowPassword(!showPassword)}>
                                <Feather name={showPassword ? "eye" : "eye-off"} size={16} color="#E11D48" />
                            </Pressable>
                        </View>
                        <TextInput
                            className="text-base text-gray-800 font-medium py-1"
                            placeholder="••••••••"
                            placeholderTextColor="#FDA4AF"
                            secureTextEntry={!showPassword}
                            value={password}
                            onChangeText={setPassword}
                        />
                    </View>

                </View>

                {/* Login Button */}
                <Pressable
                    onPress={handleLogin}
                    disabled={isPending}
                    className={`bg-[#86EFAC] rounded-full py-5 items-center flex-row justify-center space-x-2 ${isPending ? 'opacity-70' : 'active:opacity-80'}`}
                >
                    {isPending ? (
                        <ActivityIndicator color="#065F46" />
                    ) : (
                        <>
                            <Text className="text-[#065F46] font-bold text-lg">Đăng nhập</Text>
                            <Feather name="log-in" size={20} color="#065F46" />
                        </>
                    )}
                </Pressable>

                {/* Footer */}
                <View className="mt-auto items-center">
                    <View className="flex-row mb-4">
                        <Text className="text-gray-500">Chưa có tài khoản? </Text>
                        <Pressable onPress={() => router.push("/register")}>
                            <Text className="text-[#064E3B] font-bold underline">Đăng ký ngay</Text>
                        </Pressable>
                    </View>
                    <View className="flex-row space-x-4">
                        <Text className="text-gray-400 text-xs">Điều khoản</Text>
                        <Text className="text-gray-300 text-xs">•</Text>
                        <Text className="text-gray-400 text-xs">Bảo mật</Text>
                    </View>
                </View>

            </View>
        </KeyboardAvoidingView>
    );
}