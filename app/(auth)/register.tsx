import { validateRegister } from "@/common/validation";
import { useRegisterUser } from "@/hooks/useAuth";
import { useToast } from "@/stores/toastStore";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  Lock,
  Mail,
  Phone,
  ShieldCheck,
  User,
} from "lucide-react-native";
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

export default function RegisterScreen() {
  const router = useRouter();
  const toast = useToast();
  const { mutate: register, isPending } = useRegisterUser();

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
  });

  const handleRegister = () => {
    const { isValid, message } = validateRegister(form);

    if (!isValid) {
      toast.error("Lỗi đăng ký", message);
      return;
    }

    const cleanForm = {
      ...form,
      fullName: form.fullName.trim(),
      email: form.email.trim(),
      phoneNumber: form.phoneNumber.trim(),
    };

    register(cleanForm, {
      onSuccess: (res: any) => {
        if (res.success) {
          toast.success("Thành công", "Đăng ký thành công! Hãy xác thực OTP.");
          // Chuyển sang trang OTP và truyền email qua params
          router.push({
            pathname: "/(auth)/verify-otp",
            params: { email: form.email.trim() },
          });
        }
      },
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView contentContainerStyle={{ padding: 24 }}>
          <Pressable
            onPress={() => router.back()}
            className="w-12 h-12 bg-white border-2 border-black rounded-2xl items-center justify-center mb-8 shadow-sm"
          >
            <ArrowLeft color="black" size={24} />
          </Pressable>

          <Text className="text-4xl font-space-bold text-black mb-2">
            Tạo tài khoản
          </Text>
          <Text className="text-gray-500 font-space-medium mb-8">
            Bắt đầu hành trình chăm sóc sức khỏe gia đình ngay hôm nay.
          </Text>

          <View className="gap-y-4">
            {/* Full Name */}
            <View>
              <Text className="text-xs font-space-bold mb-2 ml-1 uppercase">
                Họ và tên
              </Text>
              <View className="flex-row items-center bg-white border-2 border-black rounded-2xl px-4 py-1 shadow-sm gap-x-3">
                <User size={20} color="gray" />
                <TextInput
                  className="flex-1 h-12 font-space-bold text-black"
                  placeholderTextColor="#A0A0A0"
                  placeholder="Nguyễn Văn A"
                  value={form.fullName}
                  onChangeText={(t) => setForm({ ...form, fullName: t })}
                />
              </View>
            </View>

            {/* Email */}
            <View>
              <Text className="text-xs font-space-bold mb-2 ml-1 uppercase">
                Email
              </Text>
              <View className="flex-row items-center bg-white border-2 border-black rounded-2xl px-4 py-1 shadow-sm gap-x-3">
                <Mail size={20} color="gray" />
                <TextInput
                  className="flex-1 h-12 font-space-bold text-black"
                  placeholder="example@gmail.com"
                  placeholderTextColor="#A0A0A0"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={form.email}
                  onChangeText={(t) => setForm({ ...form, email: t })}
                />
              </View>
            </View>

            {/* Phone */}
            <View>
              <Text className="text-xs font-space-bold mb-2 ml-1 uppercase">
                Số điện thoại
              </Text>
              <View className="flex-row items-center bg-white border-2 border-black rounded-2xl px-4 py-1 shadow-sm gap-x-3">
                <Phone size={20} color="gray" />
                <TextInput
                  className="flex-1 h-12 font-space-bold text-black"
                  placeholder="0912345678"
                  placeholderTextColor="#A0A0A0"
                  keyboardType="phone-pad"
                  value={form.phoneNumber}
                  onChangeText={(t) => setForm({ ...form, phoneNumber: t })}
                />
              </View>
            </View>

            {/* Password */}
            <View>
              <Text className="text-xs font-space-bold mb-2 ml-1 uppercase">
                Mật khẩu
              </Text>
              <View className="flex-row items-center bg-white border-2 border-black rounded-2xl px-4 py-1 shadow-sm gap-x-3">
                <Lock size={20} color="gray" />
                <TextInput
                  className="flex-1 h-12 font-space-bold text-black"
                  placeholder="********"
                  placeholderTextColor="#A0A0A0"
                  secureTextEntry
                  value={form.password}
                  onChangeText={(t) => setForm({ ...form, password: t })}
                />
              </View>
            </View>

            {/* Confirm Password */}
            <View>
              <Text className="text-xs font-space-bold mb-2 ml-1 uppercase">
                Nhập lại mật khẩu
              </Text>
              <View className="flex-row items-center bg-white border-2 border-black rounded-2xl px-4 py-1 shadow-sm gap-x-3">
                <ShieldCheck size={20} color="gray" />
                <TextInput
                  className="flex-1 h-12 font-space-bold text-black"
                  placeholder="********"
                  placeholderTextColor="#A0A0A0"
                  secureTextEntry
                  value={form.confirmPassword}
                  onChangeText={(t) => setForm({ ...form, confirmPassword: t })}
                />
              </View>
            </View>
          </View>

          <Pressable
            onPress={handleRegister}
            disabled={isPending}
            className={`bg-[#A3E6A1] border-2 border-black rounded-[24px] py-4 mt-10 shadow-md ${isPending ? "opacity-70" : "active:opacity-80"}`}
          >
            {isPending ? (
              <ActivityIndicator color="black" />
            ) : (
              <Text className="text-center font-space-bold text-lg text-black uppercase">
                Đăng ký ngay
              </Text>
            )}
          </Pressable>

          <View className="flex-row justify-center mt-6">
            <Text className="font-space-medium text-gray-500">
              Đã có tài khoản?{" "}
            </Text>
            <Pressable onPress={() => router.push("/login")}>
              <Text className="font-space-bold text-black border-b border-black">
                Đăng nhập
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
