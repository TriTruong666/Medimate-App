// app/login.tsx
import { useLoginUser } from "@/hooks/useAuth";
import { usePushToken } from "@/hooks/usePushToken";
import { AntDesign, Feather } from "@expo/vector-icons";
import * as Notifications from "expo-notifications";
import { Link, router } from "expo-router";
import React, { useState } from "react";
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

// Cấu hình thông báo hiển thị khi app đang mở (Foreground)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true, // Thêm dòng này (Hiển thị banner thả xuống)
    shouldShowList: true, // Thêm dòng này (Hiển thị trong trung tâm thông báo)
  }),
});

export default function LoginScreen() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // State lưu token

  const { mutate: login, isPending } = useLoginUser();

  // Tự động xin quyền và lấy Token khi mở màn hình Login
  const fcmToken = usePushToken();

  const handleLogin = () => {
    if (!identifier.trim() || !password) return;

    login({
      identifier: identifier.trim(),
      password: password,
      fcmToken: fcmToken || "no_token_available",
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{
            paddingHorizontal: 24,
            paddingTop: 24,
            paddingBottom: 40,
          }}
          showsVerticalScrollIndicator={false}
        >
          <Link href="/" asChild>
            <Pressable className="w-12 h-12 rounded-2xl items-center justify-center shadow-sm bg-white border-2 border-black mb-8">
              <AntDesign name="arrow-left" size={24} color="black" />
            </Pressable>
          </Link>

          {/* Tiêu đề & Lời chào kiểu Soft UI */}
          <View className="mb-8">
            <Text className="text-4xl text-black tracking-tight font-space-bold mb-2">
              Chào mừng quay lại!
            </Text>
            <Text className="text-gray-500 font-space-medium">
              Vui lòng đăng nhập để tiếp tục quản lý lịch uống thuốc của bạn.
            </Text>
          </View>

          {/* Form nhập liệu */}
          <View className="gap-y-4">
            {/* Box input Email */}
            <View>
              <Text className="text-xs font-space-bold mb-2 ml-1 uppercase">Email</Text>
              <View className="px-4 py-1 rounded-2xl flex-row items-center border-2 border-black bg-white">
                <Feather name="mail" size={20} color="gray" />
                <TextInput
                  placeholder="Email của bạn"
                  placeholderTextColor="#A0A0A0"
                  className="flex-1 h-12 ml-3 font-space-bold text-black"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  value={identifier}
                  onChangeText={setIdentifier}
                />
              </View>
            </View>

            {/* Box input Mật khẩu */}
            <View>
              <Text className="text-xs font-space-bold mb-2 ml-1 uppercase">Mật khẩu</Text>
              <View className="px-4 py-1 rounded-2xl flex-row items-center border-2 border-black bg-white">
                <Feather name="lock" size={20} color="gray" />
                <TextInput
                  placeholder="********"
                  placeholderTextColor="#A0A0A0"
                  secureTextEntry={!showPassword}
                  className="flex-1 h-12 ml-3 font-space-bold text-black"
                  value={password}
                  onChangeText={setPassword}
                />
                <Pressable
                  onPress={() => setShowPassword(!showPassword)}
                  className="p-2 -mr-2"
                >
                  <Feather
                    name={showPassword ? "eye" : "eye-off"}
                    size={20}
                    color="gray"
                  />
                </Pressable>
              </View>
            </View>

            {/* Quên mật khẩu */}
            <Pressable className="items-end mt-1">
              <Text className="text-sm text-gray-500 font-space-medium">
                Quên mật khẩu?
              </Text>
            </Pressable>
          </View>

          {/* Nút hành động chính */}
          <View className="mt-10">
            <Pressable
              onPress={handleLogin}
              disabled={isPending || !identifier || !password}
              className={`w-full py-4 rounded-[24px] flex-row items-center justify-center shadow-md bg-[#A3E6A1] border-2 border-black ${isPending || !identifier || !password ? "opacity-70" : "active:opacity-80"}`}
            >
              {isPending ? (
                <ActivityIndicator color="black" />
              ) : (
                <>
                  <Text className="text-black text-lg mx-2 font-space-bold uppercase">
                    ĐĂNG NHẬP NGAY
                  </Text>
                  <AntDesign name="arrow-right" size={20} color="black" />
                </>
              )}
            </Pressable>

            <View className="flex-row justify-center mt-8">
              <Text className="text-gray-500 font-space-medium">
                Chưa có tài khoản?{" "}
              </Text>
              <Pressable
                onPress={() => router.push("/register")}
                className="active:opacity-70"
              >
                <Text className="font-space-bold text-black border-b border-black">Đăng ký ngay</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
