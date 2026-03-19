import { useDeleteMember, useGenerateDependentLoginCode, useGetMemberById } from "@/hooks/useMember";
// TODO: Import các hook gọi API Health Profile của bạn tại đây
// import { useCreateHealthProfile, useUpdateHealthProfile, useDeleteHealthProfile } from "@/hooks/useHealthProfile";

import { useLocalSearchParams, useRouter } from "expo-router";
import {
    ArrowLeft,
    Edit3,
    FileText,
    HeartPulse,
    Plus,
    Trash2,
    X
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Image, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function MemberDetailScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id: string }>();

    // --- 1. HOOKS API THÀNH VIÊN ---
    const { data: member, isLoading: isFetching } = useGetMemberById(id);
    const { mutate: deleteMember, isPending: isDeleting } = useDeleteMember();
    const { mutate: generateQrCode, isPending: isGeneratingQr } = useGenerateDependentLoginCode();
    const [qrImageUrl, setQrImageUrl] = useState<string | null>(null);

    // --- 2. STATES & LOGIC CHO HEALTH PROFILE (HỒ SƠ SỨC KHỎE) ---
    const [isHpModalVisible, setIsHpModalVisible] = useState(false);
    const [hpHeight, setHpHeight] = useState("");
    const [hpWeight, setHpWeight] = useState("");
    const [hpBloodType, setHpBloodType] = useState("O");

    // Giả lập dữ liệu Health Profile (Bạn hãy thay bằng data từ API trả về, ví dụ: member?.healthProfile)
    // Tạm thời tôi dùng biến state này để bạn thấy UI thay đổi khi tạo/xóa
    const [mockHealthProfile, setMockHealthProfile] = useState<{ height: string, weight: string, bloodType: string } | null>(null);

    const handleOpenAddHp = () => {
        setHpHeight("");
        setHpWeight("");
        setHpBloodType("O");
        setIsHpModalVisible(true);
    };

    const handleOpenEditHp = () => {
        if (mockHealthProfile) {
            setHpHeight(mockHealthProfile.height);
            setHpWeight(mockHealthProfile.weight);
            setHpBloodType(mockHealthProfile.bloodType);
        }
        setIsHpModalVisible(true);
    };

    const handleSaveHp = () => {
        // TODO: Gọi API Create hoặc Update ở đây
        // Ví dụ: createHealthProfile({ memberId: id, height: hpHeight, weight: hpWeight, bloodType: hpBloodType })

        // Code giả lập cập nhật UI ngay lập tức
        setMockHealthProfile({ height: hpHeight, weight: hpWeight, bloodType: hpBloodType });
        setIsHpModalVisible(false);
        Alert.alert("Thành công", "Đã lưu hồ sơ sức khỏe!");
    };

    const handleDeleteHp = () => {
        Alert.alert(
            "Xóa hồ sơ sức khỏe",
            "Bạn có chắc chắn muốn xóa chiều cao, cân nặng và nhóm máu của người này?",
            [
                { text: "Hủy", style: "cancel" },
                {
                    text: "Xóa",
                    style: "destructive",
                    onPress: () => {
                        // TODO: Gọi API Delete ở đây
                        setMockHealthProfile(null); // Giả lập xóa thành công
                    },
                },
            ]
        );
    };

    // --- 3. CÁC HÀM TIỆN ÍCH KHÁC ---
    useEffect(() => {
        if (member && !member.userId && !qrImageUrl && !isGeneratingQr) {
            if (!id) return;
            generateQrCode(id, {
                onSuccess: (res) => {
                    if (res.success && res.data && res.data.qrCodeUrl) {
                        setQrImageUrl(res.data.qrCodeUrl);
                    }
                }
            });
        }
    }, [member]);

    const handleDeleteMember = () => {
        if (!id) return;
        Alert.alert(
            "Cảnh báo nguy hiểm",
            `Bạn có chắc chắn muốn xóa "${member?.fullName}" khỏi gia đình không?`,
            [
                { text: "Hủy", style: "cancel" },
                { text: "Xóa vĩnh viễn", style: "destructive", onPress: () => deleteMember(id, { onSuccess: () => router.back() }) },
            ]
        );
    };

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
                <Pressable onPress={() => router.back()} className="w-12 h-12 bg-white border-2 border-black rounded-2xl items-center justify-center active:opacity-80 shadow-sm">
                    <ArrowLeft size={22} color="#000" strokeWidth={2.5} />
                </Pressable>
                <Text className="text-xl text-black font-space-bold">Hồ sơ chi tiết</Text>
                <Pressable onPress={() => router.push({ pathname: "/(manager)/(family)/edit-member", params: { memberId: id } } as any)} className="w-12 h-12 bg-[#FFD700] border-2 border-black rounded-2xl items-center justify-center active:opacity-80 shadow-sm">
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

                {/* 2️⃣ Thông tin cá nhân */}
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

                {/* 3️⃣ HỒ SƠ SỨC KHỎE (Health Profile) */}
                <View className="bg-[#FFF3E0] border-2 border-black rounded-[24px] p-5 mb-6 shadow-sm">
                    <View className="flex-row items-center justify-between mb-4">
                        <View className="flex-row items-center">
                            <FileText size={20} color="#000" strokeWidth={2.5} />
                            <Text className="text-lg text-black font-space-bold ml-2">Hồ sơ sức khỏe</Text>
                        </View>

                        {/* Thay đổi nút bấm dựa trên việc đã có dữ liệu hay chưa */}
                        {mockHealthProfile ? (
                            <View className="flex-row gap-2">
                                <Pressable onPress={handleOpenEditHp} className="bg-white w-9 h-9 rounded-full border-2 border-black items-center justify-center active:bg-gray-100">
                                    <Edit3 size={14} color="#000" />
                                </Pressable>
                                <Pressable onPress={handleDeleteHp} className="bg-[#FFA07A] w-9 h-9 rounded-full border-2 border-black items-center justify-center active:opacity-80">
                                    <Trash2 size={14} color="#000" />
                                </Pressable>
                            </View>
                        ) : (
                            <Pressable onPress={handleOpenAddHp} className="bg-black w-8 h-8 rounded-full items-center justify-center active:opacity-80">
                                <Plus size={16} color="#FFF" strokeWidth={3} />
                            </Pressable>
                        )}
                    </View>

                    {/* Hiển thị dữ liệu hoặc dòng thông báo */}
                    {mockHealthProfile ? (
                        <View className="bg-white/50 rounded-2xl p-4 border border-black/10">
                            <View className="flex-row justify-between mb-2">
                                <Text className="text-gray-600 font-space-medium">Chiều cao</Text>
                                <Text className="text-black font-space-bold">{mockHealthProfile.height} cm</Text>
                            </View>
                            <View className="flex-row justify-between mb-2">
                                <Text className="text-gray-600 font-space-medium">Cân nặng</Text>
                                <Text className="text-black font-space-bold">{mockHealthProfile.weight} kg</Text>
                            </View>
                            <View className="flex-row justify-between pt-2 border-t border-black/10">
                                <Text className="text-gray-600 font-space-medium">Nhóm máu</Text>
                                <Text className="text-red-500 font-space-bold">{mockHealthProfile.bloodType}</Text>
                            </View>
                        </View>
                    ) : (
                        <Text className="text-sm text-gray-600 font-space-medium leading-5">
                            Chưa có dữ liệu chiều cao, cân nặng, nhóm máu. Bấm nút "+" để tạo mới.
                        </Text>
                    )}
                </View>

                {/* 4️⃣ TÌNH TRẠNG BỆNH LÝ (Health Conditions) */}
                <View className="bg-[#FFE4E1] border-2 border-black rounded-[24px] p-5 mb-6 shadow-sm">
                    <View className="flex-row items-center justify-between mb-4">
                        <View className="flex-row items-center">
                            <HeartPulse size={20} color="#000" strokeWidth={2.5} />
                            <Text className="text-lg text-black font-space-bold ml-2">Tình trạng bệnh lý</Text>
                        </View>
                        <Pressable className="bg-black w-8 h-8 rounded-full items-center justify-center active:opacity-80">
                            <Plus size={16} color="#FFF" strokeWidth={3} />
                        </Pressable>
                    </View>
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
                    </View>
                )}

                {/* Nút Xóa Thành viên */}
                {member.role !== "Owner" && (
                    <Pressable onPress={handleDeleteMember} disabled={isDeleting} className={`bg-[#FFA07A] border-2 border-black rounded-[24px] py-4 flex-row items-center justify-center shadow-sm mb-5 ${isDeleting ? "opacity-70" : "active:opacity-80"}`}>
                        {isDeleting ? <ActivityIndicator color="#000" /> : <><Trash2 size={20} color="#000" strokeWidth={2.5} /><Text className="text-base text-black font-space-bold ml-2">Xoá thành viên khỏi nhóm</Text></>}
                    </Pressable>
                )}
            </ScrollView>

            {/* 🌟 MODAL (POPUP) THÊM / SỬA HỒ SƠ SỨC KHỎE 🌟 */}
            <Modal visible={isHpModalVisible} transparent={true} animationType="fade" onRequestClose={() => setIsHpModalVisible(false)}>
                <Pressable className="flex-1 bg-black/60 justify-center items-center px-5" onPress={() => setIsHpModalVisible(false)}>
                    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="w-full">
                        <Pressable className="bg-[#FFF3E0] border-2 border-black rounded-[32px] p-6 shadow-lg w-full" onPress={(e) => e.stopPropagation()}>

                            <Pressable onPress={() => setIsHpModalVisible(false)} className="absolute top-4 right-4 w-8 h-8 bg-white rounded-full items-center justify-center border-2 border-black active:bg-gray-200 z-10">
                                <X size={18} color="#000" strokeWidth={3} />
                            </Pressable>

                            <View className="items-center mb-6 mt-2">
                                <View className="w-16 h-16 bg-white border-2 border-black rounded-2xl items-center justify-center mb-4 shadow-sm">
                                    <FileText size={32} color="#000" />
                                </View>
                                <Text className="text-2xl text-black font-space-bold text-center">
                                    {mockHealthProfile ? "Sửa hồ sơ sức khỏe" : "Hồ sơ sức khỏe"}
                                </Text>
                            </View>

                            <View className="flex-row gap-4 mb-4">
                                {/* Chiều cao */}
                                <View className="flex-1">
                                    <Text className="text-sm font-space-bold text-black mb-2 ml-2">Chiều cao (cm)</Text>
                                    <View className="px-4 py-3 rounded-[20px] border-2 border-black bg-white shadow-sm">
                                        <TextInput value={hpHeight} onChangeText={setHpHeight} placeholder="VD: 170" keyboardType="numeric" className="text-lg text-black font-space-bold" />
                                    </View>
                                </View>
                                {/* Cân nặng */}
                                <View className="flex-1">
                                    <Text className="text-sm font-space-bold text-black mb-2 ml-2">Cân nặng (kg)</Text>
                                    <View className="px-4 py-3 rounded-[20px] border-2 border-black bg-white shadow-sm">
                                        <TextInput value={hpWeight} onChangeText={setHpWeight} placeholder="VD: 65" keyboardType="numeric" className="text-lg text-black font-space-bold" />
                                    </View>
                                </View>
                            </View>

                            {/* Nhóm máu */}
                            <View className="mb-6">
                                <Text className="text-sm font-space-bold text-black mb-2 ml-2">Nhóm máu</Text>
                                <View className="flex-row justify-between gap-2">
                                    {["A", "B", "AB", "O"].map((type) => (
                                        <Pressable
                                            key={type}
                                            onPress={() => setHpBloodType(type)}
                                            className={`flex-1 py-3 rounded-[20px] border-2 border-black items-center justify-center shadow-sm ${hpBloodType === type ? "bg-[#FFD700]" : "bg-white"}`}
                                        >
                                            <Text className="text-base font-space-bold text-black">{type}</Text>
                                        </Pressable>
                                    ))}
                                </View>
                            </View>

                            {/* Nút Lưu Modal */}
                            <Pressable
                                onPress={handleSaveHp}
                                disabled={!hpHeight || !hpWeight}
                                className={`py-4 rounded-[24px] border-2 border-black bg-black items-center justify-center shadow-sm ${!hpHeight || !hpWeight ? "opacity-70" : "active:opacity-80"}`}
                            >
                                <Text className="text-base font-space-bold text-white">Lưu thông tin</Text>
                            </Pressable>

                        </Pressable>
                    </KeyboardAvoidingView>
                </Pressable>
            </Modal>
        </SafeAreaView>
    );
}