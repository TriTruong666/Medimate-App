// components/popup/GuardianInvitePopup.tsx
// Popup xuất hiện khi Guardian (chủ gia đình) được mời vào phòng khám 3 bên
import React, { useEffect, useRef } from 'react';
import {
    Animated,
    Image,
    Pressable,
    Text,
    View,
    ActivityIndicator,
} from 'react-native';
import { PhoneCall, X, Users } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useMutation } from '@tanstack/react-query';
import { useVideoCallActions } from '../../stores/videoCallStore';
import { useToast } from '../../stores/toastStore';

import * as SecureStore from 'expo-secure-store';

// ─── API call ────────────────────────────────────────────────────────────────
const API_BASE = process.env.EXPO_PUBLIC_NET_API_URL;

async function joinAsGuardian(sessionId: string) {
    const token = await SecureStore.getItemAsync('accessToken');
    const res = await fetch(
        `${API_BASE}/api/v1/video-call/sessions/${sessionId}/guardian/join`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        }
    );
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err?.message || 'Không thể tham gia cuộc gọi');
    }
    return res.json() as Promise<{
        success: boolean;
        data: {
            token: string;
            uid: number;
            channelName: string;
            sessionId: string;
            memberName: string;
            doctorName: string;
        };
    }>;
}

// ─── Props ───────────────────────────────────────────────────────────────────
interface GuardianInvitePopupProps {
    data: {
        sessionId: string;
        memberName: string;
        memberAvatarUrl?: string;
        doctorName: string;
        scheduledTime?: string;
    };
    onClose: () => void;
}

