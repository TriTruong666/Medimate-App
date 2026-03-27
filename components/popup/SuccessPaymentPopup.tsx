import { Check, Crown, Star, CreditCard, Landmark } from 'lucide-react-native';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { BottomSheetBase } from './BottomSheetBase';
import dayjs from 'dayjs';

interface SuccessPaymentPopupProps {
    plan: {
        id: string;
        name: string;
        price: string;
        priceNote: string;
        color: string;
        badge: string;
    };
    method: 'credit' | 'banking';
    onClose: () => void;
}

export const SuccessPaymentPopup: React.FC<SuccessPaymentPopupProps> = ({
    plan,
    method,
    onClose,
}) => {
    const isPremium = plan.id === 'premium';
    const accentColor = isPremium ? '#FFD700' : '#A3E6A1';

    return (
        <BottomSheetBase onClose={onClose}>
            <View
                style={{
                    backgroundColor: '#FFF',
                    borderTopLeftRadius: 32,
                    borderTopRightRadius: 32,
                    paddingTop: 16,
                    paddingBottom: 48,
                    paddingHorizontal: 28,
                }}
            >
                {/* Drag handle (Blackbird style) */}
                <View style={{ alignItems: 'center', marginBottom: 24 }}>
                    <View style={{ width: 44, height: 4, borderRadius: 2, backgroundColor: 'rgba(0,0,0,0.08)' }} />
                </View>

                {/* Brand Tag (White theme) */}
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 16 }}>
                    <Text style={{ fontFamily: 'SpaceGrotesk_700Bold', fontSize: 13, color: '#000', letterSpacing: 1.5, textTransform: 'uppercase' }}>
                        Medimate
                    </Text>
                    <View style={{ backgroundColor: '#000', paddingHorizontal: 6, paddingVertical: 1, borderRadius: 4 }}>
                        <Text style={{ fontFamily: 'SpaceGrotesk_700Bold', fontSize: 8, color: '#FFF', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                            Pay
                        </Text>
                    </View>
                </View>

                {/* Big Thank You Message (White theme) */}
                <View style={{ marginBottom: 40 }}>
                    <Text style={{ fontFamily: 'SpaceGrotesk_700Bold', fontSize: 29, color: '#000', lineHeight: 36, letterSpacing: -0.5 }}>
                        Cảm ơn bạn đã đăng ký{' '}
                        <Text style={{ color: isPremium ? '#B8860B' : '#2D5A27' }}>
                            Medimate {plan.name}
                        </Text>
                        . Hóa đơn sẽ được gửi qua email.
                    </Text>
                </View>

                {/* ─── Transaction Details (Detailed as requested) ─── */}

                {/* Amount Row */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 18, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.06)' }}>
                    <Text style={{ fontFamily: 'SpaceGrotesk_700Bold', fontSize: 12, color: 'rgba(0,0,0,0.3)', letterSpacing: 1.5, textTransform: 'uppercase' }}>
                        Tổng thanh toán
                    </Text>
                    <Text style={{ fontFamily: 'SpaceGrotesk_700Bold', fontSize: 16, color: '#000' }}>
                        {plan.price}
                    </Text>
                </View>

                {/* Method Row */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 18, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.06)' }}>
                    <Text style={{ fontFamily: 'SpaceGrotesk_700Bold', fontSize: 12, color: 'rgba(0,0,0,0.3)', letterSpacing: 1.5, textTransform: 'uppercase' }}>
                        Phương thức
                    </Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <View style={{ width: 26, height: 18, borderRadius: 4, backgroundColor: 'rgba(0,0,0,0.04)', alignItems: 'center', justifyContent: 'center' }}>
                            {method === 'credit'
                                ? <CreditCard size={12} color="#000" />
                                : <Landmark size={12} color="#000" />
                            }
                        </View>
                        <Text style={{ fontFamily: 'SpaceGrotesk_700Bold', fontSize: 13, color: '#000' }}>
                            {method === 'credit' ? 'VISA / MASTER' : 'QR chuyển khoản'}
                        </Text>
                    </View>
                </View>

                {/* Service Row */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 18, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.06)' }}>
                    <Text style={{ fontFamily: 'SpaceGrotesk_700Bold', fontSize: 12, color: 'rgba(0,0,0,0.3)', letterSpacing: 1.5, textTransform: 'uppercase' }}>
                        Dịch vụ
                    </Text>
                    <Text style={{ fontFamily: 'SpaceGrotesk_700Bold', fontSize: 14, color: '#000' }}>
                        Medimate {plan.name}
                    </Text>
                </View>

                {/* Date Row */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 18, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.06)' }}>
                    <Text style={{ fontFamily: 'SpaceGrotesk_700Bold', fontSize: 12, color: 'rgba(0,0,0,0.3)', letterSpacing: 1.5, textTransform: 'uppercase' }}>
                        Ngày thanh toán
                    </Text>
                    <Text style={{ fontFamily: 'SpaceGrotesk_700Bold', fontSize: 14, color: '#000' }}>
                        {dayjs().format('DD/MM/YYYY')}
                    </Text>
                </View>

                {/* Renewal Row */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 18, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.06)' }}>
                    <Text style={{ fontFamily: 'SpaceGrotesk_700Bold', fontSize: 12, color: 'rgba(0,0,0,0.3)', letterSpacing: 1.5, textTransform: 'uppercase' }}>
                        Gia hạn
                    </Text>
                    <Text style={{ fontFamily: 'SpaceGrotesk_700Bold', fontSize: 14, color: '#000' }}>
                        {plan.priceNote}
                    </Text>
                </View>

                {/* Reward Highlight (Green accent) */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 18 }}>
                    <Text style={{ fontFamily: 'SpaceGrotesk_700Bold', fontSize: 12, color: '#2D5A27', letterSpacing: 1.5, textTransform: 'uppercase' }}>
                        Medimate Reward
                    </Text>
                    <Text style={{ fontFamily: 'SpaceGrotesk_700Bold', fontSize: 14, color: '#2D5A27' }}>
                        +50 điểm 🎁
                    </Text>
                </View>

                {/* Outlined Got It Button (Blackbird white style) */}
                <Pressable
                    onPress={onClose}
                    style={{
                        marginTop: 20,
                        height: 58,
                        borderWidth: 1.5,
                        borderColor: '#000',
                        borderRadius: 20,
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: 'transparent',
                    }}
                >
                    <Text style={{ fontFamily: 'SpaceGrotesk_700Bold', fontSize: 17, color: '#000' }}>
                        Đã hiểu
                    </Text>
                </Pressable>
            </View>
        </BottomSheetBase>
    );
};
