import { getFamilies } from '@/apis/family.api';
import { createPayment } from '@/apis/payment.api';
import { FamilyData } from '@/types/Family';
import { CreatePaymentRequest } from '@/types/Payment';
import { useRouter } from 'expo-router';
import { Check, Crown, Landmark, Shield, Star, Users, X } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { BottomSheetBase } from './BottomSheetBase';

interface CheckoutPopupProps {
    plan: {
        packageId: string;
        name: string;
        price: string;
        priceNote: string;
        color: string;
        badge: string;
    };
    onClose: () => void;
    onConfirm: () => void;
}

type Step = 'select_family' | 'payment';

export const CheckoutPopup: React.FC<CheckoutPopupProps> = ({ plan, onClose, onConfirm }) => {
    const router = useRouter();

    const [step, setStep] = useState<Step>('select_family');
    const [families, setFamilies] = useState<FamilyData[]>([]);
    const [selectedFamily, setSelectedFamily] = useState<FamilyData | null>(null);
    const [familiesLoading, setFamiliesLoading] = useState(true);
    const [paying, setPaying] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const isPremium = plan.badge === 'CAO CẤP';
    const headerColor = isPremium ? '#FFD700' : '#A3E6A1';

    useEffect(() => {
        (async () => {
            const res = await getFamilies();
            if (res.success && res.data) {
                const shared = res.data.filter(f => f.type === 'Shared');
                setFamilies(shared);
                if (shared.length === 1) setSelectedFamily(shared[0]);
            }
            setFamiliesLoading(false);
        })();
    }, []);

    const handlePayment = async () => {
        if (!selectedFamily) return;
        setPaying(true);
        setErrorMsg('');

        const body: CreatePaymentRequest = {
            packageId: plan.packageId,
            familyId: selectedFamily.familyId,
            buyerName: selectedFamily.familyName,
            buyerEmail: 'user@medimate.vn',
            buyerPhone: '0900000000',
            returnUrl: 'medimate://payment/success',
            cancelUrl: 'medimate://payment/cancel',
        };

        const res = await createPayment(body);
        setPaying(false);

        if (res.success && res.data?.paymentUrl) {
            onClose();
            router.push({
                pathname: '/payment-webview',
                params: {
                    url: res.data.paymentUrl,
                    qrCode: res.data.qrCode ?? '',
                    planName: plan.name,
                    familyName: selectedFamily.familyName,
                    price: plan.price,
                    orderCode: String(res.data.orderCode ?? ''),
                },
            });
        } else {
            setErrorMsg(res.message ?? 'Thanh toán thất bại. Vui lòng thử lại.');
        }
    };

    return (
        <BottomSheetBase onClose={onClose} centered={false}>

            {/* ════════════════════════════════════
                STEP 1 — CHỌN GIA ĐÌNH
            ════════════════════════════════════ */}
            {step === 'select_family' && (
                <View style={{ paddingHorizontal: 24, paddingTop: 8 }}>
                    {/* Header */}
                    <View className="flex-row items-center justify-between mb-6">
                        <View className="flex-row items-center gap-x-3">
                            <View
                                className="w-12 h-12 rounded-2xl border-2 border-black items-center justify-center"
                                style={{ backgroundColor: headerColor }}
                            >
                                <Users size={24} color="black" />
                            </View>
                            <View>
                                <Text className="text-xl font-space-bold text-black">Chọn gia đình</Text>
                                <Text className="text-xs font-space-medium text-gray-500">
                                    Gói {plan.name} — {plan.price}
                                </Text>
                            </View>
                        </View>
                        <Pressable
                            onPress={onClose}
                            className="w-10 h-10 rounded-full border-2 border-black bg-white items-center justify-center shadow-sm"
                        >
                            <X size={20} color="black" strokeWidth={2.5} />
                        </Pressable>
                    </View>

                    {/* Family list */}
                    {familiesLoading ? (
                        <View className="items-center py-10">
                            <ActivityIndicator size="small" color="#000" />
                            <Text className="mt-2 text-xs font-space-medium text-black/40">
                                Đang tải danh sách gia đình...
                            </Text>
                        </View>
                    ) : families.length === 0 ? (
                        <View className="items-center py-10 px-4">
                            <Shield size={40} color="#CCC" />
                            <Text className="mt-3 text-sm font-space-bold text-black/50 text-center">
                                Bạn chưa có gia đình nào.{'\n'}Hãy tạo gia đình trước khi đăng ký gói.
                            </Text>
                        </View>
                    ) : (
                        <View className="gap-y-3 mb-6">
                            {families.map((fam) => {
                                const isSel = selectedFamily?.familyId === fam.familyId;
                                return (
                                    <Pressable
                                        key={fam.familyId}
                                        onPress={() => setSelectedFamily(fam)}
                                        style={{
                                            borderWidth: 2,
                                            borderColor: isSel ? '#000' : '#E0E0E0',
                                            borderRadius: 20,
                                            padding: 16,
                                            backgroundColor: isSel ? headerColor : '#FFF',
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            gap: 12,
                                            shadowColor: '#000',
                                            shadowOffset: isSel ? { width: 3, height: 3 } : { width: 0, height: 0 },
                                            shadowOpacity: isSel ? 1 : 0,
                                            shadowRadius: 0,
                                            elevation: isSel ? 3 : 0,
                                        }}
                                    >
                                        <View style={{ width: 44, height: 44, borderRadius: 14, borderWidth: 2, borderColor: '#000', backgroundColor: '#F9F6FC', alignItems: 'center', justifyContent: 'center' }}>
                                            <Users size={22} color="#000" strokeWidth={2} />
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Text className="text-base font-space-bold text-black">{fam.familyName}</Text>
                                            <Text className="text-xs font-space-medium text-black/50">{fam.memberCount} thành viên</Text>
                                        </View>
                                        {isSel && (
                                            <View className="w-7 h-7 rounded-full bg-black items-center justify-center">
                                                <Check size={16} color="#FFF" strokeWidth={3} />
                                            </View>
                                        )}
                                    </Pressable>
                                );
                            })}
                        </View>
                    )}

                    {/* Buttons */}
                    <View className="flex-row gap-x-4 mt-2">
                        <Pressable
                            onPress={onClose}
                            className="flex-1 h-14 bg-white border-2 border-black rounded-2xl items-center justify-center"
                        >
                            <Text className="font-space-bold uppercase text-black">Hủy</Text>
                        </Pressable>
                        <Pressable
                            onPress={() => { if (selectedFamily) setStep('payment'); }}
                            disabled={!selectedFamily || familiesLoading}
                            style={{
                                flex: 1,
                                height: 56,
                                borderWidth: 2,
                                borderColor: '#000',
                                borderRadius: 16,
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: selectedFamily && !familiesLoading ? '#000' : '#DDD',
                            }}
                        >
                            <Text className="font-space-bold uppercase text-white">Tiếp tục</Text>
                        </Pressable>
                    </View>
                </View>
            )}

            {/* ════════════════════════════════════
                STEP 2 — XÁC NHẬN & THANH TOÁN
            ════════════════════════════════════ */}
            {step === 'payment' && (
                <View style={{ paddingHorizontal: 24, paddingTop: 8 }}>
                    {/* Header */}
                    <View className="flex-row items-center justify-between mb-6">
                        <View className="flex-row items-center gap-x-3">
                            <View
                                className="w-12 h-12 rounded-2xl border-2 border-black items-center justify-center"
                                style={{ backgroundColor: headerColor }}
                            >
                                {isPremium ? <Crown size={24} color="black" /> : <Star size={24} color="black" />}
                            </View>
                            <View>
                                <Text className="text-xl font-space-bold text-black">Xác nhận</Text>
                                <Text className="text-xs font-space-medium text-gray-500">Gói {plan.name}</Text>
                            </View>
                        </View>
                        <Pressable
                            onPress={onClose}
                            className="w-10 h-10 rounded-full border-2 border-black bg-white items-center justify-center shadow-sm"
                        >
                            <X size={20} color="black" strokeWidth={2.5} />
                        </Pressable>
                    </View>

                    {/* Summary card */}
                    <View style={{ borderWidth: 2, borderColor: '#000', borderRadius: 20, padding: 20, backgroundColor: headerColor, marginBottom: 20, gap: 10 }}>
                        <View className="flex-row justify-between items-center">
                            <Text className="text-xs font-space-bold text-black/60 uppercase tracking-wider">Gói dịch vụ</Text>
                            <Text className="text-base font-space-bold text-black">{plan.name}</Text>
                        </View>
                        <View className="flex-row justify-between items-center">
                            <Text className="text-xs font-space-bold text-black/60 uppercase tracking-wider">Gia đình</Text>
                            <Text className="text-base font-space-bold text-black">{selectedFamily?.familyName}</Text>
                        </View>
                        <View className="h-[1px] bg-black/10 my-1" />
                        <View className="flex-row justify-between items-center">
                            <Text className="text-xs font-space-bold text-black/60 uppercase tracking-wider">Tổng cộng</Text>
                            <Text className="text-xl font-space-bold text-black">{plan.price}</Text>
                        </View>
                    </View>

                    {/* PayOS info */}
                    <View className="flex-row items-center gap-x-3 mb-5 px-4 py-3 bg-white border-2 border-black/10 rounded-2xl">
                        <Landmark size={22} color="#555" strokeWidth={2} />
                        <Text className="flex-1 text-sm font-space-medium text-black/60 leading-5">
                            Trang thanh toán <Text className="font-space-bold text-black">PayOS</Text> sẽ mở ngay sau khi bấm thanh toán.
                        </Text>
                    </View>

                    {errorMsg ? (
                        <Text className="text-sm font-space-bold text-red-500 text-center mb-4">{errorMsg}</Text>
                    ) : null}

                    {/* Buttons */}
                    <View className="flex-row gap-x-4">
                        <Pressable
                            onPress={() => setStep('select_family')}
                            className="flex-1 h-14 bg-white border-2 border-black rounded-2xl items-center justify-center"
                        >
                            <Text className="font-space-bold uppercase text-black">Quay lại</Text>
                        </Pressable>
                        <Pressable
                            onPress={handlePayment}
                            disabled={paying}
                            style={{
                                flex: 1,
                                height: 56,
                                borderWidth: 2,
                                borderColor: '#000',
                                borderRadius: 16,
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: paying ? '#DDD' : headerColor,
                            }}
                        >
                            {paying
                                ? <ActivityIndicator size="small" color="#000" />
                                : <Text className="font-space-bold uppercase text-black">Thanh toán</Text>}
                        </Pressable>
                    </View>
                </View>
            )}
        </BottomSheetBase>
    );
};
