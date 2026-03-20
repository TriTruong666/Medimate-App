import { useVerifyOtp } from "@/hooks/useAuth";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, ShieldCheck } from "lucide-react-native";
import React, { useState } from "react";
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    Text,
    TextInput,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function VerifyOtpScreen() {
    const router = useRouter();
    const { email } = useLocalSearchParams<{ email: string }>();
    const { mutate: verify, isPending } = useVerifyOtp();
    const [otp, setOtp] = useState("");

    const handleVerify = () => {
        if (otp.length < 4 || !email) return;

        verify({ email, verifyCode: otp });
        // Hook useVerifyOtp của bạn đã có logic router.replace("/login") khi thành công
    };

    return (
        <SafeAreaView className="flex-1 bg-background">
            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1 px-6">
                <Pressable
                    onPress={() => router.back()}
                    className="w-12 h-12 bg-white border-2 border-black rounded-2xl items-center justify-center mt-6 mb-8 shadow-sm"
                >
                    <ArrowLeft color="black" size={24} />
                </Pressable>

                <View className="items-center mb-10">
                    <View className="w-20 h-20 bg-[#D9AEF6] border-2 border-black rounded-[24px] items-center justify-center mb-6 shadow-sm">
                        <ShieldCheck size={40} color="black" />
                    </View>
                    <Text className="text-3xl font-space-bold text-black text-center">Xác thực OTP</Text>
                    <Text className="text-gray-500 font-space-medium text-center mt-2 px-4">
                        Chúng tôi đã gửi mã xác thực đến email:{"\n"}
                        <Text className="text-black font-space-bold">{email}</Text>
                    </Text>
                </View>

                <View>
                    <Text className="text-xs font-space-bold mb-3 ml-1 uppercase text-center">Nhập mã xác thực</Text>
                    <TextInput
                        className="bg-white border-2 border-black rounded-[24px] h-20 text-center text-3xl font-space-bold text-black tracking-[10px]"
                        placeholder="000000"
                        keyboardType="number-pad"
                        maxLength={6}
                        value={otp}
                        onChangeText={setOtp}
                        autoFocus
                    />
                </View>

                <Pressable
                    onPress={handleVerify}
                    disabled={isPending || otp.length < 4}
                    className={`py-5 rounded-[24px] border-2 border-black mt-10 shadow-md ${otp.length >= 4 ? "bg-black active:opacity-90" : "bg-gray-300"
                        }`}
                >
                    {isPending ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text className="text-center font-space-bold text-lg text-white uppercase">Xác nhận</Text>
                    )}
                </Pressable>

                <View className="mt-8 items-center">
                    <Text className="font-space-medium text-gray-500">Không nhận được mã?</Text>
                    <Pressable className="mt-2">
                        <Text className="font-space-bold text-black border-b border-black">Gửi lại mã</Text>
                    </Pressable>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}