import { useRouter } from 'expo-router';
import { Maximize2, MicOff, Pause, PhoneOff } from 'lucide-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Dimensions, Pressable, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';
import { endSession } from '../../apis/session.api';
import { useToast } from '../../stores/toastStore';
import { useVideoCallActions } from '../../stores/videoCallStore';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

const PIP_W = 152;
const PIP_H = 228;
const MARGIN = 16;

const SNAP_POSITIONS = [
    { x: MARGIN,                      y: MARGIN + 60 },
    { x: SCREEN_W - PIP_W - MARGIN,   y: MARGIN + 60 },
    { x: MARGIN,                      y: SCREEN_H - PIP_H - MARGIN - 90 },
    { x: SCREEN_W - PIP_W - MARGIN,   y: SCREEN_H - PIP_H - MARGIN - 90 },
];

function findNearestSnap(x: number, y: number) {
    'worklet';
    let minDist = Infinity;
    let nearest = SNAP_POSITIONS[3];
    for (const pos of SNAP_POSITIONS) {
        const dist = Math.sqrt((x - pos.x) ** 2 + (y - pos.y) ** 2);
        if (dist < minDist) { minDist = dist; nearest = pos; }
    }
    return nearest;
}

// ─── Mini call duration timer ─────────────────────────────────────────────────
function MiniTimer({ isConnected }: { isConnected: boolean }) {
    const [secs, setSecs] = useState(0);
    useEffect(() => {
        if (!isConnected) return;
        const iv = setInterval(() => setSecs(s => s + 1), 1000);
        return () => clearInterval(iv);
    }, [isConnected]);
    const mm = Math.floor(secs / 60).toString().padStart(2, '0');
    const ss = (secs % 60).toString().padStart(2, '0');
    return (
        <Text style={{ fontFamily: 'SpaceGrotesk_700Bold', fontSize: 9, color: '#22C55E', letterSpacing: 1 }}>
            {mm}:{ss}
        </Text>
    );
}

// ─── End session with 2-step Alert ───────────────────────────────────────────
function useEndCallFlow(sessionId: string, onEnd: () => void) {
    const toast = useToast();

    const trigger = useCallback(() => {
        // Step 1
        Alert.alert(
            'Kết thúc phiên khám?',
            'Hành động này sẽ đóng phiên tư vấn. Bạn có chắc?',
            [
                { text: 'Quay lại', style: 'cancel' },
                {
                    text: 'Có, tôi muốn kết thúc',
                    style: 'destructive',
                    onPress: () => {
                        // Step 2
                        setTimeout(() => {
                            Alert.alert(
                                '⚠️ Xác nhận lần cuối',
                                'Đây là xác nhận CUỐI CÙNG. Phòng khám sẽ đóng và không thể khôi phục.',
                                [
                                    { text: 'Huỷ bỏ', style: 'cancel' },
                                    {
                                        text: '🔴 Kết thúc ngay',
                                        style: 'destructive',
                                        onPress: async () => {
                                            try { if (sessionId) await endSession(sessionId); } catch { }
                                            onEnd();
                                            toast.info('Phiên khám đã kết thúc', 'Cảm ơn bạn đã sử dụng MediMate.');
                                        },
                                    },
                                ],
                                { cancelable: true }
                            );
                        }, 100);
                    },
                },
            ],
            { cancelable: true }
        );
    }, [sessionId]);

    return trigger;
}

