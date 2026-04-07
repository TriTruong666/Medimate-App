import { useRouter } from 'expo-router';
import { Maximize2, MicOff, PhoneOff } from 'lucide-react-native';
import React, { useCallback } from 'react';
import { Dimensions, Pressable, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    runOnJS,
} from 'react-native-reanimated';
import { useVideoCallActions } from '../../stores/videoCallStore';
import { endSession } from '../../apis/session.api';
import { useToast } from '../../stores/toastStore';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

const PIP_W = 140;
const PIP_H = 200;
const MARGIN = 16;

// Snap positions (corners)
const SNAP_POSITIONS = [
    { x: MARGIN, y: MARGIN + 50 },                                  // top-left
    { x: SCREEN_W - PIP_W - MARGIN, y: MARGIN + 50 },               // top-right
    { x: MARGIN, y: SCREEN_H - PIP_H - MARGIN - 80 },               // bottom-left
    { x: SCREEN_W - PIP_W - MARGIN, y: SCREEN_H - PIP_H - MARGIN - 80 },  // bottom-right
];

function findNearestSnap(x: number, y: number) {
    'worklet';
    let minDist = Infinity;
    let nearest = SNAP_POSITIONS[3]; // default bottom-right
    for (const pos of SNAP_POSITIONS) {
        const dist = Math.sqrt((x - pos.x) ** 2 + (y - pos.y) ** 2);
        if (dist < minDist) {
            minDist = dist;
            nearest = pos;
        }
    }
    return nearest;
}

export default function FloatingVideoCall() {
    const router = useRouter();
    const toast = useToast();
    const { state, maximize, endCall } = useVideoCallActions();

    // Initial position: bottom-right
    const translateX = useSharedValue(SNAP_POSITIONS[3].x);
    const translateY = useSharedValue(SNAP_POSITIONS[3].y);
    const contextX = useSharedValue(0);
    const contextY = useSharedValue(0);
    const scale = useSharedValue(1);

    const handleMaximize = useCallback(() => {
        maximize();
        router.push({
            pathname: '/(manager)/(doctor)/video_call',
            params: {
                sessionId: state.sessionId,
                appointmentId: state.appointmentId,
            },
        } as any);
    }, [state.sessionId, state.appointmentId]);

    const handleEndCall = useCallback(async () => {
        try {
            if (state.sessionId) {
                await endSession(state.sessionId);
            }
        } catch (e) {
            console.error(e);
        }
        endCall();
        toast.info('Cuộc gọi đã kết thúc', 'Phiên tư vấn đã đóng.');
    }, [state.sessionId]);

    const panGesture = Gesture.Pan()
        .onStart(() => {
            contextX.value = translateX.value;
            contextY.value = translateY.value;
            scale.value = withSpring(1.05);
        })
        .onUpdate((e) => {
            translateX.value = contextX.value + e.translationX;
            translateY.value = contextY.value + e.translationY;
        })
        .onEnd(() => {
            const snap = findNearestSnap(translateX.value, translateY.value);
            translateX.value = withSpring(snap.x, { damping: 20, stiffness: 200 });
            translateY.value = withSpring(snap.y, { damping: 20, stiffness: 200 });
            scale.value = withSpring(1);
        });

    const tapGesture = Gesture.Tap()
        .onEnd(() => {
            runOnJS(handleMaximize)();
        });

    const composedGesture = Gesture.Race(panGesture, tapGesture);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [
            { translateX: translateX.value },
            { translateY: translateY.value },
            { scale: scale.value },
        ],
    }));

    // Don't render if call isn't active or isn't minimized
    if (!state.isActive || !state.isMinimized) return null;

    return (
        <GestureDetector gesture={composedGesture}>
            <Animated.View
                style={[
                    {
                        position: 'absolute',
                        width: PIP_W,
                        height: PIP_H,
                        borderRadius: 24,
                        backgroundColor: '#1C1C1E',
                        borderWidth: 2,
                        borderColor: 'rgba(255,255,255,0.15)',
                        overflow: 'hidden',
                        zIndex: 9999,
                        elevation: 20,
                        // Shadow for iOS
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 8 },
                        shadowOpacity: 0.6,
                        shadowRadius: 16,
                    },
                    animatedStyle,
                ]}
            >
                {/* Video Preview Area */}
                <View style={{
                    flex: 1,
                    backgroundColor: '#000',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}>
                    {/* Status indicator */}
                    <View style={{
                        position: 'absolute',
                        top: 10,
                        left: 10,
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 4,
                    }}>
                        <View style={{
                            width: 6,
                            height: 6,
                            borderRadius: 3,
                            backgroundColor: state.remoteUids.length > 0 ? '#22C55E' : '#F59E0B',
                        }} />
                        <Text style={{
                            fontFamily: 'SpaceGrotesk_700Bold',
                            fontSize: 8,
                            color: 'rgba(255,255,255,0.7)',
                            textTransform: 'uppercase',
                            letterSpacing: 0.5,
                        }}>
                            {state.remoteUids.length > 0 ? (state.remoteUids.length > 1 ? '3 Người' : 'Đang hẹn') : 'Chờ...'}
                        </Text>
                    </View>

                    {/* Muted indicator */}
                    {state.isMuted && (
                        <View style={{
                            position: 'absolute',
                            top: 10,
                            right: 10,
                        }}>
                            <MicOff size={12} color="#FF4A4A" />
                        </View>
                    )}

                    {/* Maximize icon */}
                    <View style={{
                        width: 44,
                        height: 44,
                        borderRadius: 22,
                        backgroundColor: 'rgba(255,255,255,0.1)',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}>
                        <Maximize2 size={20} color="white" />
                    </View>
                    <Text style={{
                        fontFamily: 'SpaceGrotesk_600SemiBold',
                        fontSize: 10,
                        color: 'rgba(255,255,255,0.5)',
                        marginTop: 6,
                    }}>
                        Nhấn để mở rộng
                    </Text>
                </View>

                {/* Mini End Call Button */}
                <Pressable
                    onPress={handleEndCall}
                    style={{
                        height: 40,
                        backgroundColor: '#FF4A4A',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexDirection: 'row',
                        gap: 6,
                    }}
                >
                    <PhoneOff size={14} color="white" strokeWidth={2.5} />
                    <Text style={{
                        fontFamily: 'SpaceGrotesk_700Bold',
                        fontSize: 10,
                        color: '#fff',
                        textTransform: 'uppercase',
                    }}>
                        Kết thúc
                    </Text>
                </Pressable>
            </Animated.View>
        </GestureDetector>
    );
}
