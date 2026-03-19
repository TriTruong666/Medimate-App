import { useDeleteMember, useGenerateDependentLoginCode, useGetMemberById } from "@/hooks/useMember";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
    ArrowLeft,
    Clock,
    Edit3,
    Pill,
    RefreshCw,
    Share2,
    Trash2,
    TrendingUp
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Image, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function MemberDetailScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id: string }>();

    // 1. Fetch thông tin thành viên
    const { data: member, isLoading: isFetching } = useGetMemberById(id);

    // 2. Hook Xóa thành viên
    const { mutate: deleteMember, isPending: isDeleting } = useDeleteMember();

    // 3. Hook Tạo mã đăng nhập
    const { mutate: generateQrCode, isPending: isGeneratingQr } = useGenerateDependentLoginCode();

    // Đổi state này để lưu thẳng cái link ảnh QR
    const [qrImageUrl, setQrImageUrl] = useState<string | null>(null);

    // Tự động gọi API lấy mã đăng nhập nếu là "Thành viên phụ thuộc"
    useEffect(() => {
        if (member && !member.userId && !qrImageUrl && !isGeneratingQr) {
            handleGenerateLoginCode();
        }
    }, [member]);

    const handleGenerateLoginCode = () => {
        if (!id) return;
        generateQrCode(id, {
            onSuccess: (res) => {
                // Đọc đúng key qrCodeUrl từ API JSON của bạn
                if (res.success && res.data && res.data.qrCodeUrl) {
                    setQrImageUrl(res.data.qrCodeUrl);
                }
            }
        });
    };

    // Xử lý xóa thành viên
    const handleDelete = () => {
        if (!id) return;

        Alert.alert(
            "Cảnh báo nguy hiểm",
            `Bạn có chắc chắn muốn xóa "${member?.fullName}" khỏi gia đình không?\n\nHành động này sẽ XÓA TOÀN BỘ:\n• Hồ sơ cá nhân\n• Đơn thuốc\n• Lịch uống thuốc`,
            [
                { text: "Hủy", style: "cancel" },
                {
                    text: "Xóa vĩnh viễn",
                    style: "destructive",
                    onPress: () => {
                        deleteMember(id, {
                            onSuccess: () => router.back()
                        });
                    },
                },
            ]
        );
    };

    // Hàm tính tuổi
    const calculateAge = (dobString?: string | null) => {
        if (!dobString) return "Chưa cập nhật";
        const dob = new Date(dobString);
        const ageDate = new Date(Date.now() - dob.getTime());
        return `${Math.abs(ageDate.getUTCFullYear() - 1970)} tuổi`;
    };

    if (isFetching) {
        return (
            <SafeAreaView className="flex-1 bg-background justify-center items-center">
                <ActivityIndicator size="large" color="#000" />
            </SafeAreaView>
        );
    }

    if (!member) {
        return (
            <SafeAreaView className="flex-1 bg-background justify-center items-center">
                <Text className="font-space-bold text-lg text-black">Không tìm thấy thông tin thành viên</Text>
                <Pressable onPress={() => router.back()} className="mt-4 bg-black px-6 py-3 rounded-full active:opacity-80">
                    <Text className="text-white font-space-bold">Quay lại</Text>
                </Pressable>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-[#F9F6FC]" edges={["top"]}>
            {/* Header */}
            <View className="flex-row items-center justify-between px-5 pt-3 pb-4">
                <Pressable
                    onPress={() => router.back()}
                    className="w-12 h-12 bg-white border-2 border-black rounded-2xl items-center justify-center active:opacity-80 shadow-sm"
                >
                    <ArrowLeft size={22} color="#000" strokeWidth={2.5} />
                </Pressable>
                <Text className="text-xl text-black font-space-bold">
                    Hồ sơ chi tiết
                </Text>

                {/* Nút Edit chuyển sang trang edit-member */}
                <Pressable
                    onPress={() => router.push({ pathname: "/(manager)/(family)/edit-member", params: { memberId: id } } as any)}
                    className="w-12 h-12 bg-[#FFD700] border-2 border-black rounded-2xl items-center justify-center active:opacity-80 shadow-sm"
                >
                    <Edit3 size={20} color="#000" strokeWidth={2.5} />
                </Pressable>
            </View>

            <ScrollView className="flex-1 px-5" contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>

                {/* 1️⃣ Thông tin Profile */}
                <View className="items-center mb-6 mt-2">
                    <View className="w-24 h-24 rounded-[32px] border-4 border-black overflow-hidden mb-4 bg-[#A3E6A1] items-center justify-center shadow-sm">
                        {member.avatarUrl ? (
                            <Image source={{ uri: member.avatarUrl }} className="w-full h-full" resizeMode="cover" />
                        ) : (
                            <Text className="text-3xl font-space-bold uppercase text-black">{member.fullName.charAt(0)}</Text>
                        )}
                    </View>
                    <Text className="text-2xl text-black font-space-bold text-center">{member.fullName}</Text>
                    <Text className="text-sm text-gray-500 font-space-medium mt-1">
                        {member.role === 'Owner' ? 'Chủ gia đình' : 'Thành viên'} • {calculateAge(member.dateOfBirth)}
                    </Text>
                </View>

                {/* 2️⃣ QR Code Card */}
                {!member.userId && (
                    <View className="bg-white border-2 border-black rounded-[32px] p-6 mb-6 shadow-sm items-center relative overflow-hidden">
                        {/* Decor góc trên */}
                        <View className="absolute top-0 right-0 w-20 h-20 bg-[#D9AEF6] rounded-bl-[40px] border-b-2 border-l-2 border-black" />

                        <View className="bg-white/90 self-center px-4 py-1.5 rounded-full border-2 border-black mb-4 z-10 flex-row items-center gap-2">
                            <Text className="text-xs font-space-bold uppercase tracking-wider text-black">
                                Mã đăng nhập thiết bị
                            </Text>
                            {/* Nút lấy lại mã QR mới */}
                            <Pressable onPress={handleGenerateLoginCode} className="p-1 active:opacity-60">
                                <RefreshCw size={14} color="#000" strokeWidth={2.5} />
                            </Pressable>
                        </View>

                        {/* Khung chứa QR Ảnh */}
                        <View className="w-48 h-48 bg-white border-4 border-black rounded-3xl items-center justify-center mb-4 p-2 shadow-sm overflow-hidden">
                            {isGeneratingQr ? (
                                <ActivityIndicator color="#000" size="large" />
                            ) : qrImageUrl ? (
                                <Image
                                    source={{ uri: qrImageUrl }}
                                    className="w-full h-full"
                                    resizeMode="contain"
                                />
                            ) : (
                                <Text className="text-center font-space-bold text-gray-400">Không tải được mã</Text>
                            )}
                        </View>

                        <Text className="text-sm text-gray-500 font-space-medium text-center leading-5">
                            Dùng app trên máy khác quét mã này để{"\n"}đăng nhập nhanh cho <Text className="text-black font-space-bold">{member.fullName}</Text>
                        </Text>
                        <Text className="text-[10px] text-gray-400 font-space-medium mt-2">
                            Mã có hiệu lực trong 5 phút
                        </Text>

                        {/* Nút chia sẻ */}
                        <Pressable className="mt-5 bg-black px-6 py-3.5 rounded-2xl flex-row items-center active:opacity-80">
                            <Share2 size={16} color="#FFF" />
                            <Text className="text-white font-space-bold text-sm ml-2">Chia sẻ mã</Text>
                        </Pressable>
                    </View>
                )}

                {/* 3️⃣ Thống kê */}
                <View className="flex-row gap-3 mb-6">
                    <View className="flex-1 border-2 border-black rounded-[24px] p-4 shadow-sm bg-[#A3E6A1]">
                        <View className="w-10 h-10 bg-white rounded-2xl border-2 border-black items-center justify-center mb-2">
                            <TrendingUp size={20} color="#000" strokeWidth={2.5} />
                        </View>
                        <Text className="text-sm text-black/60 font-space-bold">Tuân thủ</Text>
                        <Text className="text-3xl text-black font-space-bold">--%</Text>
                    </View>

                    <View className="flex-1 bg-white border-2 border-black rounded-[24px] p-4 shadow-sm">
                        <View className="w-10 h-10 bg-[#D9AEF6] rounded-2xl border-2 border-black items-center justify-center mb-2">
                            <Pill size={20} color="#000" strokeWidth={2.5} />
                        </View>
                        <Text className="text-sm text-gray-400 font-space-bold">Đang dùng</Text>
                        <Text className="text-3xl text-black font-space-bold">--</Text>
                        <Text className="text-xs text-gray-400 font-space-medium">loại thuốc</Text>
                    </View>
                </View>

                {/* 4️⃣ Danh sách thuốc */}
                <Text className="text-xl text-black font-space-bold mb-3">Danh sách thuốc</Text>
                <View className="bg-gray-50 border-2 border-black/10 rounded-[24px] p-8 mb-6 items-center justify-center border-dashed">
                    <View className="w-12 h-12 bg-gray-200 rounded-full items-center justify-center mb-3">
                        <Clock size={20} color="#888" />
                    </View>
                    <Text className="text-gray-400 font-space-medium text-center">
                        Người này hiện chưa có{"\n"}lịch trình uống thuốc nào.
                    </Text>
                </View>

                {/* 5️⃣ Nút Xóa Thành viên */}
                {member.role !== "Owner" && (
                    <Pressable
                        onPress={handleDelete}
                        disabled={isDeleting}
                        className={`bg-[#FFA07A] border-2 border-black rounded-[24px] py-4 flex-row items-center justify-center shadow-sm mb-5 ${isDeleting ? "opacity-70" : "active:opacity-80"}`}
                    >
                        {isDeleting ? (
                            <ActivityIndicator color="#000" />
                        ) : (
                            <>
                                <Trash2 size={20} color="#000" strokeWidth={2.5} />
                                <Text className="text-base text-black font-space-bold ml-2">Xoá thành viên khỏi nhóm</Text>
                            </>
                        )}
                    </Pressable>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}