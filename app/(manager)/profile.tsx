import { useGetMemberById, useUpdateMember } from "@/hooks/useMember";
import { useGetMe, useUpdateMe } from "@/hooks/useUser";
import { getDecodedToken } from "@/utils/token";
import { AntDesign, Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Image,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function EditProfileScreen() {
    const [userId, setUserId] = useState<string | undefined>(undefined);
    const [memberId, setMemberId] = useState<string | undefined>(undefined);

    // Form States
    const [fullName, setFullName] = useState("");
    const [dateOfBirth, setDateOfBirth] = useState("");
    const [gender, setGender] = useState<"Male" | "Female" | "Other">("Other");
    const [avatarUri, setAvatarUri] = useState<string | null>(null);
    const [avatarFile, setAvatarFile] = useState<any>(null);

    // Lấy và giải mã Token
    useEffect(() => {
        const fetchToken = async () => {
            const decoded = await getDecodedToken();
            if (decoded) {
                setUserId(decoded.Id);
                setMemberId(decoded.memberId);
            }
        };
        fetchToken();
    }, []);

    // Fetch dữ liệu
    const { data: userProfile, isLoading: isUserLoading } = useGetMe(!!userId);
    const effectiveMemberId = !userId && memberId ? memberId : undefined;
    const { data: memberProfile, isLoading: isMemberLoading } = useGetMemberById(effectiveMemberId);

    const displayData = userId ? userProfile : memberProfile;
    const isLoading = userId ? isUserLoading : isMemberLoading;

    // Mutations
    const { mutate: updateUser, isPending: isUpdatingUser } = useUpdateMe();
    const { mutate: updateMember, isPending: isUpdatingMember } = useUpdateMember();
    const isSaving = isUpdatingUser || isUpdatingMember;

    // Cập nhật Form khi có dữ liệu
    useEffect(() => {
        if (displayData) {
            setFullName(displayData.fullName || "");
            setDateOfBirth(displayData.dateOfBirth ? displayData.dateOfBirth.split("T")[0] : "");
            setGender((displayData.gender as any) || "Other");
            setAvatarUri(displayData.avatarUrl || null);
        }
    }, [displayData]);

    const handlePickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["images"],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled) {
            setAvatarUri(result.assets[0].uri);
            setAvatarFile({
                uri: result.assets[0].uri,
                name: "avatar.jpg",
                type: "image/jpeg",
            });
        }
    };

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
        if (!fullName.trim()) return;

        const formData = new FormData();
        formData.append("FullName", fullName.trim());
        formData.append("Gender", gender);

        if (dateOfBirth) {
            formData.append("DateOfBirth", `${dateOfBirth}T00:00:00.000Z`);
        }

        if (avatarFile) {
            formData.append("AvatarFile", avatarFile as any);
        }

        if (userId) {
            updateUser(formData, { onSuccess: () => router.back() });
        } else if (memberId) {
            updateMember({ id: memberId, formData }, { onSuccess: () => router.back() });
        }
    };

    if (isLoading) {
        return (
            <SafeAreaView className="flex-1 bg-background justify-center items-center">
                <ActivityIndicator size="large" color="#000" />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1">
                <ScrollView className="flex-1 px-6 pt-4" showsVerticalScrollIndicator={false}>
                    {/* Header */}
                    <View className="flex-row items-center justify-between mb-8">
                        <Pressable onPress={() => router.back()} className="w-12 h-12 rounded-full border-2 border-black bg-white items-center justify-center shadow-sm">
                            <AntDesign name="arrow-left" size={24} color="black" />
                        </Pressable>
                        <Text className="text-2xl text-black font-space-bold">Hồ sơ của tôi</Text>
                        <View className="w-12 h-12" />
                    </View>

                    {/* Avatar Section */}
                    <View className="items-center mb-10">
                        <Pressable onPress={handlePickImage} className="relative active:opacity-80">
                            <View className="w-32 h-32 rounded-full border-4 border-black bg-[#D9AEF6] items-center justify-center overflow-hidden shadow-sm">
                                {Boolean(avatarUri) ? (
                                    <Image
                                        source={{ uri: avatarUri as string }}
                                        className="w-full h-full"
                                        resizeMode="cover"
                                    />
                                ) : (
                                    <Feather name="user" size={40} color="#000" />
                                )}
                            </View>
                            <View className="absolute bottom-0 right-0 w-10 h-10 bg-[#FFD700] border-2 border-black rounded-full items-center justify-center shadow-sm">
                                <Feather name="image" size={18} color="#000" />
                            </View>
                        </Pressable>
                    </View>

                    {/* Form Fields */}
                    <View className="space-y-5 mb-10">
                        {/* Họ và Tên */}
                        <View>
                            <Text className="text-sm font-space-bold text-black mb-2 ml-2 uppercase tracking-wider">Họ và Tên</Text>
                            <View className="px-5 py-4 rounded-[24px] border-2 border-black bg-white shadow-sm">
                                <TextInput
                                    value={fullName}
                                    onChangeText={setFullName}
                                    placeholder="Nhập họ và tên..."
                                    className="text-lg text-black font-space-bold"
                                />
                            </View>
                        </View>

                        {/* Giới tính */}
                        <View className="mt-4">
                            <Text className="text-sm font-space-bold text-black mb-2 ml-2 uppercase tracking-wider">Giới tính</Text>
                            <View className="flex-row justify-between gap-3">
                                {["Male", "Female", "Other"].map((g) => (
                                    <Pressable
                                        key={g}
                                        onPress={() => setGender(g as any)}
                                        className={`flex-1 py-4 rounded-[24px] border-2 border-black items-center justify-center shadow-sm ${gender === g ? "bg-[#A3E6A1]" : "bg-white"}`}
                                    >
                                        <Text className="text-base font-space-bold text-black">
                                            {g === "Male" ? "Nam" : g === "Female" ? "Nữ" : "Khác"}
                                        </Text>
                                    </Pressable>
                                ))}
                            </View>
                        </View>

                        {/* Ngày sinh */}
                        <View className="mt-4">
                            <Text className="text-sm font-space-bold text-black mb-2 ml-2 uppercase tracking-wider">Ngày sinh (YYYY-MM-DD)</Text>
                            <View className="px-5 py-4 rounded-[24px] border-2 border-black bg-white shadow-sm flex-row items-center">
                                <Feather name="calendar" size={20} color="#888" />
                                <TextInput
                                    value={dateOfBirth}
                                    onChangeText={handleDateChange}
                                    placeholder="VD: 2000-12-31"
                                    keyboardType="numeric"
                                    maxLength={10}
                                    className="flex-1 text-lg text-black font-space-bold ml-3"
                                />
                            </View>
                        </View>
                    </View>

                    {/* Nút Lưu */}
                    <Pressable
                        onPress={handleSave}
                        disabled={isSaving || !fullName}
                        className={`bg-black border-2 border-black rounded-[32px] flex-row items-center justify-center py-5 shadow-lg mb-10 ${isSaving || !fullName ? "opacity-70" : "active:opacity-90"}`}
                    >
                        {isSaving ? (
                            <ActivityIndicator color="#FFF" />
                        ) : (
                            <Text className="text-lg text-white font-space-bold uppercase tracking-wider">Lưu thay đổi</Text>
                        )}
                    </Pressable>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}