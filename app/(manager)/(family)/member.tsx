import {
    useAddHealthCondition,
    useCreateHealthProfile,
    useDeleteHealthCondition,
    useGetHealthProfile,
    useUpdateHealthCondition,
    useUpdateHealthProfile
} from "@/hooks/useHealth";
import { useDeleteMember, useGenerateDependentLoginCode, useGetMemberById } from "@/hooks/useMember";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
    ArrowLeft,
    Edit3,
    FileText,
    HeartPulse,
    Plus,
    RefreshCw,
    Trash2,
    X
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Image, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function MemberDetailScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id: string }>();

    // --- 1. API THÀNH VIÊN & QR LOGIC ---
    const { data: member, isLoading: isFetchingMember } = useGetMemberById(id);
    const { mutate: deleteMember } = useDeleteMember();
    const { mutate: generateQrCode, isPending: isGeneratingQr } = useGenerateDependentLoginCode();

    const [qrImageUrl, setQrImageUrl] = useState<string | null>(null);
    const [timeLeft, setTimeLeft] = useState<number>(0);

    const handleGenerateQR = () => {
        if (!id) return;
        generateQrCode(id, {
            onSuccess: (res) => {
                if (res.success && res.data?.qrCodeUrl) {
                    setQrImageUrl(res.data.qrCodeUrl);
                    setTimeLeft(300); // 5 phút = 300 giây
                }
            }
        });
    };

    useEffect(() => {
        if (member && !member.userId && !qrImageUrl && !isGeneratingQr) {
            handleGenerateQR();
        }
    }, [member]);

    useEffect(() => {
        if (timeLeft <= 0) return;
        const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
        return () => clearInterval(timer);
    }, [timeLeft]);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    // --- 2. API SỨC KHỎE (PROFILE & CONDITIONS) ---
    const { data: healthProfile, isLoading: isFetchingHealth } = useGetHealthProfile(id);
    const { mutate: createHP, isPending: isCreatingHP } = useCreateHealthProfile();
    const { mutate: updateHP, isPending: isUpdatingHP } = useUpdateHealthProfile();
    const { mutate: addHC, isPending: isAddingHC } = useAddHealthCondition();
    const { mutate: updateHC, isPending: isUpdatingHC } = useUpdateHealthCondition();
    const { mutate: deleteHC } = useDeleteHealthCondition();

    // --- 3. STATES CHO MODALS ---
    const [isHpModalVisible, setIsHpModalVisible] = useState(false);
    const [hpForm, setHpForm] = useState({ bloodType: "O", height: "", weight: "", insurance: "" });

    const [isHcModalVisible, setIsHcModalVisible] = useState(false);
    const [hcForm, setHcForm] = useState({ name: "", note: "" });
    const [editingHcId, setEditingHcId] = useState<string | null>(null);

    // --- 4. XỬ LÝ HỒ SƠ SỨC KHỎE ---
    const handleOpenHpModal = () => {
        if (healthProfile) {
            setHpForm({
                bloodType: healthProfile.bloodType,
                height: healthProfile.height.toString(),
                weight: healthProfile.weight.toString(),
                insurance: healthProfile.insuranceNumber || ""
            });
        } else {
            setHpForm({ bloodType: "O", height: "", weight: "", insurance: "" });
        }
        setIsHpModalVisible(true);
    };

    const handleSaveHp = () => {
        const data = {
            bloodType: hpForm.bloodType,
            height: Number(hpForm.height),
            weight: Number(hpForm.weight),
            insuranceNumber: hpForm.insurance
        };
        const action = healthProfile ? updateHP : createHP;
        action({ memberId: id!, data }, { onSuccess: () => setIsHpModalVisible(false) });
    };

    // --- 5. XỬ LÝ BỆNH LÝ ---
    const handleOpenHcModal = (hc?: any) => {
        if (hc) {
            setEditingHcId(hc.conditionId);
            setHcForm({ name: hc.conditionName, note: hc.description });
        } else {
            setEditingHcId(null);
            setHcForm({ name: "", note: "" });
        }
        setIsHcModalVisible(true);
    };

    const handleSaveHc = () => {
        const data = {
            conditionName: hcForm.name,
            description: hcForm.note,
            diagnosedDate: new Date().toISOString(),
            status: "Active"
        };
        if (editingHcId) {
            updateHC({ conditionId: editingHcId, data }, { onSuccess: () => setIsHcModalVisible(false) });
        } else {
            addHC({ memberId: id!, data }, { onSuccess: () => setIsHcModalVisible(false) });
        }
    };

    if (isFetchingMember || isFetchingHealth) return <SafeAreaView className="flex-1 bg-background justify-center items-center"><ActivityIndicator size="large" color="#000" /></SafeAreaView>;
    if (!member) return null;

    const age = member.dateOfBirth ? new Date().getFullYear() - new Date(member.dateOfBirth).getFullYear() : "N/A";
    const dobFormatted = member.dateOfBirth ? new Date(member.dateOfBirth).toLocaleDateString('vi-VN') : "Chưa cập nhật";

    return (
        <SafeAreaView className="flex-1 bg-[#F9F6FC]" edges={["top"]}>
            <View className="flex-row items-center justify-between px-5 pt-3 pb-4">
                <Pressable onPress={() => router.back()} className="w-12 h-12 bg-white border-2 border-black rounded-2xl items-center justify-center active:opacity-80 shadow-sm"><ArrowLeft size={22} color="#000" strokeWidth={2.5} /></Pressable>
                <Text className="text-xl text-black font-space-bold">Hồ sơ chi tiết</Text>
                <Pressable onPress={() => router.push({ pathname: "/(manager)/(family)/edit-member", params: { memberId: id } } as any)} className="w-12 h-12 bg-[#FFD700] border-2 border-black rounded-2xl items-center justify-center active:opacity-80 shadow-sm"><Edit3 size={20} color="#000" strokeWidth={2.5} /></Pressable>
            </View>

            <ScrollView className="flex-1 px-5" contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
                {/* MEMBER HEADER */}
                <View className="items-center mb-6 mt-2">
                    <View className="w-24 h-24 rounded-[32px] border-4 border-black overflow-hidden mb-4 bg-[#A3E6A1] items-center justify-center shadow-sm">
                        {member.avatarUrl ? <Image source={{ uri: member.avatarUrl }} className="w-full h-full" resizeMode="cover" /> : <Text className="text-3xl font-space-bold uppercase text-black">{member.fullName.charAt(0)}</Text>}
                    </View>
                    <Text className="text-2xl text-black font-space-bold text-center">{member.fullName}</Text>
                    <Text className="text-sm text-gray-500 font-space-medium mt-1">{member.role === 'Owner' ? 'Chủ gia đình' : 'Thành viên'} • {age} tuổi</Text>
                </View>

                {/* PERSONAL INFO */}
                <View className="bg-white border-2 border-black rounded-[24px] p-5 mb-6 shadow-sm">
                    <Text className="text-lg text-black font-space-bold mb-4">Thông tin cá nhân</Text>
                    <View className="flex-row justify-between mb-3 border-b-2 border-black/5 pb-3"><Text className="text-sm text-gray-500 font-space-medium">Họ và Tên</Text><Text className="text-sm text-black font-space-bold">{member.fullName}</Text></View>
                    <View className="flex-row justify-between mb-3 border-b-2 border-black/5 pb-3"><Text className="text-sm text-gray-500 font-space-medium">Ngày sinh</Text><Text className="text-sm text-black font-space-bold">{dobFormatted}</Text></View>
                    <View className="flex-row justify-between"><Text className="text-sm text-gray-500 font-space-medium">Giới tính</Text><Text className="text-sm text-black font-space-bold">{member.gender === 'Male' ? 'Nam' : member.gender === 'Female' ? 'Nữ' : 'Khác'}</Text></View>
                </View>

                {/* QR CODE CARD */}
                {!member.userId && (
                    <View className="bg-white border-2 border-black rounded-[32px] p-6 mb-6 shadow-sm items-center relative overflow-hidden">
                        <View className="absolute top-0 right-0 w-20 h-20 bg-[#D9AEF6] rounded-bl-[40px] border-b-2 border-l-2 border-black" />
                        <View className="bg-white/90 self-center px-4 py-1.5 rounded-full border-2 border-black mb-4 z-10 flex-row items-center gap-2">
                            <Text className="text-xs font-space-bold uppercase tracking-wider text-black">Mã đăng nhập thiết bị</Text>
                            <Pressable onPress={handleGenerateQR} className="p-1 active:opacity-60"><RefreshCw size={14} color="#000" strokeWidth={2.5} /></Pressable>
                        </View>
                        <View className="w-48 h-48 bg-white border-4 border-black rounded-3xl items-center justify-center mb-2 p-2 shadow-sm overflow-hidden">
                            {isGeneratingQr ? <ActivityIndicator color="#000" size="large" /> : (timeLeft > 0 && qrImageUrl) ? <Image source={{ uri: qrImageUrl }} className="w-full h-full" resizeMode="contain" /> : <View className="items-center px-4"><Text className="text-center font-space-bold text-red-500 mb-2">Mã đã hết hạn</Text><Pressable onPress={handleGenerateQR} className="bg-black px-4 py-2 rounded-xl"><Text className="text-white text-xs font-space-bold">LẤY MÃ MỚI</Text></Pressable></View>}
                        </View>
                        {timeLeft > 0 && <Text className="text-[10px] text-gray-400 font-space-bold mt-2">Hết hạn sau: <Text className="text-red-500">{formatTime(timeLeft)}</Text></Text>}
                    </View>
                )}

                {/* HEALTH PROFILE (GẮN API) */}
                <View className="bg-[#FFF3E0] border-2 border-black rounded-[24px] p-5 mb-6 shadow-sm">
                    <View className="flex-row items-center justify-between mb-4">
                        <View className="flex-row items-center"><FileText size={20} color="#000" strokeWidth={2.5} /><Text className="text-lg text-black font-space-bold ml-2">Hồ sơ sức khỏe</Text></View>
                        <Pressable onPress={handleOpenHpModal} className="bg-black w-9 h-9 rounded-full items-center justify-center active:opacity-80">{healthProfile ? <Edit3 size={14} color="#FFF" /> : <Plus size={16} color="#FFF" strokeWidth={3} />}</Pressable>
                    </View>
                    {healthProfile ? (
                        <View className="bg-white/50 rounded-2xl p-4 border border-black/10">
                            <View className="flex-row justify-between mb-2"><Text className="text-gray-600 font-space-medium">Chiều cao / Cân nặng</Text><Text className="text-black font-space-bold">{healthProfile.height}cm / {healthProfile.weight}kg</Text></View>
                            <View className="flex-row justify-between"><Text className="text-gray-600 font-space-medium">BMI / Nhóm máu</Text><Text className="text-black font-space-bold">{healthProfile.bmi?.toFixed(1) ?? "--"} / <Text className="text-red-500">{healthProfile.bloodType}</Text></Text></View>
                        </View>
                    ) : <Text className="text-sm text-gray-600 font-space-medium leading-5">Chưa có dữ liệu chiều cao, cân nặng. Bấm nút "+" để tạo mới.</Text>}
                </View>

                {/* HEALTH CONDITIONS (GẮN API) */}
                <View className="bg-[#FFE4E1] border-2 border-black rounded-[24px] p-5 mb-6 shadow-sm">
                    <View className="flex-row items-center justify-between mb-4">
                        <View className="flex-row items-center"><HeartPulse size={20} color="#000" strokeWidth={2.5} /><Text className="text-lg text-black font-space-bold ml-2">Tình trạng bệnh lý</Text></View>
                        {healthProfile && <Pressable onPress={() => handleOpenHcModal()} className="bg-black w-8 h-8 rounded-full items-center justify-center active:opacity-80"><Plus size={16} color="#FFF" strokeWidth={3} /></Pressable>}
                    </View>
                    {!healthProfile ? <Text className="text-sm text-red-500 font-space-bold leading-5">⚠️ Vui lòng tạo "Hồ sơ sức khỏe" trước khi thêm thông tin bệnh lý.</Text> : healthProfile.conditions?.length > 0 ? (
                        <View className="gap-3">{healthProfile.conditions.map((hc) => (
                            <View key={hc.conditionId} className="bg-white/60 rounded-2xl p-4 border border-black/10 flex-row justify-between items-center shadow-sm">
                                <View className="flex-1 mr-2"><Text className="text-black font-space-bold">{hc.conditionName}</Text><Text className="text-gray-600 font-space-medium text-xs mt-1" numberOfLines={1}>{hc.description}</Text></View>
                                <View className="flex-row gap-2">
                                    <Pressable onPress={() => handleOpenHcModal(hc)} className="bg-white w-8 h-8 rounded-full border-2 border-black items-center justify-center"><Edit3 size={12} color="#000" /></Pressable>
                                    <Pressable onPress={() => { Alert.alert("Xác nhận", "Xóa bệnh lý này?", [{ text: "Hủy" }, { text: "Xóa", style: "destructive", onPress: () => deleteHC(hc.conditionId) }]) }} className="bg-[#FFA07A] w-8 h-8 rounded-full border-2 border-black items-center justify-center"><Trash2 size={12} color="#000" /></Pressable>
                                </View>
                            </View>
                        ))}</View>
                    ) : <Text className="text-sm text-gray-600 font-space-medium leading-5">Chưa ghi nhận bệnh lý nền nào.</Text>}
                </View>
            </ScrollView>

            {/* MODAL 1: HEALTH PROFILE */}
            <Modal visible={isHpModalVisible} transparent animationType="fade">
                <Pressable className="flex-1 bg-black/60 justify-center items-center px-5" onPress={() => setIsHpModalVisible(false)}>
                    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="w-full">
                        <Pressable className="bg-[#FFF3E0] border-2 border-black rounded-[32px] p-6 w-full" onPress={(e) => e.stopPropagation()}>
                            <View className="flex-row justify-between items-center mb-6"><Text className="text-xl font-space-bold">Chỉ số sức khỏe</Text><Pressable onPress={() => setIsHpModalVisible(false)}><X size={24} color="#000" /></Pressable></View>
                            <View className="flex-row gap-4 mb-4">
                                <View className="flex-1"><Text className="text-xs font-space-bold mb-1 ml-1 uppercase text-black">Chiều cao (cm)</Text><TextInput value={hpForm.height} onChangeText={(t) => setHpForm({ ...hpForm, height: t })} keyboardType="numeric" className="bg-white border-2 border-black rounded-2xl p-4 font-space-bold" /></View>
                                <View className="flex-1"><Text className="text-xs font-space-bold mb-1 ml-1 uppercase text-black">Cân nặng (kg)</Text><TextInput value={hpForm.weight} onChangeText={(t) => setHpForm({ ...hpForm, weight: t })} keyboardType="numeric" className="bg-white border-2 border-black rounded-2xl p-4 font-space-bold" /></View>
                            </View>
                            <Text className="text-xs font-space-bold mb-1 ml-1 uppercase text-black">Nhóm máu</Text>
                            <View className="flex-row justify-between mb-6">{["A", "B", "AB", "O"].map(t => (<Pressable key={t} onPress={() => setHpForm({ ...hpForm, bloodType: t })} className={`w-[22%] py-3 rounded-xl border-2 border-black items-center ${hpForm.bloodType === t ? 'bg-[#FFD700]' : 'bg-white'}`}><Text className="font-space-bold">{t}</Text></Pressable>))}</View>
                            <Pressable onPress={handleSaveHp} disabled={isCreatingHP || isUpdatingHP} className="bg-black py-4 rounded-[20px] items-center">{(isCreatingHP || isUpdatingHP) ? <ActivityIndicator color="#FFF" /> : <Text className="text-white font-space-bold uppercase">Lưu hồ sơ</Text>}</Pressable>
                        </Pressable>
                    </KeyboardAvoidingView>
                </Pressable>
            </Modal>

            {/* MODAL 2: HEALTH CONDITION */}
            <Modal visible={isHcModalVisible} transparent animationType="fade">
                <Pressable className="flex-1 bg-black/60 justify-center items-center px-5" onPress={() => setIsHcModalVisible(false)}>
                    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="w-full">
                        <Pressable className="bg-[#FFE4E1] border-2 border-black rounded-[32px] p-6 w-full" onPress={(e) => e.stopPropagation()}>
                            <View className="flex-row justify-between items-center mb-6"><Text className="text-xl font-space-bold">{editingHcId ? "Sửa bệnh lý" : "Thêm bệnh lý"}</Text><Pressable onPress={() => setIsHcModalVisible(false)}><X size={24} color="#000" /></Pressable></View>
                            <Text className="text-xs font-space-bold mb-1 ml-1 uppercase text-black">Tên bệnh / Tình trạng</Text>
                            <TextInput value={hcForm.name} onChangeText={(t) => setHcForm({ ...hcForm, name: t })} placeholder="VD: Cao huyết áp" className="bg-white border-2 border-black rounded-2xl p-4 font-space-bold mb-4" />
                            <Text className="text-xs font-space-bold mb-1 ml-1 uppercase text-black">Ghi chú / Mô tả</Text>
                            <TextInput value={hcForm.note} onChangeText={(t) => setHcForm({ ...hcForm, note: t })} multiline placeholder="VD: Cần theo dõi hàng ngày" className="bg-white border-2 border-black rounded-2xl p-4 font-space-bold mb-6 h-24" style={{ textAlignVertical: 'top' }} />
                            <Pressable onPress={handleSaveHc} disabled={isAddingHC || isUpdatingHC || !hcForm.name} className="bg-black py-4 rounded-[20px] items-center">{(isAddingHC || isUpdatingHC) ? <ActivityIndicator color="#FFF" /> : <Text className="text-white font-space-bold uppercase">Xác nhận</Text>}</Pressable>
                        </Pressable>
                    </KeyboardAvoidingView>
                </Pressable>
            </Modal>
        </SafeAreaView>
    );
}