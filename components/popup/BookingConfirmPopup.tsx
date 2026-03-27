import { useSetAtom } from "jotai";
import { 
    Calendar, 
    Check,
    Clock,
    Star,
    User,
    Users,
    ChevronRight,
    ChevronLeft,
    X 
} from "lucide-react-native";
import React, { useState } from "react";
import { Image, Pressable, ScrollView, Text, View } from "react-native";
import { popupAtom } from "../../stores/popupStore";
import { useToast } from "../../stores/toastStore";
import { BottomSheetBase } from "./BottomSheetBase";

// ─── Mock Data ───────────────────────────────────────────────
const MOCK_MEMBERS = [
    { id: '1', name: 'Nguyễn Văn A (Tôi)', avatar: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png', role: 'Chủ hộ' },
    { id: '2', name: 'Trần Thị B (Vợ)', avatar: 'https://cdn-icons-png.flaticon.com/512/4140/4140047.png', role: 'Thành viên' },
    { id: '3', name: 'Nguyễn Văn C (Con trai)', avatar: 'https://cdn-icons-png.flaticon.com/512/4140/4140037.png', role: 'Thành viên' },
    { id: '4', name: 'Nguyễn Thị D (Con gái)', avatar: 'https://cdn-icons-png.flaticon.com/512/4140/4140051.png', role: 'Thành viên' },
    { id: '5', name: 'Lê Văn E (Ông nội)', avatar: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png', role: 'Thành viên' },
];

/**
 * BookingConfirmPopup - Multi-step selection inside one file
 */
export default function BookingConfirmPopup() {
    const setPopup = useSetAtom(popupAtom);
    const toast = useToast();
    
    // Step Control: 'confirm' | 'select'
    const [step, setStep] = useState<'confirm' | 'select'>('confirm');
    const [selectedMember, setSelectedMember] = useState(MOCK_MEMBERS[0]);

    const handleConfirmBooking = () => {
        toast.success(
            "Đặt lịch thành công",
            `Lịch hẹn cho ${selectedMember.name} đã được xác nhận!`
        );
        setPopup(null);
    };

    const toggleMember = (member: typeof MOCK_MEMBERS[0]) => {
        setSelectedMember(member);
        setStep('confirm'); // Quay lại màn hình xác nhận sau khi chọn
    };

    return (
        <BottomSheetBase onClose={() => setPopup(null)}>
            <View style={{ paddingHorizontal: 24, paddingTop: 10, paddingBottom: 25, minHeight: 480 }}>
                
                {/* ════════════════════════════════════════════════
                    STEP 1: CONFIRMATION VIEW
                    ════════════════════════════════════════════════ */}
                {step === 'confirm' && (
                    <View>
                        {/* 1. Header Step 1 */}
                        <View className="flex-row items-center justify-between mb-8">
                            <View className="flex-row items-center gap-x-3">
                                <View className="w-12 h-12 rounded-2xl border-2 border-black bg-[#A3E6A1] items-center justify-center shadow-sm">
                                    <Calendar size={24} color="black" strokeWidth={2.5} />
                                </View>
                                <View>
                                    <Text className="text-xl font-space-bold text-black uppercase tracking-tight text-left">Xác nhận lịch</Text>
                                    <Text className="text-[10px] font-space-medium text-black/40 text-left">Gói khám gia đình Premium</Text>
                                </View>
                            </View>
                            <Pressable 
                                onPress={() => setPopup(null)}
                                className="w-10 h-10 rounded-full border-2 border-black bg-white items-center justify-center shadow-sm"
                            >
                                <X size={20} color="black" strokeWidth={2.5} />
                            </Pressable>
                        </View>

                        {/* 2. Select Box Row */}
                        <View className="mb-6">
                            <Text className="text-[11px] font-space-bold text-black/60 uppercase mb-2 ml-1 text-left tracking-wider">Người khám</Text>
                            <Pressable 
                                onPress={() => setStep('select')}
                                className="flex-row items-center bg-white border-2 border-black rounded-[24px] p-4 shadow-sm active:bg-gray-50 active:translate-y-0.5"
                            >
                                <View className="w-12 h-12 rounded-full border-2 border-black items-center justify-center bg-[#D9AEF6]">
                                    <Image source={{ uri: selectedMember.avatar }} className="w-11 h-11 rounded-full" />
                                </View>
                                <View className="ml-3 flex-1">
                                    <Text className="text-base font-space-bold text-black text-left">{selectedMember.name}</Text>
                                    <Text className="text-[11px] font-space-medium text-black/30 text-left">Nhấn để thay đổi thành viên</Text>
                                </View>
                                <ChevronRight size={24} color="black" strokeWidth={2} />
                            </Pressable>
                        </View>

                        {/* 3. Details Rows */}
                        <View className="mb-10">
                            <View className="flex-row items-center bg-white border-2 border-black rounded-2xl px-4 py-4 mb-3 shadow-sm">
                                <Star size={20} color="#000" strokeWidth={2.5} />
                                <View className="ml-3 flex-1">
                                    <Text className="text-[10px] font-space-bold text-black/30 uppercase leading-tight text-left italic">Chuyên gia tư vấn</Text>
                                    <Text className="text-sm font-space-bold text-black text-left uppercase">Prof. Dr. Logan Mason</Text>
                                </View>
                            </View>

                            <View className="flex-row gap-x-3 mb-3">
                                <View className="flex-1 flex-row items-center bg-white border-2 border-black rounded-2xl px-4 py-3 shadow-sm">
                                    <Calendar size={18} color="#000" strokeWidth={2.5} />
                                    <View className="ml-2">
                                        <Text className="text-[9px] font-space-bold text-black/30 uppercase leading-tight text-left">Ngày</Text>
                                        <Text className="text-xs font-space-bold text-black text-left italic">28/03/2026</Text>
                                    </View>
                                </View>
                                <View className="flex-1 flex-row items-center bg-white border-2 border-black rounded-2xl px-4 py-3 shadow-sm">
                                    <Clock size={16} color="#000" strokeWidth={2.5} />
                                    <View className="ml-2">
                                        <Text className="text-[9px] font-space-bold text-black/30 uppercase leading-tight text-left">Giờ</Text>
                                        <Text className="text-xs font-space-bold text-black text-left italic">09:30 AM</Text>
                                    </View>
                                </View>
                            </View>

                            <View className="flex-row items-center bg-[#A3E6A1] border-2 border-black rounded-2xl px-4 py-4 shadow-sm">
                                <Check size={20} color="#034B1D" strokeWidth={3.5} />
                                <View className="ml-3 flex-1 flex-row items-center justify-between">
                                    <View>
                                        <Text className="text-[10px] font-space-bold text-black/30 uppercase leading-tight text-left">Phí dịch vụ</Text>
                                        <Text className="text-sm font-space-bold text-[#2D5A27] text-left uppercase">Đã bao gồm (Gói Premium)</Text>
                                    </View>
                                </View>
                            </View>
                        </View>

                        {/* 4. Action Buttons Step 1 */}
                        <View className="flex-row gap-x-4">
                            <Pressable 
                                onPress={() => setPopup(null)} 
                                className="flex-1 h-14 bg-white border-2 border-black rounded-2xl items-center justify-center active:bg-gray-50 shadow-sm"
                            >
                                <Text className="font-space-bold uppercase text-black text-sm">Hủy</Text>
                            </Pressable>
                            <Pressable
                                onPress={handleConfirmBooking}
                                className="flex-[2] h-14 bg-[#B3354B] border-2 border-black rounded-2xl items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none"
                            >
                                <Text className="font-space-bold uppercase text-white text-lg">Đặt lịch ngay</Text>
                            </Pressable>
                        </View>
                    </View>
                )}

                {/* ════════════════════════════════════════════════
                    STEP 2: MEMBER SELECTION VIEW
                    ════════════════════════════════════════════════ */}
                {step === 'select' && (
                    <View className="flex-1">
                        {/* 1. Header Step 2 */}
                        <View className="flex-row items-center justify-between mb-8">
                            <View className="flex-row items-center gap-x-3">
                                <Pressable 
                                    onPress={() => setStep('confirm')}
                                    className="w-10 h-10 rounded-xl border-2 border-black bg-white items-center justify-center shadow-sm"
                                >
                                    <ChevronLeft size={24} color="black" strokeWidth={2.5} />
                                </Pressable>
                                <View>
                                    <Text className="text-xl font-space-bold text-black uppercase tracking-tight text-left">Chọn thành viên</Text>
                                    <Text className="text-[10px] font-space-medium text-black/40 text-left">Ai sẽ là người sử dụng dịch vụ này?</Text>
                                </View>
                            </View>
                        </View>

                        {/* 2. Vertical List */}
                        <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 350 }} className="mb-4">
                            {MOCK_MEMBERS.map((member) => {
                                const isSelected = selectedMember.id === member.id;
                                return (
                                    <Pressable 
                                        key={member.id}
                                        onPress={() => toggleMember(member)}
                                        className={`flex-row items-center p-4 rounded-3xl border-2 mb-3 shadow-sm active:translate-y-0.5 ${isSelected ? 'bg-black border-black' : 'bg-white border-black/10'}`}
                                    >
                                        <View className="w-12 h-12 rounded-full border-2 border-black items-center justify-center shadow-sm bg-[#A3E6A1]">
                                            <Image source={{ uri: member.avatar }} className="w-11 h-11 rounded-full" />
                                        </View>
                                        <View className="flex-1 ml-4">
                                            <Text className={`text-[16px] font-space-bold ${isSelected ? 'text-[#A3E6A1]' : 'text-black'} text-left tracking-tight`}>
                                                {member.name}
                                            </Text>
                                            <Text className={`text-[11px] font-space-medium ${isSelected ? 'text-gray-400' : 'text-black/40'} text-left`}>
                                                Vai trò: {member.role}
                                            </Text>
                                        </View>
                                        <View className={`w-8 h-8 rounded-full border-2 items-center justify-center ${isSelected ? 'bg-[#A3E6A1] border-black' : 'bg-gray-100 border-black/10'}`}>
                                            {isSelected && <Check size={16} color="black" strokeWidth={3} />}
                                        </View>
                                    </Pressable>
                                );
                            })}
                        </ScrollView>
                        
                        <Pressable 
                            onPress={() => setStep('confirm')}
                            className="h-14 bg-white border-2 border-black rounded-2xl items-center justify-center active:bg-gray-100 shadow-sm"
                        >
                            <Text className="font-space-bold uppercase text-black">Quay lại</Text>
                        </Pressable>
                    </View>
                )}
            </View>
        </BottomSheetBase>
    );
}
