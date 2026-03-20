import { useGetFamilyById, useUpdateFamily } from "@/hooks/useFamily";
import { AntDesign, Feather } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    Switch,
    Text,
    TextInput,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function EditFamilyScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id: string }>();

    // States cho Form
    const [familyName, setFamilyName] = useState("");
    const [isOpenJoin, setIsOpenJoin] = useState(false);

    // 1. Lấy dữ liệu chi tiết gia đình
    const { data: family, isLoading: isFetching } = useGetFamilyById(id);

    // 2. Hook cập nhật
    const { mutate: updateFamily, isPending: isUpdating } = useUpdateFamily();

    // Cập nhật form khi dữ liệu API trả về
    useEffect(() => {
        if (family) {
            setFamilyName(family.familyName);
            setIsOpenJoin(family.isOpenJoin);
        }
    }, [family]);

    const handleSave = () => {
        if (!familyName.trim() || !id) return;

        updateFamily(
            {
                id,
                data: {
                    familyName: familyName.trim(),
                    isOpenJoin: isOpenJoin,
                },
            },
            {
                onSuccess: () => {
                    router.back();
                },
            }
        );
    };

    if (isFetching) {
        return (
            <SafeAreaView className="flex-1 bg-background justify-center items-center">
                <ActivityIndicator size="large" color="#000" />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                className="flex-1"
            >
                <ScrollView className="flex-1 px-6 pt-4" showsVerticalScrollIndicator={false}>
                    {/* Header */}
                    <View className="flex-row items-center justify-between mb-8">
                        <Pressable
                            onPress={() => router.back()}
                            className="w-12 h-12 rounded-full border-2 border-black bg-white items-center justify-center shadow-sm"
                        >
                            <AntDesign name="arrow-left" size={24} color="black" />
                        </Pressable>
                        <Text className="text-2xl text-black font-space-bold">Sửa gia đình</Text>
                        <View className="w-12 h-12" />
                    </View>

                    {/* Banner minh họa */}
                    <View className="bg-[#D9AEF6] border-2 border-black rounded-[32px] p-8 mb-8 items-center justify-center shadow-sm">
                        <View className="w-20 h-20 bg-white rounded-3xl border-2 border-black items-center justify-center">
                            <Feather name="users" size={40} color="black" />
                        </View>
                        <Text className="text-black font-space-bold mt-4 text-center">
                            Cập nhật thông tin nhóm để{"\n"}mọi người dễ dàng nhận diện
                        </Text>
                    </View>

                    {/* Form Fields */}
                    <View className="gap-y-6">
                        {/* Tên gia đình */}
                        <View>
                            <Text className="text-sm font-space-bold text-black mb-2 ml-2 uppercase tracking-wider">
                                Tên nhóm gia đình
                            </Text>
                            <View className="px-5 py-4 rounded-[24px] border-2 border-black bg-white shadow-sm">
                                <TextInput
                                    value={familyName}
                                    onChangeText={setFamilyName}
                                    placeholder="VD: Gia đình của tôi..."
                                    className="text-lg text-black font-space-bold"
                                />
                            </View>
                        </View>

                        {/* Switch: Cho phép tham gia */}
                        <View className="bg-white border-2 border-black rounded-[24px] p-5 flex-row items-center justify-between shadow-sm">
                            <View className="flex-1 mr-4">
                                <Text className="text-base font-space-bold text-black">
                                    Mở cho phép tham gia
                                </Text>
                                <Text className="text-xs text-gray-500 font-space-medium mt-1">
                                    Người khác có thể dùng mã QR hoặc mã Code để vào nhóm này.
                                </Text>
                            </View>
                            <Switch
                                value={isOpenJoin}
                                onValueChange={setIsOpenJoin}
                                trackColor={{ false: "#E5E7EB", true: "#A3E6A1" }}
                                thumbColor={isOpenJoin ? "#000" : "#FFF"}
                                ios_backgroundColor="#E5E7EB"
                            />
                        </View>
                    </View>

                    {/* Nút lưu */}
                    <Pressable
                        onPress={handleSave}
                        disabled={isUpdating || !familyName.trim()}
                        className={`bg-black border-2 border-black rounded-[32px] flex-row items-center justify-center py-5 shadow-lg mt-10 mb-10 ${isUpdating || !familyName.trim() ? "opacity-70" : "active:opacity-90"
                            }`}
                    >
                        {isUpdating ? (
                            <ActivityIndicator color="#FFF" />
                        ) : (
                            <>
                                <Feather name="check" size={20} color="white" />
                                <Text className="text-lg text-white font-space-bold uppercase tracking-wider ml-2">
                                    Lưu thay đổi
                                </Text>
                            </>
                        )}
                    </Pressable>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}