export function GuardianInvitePopup({ data, onClose }: GuardianInvitePopupProps) {
    const router = useRouter();
    const toast = useToast();
    const { startCall } = useVideoCallActions();

    // ── Animation: slide-up từ dưới lên ──────────────────────────────────
    const slideY = useRef(new Animated.Value(300)).current;
    const opacity = useRef(new Animated.Value(0)).current;
    const pulseScale = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        // Slide-up + fade-in khi mount
        Animated.parallel([
            Animated.spring(slideY, { toValue: 0, useNativeDriver: true, damping: 18, stiffness: 180 }),
            Animated.timing(opacity, { toValue: 1, duration: 250, useNativeDriver: true }),
        ]).start();

        // Pulse animation cho button tham gia
        const pulse = Animated.loop(
            Animated.sequence([
                Animated.timing(pulseScale, { toValue: 1.06, duration: 700, useNativeDriver: true }),
                Animated.timing(pulseScale, { toValue: 1, duration: 700, useNativeDriver: true }),
            ])
        );
        pulse.start();
        return () => pulse.stop();
    }, []);

    const dismissWithAnimation = (cb?: () => void) => {
        Animated.parallel([
            Animated.timing(slideY, { toValue: 300, duration: 220, useNativeDriver: true }),
            Animated.timing(opacity, { toValue: 0, duration: 220, useNativeDriver: true }),
        ]).start(() => { onClose(); cb?.(); });
    };

    // ── Join mutation ─────────────────────────────────────────────────────
    const { mutate: join, isPending } = useMutation({
        mutationFn: () => joinAsGuardian(data.sessionId),
        onSuccess: (res) => {
            if (!res.success || !res.data) {
                toast.error('Lỗi', 'Không lấy được thông tin phòng khám.');
                return;
            }
            const { token, uid, channelName, sessionId, memberName, doctorName } = res.data;

            // Khởi tạo call state với role guardian
            startCall(sessionId, '', 'guardian', {
                localUid: uid,
                memberName,
                doctorName,
            });

            dismissWithAnimation(() => {
                router.push({
                    pathname: '/(manager)/(doctor)/video_call',
                    params: {
                        sessionId,
                        agoraToken: token,
                        agoraUid: String(uid),
                        channelName,
                        role: 'guardian',
                        memberName,
                        doctorName,
                    },
                } as any);
            });
        },
        onError: (err: any) => {
            toast.error('Không thể tham gia', err.message || 'Vui lòng thử lại.');
        },
    });

    return (
        <Animated.View
            style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                zIndex: 9999,
                transform: [{ translateY: slideY }],
                opacity,
            }}
        >
            {/* Backdrop */}
            <Pressable
                style={{ position: 'absolute', top: -800, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.45)' }}
                onPress={() => dismissWithAnimation()}
            />

            {/* Card */}
            <View style={{
                backgroundColor: '#fff',
                borderTopLeftRadius: 32,
                borderTopRightRadius: 32,
                borderTopWidth: 2,
                borderLeftWidth: 2,
                borderRightWidth: 2,
                borderColor: '#000',
                padding: 24,
                paddingBottom: 44,
            }}>
                {/* Header */}
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                        <View style={{
                            width: 40, height: 40, borderRadius: 20,
                            backgroundColor: '#EDE9FE', borderWidth: 2, borderColor: '#7C3AED',
                            alignItems: 'center', justifyContent: 'center',
                        }}>
                            <Users size={20} color="#7C3AED" strokeWidth={2.5} />
                        </View>
                        <Text style={{ fontFamily: 'SpaceGrotesk_700Bold', fontSize: 17, color: '#000' }}>
                            Phòng khám đã mở!
                        </Text>
                    </View>
                    <Pressable
                        onPress={() => dismissWithAnimation()}
                        style={{
                            width: 34, height: 34, borderRadius: 12,
                            backgroundColor: '#F3F4F6', borderWidth: 2, borderColor: '#E5E7EB',
                            alignItems: 'center', justifyContent: 'center',
                        }}
                    >
                        <X size={16} color="#374151" strokeWidth={2.5} />
                    </Pressable>
                </View>

                {/* Member info card */}
                <View style={{
                    backgroundColor: '#F9F6FC',
                    borderWidth: 2, borderColor: '#E5E7EB',
                    borderRadius: 20, padding: 16, marginBottom: 20,
                    flexDirection: 'row', alignItems: 'center', gap: 14,
                }}>
                    {/* Avatar */}
                    <View style={{
                        width: 56, height: 56, borderRadius: 28,
                        overflow: 'hidden', borderWidth: 2, borderColor: '#7C3AED',
                        backgroundColor: '#EDE9FE', alignItems: 'center', justifyContent: 'center',
                    }}>
                        {data.memberAvatarUrl
                            ? <Image source={{ uri: data.memberAvatarUrl }} style={{ width: 56, height: 56 }} />
                            : <Text style={{ fontFamily: 'SpaceGrotesk_700Bold', fontSize: 22, color: '#7C3AED' }}>
                                {(data.memberName || '?')[0].toUpperCase()}
                            </Text>
                        }
                    </View>

                    <View style={{ flex: 1 }}>
                        <Text style={{ fontFamily: 'SpaceGrotesk_500Medium', fontSize: 11, color: '#6B7280', marginBottom: 2 }}>
                            Đang khám bệnh với
                        </Text>
                        <Text style={{ fontFamily: 'SpaceGrotesk_700Bold', fontSize: 15, color: '#000' }}>
                            {data.memberName}
                        </Text>
                        <Text style={{ fontFamily: 'SpaceGrotesk_500Medium', fontSize: 12, color: '#7C3AED', marginTop: 2 }}>
                            Bác sĩ {data.doctorName}
                            {data.scheduledTime ? `  ·  ${data.scheduledTime}` : ''}
                        </Text>
                    </View>
                </View>

                <Text style={{
                    fontFamily: 'SpaceGrotesk_500Medium', fontSize: 13, color: '#6B7280',
                    textAlign: 'center', lineHeight: 20, marginBottom: 24,
                }}>
                    Bạn có thể tham gia theo dõi trực tiếp buổi khám để hiểu rõ tình trạng sức khoẻ của thành viên.
                </Text>

                {/* Buttons */}
                <View style={{ flexDirection: 'row', gap: 12 }}>
                    {/* Decline */}
                    <Pressable
                        onPress={() => dismissWithAnimation()}
                        style={{
                            flex: 1, paddingVertical: 14, borderRadius: 16,
                            backgroundColor: '#F3F4F6', borderWidth: 2, borderColor: '#E5E7EB',
                            alignItems: 'center',
                        }}
                    >
                        <Text style={{ fontFamily: 'SpaceGrotesk_700Bold', fontSize: 14, color: '#6B7280' }}>
                            Để sau
                        </Text>
                    </Pressable>

                    {/* Join */}
                    <Animated.View style={{ flex: 2, transform: [{ scale: pulseScale }] }}>
                        <Pressable
                            onPress={() => !isPending && join()}
                            style={{
                                paddingVertical: 14, borderRadius: 16,
                                backgroundColor: '#7C3AED', borderWidth: 2, borderColor: '#000',
                                flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
                                shadowColor: '#7C3AED', shadowOffset: { width: 0, height: 4 },
                                shadowOpacity: 0.35, shadowRadius: 8, elevation: 6,
                            }}
                        >
                            {isPending
                                ? <ActivityIndicator size="small" color="#fff" />
                                : <>
                                    <PhoneCall size={18} color="#fff" strokeWidth={2.5} />
                                    <Text style={{ fontFamily: 'SpaceGrotesk_700Bold', fontSize: 15, color: '#fff' }}>
                                        Tham gia ngay
                                    </Text>
                                </>
                            }
                        </Pressable>
                    </Animated.View>
                </View>
            </View>
        </Animated.View>
    );
}