// ─── Main floating PiP component ─────────────────────────────────────────────
export default function FloatingVideoCall() {
    const router = useRouter();
    const toast = useToast();
    const { state, maximize, endCall } = useVideoCallActions();

    const translateX = useSharedValue(SNAP_POSITIONS[3].x);
    const translateY = useSharedValue(SNAP_POSITIONS[3].y);
    const contextX = useSharedValue(0);
    const contextY = useSharedValue(0);
    const scale = useSharedValue(1);

    const handleMaximize = useCallback(() => {
        maximize();
        router.push({
            pathname: '/(manager)/(doctor)/video_call',
            params: { sessionId: state.sessionId, appointmentId: state.appointmentId },
        } as any);
    }, [state.sessionId, state.appointmentId]);

    const triggerEndCall = useEndCallFlow(state.sessionId, endCall);

    // ── Minimize from PiP: just goes back to the full screen ──
    const handleMaximizeAndAlert = useCallback(() => {
        Alert.alert(
            'Mở rộng cuộc gọi?',
            'Nhấn xác nhận để quay lại màn hình cuộc gọi đầy đủ.',
            [
                { text: 'Huỷ', style: 'cancel' },
                { text: 'Mở rộng', onPress: handleMaximize },
            ]
        );
    }, [handleMaximize]);

    const panGesture = Gesture.Pan()
        .onStart(() => {
            contextX.value = translateX.value;
            contextY.value = translateY.value;
            scale.value = withSpring(1.06, { damping: 12 });
        })
        .onUpdate((e) => {
            translateX.value = contextX.value + e.translationX;
            translateY.value = contextY.value + e.translationY;
        })
        .onEnd(() => {
            const snap = findNearestSnap(translateX.value, translateY.value);
            translateX.value = withSpring(snap.x, { damping: 22, stiffness: 220 });
            translateY.value = withSpring(snap.y, { damping: 22, stiffness: 220 });
            scale.value = withSpring(1);
        });

    const tapGesture = Gesture.Tap()
        .maxDuration(200)
        .onEnd(() => { runOnJS(handleMaximize)(); });

    const composedGesture = Gesture.Exclusive(panGesture, tapGesture);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [
            { translateX: translateX.value },
            { translateY: translateY.value },
            { scale: scale.value },
        ],
    }));

    if (!state.isActive || !state.isMinimized) return null;

    const isConnected = state.remoteUids.length > 0;

    return (
        <GestureDetector gesture={composedGesture}>
            <Animated.View style={[
                {
                    position: 'absolute',
                    width: PIP_W,
                    height: PIP_H,
                    borderRadius: 22,
                    backgroundColor: '#0E0E14',
                    borderWidth: 2,
                    borderColor: 'rgba(255,255,255,0.16)',
                    overflow: 'hidden',
                    zIndex: 9999,
                    elevation: 22,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 10 },
                    shadowOpacity: 0.6,
                    shadowRadius: 18,
                },
                animatedStyle,
            ]}>
                {/* ── Video area (placeholder) ── */}
                <View style={{ flex: 1, backgroundColor: '#18181C', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>

                    {/* Status + timer row */}
                    <View style={{
                        position: 'absolute', top: 8, left: 8,
                        flexDirection: 'row', alignItems: 'center', gap: 4,
                        backgroundColor: 'rgba(0,0,0,0.6)',
                        paddingHorizontal: 7, paddingVertical: 3,
                        borderRadius: 999, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
                    }}>
                        <View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: isConnected ? '#22C55E' : '#F59E0B' }} />
                        <MiniTimer isConnected={isConnected} />
                    </View>

                    {/* Muted badge */}
                    {state.isMuted && (
                        <View style={{
                            position: 'absolute', top: 8, right: 8,
                            backgroundColor: 'rgba(255,67,58,0.85)', borderRadius: 6, padding: 3,
                        }}>
                            <MicOff size={9} color="white" />
                        </View>
                    )}

                    {/* Center: maximize icon */}
                    <View style={{
                        width: 44, height: 44, borderRadius: 22,
                        backgroundColor: 'rgba(255,255,255,0.07)',
                        borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.12)',
                        alignItems: 'center', justifyContent: 'center', marginBottom: 5,
                    }}>
                        <Maximize2 size={18} color="rgba(255,255,255,0.75)" />
                    </View>
                    <Text style={{ fontFamily: 'SpaceGrotesk_600SemiBold', fontSize: 8, color: 'rgba(255,255,255,0.38)', textTransform: 'uppercase', letterSpacing: 0.8 }}>
                        Nhấn để mở rộng
                    </Text>
                </View>

                {/* ── Action buttons (2 rows, bottom) ── */}

                {/* Row 1: Thu nhỏ / Mở rộng — yellow, 1 confirm */}
                <Pressable
                    onPress={handleMaximize}
                    style={({ pressed }) => ({
                        height: 34,
                        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5,
                        backgroundColor: pressed ? 'rgba(251,191,36,0.85)' : 'rgba(251,191,36,0.15)',
                        borderTopWidth: 1, borderTopColor: '#FBBF24',
                    })}
                >
                    <Pause size={11} color="#FBBF24" strokeWidth={2.5} />
                    <Text style={{ fontFamily: 'SpaceGrotesk_700Bold', fontSize: 10, color: '#FBBF24', textTransform: 'uppercase', letterSpacing: 0.8 }}>
                        Mở rộng
                    </Text>
                </Pressable>

                {/* Row 2: Kết thúc phiên — red, 2 confirms */}
                <Pressable
                    onPress={triggerEndCall}
                    style={({ pressed }) => ({
                        height: 32,
                        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5,
                        backgroundColor: pressed ? '#CC2F26' : '#FF3B30',
                    })}
                >
                    <PhoneOff size={11} color="white" strokeWidth={2.5} />
                    <Text style={{ fontFamily: 'SpaceGrotesk_700Bold', fontSize: 10, color: '#fff', textTransform: 'uppercase', letterSpacing: 0.8 }}>
                        Kết thúc phiên
                    </Text>
                </Pressable>
            </Animated.View>
        </GestureDetector>
    );
}
