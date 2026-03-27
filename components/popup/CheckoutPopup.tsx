import { Check, CreditCard, Crown, Shield, Star, X, Landmark, QrCode, Sparkles, Hash, Calendar, Clock } from 'lucide-react-native';
import React, { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { BottomSheetBase } from './BottomSheetBase';
import dayjs from 'dayjs';

interface CheckoutPopupProps {
    plan: {
        id: string;
        name: string;
        price: string;
        priceNote: string;
        color: string;
        badge: string;
    };
    onClose: () => void;
    onConfirm: () => void;
}

type PaymentMethod = 'credit' | 'banking';

export const CheckoutPopup: React.FC<CheckoutPopupProps> = ({
    plan,
    onClose,
    onConfirm,
}) => {
    const [method, setMethod] = useState<PaymentMethod>('credit');
    const [cardNumber, setCardNumber] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvv, setCvv] = useState('');
    const [step, setStep] = useState<'payment' | 'success'>('payment');

    const isPremium = plan.id === 'premium';
    const headerColor = isPremium ? '#FFD700' : '#A3E6A1';
    const accentColor = isPremium ? '#B8860B' : '#2D5A27';

    const formatCard = (text: string) => {
        const cleaned = text.replace(/\D/g, '').slice(0, 16);
        return cleaned.replace(/(.{4})/g, '$1 ').trim();
    };

    const formatExpiry = (text: string) => {
        const cleaned = text.replace(/\D/g, '').slice(0, 4);
        if (cleaned.length >= 3) {
            return cleaned.slice(0, 2) + '/' + cleaned.slice(2);
        }
        return cleaned;
    };

    const isFormValid = method === 'banking' || (cardNumber.replace(/\s/g, '').length === 16 && expiry.length === 5 && cvv.length === 3);

    const handlePayment = () => {
        // Switch internally to avoid "double popup" issues
        setStep('success');
    };

    const handleDone = () => {
        onClose();
    };

    return (
        <BottomSheetBase onClose={handleDone} centered={step === 'success'}>
            {step === 'payment' ? (
                /* ═══════════════════════════════════════════════
                   PAYMENT VIEW — Bottom Sheet Style (Light)
                   ═══════════════════════════════════════════════ */
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
                                <Text className="text-xl font-space-bold text-black font-space-bold">Thanh toán</Text>
                                <Text className="text-xs font-space-medium text-gray-500 font-space-medium">Gói {plan.name}</Text>
                            </View>
                        </View>
                        <Pressable
                            onPress={onClose}
                            className="w-10 h-10 rounded-full border-2 border-black bg-white items-center justify-center shadow-sm"
                        >
                            <X size={20} color="black" strokeWidth={2.5} />
                        </Pressable>
                    </View>

                    {/* Method Tabs */}
                    <View className="flex-row gap-x-3 mb-6">
                        <Pressable
                            onPress={() => setMethod('credit')}
                            style={{
                                flex: 1,
                                height: 52,
                                borderWidth: 2,
                                borderColor: '#000',
                                borderRadius: 16,
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 8,
                                backgroundColor: method === 'credit' ? '#000' : '#FFF',
                            }}
                        >
                            <CreditCard size={18} color={method === 'credit' ? '#FFF' : '#000'} strokeWidth={2.5} />
                            <Text className="font-space-bold uppercase text-[11px]" style={{ color: method === 'credit' ? '#FFF' : '#000' }}>
                                Thẻ tín dụng
                            </Text>
                        </Pressable>
                        <Pressable
                            onPress={() => setMethod('banking')}
                            style={{
                                flex: 1,
                                height: 52,
                                borderWidth: 2,
                                borderColor: '#000',
                                borderRadius: 16,
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 8,
                                backgroundColor: method === 'banking' ? '#000' : '#FFF',
                            }}
                        >
                            <Landmark size={18} color={method === 'banking' ? '#FFF' : '#000'} strokeWidth={2.5} />
                            <Text className="font-space-bold uppercase text-[11px]" style={{ color: method === 'banking' ? '#FFF' : '#000' }}>
                                Banking QR
                            </Text>
                        </Pressable>
                    </View>

                    {/* Form/QR */}
                    <View className="mb-4">
                        {method === 'credit' ? (
                            <View>
                                <View className="flex-row items-center bg-white border-2 border-black rounded-2xl px-4 py-1 mb-3 shadow-sm">
                                    <CreditCard size={20} color="#000" strokeWidth={2} />
                                    <TextInput
                                        className="flex-1 h-12 ml-3 font-space-bold text-black"
                                        placeholder="0000 0000 0000 0000"
                                        placeholderTextColor="#A0A0A0"
                                        value={cardNumber}
                                        onChangeText={(t) => setCardNumber(formatCard(t))}
                                        keyboardType="number-pad"
                                        maxLength={19}
                                    />
                                </View>
                                <View className="flex-row gap-x-3">
                                    <View className="flex-1 flex-row items-center bg-white border-2 border-black rounded-2xl px-4 py-1 shadow-sm">
                                        <TextInput className="flex-1 h-12 font-space-bold text-black" placeholder="MM/YY" placeholderTextColor="#A0A0A0" value={expiry} onChangeText={formatExpiry} keyboardType="number-pad" maxLength={5} />
                                    </View>
                                    <View className="flex-1 flex-row items-center bg-white border-2 border-black rounded-2xl px-4 py-1 shadow-sm">
                                        <TextInput className="flex-1 h-12 font-space-bold text-black" placeholder="CVV" placeholderTextColor="#A0A0A0" value={cvv} onChangeText={t => setCvv(t.replace(/\D/g, '').slice(0, 3))} keyboardType="number-pad" maxLength={3} secureTextEntry />
                                    </View>
                                </View>
                            </View>
                        ) : (
                            <View style={{ width: '100%', borderWidth: 2, borderColor: '#000', borderRadius: 24, padding: 16, backgroundColor: '#FFF', alignItems: 'center' }}>
                                <View className="w-[140px] h-[140px] bg-[#F9F6FC] rounded-2xl border-2 border-black items-center justify-center relative">
                                    <QrCode size={90} color="#000" strokeWidth={1} />
                                </View>
                                <Text className="text-[10px] font-space-bold text-black/40 text-center mt-3 uppercase tracking-widest">Quét mã QR để thanh toán</Text>
                            </View>
                        )}
                    </View>

                    {/* Confirm Button */}
                    <View className="flex-row gap-x-4 mt-2">
                        <Pressable onPress={onClose} className="flex-1 h-14 bg-white border-2 border-black rounded-2xl items-center justify-center">
                            <Text className="font-space-bold uppercase text-black">Hủy</Text>
                        </Pressable>
                        <Pressable
                            onPress={handlePayment}
                            disabled={!isFormValid}
                            style={{ flex: 1, height: 56, borderWidth: 2, borderColor: '#000', borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: isFormValid ? headerColor : '#DDD' }}
                        >
                            <Text className="font-space-bold uppercase text-black">Thanh toán</Text>
                        </Pressable>
                    </View>
                </View>
            ) : (
                /* ═══════════════════════════════════════════════
                   SUCCESS VIEW — Blackbird Pay Style (Centered White)
                   ═══════════════════════════════════════════════ */
                <View style={{ backgroundColor: '#FFF', borderRadius: 28, padding: 28, width: '100%', shadowColor: '#000', shadowOffset: { width: 4, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 12 }}>
                    
                    {/* Brand Tag */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 16 }}>
                        <Text style={{ fontFamily: 'SpaceGrotesk_700Bold', fontSize: 13, color: '#000', letterSpacing: 1.5, textTransform: 'uppercase' }}>MEDIMATE</Text>
                        <View style={{ backgroundColor: '#000', paddingHorizontal: 6, paddingVertical: 1, borderRadius: 4 }}>
                            <Text style={{ fontFamily: 'SpaceGrotesk_700Bold', fontSize: 8, color: '#FFF', textTransform: 'uppercase' }}>PAY</Text>
                        </View>
                    </View>

                    {/* Message */}
                    <View style={{ marginBottom: 32 }}>
                        <Text style={{ fontFamily: 'SpaceGrotesk_700Bold', fontSize: 28, color: '#000', lineHeight: 36, letterSpacing: -0.5 }}>
                            Cảm ơn đã đăng ký <Text style={{ color: accentColor }}>Medimate {plan.name}</Text>. Hóa đơn sẽ được gửi sớm.
                        </Text>
                    </View>

                    {/* Receipt Details (Ref Image Style) */}
                    <View style={{ marginBottom: 24 }}>
                        {[
                            { label: 'Số tiền', value: plan.price },
                            { label: 'Phương thức', value: method === 'credit' ? 'VISA/MASTER' : 'QR CHUYÊN KHOẢN' },
                            { label: 'Dịch vụ', value: plan.name },
                            { label: 'Gia hạn', value: plan.priceNote },
                        ].map((item, idx) => (
                            <View key={idx} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 16, borderBottomWidth: idx === 3 ? 0 : 1, borderBottomColor: 'rgba(0,0,0,0.06)' }}>
                                <Text style={{ fontFamily: 'SpaceGrotesk_700Bold', fontSize: 11, color: '#AAA', textTransform: 'uppercase', letterSpacing: 1 }}>{item.label}</Text>
                                <Text style={{ fontFamily: 'SpaceGrotesk_700Bold', fontSize: 14, color: '#000' }}>{item.value}</Text>
                            </View>
                        ))}
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 16 }}>
                            <Text style={{ fontFamily: 'SpaceGrotesk_700Bold', fontSize: 11, color: accentColor, textTransform: 'uppercase' }}>Medimate Reward</Text>
                            <Text style={{ fontFamily: 'SpaceGrotesk_700Bold', fontSize: 14, color: accentColor }}>+50 Điểm 🎁</Text>
                        </View>
                    </View>

                    {/* Outlined Button */}
                    <Pressable
                        onPress={handleDone}
                        style={{ height: 60, borderWidth: 1.5, borderColor: '#000', borderRadius: 20, alignItems: 'center', justifyContent: 'center' }}
                    >
                        <Text style={{ fontFamily: 'SpaceGrotesk_700Bold', fontSize: 17, color: '#000' }}>Đã hiểu</Text>
                    </Pressable>
                </View>
            )}
        </BottomSheetBase>
    );
};
