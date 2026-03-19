// app/verify-otp.tsx
import { useVerifyOtp } from "@/hooks/useAuth";
import { Feather, Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, Text, TextInput, View } from "react-native";

export default function VerifyOtpScreen() {
    const { email } = useLocalSearchParams<{ email: string }>();

    // 1. Đổi thành mảng 6 phần tử trống
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [countdown, setCountdown] = useState(30);

    // 2. Thêm Ref cho đủ 6 ô input
    const inputRefs = [
        useRef<TextInput>(null),
        useRef<TextInput>(null),
        useRef<TextInput>(null),
        useRef<TextInput>(null),
        useRef<TextInput>(null),
        useRef<TextInput>(null),
    ];

    const { mutate: verify, isPending } = useVerifyOtp();

    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [countdown]);

    const handleChangeText = (text: string, index: number) => {
        const value = text.length > 1 ? text.slice(-1) : text;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // 3. Đổi điều kiện nhảy ô: Nếu có số và chưa tới ô thứ 6 (index < 5)
        if (value && index < 5) {
            inputRefs[index + 1].current?.focus();
        }
    };

    const handleKeyPress = (e: any, index: number) => {
        if (e.nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
            inputRefs[index - 1].current?.focus();
        }
    };

    const handleVerify = () => {
        const otpCode = otp.join("");
        // 4. Kiểm tra đủ 6 số mới cho gọi API
        if (otpCode.length < 6) return;

        verify({
            email: email || "",
            otp: otpCode
        });
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            className="flex-1 bg-[#F8FAFA]"
        >
            <View className="flex-1 px-6 pt-12 pb-8 items-center">

                <View className="w-full flex-row mb-12">
                    <Pressable
                        onPress={() => router.back()}
                        className="w-10 h-10 bg-white rounded-full items-center justify-center shadow-sm border border-gray-100"
                    >
                        <Feather name="arrow-left" size={20} color="black" />
                    </Pressable>
                </View>

                <View className="w-32 h-32 bg-white rounded-[40px] items-center justify-center shadow-sm mb-8 relative">
                    <Ionicons name="mail" size={50} color="#9CA3AF" />
                    <View className="absolute top-6 right-8">
                        <Ionicons name="heart" size={16} color="#FCA5A5" />
                    </View>
                </View>

                <Text className="text-3xl font-extrabold text-[#1F2937] mb-3 text-center">
                    Kiểm tra email
                </Text>
                <Text className="text-gray-500 text-center mb-10 px-4 leading-6">
                    Chúng tôi đã gửi mã 6 chữ số đến{"\n"}
                    <Text className="text-[#1F2937] font-bold">{email || "email của bạn"}</Text>
                </Text>

                {/* 5. Giao diện 6 ô nhập mã OTP (Đã thu nhỏ kích thước và khoảng cách để vừa màn hình) */}
                <View className="flex-row justify-between w-full mb-10">
                    {otp.map((digit, index) => (
                        <TextInput
                            key={index}
                            ref={inputRefs[index]}
                            className={`w-11 h-14 rounded-xl text-center text-xl font-bold border-2 ${digit ? "border-[#059669] bg-[#E1F8ED] text-[#059669]" : "border-gray-200 bg-white text-gray-800"
                                }`}
                            keyboardType="number-pad"
                            maxLength={2}
                            value={digit}
                            onChangeText={(text) => handleChangeText(text, index)}
                            onKeyPress={(e) => handleKeyPress(e, index)}
                            selectTextOnFocus
                        />
                    ))}
                </View>

                <View className="flex-row items-center mb-8">
                    <Ionicons name="time-outline" size={16} color="#9CA3AF" />
                    <Text className="text-gray-500 ml-1 font-medium">
                        Gửi lại mã sau <Text className="text-[#1F2937] font-bold">00:{countdown < 10 ? `0${countdown}` : countdown}</Text>
                    </Text>
                </View>

                <Pressable
                    onPress={handleVerify}
                    disabled={isPending || otp.join("").length < 6} // Đổi điều kiện disable nút
                    className={`w-full bg-[#86EFAC] rounded-full py-4 items-center justify-center ${(isPending || otp.join("").length < 6) ? 'opacity-70' : 'active:opacity-80'
                        }`}
                >
                    {isPending ? (
                        <ActivityIndicator color="#065F46" />
                    ) : (
                        <View className="flex-row items-center">
                            <Text className="text-[#065F46] font-bold text-lg mr-2">Xác thực tài khoản</Text>
                            <Feather name="arrow-right" size={20} color="#065F46" />
                        </View>
                    )}
                </Pressable>

            </View>
        </KeyboardAvoidingView>
    );
}