import { validateMemberProfile } from "@/common/validation";
import { useDeleteMember, useGetMemberById, useUpdateMember } from "@/hooks/useMember";
import { usePopup } from "@/stores/popupStore";
import { useToast } from "@/stores/toastStore";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, Calendar, Check, Image as ImageIcon, Trash2, User } from "lucide-react-native";
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

export default function EditMemberScreen() {
    const router = useRouter();
    const { memberId } = useLocalSearchParams<{ memberId: string }>();
    const toast = useToast();
    const popup = usePopup();

    const [fullName, setFullName] = useState("");
    const [dateOfBirth, setDateOfBirth] = useState("");
    const [gender, setGender] = useState<"Male" | "Female" | "Other">("Other");
    const [avatarUri, setAvatarUri] = useState<string | null>(null);
    const [avatarFile, setAvatarFile] = useState<any>(null);
    const [isInitialized, setIsInitialized] = useState(false);

    const { data: member, isLoading: isFetching } = useGetMemberById(memberId);
    const { mutate: updateMember, isPending: isUpdating } = useUpdateMember();
    const { mutate: deleteMember, isPending: isDeleting } = useDeleteMember();

    useEffect(() => {
        if (member && !isInitialized) {
            setFullName(member.fullName || "");
            setDateOfBirth(member.dateOfBirth ? member.dateOfBirth.split("T")[0] : "");
            setGender((member.gender as any) || "Other");
            setAvatarUri(member.avatarUrl || null);
            setIsInitialized(true);
        }
    }, [member, isInitialized]);

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

    const handleSave = () => {
        if (!memberId) return;

        const { isValid, message } = validateMemberProfile(fullName, dateOfBirth);
        if (!isValid) {
            toast.error("Lỗi", message);
            return;
        }

        const formData = new FormData();
        formData.append("FullName", fullName.trim());
        formData.append("Gender", gender);

        if (dateOfBirth) {
            formData.append("DateOfBirth", `${dateOfBirth}T00:00:00.000Z`);
        }

        if (avatarFile) {
            formData.append("AvatarFile", avatarFile as any);
        }

        updateMember(
            { id: memberId, formData },
            {
                onSuccess: () => {
                    toast.success("Thành công", "Đã cập nhật thông tin thành viên.");
                    router.back();
                },
                onError: () => {
                    toast.error("Lỗi", "Không thể cập nhật hồ sơ");
                }
            }
        );
    };

    const handleDelete = () => {
        if (!memberId) return;

        popup.confirm(
            {
                title: "Xóa thành viên",
                message: `Bạn có chắc chắn muốn xóa "${fullName}" khỏi gia đình không? Mọi dữ liệu liên quan sẽ bị mất.`,
                type: "danger",
                confirmLabel: "Xóa",
                cancelLabel: "Hủy"
            },
            () => {
                deleteMember(memberId, {
                    onSuccess: () => {
                        toast.success("Thành công", "Đã xóa thành viên");
                        router.back();
                    },
                    onError: () => {
                        toast.error("Lỗi", "Không thể xóa thành viên");
                    }
                });
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

    const isProcessing = isUpdating || isDeleting;

    return (
        <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1">
                <ScrollView className="flex-1 px-6 pt-4" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
                    {/* Header */}
                    <View className="flex-row items-center justify-between mb-8">
                        <Pressable onPress={() => router.back()} className="w-12 h-12 bg-white border-2 border-black rounded-[16px] items-center justify-center shadow-sm active:opacity-80">
                            <ArrowLeft size={22} color="#000" strokeWidth={2.5} />
                        </Pressable>
                        <Text className="text-xl text-black font-space-bold">Hồ sơ thành viên</Text>
                        <View className="w-12 h-12" />
                    </View>

                    {/* Avatar Section */}
                    <View className="items-center mb-8">
                        <Pressable onPress={handlePickImage} className="relative active:opacity-80">
                            <View className="w-32 h-32 rounded-[40px] border-4 border-black bg-[#A3E6A1] items-center justify-center overflow-hidden shadow-sm">
                                {Boolean(avatarUri) ? (
                                    <Image source={{ uri: avatarUri as string }} className="w-full h-full" resizeMode="cover" />
                                ) : (
                                    <User size={50} color="#000" />
                                )}
                            </View>
                            <View className="absolute bottom-0 right-0 w-10 h-10 bg-[#FFD700] border-2 border-black rounded-full items-center justify-center shadow-sm">
                                <ImageIcon size={18} color="#000" />
                            </View>
                        </Pressable>
                    </View>

                    {/* Dấu hiệu nhận biết Chủ gia đình */}
                    {member?.role === "Owner" && (
                        <View className="bg-[#FFD700] border-2 border-black rounded-xl py-2 px-4 self-center mb-6 shadow-sm">
                            <Text className="text-black font-space-bold text-xs uppercase tracking-widest">Chủ gia đình</Text>
                        </View>
                    )}

                    {/* Form Fields */}
                    <View className="space-y-5">
                        {/* Họ và Tên */}
                        <View>
                            <Text className="text-sm font-space-bold text-black mb-2 ml-2 uppercase tracking-wider">Họ và Tên</Text>
                            <View className="px-5 py-4 rounded-[24px] border-2 border-black bg-white shadow-sm">
                                <TextInput
                                    value={fullName}
                                    onChangeText={setFullName}
                                    placeholder="Nhập tên thành viên..."
                                    placeholderTextColor="#A0A0A0"
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
                                        className={`flex-1 py-4 rounded-[24px] border-2 border-black items-center justify-center shadow-sm ${gender === g ? "bg-[#87CEFA]" : "bg-white"}`}
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
                            <View className="px-5 py-3 rounded-[24px] border-2 border-black bg-white shadow-sm flex-row items-center h-16">
                                <Calendar size={20} color="#888" />
                                <TextInput
                                    value={dateOfBirth}
                                    onChangeText={handleDateChange}
                                    placeholder="VD: 1980-05-20"
                                    placeholderTextColor="#A0A0A0"
                                    keyboardType="numeric"
                                    maxLength={10}
                                    className="flex-1 text-lg text-black font-space-bold ml-3"
                                />
                            </View>
                        </View>
                    </View>

                    {/* Action Buttons */}
                    <View className="mt-10 gap-y-4">
                        {/* Nút Lưu */}
                        <Pressable
                            onPress={handleSave}
                            disabled={isProcessing}
                            className={`bg-[#A3E6A1] border-2 border-black rounded-[24px] flex-row items-center justify-center py-5 shadow-md ${isProcessing ? "opacity-70 bg-gray-300" : "active:opacity-80 active:translate-y-0.5"}`}
                        >
                            {isUpdating ? (
                                <ActivityIndicator color="#000" />
                            ) : (
                                <>
                                    <Check size={20} color="#000" strokeWidth={3} />
                                    <Text className="text-lg text-black font-space-bold uppercase tracking-wider ml-2">Lưu thay đổi</Text>
                                </>
                            )}
                        </Pressable>

                        {/* Nút Xóa */}
                        {member?.role !== "Owner" && (
                            <Pressable
                                onPress={handleDelete}
                                disabled={isProcessing}
                                className={`bg-[#FFA07A] border-2 border-black rounded-[24px] flex-row items-center justify-center py-5 shadow-md ${isProcessing ? "opacity-70 bg-gray-300" : "active:opacity-80 active:translate-y-0.5"}`}
                            >
                                {isDeleting ? (
                                    <ActivityIndicator color="#000" />
                                ) : (
                                    <>
                                        <Trash2 size={20} color="#000" strokeWidth={3} />
                                        <Text className="text-lg text-black font-space-bold uppercase tracking-wider ml-2">Xóa thành viên</Text>
                                    </>
                                )}
                            </Pressable>
                        )}
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}