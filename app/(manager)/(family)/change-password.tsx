import { useChangePassword } from "@/hooks/useUser";
import { useRouter } from "expo-router";
import { ArrowLeft, Eye, EyeOff, Lock, ShieldCheck } from "lucide-react-native";
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

export default function ChangePasswordScreen() {
    const router = useRouter();
    const { mutate: changePassword, isPending } = useChangePassword();

    const [form, setForm] = useState({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    // States để điều khiển ẩn/hiện mật khẩu cho từng trường
    const [showOld, setShowOld] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const handleConfirm = () => {
        if (!form.oldPassword || !form.newPassword || !form.confirmPassword) return;
        if (form.newPassword !== form.confirmPassword) {
            alert("Mật khẩu mới và xác nhận mật khẩu không khớp!");
            return;
        }

        changePassword(
            {
                oldPassword: form.oldPassword,
                newPassword: form.newPassword,
                confirmPassword: form.confirmPassword // Truyền luôn cả confirm nếu API yêu cầu
            },
            {
                onSuccess: (res) => {
                    if (res.success) router.back();
                },
            }
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-background">
            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1">
                <ScrollView contentContainerStyle={{ padding: 24 }} showsVerticalScrollIndicator={false}>
                    <Pressable
                        onPress={() => router.back()}
                        className="w-12 h-12 bg-white border-2 border-black rounded-2xl items-center justify-center mb-8 shadow-sm active:opacity-80"
                    >
                        <ArrowLeft color="black" size={24} />
                    </Pressable>

                    <View className="items-center mb-10">
                        <View className="w-20 h-20 bg-[#D9AEF6] border-2 border-black rounded-[24px] items-center justify-center mb-4 shadow-sm">
                            <ShieldCheck size={40} color="black" />
                        </View>
                        <Text className="text-3xl font-space-bold text-black">Đổi mật khẩu</Text>
                        <Text className="text-gray-500 font-space-medium text-center mt-2">Nhập mật khẩu hiện tại và mật khẩu mới để bảo mật tài khoản.</Text>
                    </View>

                    <View className="gap-y-5">
                        {/* Mật khẩu hiện tại */}
                        <View>
                            <Text className="text-xs font-space-bold mb-2 ml-1 uppercase text-black">
                                Mật khẩu hiện tại <Text className="text-red-500">*</Text>
                            </Text>
                            <View className="flex-row items-center bg-white border-2 border-black rounded-2xl px-4 py-1 shadow-sm">
                                <Lock size={20} color="gray" />
                                <TextInput
                                    className="flex-1 h-12 ml-3 font-space-bold text-black"
                                    placeholder="********"
                                    secureTextEntry={!showOld}
                                    value={form.oldPassword}
                                    onChangeText={(t) => setForm({ ...form, oldPassword: t })}
                                />
                                <Pressable onPress={() => setShowOld(!showOld)} className="p-2">
                                    {showOld ? <EyeOff size={20} color="black" /> : <Eye size={20} color="black" />}
                                </Pressable>
                            </View>
                        </View>

                        {/* Mật khẩu mới */}
                        <View>
                            <Text className="text-xs font-space-bold mb-2 ml-1 uppercase text-black">
                                Mật khẩu mới <Text className="text-red-500">*</Text>
                            </Text>
                            <View className="flex-row items-center bg-white border-2 border-black rounded-2xl px-4 py-1 shadow-sm">
                                <Lock size={20} color="gray" />
                                <TextInput
                                    className="flex-1 h-12 ml-3 font-space-bold text-black"
                                    placeholder="********"
                                    secureTextEntry={!showNew}
                                    value={form.newPassword}
                                    onChangeText={(t) => setForm({ ...form, newPassword: t })}
                                />
                                <Pressable onPress={() => setShowNew(!showNew)} className="p-2">
                                    {showNew ? <EyeOff size={20} color="black" /> : <Eye size={20} color="black" />}
                                </Pressable>
                            </View>
                        </View>

                        {/* Xác nhận mật khẩu mới */}
                        <View>
                            <Text className="text-xs font-space-bold mb-2 ml-1 uppercase text-black">
                                Xác nhận mật khẩu mới <Text className="text-red-500">*</Text>
                            </Text>
                            <View className="flex-row items-center bg-white border-2 border-black rounded-2xl px-4 py-1 shadow-sm">
                                <Lock size={20} color="gray" />
                                <TextInput
                                    className="flex-1 h-12 ml-3 font-space-bold text-black"
                                    placeholder="********"
                                    secureTextEntry={!showConfirm}
                                    value={form.confirmPassword}
                                    onChangeText={(t) => setForm({ ...form, confirmPassword: t })}
                                />
                                <Pressable onPress={() => setShowConfirm(!showConfirm)} className="p-2">
                                    {showConfirm ? <EyeOff size={20} color="black" /> : <Eye size={20} color="black" />}
                                </Pressable>
                            </View>
                        </View>
                    </View>

                    <Pressable
                        onPress={handleConfirm}
                        disabled={isPending || !form.oldPassword || !form.newPassword || !form.confirmPassword}
                        className={`bg-black border-2 border-black rounded-[24px] py-5 mt-12 shadow-lg ${isPending || !form.oldPassword || !form.newPassword || !form.confirmPassword ? "opacity-70" : "active:opacity-90"}`}
                    >
                        {isPending ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text className="text-center font-space-bold text-lg text-white uppercase tracking-wider">Cập nhật mật khẩu</Text>
                        )}
                    </Pressable>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}