import { useAtom, useSetAtom } from "jotai";
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
import React, { useState, useEffect } from "react";
import { Image, Pressable, ScrollView, Text, View, ActivityIndicator } from "react-native";
import { popupAtom } from "../../stores/popupStore";
import { useToast } from "../../stores/toastStore";
import { BottomSheetBase } from "./BottomSheetBase";
import { useGetFamilies, useGetFamilyMembers, useGetSubscription } from "../../hooks/useFamily";
import { createAppointment } from "../../apis/appointment.api";
import { router } from "expo-router";
import dayjs from "dayjs";

export default function BookingConfirmPopup() {
    const [popup, setPopup] = useAtom(popupAtom);
    const toast = useToast();
    
    // Appointment info passed via popup.data
    const data = popup?.data;
    
    // Step Control: 'confirm' | 'selectFamily' | 'selectMember'
    const [step, setStep] = useState<'confirm' | 'selectFamily' | 'selectMember'>('confirm');
    
    const [selectedFamilyId, setSelectedFamilyId] = useState<string | null>(null);
    const [selectedMember, setSelectedMember] = useState<any | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { data: families, isLoading: isLoadingFamilies } = useGetFamilies();
    const { data: members, isLoading: isLoadingMembers } = useGetFamilyMembers(selectedFamilyId || undefined);
    const { data: subscription, isLoading: isLoadingSubscription } = useGetSubscription(selectedFamilyId || undefined);

    // Auto-select personal family member initially if available
    useEffect(() => {
        if (families && families.length > 0 && !selectedMember) {
            const personalFamily = families.find((f: any) => f.type === 'Personal');
            if (personalFamily) {
                // We'd ideally need the members of this family, but useGetFamilyMembers is reliant on selectedFamilyId
                // We'll let the user select explicitly for safety, or if we had a single user context we'd use that.
            }
        }
    }, [families]);

    const handleConfirmBooking = async () => {
        if (!selectedMember || !data) {
            toast.error("Lỗi", "Vui lòng chọn người khám.");
            return;
        }

        setIsSubmitting(true);
        try {
            const reqData = {
                doctorId: data.doctorId,
                memberId: selectedMember.memberId,
                availabilityId: data.availabilityId,
                appointmentDate: data.date,
                appointmentTime: data.time
            };

            const res = await createAppointment(reqData);
            
            if (res.success) {
                toast.success(
                    "Đặt lịch thành công",
                    `Lịch hẹn cho ${selectedMember.fullName} đã được xác nhận!`
                );
                setPopup(null);
                // Navigate to appointments tab to view the new booking
                router.replace("/(manager)/(doctor)/appointments" as any);
            } else {
                toast.error("Thất bại", res.message || "Không thể đặt lịch.");
            }
        } catch (error) {
            toast.error("Lỗi", "Có lỗi xảy ra khi gọi API.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const toggleMember = (member: any) => {
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
                                onPress={() => setStep('selectFamily')}
                                className="flex-row items-center bg-white border-2 border-black rounded-[24px] p-4 shadow-sm active:bg-gray-50 active:translate-y-0.5"
                            >
                                {selectedMember ? (
                                    <>
                                        <View className="w-12 h-12 rounded-full border-2 border-black items-center justify-center bg-[#D9AEF6] overflow-hidden">
                                            <Image source={{ uri: selectedMember.avatarUrl || 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png' }} className="w-12 h-12" />
                                        </View>
                                        <View className="ml-3 flex-1">
                                            <Text className="text-base font-space-bold text-black text-left">{selectedMember.fullName}</Text>
                                            <Text className="text-[11px] font-space-medium text-black/30 text-left">Nhấn để thay đổi thành viên</Text>
                                        </View>
                                    </>
                                ) : (
                                    <>
                                        <View className="w-12 h-12 rounded-full border-2 border-black border-dashed items-center justify-center bg-gray-50">
                                            <User size={20} color="black" />
                                        </View>
                                        <View className="ml-3 flex-1">
                                            <Text className="text-base font-space-bold text-black text-left">Chọn người khám</Text>
                                            <Text className="text-[11px] font-space-medium text-black/40 text-left">Bắt buộc</Text>
                                        </View>
                                    </>
                                )}
                                <ChevronRight size={24} color="black" strokeWidth={2} />
                            </Pressable>
                        </View>

                        {/* 3. Details Rows */}
                        <View className="mb-10">
                            <View className="flex-row items-center bg-white border-2 border-black rounded-2xl px-4 py-4 mb-3 shadow-sm">
                                <View className="w-8 h-8 rounded-full border border-black overflow-hidden mr-3">
                                    <Image source={{ uri: data?.avatar || 'https://cdn-icons-png.flaticon.com/512/3845/3842326.png' }} className="w-full h-full" />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-[10px] font-space-bold text-black/30 uppercase leading-tight text-left italic">{data?.specialty || 'Chuyên gia tư vấn'}</Text>
                                    <Text className="text-sm font-space-bold text-black text-left uppercase" numberOfLines={1}>{data?.doctorName || 'Doctor'}</Text>
                                </View>
                            </View>

                            <View className="flex-row gap-x-3 mb-3">
                                <View className="flex-1 flex-row items-center bg-white border-2 border-black rounded-2xl px-4 py-3 shadow-sm">
                                    <Calendar size={18} color="#000" strokeWidth={2.5} />
                                    <View className="ml-2 flex-1">
                                        <Text className="text-[9px] font-space-bold text-black/30 uppercase leading-tight text-left">Ngày</Text>
                                        <Text className="text-xs font-space-bold text-black text-left italic" numberOfLines={1}>{data?.date ? dayjs(data.date).format("DD/MM/YYYY") : 'N/A'}</Text>
                                    </View>
                                </View>
                                <View className="flex-1 flex-row items-center bg-white border-2 border-black rounded-2xl px-4 py-3 shadow-sm">
                                    <Clock size={16} color="#000" strokeWidth={2.5} />
                                    <View className="ml-2 flex-1">
                                        <Text className="text-[9px] font-space-bold text-black/30 uppercase leading-tight text-left">Giờ</Text>
                                        <Text className="text-xs font-space-bold text-black text-left italic" numberOfLines={1}>{data?.displayTime || data?.time || 'N/A'}</Text>
                                    </View>
                                </View>
                            </View>

                            <View className="flex-row items-center bg-[#A3E6A1] border-2 border-black rounded-2xl px-4 py-4 shadow-sm">
                                <Check size={20} color="#034B1D" strokeWidth={3.5} />
                                <View className="ml-3 flex-1">
                                    <Text className="text-[10px] font-space-bold text-black/30 uppercase leading-tight text-left">Phí dịch vụ</Text>
                                    {isLoadingSubscription ? (
                                        <Text className="text-sm font-space-bold text-[#2D5A27] text-left uppercase">Đang tải gói...</Text>
                                    ) : subscription ? (
                                        <View>
                                            <Text className="text-sm font-space-bold text-[#2D5A27] text-left uppercase">
                                                {subscription.packageName}
                                            </Text>
                                            <Text className="text-[10px] font-space-medium text-[#166534] text-left">
                                                Còn {subscription.remainingConsultantCount}/{subscription.consultantLimit} buổi khám
                                            </Text>
                                        </View>
                                    ) : (
                                        <Text className="text-sm font-space-bold text-[#DC2626] text-left uppercase">Chưa có gói dịch vụ</Text>
                                    )}
                                </View>
                            </View>
                        </View>

                        {/* 4. Action Buttons Step 1 */}
                        <View className="flex-row gap-x-4">
                            <Pressable 
                                onPress={() => setPopup(null)} 
                                disabled={isSubmitting}
                                className="flex-1 h-14 bg-white border-2 border-black rounded-2xl items-center justify-center active:bg-gray-50 shadow-sm opacity-90"
                            >
                                <Text className="font-space-bold uppercase text-black text-sm">Hủy</Text>
                            </Pressable>
                            <Pressable
                                onPress={handleConfirmBooking}
                                disabled={isSubmitting || !selectedMember}
                                className={`flex-[2] h-14 border-2 border-black rounded-2xl items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none ${isSubmitting || !selectedMember ? 'bg-[#ff7b8f]' : 'bg-[#B3354B]'}`}
                            >
                                {isSubmitting ? (
                                    <Text className="font-space-bold uppercase text-white text-lg">Đang xử lý...</Text>
                                ) : (
                                    <Text className="font-space-bold uppercase text-white text-lg">Đặt lịch ngay</Text>
                                )}
                            </Pressable>
                        </View>
                    </View>
                )}

                {/* ════════════════════════════════════════════════
                    STEP 2: FAMILY SELECTION VIEW
                    ════════════════════════════════════════════════ */}
                {step === 'selectFamily' && (
                    <View className="flex-1">
                        <View className="flex-row items-center justify-between mb-8">
                            <View className="flex-row items-center gap-x-3">
                                <Pressable 
                                    onPress={() => setStep('confirm')}
                                    className="w-10 h-10 rounded-xl border-2 border-black bg-white items-center justify-center shadow-sm"
                                >
                                    <ChevronLeft size={24} color="black" strokeWidth={2.5} />
                                </Pressable>
                                <View>
                                    <Text className="text-xl font-space-bold text-black uppercase tracking-tight text-left">Chọn gia đình</Text>
                                    <Text className="text-[10px] font-space-medium text-black/40 text-left">Lịch khám này thuộc nhóm nào?</Text>
                                </View>
                            </View>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 350 }} className="mb-4">
                            {isLoadingFamilies ? (
                                <Text className="text-center font-space-medium mt-4">Đang tải danh sách gia đình...</Text>
                            ) : (
                                families?.map((family: any) => (
                                    <Pressable
                                        key={family.familyId}
                                        onPress={() => {
                                            setSelectedFamilyId(family.familyId);
                                            setStep('selectMember');
                                        }}
                                        className="flex-row items-center p-4 rounded-3xl border-2 bg-white border-black/10 mb-3 shadow-sm active:translate-y-0.5"
                                    >
                                        <View className="w-12 h-12 rounded-full border-2 border-black items-center justify-center shadow-sm bg-[#D9AEF6] overflow-hidden">
                                            {family.familyAvatarUrl ? (
                                                <Image source={{ uri: family.familyAvatarUrl }} className="w-full h-full" />
                                            ) : (
                                                <Users size={20} color="black" />
                                            )}
                                        </View>
                                        <View className="flex-1 ml-4">
                                            <Text className="text-[16px] font-space-bold text-black text-left tracking-tight">
                                                {family.familyName}
                                            </Text>
                                            <Text className="text-[11px] font-space-medium text-black/40 text-left">
                                                {family.type === 'Personal' ? 'Cá nhân' : 'Dùng chung'} • {family.memberCount} thành viên
                                            </Text>
                                        </View>
                                        <ChevronRight size={24} color="black" />
                                    </Pressable>
                                ))
                            )}
                        </ScrollView>
                        
                        <Pressable 
                            onPress={() => setStep('confirm')}
                            className="h-14 bg-white border-2 border-black rounded-2xl items-center justify-center active:bg-gray-100 shadow-sm"
                        >
                            <Text className="font-space-bold uppercase text-black">Quay lại</Text>
                        </Pressable>
                    </View>
                )}

                {/* ════════════════════════════════════════════════
                    STEP 3: MEMBER SELECTION VIEW
                    ════════════════════════════════════════════════ */}
                {step === 'selectMember' && (
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
                            {isLoadingMembers ? (
                                <Text className="text-center font-space-medium mt-4">Đang tải thành viên...</Text>
                            ) : members?.map((member: any) => {
                                const isSelected = selectedMember?.memberId === member.memberId;
                                return (
                                    <Pressable 
                                        key={member.memberId}
                                        onPress={() => toggleMember(member)}
                                        className={`flex-row items-center p-4 rounded-3xl border-2 mb-3 shadow-sm active:translate-y-0.5 ${isSelected ? 'bg-black border-black' : 'bg-white border-black/10'}`}
                                    >
                                        <View className="w-12 h-12 rounded-full border-2 border-black items-center justify-center shadow-sm bg-[#A3E6A1] overflow-hidden">
                                            {member.avatarUrl ? (
                                                <Image source={{ uri: member.avatarUrl }} className="w-full h-full" />
                                            ) : (
                                                <User size={20} color="black" />
                                            )}
                                        </View>
                                        <View className="flex-1 ml-4">
                                            <Text className={`text-[16px] font-space-bold ${isSelected ? 'text-[#A3E6A1]' : 'text-black'} text-left tracking-tight`}>
                                                {member.fullName}
                                            </Text>
                                            <Text className={`text-[11px] font-space-medium ${isSelected ? 'text-gray-400' : 'text-black/40'} text-left`}>
                                                Vai trò: {member.role || 'Thành viên'}
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
                            onPress={() => setStep('selectFamily')}
                            className="h-14 bg-white border-2 border-black rounded-2xl items-center justify-center active:bg-gray-100 shadow-sm"
                        >
                            <Text className="font-space-bold uppercase text-black">Chọn gia đình khác</Text>
                        </Pressable>
                    </View>
                )}
            </View>
        </BottomSheetBase>
    );
}
