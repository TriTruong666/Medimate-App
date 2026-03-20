import { useCreateDependentMember } from "@/hooks/useMember";
import { AntDesign, Feather } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
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

export default function AddMemberScreen() {
    const router = useRouter();
    const { familyId } = useLocalSearchParams<{ familyId: string }>();

    const [fullName, setFullName] = useState("");
    const [dateOfBirth, setDateOfBirth] = useState("");
    const [gender, setGender] = useState<"Male" | "Female" | "Other">("Other");

    const { mutate: createMember, isPending: isCreating } = useCreateDependentMember();

    const handleDateChange = (text: string) => {
        const cleaned = text.replace(/\D/g, "");
        let formatted = cleaned;
        if (cleaned.length > 6) {
            formatted = `${cleaned.slice(0, 4)}-${cleaned.slice(4, 6)}-${cleaned.slice(6, 8)}`;
        } else if (cleaned.length > 4) {
            formatted = `${cleaned.slice(0, 4)}-${cleaned.slice(4, 6)}`;
        }
        setDateOfBirth(formatted);
    };

    const handleSave = () => {
        if (!fullName.trim() || !familyId) return;

        const payload: any = {
            familyId: familyId,
            fullName: fullName.trim(),
            gender: gender,
        };

        if (dateOfBirth) {
            payload.dateOfBirth = `${dateOfBirth}T00:00:00.000Z`;
        }

        createMember(payload, {
            onError: (error: any) => {
                console.log("Lỗi tạo member chi tiết:", error.response?.data || error);
            }
        });
    };

    return (
        <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1">
                <ScrollView className="flex-1 px-6 pt-4" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
                    <View className="flex-row items-center justify-between mb-8">
                        <Pressable onPress={() => router.back()} className="w-12 h-12 rounded-full border-2 border-black bg-white items-center justify-center shadow-sm active:opacity-80">
                            <AntDesign name="arrow-left" size={24} color="black" />
                        </Pressable>
                        <Text className="text-2xl text-black font-space-bold">Thêm thành viên</Text>
                        <View className="w-12 h-12" />
                    </View>

                    <View className="bg-[#A3E6A1] border-2 border-black rounded-[32px] p-6 mb-8 items-center justify-center shadow-sm">
                        <Text className="text-black font-space-bold text-center leading-6">Tạo hồ sơ cho người thân để quản lý{"\n"}lịch uống thuốc của họ.</Text>
                    </View>

                    {/* Avatar Section - Đã bỏ Pressable và dấu cộng */}
                    <View className="items-center mb-8">
                        <View className="w-32 h-32 rounded-full border-4 border-black bg-[#D9AEF6] items-center justify-center shadow-sm">
                            <Feather name="user" size={50} color="#000" />
                        </View>
                    </View>

                    <View className="space-y-5">
                        <View>
                            <Text className="text-sm font-space-bold text-black mb-2 ml-2 uppercase tracking-wider">Họ và Tên (*)</Text>
                            <View className="px-5 py-4 rounded-[24px] border-2 border-black bg-white shadow-sm">
                                <TextInput
                                    value={fullName}
                                    onChangeText={setFullName}
                                    placeholder="Nhập tên người thân..."
                                    className="text-lg text-black font-space-bold"
                                />
                            </View>
                        </View>

                        <View className="mt-4">
                            <Text className="text-sm font-space-bold text-black mb-2 ml-2 uppercase tracking-wider">Giới tính</Text>
                            <View className="flex-row justify-between gap-3">
                                {["Male", "Female", "Other"].map((g) => (
                                    <Pressable
                                        key={g}
                                        onPress={() => setGender(g as any)}
                                        className={`flex-1 py-4 rounded-[24px] border-2 border-black items-center justify-center shadow-sm ${gender === g ? "bg-[#FFD700]" : "bg-white"}`}
                                    >
                                        <Text className="text-base font-space-bold text-black">{g === "Male" ? "Nam" : g === "Female" ? "Nữ" : "Khác"}</Text>
                                    </Pressable>
                                ))}
                            </View>
                        </View>

                        <View className="mt-4">
                            <Text className="text-sm font-space-bold text-black mb-2 ml-2 uppercase tracking-wider">Ngày sinh (YYYY-MM-DD)</Text>
                            <View className="px-5 py-4 rounded-[24px] border-2 border-black bg-white shadow-sm flex-row items-center">
                                <Feather name="calendar" size={20} color="#888" />
                                <TextInput
                                    value={dateOfBirth}
                                    onChangeText={handleDateChange}
                                    placeholder="VD: 1960-05-20"
                                    keyboardType="numeric"
                                    maxLength={10}
                                    className="flex-1 text-lg text-black font-space-bold ml-3"
                                />
                            </View>
                        </View>
                    </View>

                    <View className="mt-10">
                        <Pressable
                            onPress={handleSave}
                            disabled={isCreating || !fullName.trim()}
                            className={`bg-black border-2 border-black rounded-[32px] flex-row items-center justify-center py-5 shadow-lg ${isCreating || !fullName.trim() ? "opacity-70" : "active:opacity-90"}`}
                        >
                            {isCreating ? (
                                <ActivityIndicator color="#FFF" />
                            ) : (
                                <>
                                    <Feather name="user-plus" size={20} color="#FFF" />
                                    <Text className="text-lg text-white font-space-bold uppercase tracking-wider ml-2">Thêm người này</Text>
                                </>
                            )}
                        </Pressable>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}