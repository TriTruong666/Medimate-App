import * as ImagePicker from 'expo-image-picker';
import { useAtomValue } from 'jotai';
import { Camera, Star, X } from 'lucide-react-native';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Image,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    View
} from 'react-native';
import { useCreateRating } from '../../hooks/useRating';
import { activePopupAtom, usePopup } from '../../stores/popupStore';
import { useToast } from '../../stores/toastStore';
import { BottomSheetBase } from './BottomSheetBase';

const RATING_LABELS: Record<number, { label: string; color: string }> = {
    0: { label: 'Chưa chọn số sao', color: '#CBD5E1' },
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

    const sessionId: string | undefined = activePopup?.data?.sessionId;
    const doctorName: string = activePopup?.data?.doctorName || 'Bác sĩ';
    const doctorSpecialty: string = activePopup?.data?.doctorSpecialty || '';

    const [score, setScore] = useState(0);
    const [comment, setComment] = useState('');

    // STATE MỚI: Lưu trữ ảnh được chọn
    const [imageAsset, setImageAsset] = useState<ImagePicker.ImagePickerAsset | null>(null);

    const { mutateAsync: createRating, isPending } = useCreateRating(sessionId);

    // HÀM MỚI: Mở thư viện ảnh
    const pickImage = async () => {
        // Xin quyền truy cập thư viện ảnh (tự động hiện popup nếu chưa có quyền)
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            toast.error('Cấp quyền', 'App cần quyền truy cập ảnh để tải ảnh lên.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images, // Chỉ chọn ảnh
            allowsEditing: true, // Cho phép crop
            aspect: [4, 3],
            quality: 0.8, // Giảm chất lượng 1 chút để upload nhanh hơn
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            setImageAsset(result.assets[0]);
        }
    };

    const handleSubmit = async () => {
        if (!sessionId) {
            toast.error('Lỗi', 'Không tìm thấy thông tin phiên khám.');
            return;
        }
        if (score === 0) {
            toast.error('Thiếu đánh giá', 'Vui lòng chọn số sao trước khi gửi.');
            return;
        }

        // Chuẩn bị payload (React Native yêu cầu format đặc biệt cho File trong FormData)
        const payload: any = {
            score,
            comment: comment.trim()
        };

        if (imageAsset) {
            // Đây là chuẩn object File mà axios và FormData trong React Native có thể hiểu
            payload.image = {
                uri: Platform.OS === 'android' ? imageAsset.uri : imageAsset.uri.replace('file://', ''),
                name: imageAsset.fileName || `rating_${Date.now()}.jpg`,
                type: imageAsset.mimeType || 'image/jpeg',
            };
        }

        try {
            const res = await createRating(payload);
            if (res.success) {
                toast.success('Cảm ơn bạn! 🎉', 'Đánh giá của bạn đã được ghi nhận.');
                close();
            } else {
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
                        <View style={{
                            backgroundColor: '#F5F0FF', borderRadius: 16, paddingHorizontal: 16,
                            paddingVertical: 10, borderWidth: 2, borderColor: '#E9D8FD', marginBottom: 16
                        }}>
                            <Text style={{ fontFamily: 'SpaceGrotesk_700Bold', fontSize: 14, color: '#7C3AED', textAlign: 'center' }}>
                                {doctorName}
                            </Text>
                            {!!doctorSpecialty && (
                                <Text style={{ fontFamily: 'SpaceGrotesk_500Medium', fontSize: 11, color: '#9F7AEA', textAlign: 'center', marginTop: 2 }}>
                                    {doctorSpecialty}
                                </Text>
                            )}
                        </View>

                        <Text style={{ fontFamily: 'SpaceGrotesk_700Bold', fontSize: 22, color: '#000', marginBottom: 6, textAlign: 'center' }}>
                            Đánh giá buổi khám
                        </Text>
                        <Text style={{ fontFamily: 'SpaceGrotesk_500Medium', fontSize: 13, color: '#64748B', textAlign: 'center' }}>
                            Phản hồi của bạn giúp cải thiện chất lượng dịch vụ
                        </Text>
                    </View>

                    {/* Stars */}
                    <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 10, marginBottom: 12 }}>
                        {[1, 2, 3, 4, 5].map((s) => {
                            const isSelected = s <= score;
                            return (
                                <Pressable
                                    key={s}
                                    onPress={() => setScore(prev => prev === s ? 0 : s)}
                                    style={({ pressed }) => ({
                                        padding: 6,
                                        transform: [{ scale: pressed ? 0.85 : isSelected ? 1.1 : 1 }],
                                    })}
                                >
                                    <Star
                                        size={44}
                                        color={isSelected ? '#F59E0B' : '#D1D5DB'}
                                        fill={isSelected ? '#F59E0B' : 'transparent'}
                                        strokeWidth={isSelected ? 0 : 1.5}
                                    />
                                </Pressable>
                            );
                        })}
                    </View>

                    {/* Rating label pill */}
                    <View style={{ alignItems: 'center', marginBottom: 28 }}>
                        <View style={{
                            backgroundColor: `${labelInfo.color}18`,
                            borderRadius: 99, paddingHorizontal: 20, paddingVertical: 8,
                            borderWidth: 1.5, borderColor: `${labelInfo.color}50`,
                        }}>
                            <Text style={{ fontFamily: 'SpaceGrotesk_700Bold', fontSize: 14, color: labelInfo.color, letterSpacing: 0.5 }}>
                                {labelInfo.label}
                            </Text>
                        </View>
                    </View>

                    {/* Comment Box */}
                    <TextInput
                        style={{
                            fontFamily: 'SpaceGrotesk_500Medium', fontSize: 14, color: '#000',
                            backgroundColor: '#F8FAFC', borderWidth: 2, borderColor: 'rgba(0,0,0,0.08)',
                            borderRadius: 16, padding: 16, minHeight: 100, textAlignVertical: 'top',
                            marginBottom: 16, lineHeight: 22,
                        }}
                        placeholder="Chia sẻ thêm cảm nhận của bạn (không bắt buộc)..."
                        placeholderTextColor="#94A3B8"
                        multiline
                        value={comment}
                        onChangeText={setComment}
                        maxLength={500}
                    />

                    {/* KHU VỰC THÊM ẢNH */}
                    <View style={{ marginBottom: 24 }}>
                        {imageAsset ? (
                            // Nếu đã chọn ảnh -> Hiển thị ảnh thu nhỏ có nút Xóa
                            <View style={{ position: 'relative', alignSelf: 'flex-start' }}>
                                <Image
                                    source={{ uri: imageAsset.uri }}
                                    style={{ width: 80, height: 80, borderRadius: 12, borderWidth: 2, borderColor: 'rgba(0,0,0,0.1)' }}
                                />
                                <Pressable
                                    onPress={() => setImageAsset(null)}
                                    style={{
                                        position: 'absolute', top: -8, right: -8,
                                        backgroundColor: '#EF4444', borderRadius: 12, padding: 4,
                                        borderWidth: 2, borderColor: '#fff'
                                    }}
                                >
                                    <X size={14} color="#fff" strokeWidth={3} />
                                </Pressable>
                            </View>
                        ) : (
                            // Nếu chưa có ảnh -> Hiển thị nút Thêm ảnh
                            <Pressable
                                onPress={pickImage}
                                style={({ pressed }) => ({
                                    flexDirection: 'row', alignItems: 'center', gap: 8,
                                    alignSelf: 'flex-start', paddingVertical: 8, paddingHorizontal: 12,
                                    borderRadius: 12, backgroundColor: '#F1F5F9',
                                    borderWidth: 1, borderColor: '#CBD5E1', borderStyle: 'dashed',
                                    opacity: pressed ? 0.7 : 1
                                })}
                            >
                                <Camera size={16} color="#64748B" />
                                <Text style={{ fontFamily: 'SpaceGrotesk_600SemiBold', fontSize: 13, color: '#64748B' }}>
                                    Đính kèm ảnh
                                </Text>
                            </Pressable>
                        )}
                    </View>

                    {/* CTA Buttons */}
                    <View style={{ flexDirection: 'row', gap: 12 }}>
                        <Pressable
                            onPress={close}
                            disabled={isPending}
                            style={({ pressed }) => ({
                                flex: 1, paddingVertical: 16, borderRadius: 16,
                                borderWidth: 2, borderColor: 'rgba(0,0,0,0.1)',
                                alignItems: 'center', opacity: pressed ? 0.7 : 1, backgroundColor: '#F8FAFC',
                            })}
                        >
                            <Text style={{ fontFamily: 'SpaceGrotesk_700Bold', fontSize: 14, color: '#64748B' }}>
                                Để sau
                            </Text>
                        </Pressable>

                        <Pressable
                            onPress={handleSubmit}
                            disabled={isPending || score === 0}
                            style={({ pressed }) => ({
                                flex: 2, paddingVertical: 16, borderRadius: 16,
                                borderWidth: 2, borderColor: score === 0 ? '#D1D5DB' : '#7C3AED',
                                backgroundColor: score === 0 ? '#E5E7EB' : isPending ? '#C4B5FD' : '#9370DB',
                                alignItems: 'center', justifyContent: 'center',
                                opacity: pressed ? 0.9 : 1, shadowColor: '#7C3AED',
                                shadowOffset: { width: 0, height: score === 0 ? 0 : 4 },
                                shadowOpacity: (isPending || score === 0) ? 0 : 0.35,
                                shadowRadius: 8, elevation: (isPending || score === 0) ? 0 : 4,
                            })}
                        >
                            {isPending ? (
                                <ActivityIndicator size="small" color="#7C3AED" />
                            ) : (
                                <Text style={{ fontFamily: 'SpaceGrotesk_700Bold', fontSize: 14, color: score === 0 ? '#505152' : '#0d404d' }}>
                                    {score === 0 ? 'Chọn số sao trước' : 'Gửi đánh giá ⭐'}
                                </Text>
                            )}
                        </Pressable>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </BottomSheetBase>
    );
}