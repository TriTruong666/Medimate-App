// app/login.tsx
import { useLoginUser } from "@/hooks/useAuth";
import { usePushToken } from "@/hooks/usePushToken";
import { AntDesign, Feather } from "@expo/vector-icons";
import * as Notifications from "expo-notifications";
import { Link } from "expo-router";
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
            paddingHorizontal: 32,
            paddingTop: 24,
            paddingBottom: 40,
          }}
          showsVerticalScrollIndicator={false}
        >
          <Link href="/" asChild>
            <Pressable className="w-12 h-12 rounded-full items-center justify-center shadow-sm bg-background-white border-2 border-black mb-6">
              <AntDesign name="arrow-left" size={24} color="black" />
            </Pressable>
          </Link>

          {/* Tiêu đề & Lời chào kiểu Soft UI */}
          <View className="mb-8">
            <Text className="text-5xl text-black tracking-tight leading-[60px] font-space-bold">
              Chào mừng{"\n"}trở lại!
            </Text>
            <Text className="text-lg text-gray-500 mt-4 font-space-regular">
              Vui lòng đăng nhập để tiếp tục quản lý lịch uống thuốc của bạn.
            </Text>
          </View>

          {/* Form nhập liệu */}
          <View>
            {/* Box input Email */}
            <View className="px-6 py-5 rounded-[32px] flex-row items-center shadow-sm border-2 border-black bg-background-white">
              <Feather name="mail" size={24} color="#888" />
              <TextInput
                placeholder="Email của bạn"
                placeholderTextColor="#A0A0A0"
                className="flex-1 text-lg text-black ml-4 font-space-regular"
                autoCapitalize="none"
                keyboardType="email-address"
                value={identifier}
                onChangeText={setIdentifier}
              />
            </View>

            {/* Box input Mật khẩu */}
            <View className="px-6 py-5 rounded-[32px] flex-row items-center shadow-sm border-2 border-black bg-background-white mt-5">
              <Feather name="lock" size={24} color="#888" />
              <TextInput
                placeholder="Mật khẩu"
                placeholderTextColor="#A0A0A0"
                secureTextEntry={!showPassword}
                className="flex-1 text-lg text-black ml-4 font-space-regular"
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
                  color="#888"
                />
              </Pressable>
            </View>

            {/* Quên mật khẩu */}
            <Pressable className="items-end mt-4">
              <Text className="text-base text-gray-500 font-space-regular">
                Quên mật khẩu?
              </Text>
            </Pressable>
          </View>

          {/* Nút hành động chính */}
          <View className="mt-8">
            <Pressable
              onPress={handleLogin}
              disabled={isPending || !identifier || !password}
              className={`w-full py-5 rounded-full flex-row items-center justify-center shadow-md bg-primary ${isPending || !identifier || !password ? "opacity-70" : "active:opacity-80"}`}
            >
              {isPending ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <Text className="text-primary-text text-xl mx-4 font-space-bold">
                    ĐĂNG NHẬP
                  </Text>
                  <AntDesign name="arrow-right" size={22} color="white" />
                </>
              )}
            </Pressable>

            <Pressable
              className="items-center mt-8 p-2"
              // onPress={() => router.push("/register")}
            >
              <Text className="text-black text-base font-space-regular">
                Chưa có tài khoản?{" "}
                <Text className="font-space-bold">Đăng ký ngay</Text>
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
