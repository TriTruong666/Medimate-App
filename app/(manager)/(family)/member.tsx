import { useDeleteMember, useGenerateDependentLoginCode, useGetMemberById } from "@/hooks/useMember";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
    ArrowLeft,
    Clock,
    Edit3,
    FileText,
    HeartPulse,
    Pill,
    Plus,
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

    // Hàm format hiển thị ngày sinh và tính tuổi
    const getAgeAndDob = (dobString?: string | null) => {
        if (!dobString) return { dob: "Chưa cập nhật", age: "N/A" };
        const dob = new Date(dobString);
        const formattedDob = `${dob.getDate().toString().padStart(2, '0')}/${(dob.getMonth() + 1).toString().padStart(2, '0')}/${dob.getFullYear()}`;
        const ageDate = new Date(Date.now() - dob.getTime());
        const age = Math.abs(ageDate.getUTCFullYear() - 1970);
        return { dob: formattedDob, age: `${age} tuổi` };
    };

    const { dob, age } = getAgeAndDob(member?.dateOfBirth);

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
                <Pressable
                    onPress={() => router.push({ pathname: "/(manager)/(family)/edit-member", params: { memberId: id } } as any)}
                    className="w-12 h-12 bg-[#FFD700] border-2 border-black rounded-2xl items-center justify-center active:opacity-80 shadow-sm"
                >
                    <Edit3 size={20} color="#000" strokeWidth={2.5} />
                </Pressable>
            </View>

            <ScrollView className="flex-1 px-5" contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>

                {/* 1️⃣ Avatar & Tên */}
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
                        {member.role === 'Owner' ? 'Chủ gia đình' : 'Thành viên'} • {age}
                    </Text>
                </View>

                {/* 2️⃣ Thông tin cá nhân chi tiết */}
                <View className="bg-white border-2 border-black rounded-[24px] p-5 mb-6 shadow-sm">
                    <Text className="text-lg text-black font-space-bold mb-4">Thông tin cá nhân</Text>

                    <View className="flex-row justify-between mb-3 border-b-2 border-black/5 pb-3">
                        <Text className="text-sm text-gray-500 font-space-medium">Họ và Tên</Text>
                        <Text className="text-sm text-black font-space-bold">{member.fullName}</Text>
                    </View>

                    <View className="flex-row justify-between mb-3 border-b-2 border-black/5 pb-3">
                        <Text className="text-sm text-gray-500 font-space-medium">Ngày sinh</Text>
                        <Text className="text-sm text-black font-space-bold">{dob}</Text>
                    </View>

                    <View className="flex-row justify-between">
                        <Text className="text-sm text-gray-500 font-space-medium">Giới tính</Text>
                        <Text className="text-sm text-black font-space-bold">
                            {member.gender === 'Male' ? 'Nam' : member.gender === 'Female' ? 'Nữ' : 'Khác'}
                        </Text>
                    </View>
                </View>

                {/* 3️⃣ Hồ sơ Sức khỏe (Health Profile) */}
                <View className="bg-[#FFF3E0] border-2 border-black rounded-[24px] p-5 mb-6 shadow-sm">
                    <View className="flex-row items-center justify-between mb-4">
                        <View className="flex-row items-center">
                            <FileText size={20} color="#000" strokeWidth={2.5} />
                            <Text className="text-lg text-black font-space-bold ml-2">Hồ sơ sức khỏe</Text>
                        </View>
                        {/* Nút Tạo Hồ sơ sức khỏe */}
                        <Pressable
                            // onPress={() => router.push("/add-health-profile")} 
                            className="bg-black w-8 h-8 rounded-full items-center justify-center active:opacity-80"
                        >
                            <Plus size={16} color="#FFF" strokeWidth={3} />
                        </Pressable>
                    </View>

                    {/* Chỗ này sau sẽ dùng API để check xem có Health Profile chưa. Tạm thời hiển thị trạng thái rỗng */}
                    <Text className="text-sm text-gray-600 font-space-medium leading-5">
                        Chưa có dữ liệu chiều cao, cân nặng, nhóm máu. Bấm nút "+" để tạo mới.
                    </Text>
                </View>

                {/* 4️⃣ Tình trạng bệnh lý (Health Conditions) */}
                <View className="bg-[#FFE4E1] border-2 border-black rounded-[24px] p-5 mb-6 shadow-sm">
                    <View className="flex-row items-center justify-between mb-4">
                        <View className="flex-row items-center">
                            <HeartPulse size={20} color="#000" strokeWidth={2.5} />
                            <Text className="text-lg text-black font-space-bold ml-2">Tình trạng bệnh lý</Text>
                        </View>
                        {/* Nút Thêm bệnh lý */}
                        <Pressable
                            // onPress={() => router.push("/add-health-condition")} 
                            className="bg-black w-8 h-8 rounded-full items-center justify-center active:opacity-80"
                        >
                            <Plus size={16} color="#FFF" strokeWidth={3} />
                        </Pressable>
                    </View>

                    {/* Dữ liệu giả định chờ API */}
                    <Text className="text-sm text-gray-600 font-space-medium leading-5">
                        Chưa ghi nhận bệnh lý nền, dị ứng hoặc lưu ý y tế nào.
                    </Text>
                </View>

                {/* 5️⃣ QR Code Card (Dành cho Dependent) */}
                {!member.userId && (
                    <View className="bg-white border-2 border-black rounded-[32px] p-6 mb-6 shadow-sm items-center relative overflow-hidden">
                        <View className="absolute top-0 right-0 w-20 h-20 bg-[#D9AEF6] rounded-bl-[40px] border-b-2 border-l-2 border-black" />

                        <View className="bg-white/90 self-center px-4 py-1.5 rounded-full border-2 border-black mb-4 z-10 flex-row items-center gap-2">
                            <Text className="text-xs font-space-bold uppercase tracking-wider text-black">Mã đăng nhập thiết bị</Text>
                            <Pressable onPress={handleGenerateLoginCode} className="p-1 active:opacity-60">
                                <RefreshCw size={14} color="#000" strokeWidth={2.5} />
                            </Pressable>
                        </View>

                        <View className="w-48 h-48 bg-white border-4 border-black rounded-3xl items-center justify-center mb-4 p-2 shadow-sm overflow-hidden">
                            {isGeneratingQr ? (
                                <ActivityIndicator color="#000" size="large" />
                            ) : qrImageUrl ? (
                                <Image source={{ uri: qrImageUrl }} className="w-full h-full" resizeMode="contain" />
                            ) : (
                                <Text className="text-center font-space-bold text-gray-400">Không tải được mã</Text>
                            )}
                        </View>

                        <Text className="text-[10px] text-gray-400 font-space-medium mt-2">Mã có hiệu lực trong 5 phút</Text>

                        <Pressable className="mt-5 bg-black px-6 py-3.5 rounded-2xl flex-row items-center active:opacity-80">
                            <Share2 size={16} color="#FFF" />
                            <Text className="text-white font-space-bold text-sm ml-2">Chia sẻ mã</Text>
                        </Pressable>
                    </View>
                )}

                {/* 6️⃣ Thống kê & Danh sách thuốc */}
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

                <Text className="text-xl text-black font-space-bold mb-3">Danh sách thuốc</Text>
                <View className="bg-gray-50 border-2 border-black/10 rounded-[24px] p-8 mb-6 items-center justify-center border-dashed">
                    <View className="w-12 h-12 bg-gray-200 rounded-full items-center justify-center mb-3">
                        <Clock size={20} color="#888" />
                    </View>
                    <Text className="text-gray-400 font-space-medium text-center">Người này hiện chưa có{"\n"}lịch trình uống thuốc nào.</Text>
                </View>

                {/* 7️⃣ Nút Xóa Thành viên */}
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