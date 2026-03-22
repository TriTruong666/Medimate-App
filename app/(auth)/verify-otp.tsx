import { useVerifyOtp } from "@/hooks/useAuth";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const CODE_LENGTH = 6;

export default function VerifyOtpScreen() {
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email: string }>();
  const { mutate: verify, isPending } = useVerifyOtp();
  const [otp, setOtp] = useState("");
  const inputRef = useRef<TextInput>(null);

  const handleVerify = () => {
    if (otp.length < CODE_LENGTH || !email) return;

    verify({ email, verifyCode: otp });
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ padding: 24, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          <Pressable
            onPress={() => router.back()}
            className="w-12 h-12 bg-white border-2 border-black rounded-2xl items-center justify-center mb-8 shadow-sm"
          >
            <ArrowLeft color="black" size={24} />
          </Pressable>

          <View className="items-center mb-10">
            <Text className="text-3xl font-space-bold text-black text-center mb-2">
              Xác thực OTP
            </Text>
            <Text className="text-gray-500 font-space-medium text-center px-4">
              Chúng tôi đã gửi mã xác thực đến email:{"\n"}
              <Text className="text-black font-space-bold">{email}</Text>
            </Text>
          </View>

          <View className="items-center relative">
            <Text className="text-xs font-space-bold mb-4 uppercase text-center text-gray-500">
              Nhập mã 6 chữ số
            </Text>

            <Pressable
              className="flex-row gap-2 w-full justify-center"
              onPress={() => inputRef.current?.focus()}
            >
              {Array(CODE_LENGTH)
                .fill(0)
                .map((_, i) => {
                  const digit = otp[i] || "";
                  const isActive = i === otp.length;

                  return (
                    <View
                      key={i}
                      className={`w-12 h-14 bg-white border-2 rounded-2xl items-center justify-center shadow-sm ${isActive ? "border-black bg-[#A3E6A1]" : "border-black"}`}
                    >
                      <Text className="text-2xl font-space-bold text-black">
                        {digit}
                      </Text>
                    </View>
                  );
                })}
            </Pressable>

            {/* Hidden Input Layer */}
            <TextInput
              ref={inputRef}
              className="absolute w-full h-full opacity-0"
              keyboardType="number-pad"
              maxLength={CODE_LENGTH}
              value={otp}
              onChangeText={setOtp}
              autoFocus
            />
          </View>

          <Pressable
            onPress={handleVerify}
            disabled={isPending || otp.length < CODE_LENGTH}
            className={`w-full py-4 rounded-[24px] flex-row border-2 border-black mt-10 shadow-md items-center justify-center ${otp.length === CODE_LENGTH ? "bg-[#A3E6A1] active:opacity-80" : "bg-gray-200"}`}
          >
            {isPending ? (
              <ActivityIndicator color="black" />
            ) : (
              <Text className="text-center font-space-bold text-lg text-black uppercase">
                Xác nhận ngay
              </Text>
            )}
          </Pressable>

          <View className="mt-8 flex-row justify-center">
            <Text className="font-space-medium text-gray-500">
              Không nhận được mã?{" "}
            </Text>
            <Pressable>
              <Text className="font-space-bold text-black border-b border-black">
                Gửi lại mã
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
