import React, { useState } from 'react';
import {
    View, Text, Pressable, TextInput, ActivityIndicator,
    ScrollView, KeyboardAvoidingView, Platform
} from 'react-native';
import { BottomSheetBase } from './BottomSheetBase';
import { activePopupAtom, usePopup } from '../../stores/popupStore';
import { Star } from 'lucide-react-native';
import { useToast } from '../../stores/toastStore';
import { useAtomValue } from 'jotai';
import { useCreateRating } from '../../hooks/useRating';

const RATING_LABELS: Record<number, { label: string; color: string }> = {
    1: { label: 'Rất tệ', color: '#EF4444' },
    2: { label: 'Kém', color: '#F97316' },
    3: { label: 'Bình thường', color: '#F59E0B' },
    4: { label: 'Rất tốt', color: '#10B981' },
    5: { label: 'Tuyệt vời! ✨', color: '#8B5CF6' },
};

export default function RatingPopup() {
    const { close } = usePopup();
    const toast = useToast();
    const activePopup = useAtomValue(activePopupAtom);

    // Data passed when opening popup: { sessionId, doctorName, doctorAvatar, doctorSpecialty }
    const sessionId: string | undefined = activePopup?.data?.sessionId;
    const doctorName: string = activePopup?.data?.doctorName || 'Bác sĩ';
    const doctorSpecialty: string = activePopup?.data?.doctorSpecialty || '';

    const [score, setScore] = useState(5);
    const [comment, setComment] = useState('');

    const { mutateAsync: createRating, isPending } = useCreateRating(sessionId);

    const handleSubmit = async () => {
        if (!sessionId) {
            toast.error('Lỗi', 'Không tìm thấy thông tin phiên khám.');
            return;
        }

        try {
            const res = await createRating({ score, comment: comment.trim() });
            if (res.success) {
                toast.success('Cảm ơn bạn! 🎉', 'Đánh giá của bạn đã được ghi nhận.');
                close();
            } else {
                // Nếu đã đánh giá rồi (409) → cũng close
                if (res.message?.includes('đã được đánh giá') || res.code === 409) {
                    toast.success('Đã đánh giá', 'Bạn đã đánh giá phiên khám này rồi.');
                    close();
                } else {
                    toast.error('Lỗi', res.message || 'Không thể gửi đánh giá.');
                }
            }
        } catch (e: any) {
            toast.error('Lỗi kết nối', e?.message || 'Vui lòng thử lại.');
        }
    };

    const labelInfo = RATING_LABELS[score];

    return (
        <BottomSheetBase onClose={close}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ padding: 24, paddingBottom: 40 }}
                    keyboardShouldPersistTaps="handled"
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
                            Đánh giá buổi khám
                        </Text>
                        <Text style={{
                            fontFamily: 'SpaceGrotesk_500Medium', fontSize: 13, color: '#64748B',
                            textAlign: 'center'
                        }}>
                            Phản hồi của bạn giúp cải thiện chất lượng dịch vụ
                        </Text>
                    </View>

                    {/* Stars */}
                    <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 10, marginBottom: 12 }}>
                        {[1, 2, 3, 4, 5].map((s) => (
                            <Pressable
                                key={s}
                                onPress={() => setScore(s)}
                                style={({ pressed }) => ({
                                    padding: 6,
                                    transform: [{ scale: pressed ? 0.88 : s <= score ? 1.1 : 1 }],
                                })}
                            >
                                <Star
                                    size={44}
                                    color={s <= score ? '#F59E0B' : '#E2E8F0'}
                                    fill={s <= score ? '#F59E0B' : 'transparent'}
                                    strokeWidth={s <= score ? 0 : 1.5}
                                />
                            </Pressable>
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

                    {/* Comment Box */}
                    <TextInput
                        style={{
                            fontFamily: 'SpaceGrotesk_500Medium', fontSize: 14, color: '#000',
                            backgroundColor: '#F8FAFC', borderWidth: 2, borderColor: 'rgba(0,0,0,0.08)',
                            borderRadius: 16, padding: 16, minHeight: 110, textAlignVertical: 'top',
                            marginBottom: 24, lineHeight: 22,
                        }}
                        placeholder="Chia sẻ thêm cảm nhận của bạn (không bắt buộc)..."
                        placeholderTextColor="#94A3B8"
                        multiline
                        value={comment}
                        onChangeText={setComment}
                        maxLength={500}
                    />

                    {/* Character count */}
                    <Text style={{
                        fontFamily: 'SpaceGrotesk_500Medium', fontSize: 11, color: '#CBD5E1',
                        textAlign: 'right', marginTop: -18, marginBottom: 20, paddingRight: 4
                    }}>
                        {comment.length}/500
                    </Text>

                    {/* CTA Buttons */}
                    <View style={{ flexDirection: 'row', gap: 12 }}>
                        <Pressable
                            onPress={close}
                            disabled={isPending}
                            style={({ pressed }) => ({
                                flex: 1, paddingVertical: 16, borderRadius: 16,
                                borderWidth: 2, borderColor: 'rgba(0,0,0,0.1)',
                                alignItems: 'center',
                                opacity: pressed ? 0.7 : 1,
                                backgroundColor: '#F8FAFC',
                            })}
                        >
                            <Text style={{ fontFamily: 'SpaceGrotesk_700Bold', fontSize: 14, color: '#64748B' }}>
                                Để sau
                            </Text>
                        </Pressable>

                        <Pressable
                            onPress={handleSubmit}
                            disabled={isPending}
                            style={({ pressed }) => ({
                                flex: 2, paddingVertical: 16, borderRadius: 16,
                                borderWidth: 2, borderColor: '#7C3AED',
                                backgroundColor: isPending ? '#C4B5FD' : '#9370DB',
                                alignItems: 'center', justifyContent: 'center',
                                opacity: pressed ? 0.9 : 1,
                                shadowColor: '#7C3AED',
                                shadowOffset: { width: 0, height: 4 },
                                shadowOpacity: isPending ? 0 : 0.35,
                                shadowRadius: 8,
                                elevation: isPending ? 0 : 4,
                            })}
                        >
                            {isPending ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <Text style={{ fontFamily: 'SpaceGrotesk_700Bold', fontSize: 14, color: '#fff' }}>
                                    Gửi đánh giá ⭐
                                </Text>
                            )}
                        </Pressable>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </BottomSheetBase>
    );
}
