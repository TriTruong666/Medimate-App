import { useGetMemberById, useUpdateMember } from "@/hooks/useMember";
import { useGetMe, useUpdateMe } from "@/hooks/useUser";
import { getDecodedToken } from "@/utils/token";
import { ArrowLeft, Camera, User, Calendar, Check } from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
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
    const router = useRouter();
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
                setMemberId(decoded.MemberId);
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
            updateUser(formData, { onSuccess: () => router.navigate("/(manager)/(settings)" as any) });
        } else if (memberId) {
            updateMember({ id: memberId, formData }, { onSuccess: () => router.navigate("/(manager)/(settings)" as any) });
        }
    };

    if (isLoading) {
        return (
            <SafeAreaView className="flex-1 bg-[#F9F6FC] justify-center items-center">
                <ActivityIndicator size="large" color="#000" />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-[#F9F6FC]" edges={["top"]}>
            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1">
                {/* Custom Header */}
                <View className="flex-row items-center justify-between px-6 pt-4 pb-2">
                    <Pressable
                        onPress={() => router.back()}
                        className="w-12 h-12 rounded-2xl border-2 border-black bg-white items-center justify-center shadow-sm active:translate-y-0.5"
                    >
                        <ArrowLeft size={24} color="black" strokeWidth={2.5} />
                    </Pressable>
                    <Text className="text-xl text-black font-space-bold">Hồ sơ cá nhân</Text>
                    <View className="w-12 h-12" />
                </View>

                <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
                    {/* Avatar Section */}
                    <View className="items-center my-8">
                        <Pressable onPress={handlePickImage} className="relative active:opacity-80">
                            <View className="w-36 h-36 rounded-3xl border-2 border-black bg-[#D9AEF6] items-center justify-center overflow-hidden shadow-md">
                                {Boolean(avatarUri) ? (
                                    <Image
                                        source={{ uri: avatarUri as string }}
                                        className="w-full h-full"
                                        resizeMode="cover"
                                    />
                                ) : (
                                    <User size={60} color="#000" strokeWidth={1.5} />
                                )}
                            </View>
                            <View className="absolute -bottom-2 -right-2 w-12 h-12 bg-[#FFD700] border-2 border-black rounded-2xl items-center justify-center shadow-md">
                                <Camera size={20} color="#000" strokeWidth={2.5} />
                            </View>
                        </Pressable>
                    </View>

                    {/* Form Fields */}
                    <View className="mb-10">
                        {/* Họ và Tên */}
                        <View className="mb-6">
                            <Text className="text-[12px] font-space-bold text-gray-500 mb-2 ml-1 uppercase tracking-[2px]">
                                Họ và Tên
                            </Text>
                            <View className="px-5 py-4 rounded-[20px] border-2 border-black bg-white shadow-sm flex-row items-center">
                                <User size={20} color="#888" strokeWidth={2} />
                                <TextInput
                                    value={fullName}
                                    onChangeText={setFullName}
                                    placeholder="Ví dụ: Nguyễn Văn A"
                                    placeholderTextColor="#A0A0A0"
                                    className="flex-1 text-lg text-black font-space-bold ml-3"
                                />
                            </View>
                        </View>

                        {/* Giới tính */}
                        <View className="mb-6">
                            <Text className="text-[12px] font-space-bold text-gray-500 mb-2 ml-1 uppercase tracking-[2px]">
                                Giới tính
                            </Text>
                            <View className="flex-row justify-between gap-x-3">
                                {[
                                    { id: "Male", label: "Nam", color: "#87CEFA" },
                                    { id: "Female", label: "Nữ", color: "#FFA07A" },
                                    { id: "Other", label: "Khác", color: "#D9AEF6" }
                                ].map((g) => (
                                    <Pressable
                                        key={g.id}
                                        onPress={() => setGender(g.id as any)}
                                        className={`flex-1 py-4 rounded-[20px] border-2 border-black items-center justify-center shadow-sm ${gender === g.id ? "bg-[#A3E6A1]" : "bg-white"}`}
                                    >
                                        <Text className="text-[15px] font-space-bold text-black">
                                            {g.label}
                                        </Text>
                                    </Pressable>
                                ))}
                            </View>
                        </View>

                        {/* Ngày sinh */}
                        <View className="mb-10">
                            <Text className="text-[12px] font-space-bold text-gray-500 mb-2 ml-1 uppercase tracking-[2px]">
                                Ngày sinh (YYYY-MM-DD)
                            </Text>
                            <View className="px-5 py-4 rounded-[20px] border-2 border-black bg-white shadow-sm flex-row items-center">
                                <Calendar size={20} color="#888" strokeWidth={2} />
                                <TextInput
                                    value={dateOfBirth}
                                    onChangeText={handleDateChange}
                                    placeholder="1990-01-01"
                                    placeholderTextColor="#A0A0A0"
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
                        className={`bg-black border-2 border-black rounded-[24px] flex-row items-center justify-center py-5 shadow-lg mb-12 ${isSaving || !fullName ? "opacity-70" : "active:translate-y-1"}`}
                    >
                        {isSaving ? (
                            <ActivityIndicator color="#FFF" />
                        ) : (
                            <View className="flex-row items-center gap-x-2">
                                <Check size={22} color="white" strokeWidth={3} />
                                <Text className="text-lg text-white font-space-bold uppercase tracking-wider">Lưu thay đổi</Text>
                            </View>
                        )}
                    </Pressable>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
