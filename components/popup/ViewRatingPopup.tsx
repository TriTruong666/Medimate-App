import dayjs from 'dayjs';
import { useAtomValue } from 'jotai';
import { Star } from 'lucide-react-native';
import React from 'react';
import {
    Pressable,
    ScrollView,
    Text,
    View,
} from 'react-native';
import { activePopupAtom, usePopup } from '../../stores/popupStore';
import { BottomSheetBase } from './BottomSheetBase';

const RATING_LABELS: Record<number, { label: string; color: string }> = {
    1: { label: 'Rất tệ', color: '#EF4444' },
    2: { label: 'Kém', color: '#F97316' },
    3: { label: 'Bình thường', color: '#F59E0B' },
    4: { label: 'Rất tốt', color: '#10B981' },
    5: { label: 'Tuyệt vời! ✨', color: '#8B5CF6' },
};

export default function ViewRatingPopup() {
    const { close } = usePopup();
    const activePopup = useAtomValue(activePopupAtom);

    // Data passed when opening popup
    const doctorName: string = activePopup?.data?.doctorName || 'Bác sĩ';
    const doctorSpecialty: string = activePopup?.data?.doctorSpecialty || '';
    const rating = activePopup?.data?.rating;

    if (!rating) return null;

    const score = rating.score || 5;
    const comment = rating.comment || '';
    const createdAt = rating.createdAt;

    const labelInfo = RATING_LABELS[score] || RATING_LABELS[5];

    return (
        <BottomSheetBase onClose={close}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ padding: 24, paddingBottom: 40 }}
            >
                {/* Header */}
                <View style={{ alignItems: 'center', marginBottom: 28 }}>
                    {/* Doctor badge */}
                    <View style={{
                        backgroundColor: '#F5F0FF', borderRadius: 16, paddingHorizontal: 16,
                        paddingVertical: 10, borderWidth: 2, borderColor: '#E9D8FD', marginBottom: 16
                    }}>
                        <Text style={{
                            fontFamily: 'SpaceGrotesk_700Bold', fontSize: 14, color: '#7C3AED',
                            textAlign: 'center'
                        }}>
                            {doctorName}
                        </Text>
                        {!!doctorSpecialty && (
                            <Text style={{
                                fontFamily: 'SpaceGrotesk_500Medium', fontSize: 11, color: '#9F7AEA',
                                textAlign: 'center', marginTop: 2
                            }}>
                                {doctorSpecialty}
                            </Text>
                        )}
                    </View>

                    <Text style={{
                        fontFamily: 'SpaceGrotesk_700Bold', fontSize: 22, color: '#000',
                        marginBottom: 6, textAlign: 'center'
                    }}>
                        Đánh giá của bạn
                    </Text>
                    {createdAt && (
                        <Text style={{
                            fontFamily: 'SpaceGrotesk_500Medium', fontSize: 13, color: '#64748B',
                            textAlign: 'center'
                        }}>
                            Trải nghiệm khám ngày {dayjs(createdAt).format('DD/MM/YYYY HH:mm')}
                        </Text>
                    )}
                </View>

                {/* Stars */}
                <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 10, marginBottom: 12 }}>
                    {[1, 2, 3, 4, 5].map((s) => (
                        <View key={s} style={{ padding: 6 }}>
                            <Star
                                size={44}
                                color={s <= score ? '#F59E0B' : '#E2E8F0'}
                                fill={s <= score ? '#F59E0B' : 'transparent'}
                                strokeWidth={s <= score ? 0 : 1.5}
                            />
                        </View>
                    ))}
                </View>

                {/* Rating label pill */}
                <View style={{ alignItems: 'center', marginBottom: 28 }}>
                    <View style={{
                        backgroundColor: `${labelInfo.color}18`,
                        borderRadius: 99, paddingHorizontal: 20, paddingVertical: 8,
                        borderWidth: 1.5, borderColor: `${labelInfo.color}50`,
                    }}>
                        <Text style={{
                            fontFamily: 'SpaceGrotesk_700Bold', fontSize: 14,
                            color: labelInfo.color, letterSpacing: 0.5
                        }}>
                            {labelInfo.label}
                        </Text>
                    </View>
                </View>

                {/* Comment Box (only if exists) */}
                {comment ? (
                    <View style={{
                        backgroundColor: '#F8FAFC', borderWidth: 2, borderColor: 'rgba(0,0,0,0.08)',
                        borderRadius: 16, padding: 16, minHeight: 100, marginBottom: 24,
                    }}>
                        <Text style={{
                            fontFamily: 'SpaceGrotesk_500Medium', fontSize: 14, color: '#000',
                            lineHeight: 22
                        }}>
                            "{comment}"
                        </Text>
                    </View>
                ) : (
                    <View style={{ marginBottom: 24 }} />
                )}

                {/* CTA Buttons */}
                <View>
                    <Pressable
                        onPress={close}
                        style={({ pressed }) => ({
                            paddingVertical: 16, borderRadius: 16,
                            borderWidth: 2, borderColor: '#000',
                            backgroundColor: '#fff',
                            alignItems: 'center',
                            opacity: pressed ? 0.7 : 1,
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.1,
                            shadowRadius: 8,
                            elevation: 2,
                        })}
                    >
                        <Text style={{ fontFamily: 'SpaceGrotesk_700Bold', fontSize: 14, color: '#000' }}>
                            Đóng
                        </Text>
                    </Pressable>
                </View>
            </ScrollView>
        </BottomSheetBase>
    );
}
