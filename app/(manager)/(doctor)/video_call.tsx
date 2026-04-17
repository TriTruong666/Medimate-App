import { useLocalSearchParams, useRouter } from 'expo-router';
import { AlertTriangle, Camera, Mic, MicOff, Minimize2, PhoneOff, SwitchCamera, XCircle } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Animated,
    Modal,
    PermissionsAndroid,
    Platform,
    Pressable,
    Text,
    View,
} from 'react-native';
import {
    ChannelProfileType,
    ClientRoleType,
    createAgoraRtcEngine,
    IRtcEngine,
    RtcConnection,
    RtcSurfaceView
} from 'react-native-agora';
import { SafeAreaView } from 'react-native-safe-area-context';
import { cancelNoShowSession, endSession, joinSession } from '../../../apis/session.api';
import { getVideoCallToken } from '../../../apis/videoCall.api';
import { useToast } from '../../../stores/toastStore';
import {
    getGlobalAgoraEngine,
    setGlobalAgoraEngine,
    useVideoCallActions,
} from '../../../stores/videoCallStore';

const AGORA_APP_ID = process.env.EXPO_PUBLIC_AGORA_APP_ID || 'dummy_app_id';

// ─────────────────────────────────────────────────────────────────────────────
// Pause Confirm Modal (1 step — simple, informative)
// ─────────────────────────────────────────────────────────────────────────────
function PauseConfirmModal({ visible, onCancel, onConfirm }: {
    visible: boolean; onCancel: () => void; onConfirm: () => void;
}) {
    const scaleAnim = useRef(new Animated.Value(0.88)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            Animated.parallel([
                Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, tension: 80, friction: 9 }),
                Animated.timing(opacityAnim, { toValue: 1, duration: 160, useNativeDriver: true }),
            ]).start();
        } else {
            scaleAnim.setValue(0.88);
            opacityAnim.setValue(0);
        }
    }, [visible]);

    return (
        <Modal visible={visible} transparent animationType="none" onRequestClose={onCancel}>
            <Animated.View style={{
                flex: 1, backgroundColor: 'rgba(0,0,0,0.72)',
                justifyContent: 'center', alignItems: 'center', padding: 28,
                opacity: opacityAnim,
            }}>
                <Animated.View style={{
                    backgroundColor: '#18181C', borderRadius: 28, padding: 26,
                    width: '100%', borderWidth: 2, borderColor: 'rgba(255,255,255,0.1)',
                    transform: [{ scale: scaleAnim }],
                }}>
                    <View style={{
                        width: 68, height: 68, borderRadius: 34,
                        backgroundColor: 'rgba(251,191,36,0.15)',
                        borderWidth: 2, borderColor: '#FBBF24',
                        alignItems: 'center', justifyContent: 'center',
                        alignSelf: 'center', marginBottom: 18,
                    }}>
                        <Text style={{ fontSize: 30 }}>⏸️</Text>
                    </View>

                    <Text style={{
                        fontFamily: 'SpaceGrotesk_700Bold', fontSize: 20, color: '#fff',
                        textAlign: 'center', marginBottom: 10,
                    }}>Tạm dừng cuộc gọi?</Text>

                    <Text style={{
                        fontFamily: 'SpaceGrotesk_500Medium', fontSize: 14,
                        color: 'rgba(255,255,255,0.5)', textAlign: 'center',
                        lineHeight: 21, marginBottom: 8,
                    }}>
                        Cuộc gọi sẽ được thu nhỏ xuống góc màn hình.
                    </Text>

                    {/* Highlight "có thể vào lại" */}
                    <View style={{
                        backgroundColor: 'rgba(34,197,94,0.12)', borderRadius: 14,
                        borderWidth: 1, borderColor: 'rgba(34,197,94,0.3)',
                        paddingHorizontal: 14, paddingVertical: 10, marginBottom: 26,
                        flexDirection: 'row', alignItems: 'center', gap: 8,
                    }}>
                        <Text style={{ fontSize: 16 }}>✅</Text>
                        <Text style={{
                            fontFamily: 'SpaceGrotesk_600SemiBold', fontSize: 13,
                            color: '#4ADE80', flex: 1,
                        }}>
                            Bạn có thể vào lại bất kỳ lúc nào trong phiên khám.
                        </Text>
                    </View>

                    <View style={{ gap: 10 }}>
                        <Pressable
                            onPress={onConfirm}
                            style={({ pressed }) => ({
                                height: 52, borderRadius: 16,
                                backgroundColor: '#FBBF24',
                                alignItems: 'center', justifyContent: 'center',
                                flexDirection: 'row', gap: 8,
                                opacity: pressed ? 0.82 : 1,
                            })}
                        >
                            <Minimize2 size={18} color="#000" strokeWidth={2.5} />
                            <Text style={{ fontFamily: 'SpaceGrotesk_700Bold', fontSize: 15, color: '#000' }}>
                                Thu nhỏ
                            </Text>
                        </Pressable>
                        <Pressable
                            onPress={onCancel}
                            style={({ pressed }) => ({
                                height: 50, borderRadius: 16,
                                backgroundColor: 'rgba(255,255,255,0.07)',
                                borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.1)',
                                alignItems: 'center', justifyContent: 'center',
                                opacity: pressed ? 0.65 : 1,
                            })}
                        >
                            <Text style={{ fontFamily: 'SpaceGrotesk_600SemiBold', fontSize: 14, color: 'rgba(255,255,255,0.7)' }}>
                                Tiếp tục cuộc gọi
                            </Text>
                        </Pressable>
                    </View>
                </Animated.View>
            </Animated.View>
        </Modal>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// End Session Confirm Modal (2 steps)
// ─────────────────────────────────────────────────────────────────────────────
function EndSessionModal({ visible, step, onCancel, onStep1, onStep2 }: {
    visible: boolean; step: 1 | 2;
    onCancel: () => void; onStep1: () => void; onStep2: () => void;
}) {
    const scaleAnim = useRef(new Animated.Value(0.88)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            Animated.parallel([
                Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, tension: 80, friction: 9 }),
                Animated.timing(opacityAnim, { toValue: 1, duration: 160, useNativeDriver: true }),
            ]).start();
        } else {
            scaleAnim.setValue(0.88);
            opacityAnim.setValue(0);
        }
    }, [visible, step]);

    const isStep1 = step === 1;

    return (
        <Modal visible={visible} transparent animationType="none" onRequestClose={onCancel}>
            <Animated.View style={{
                flex: 1, backgroundColor: 'rgba(0,0,0,0.78)',
                justifyContent: 'center', alignItems: 'center', padding: 28,
                opacity: opacityAnim,
            }}>
                <Animated.View style={{
                    backgroundColor: '#18181C', borderRadius: 28, padding: 26,
                    width: '100%', borderWidth: 2, borderColor: isStep1 ? 'rgba(255,59,48,0.3)' : 'rgba(220,38,38,0.5)',
                    transform: [{ scale: scaleAnim }],
                }}>
                    {/* Step progress */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'center', marginBottom: 20 }}>
                        {[1, 2].map(s => (
                            <View key={s} style={{
                                height: 4, width: s === step ? 36 : 16, borderRadius: 2,
                                backgroundColor: s <= step ? '#FF3B30' : 'rgba(255,255,255,0.15)',
                            }} />
                        ))}
                        <Text style={{ fontFamily: 'SpaceGrotesk_500Medium', fontSize: 10, color: 'rgba(255,255,255,0.35)', marginLeft: 2 }}>
                            {step}/2
                        </Text>
                    </View>

                    {/* Icon */}
                    <View style={{
                        width: 68, height: 68, borderRadius: 34,
                        backgroundColor: isStep1 ? 'rgba(255,59,48,0.12)' : 'rgba(220,38,38,0.2)',
                        borderWidth: 2, borderColor: isStep1 ? '#FF3B30' : '#DC2626',
                        alignItems: 'center', justifyContent: 'center',
                        alignSelf: 'center', marginBottom: 18,
                    }}>
                        <Text style={{ fontSize: 32 }}>{isStep1 ? '📋' : '⚠️'}</Text>
                    </View>

                    <Text style={{
                        fontFamily: 'SpaceGrotesk_700Bold', fontSize: 20, color: '#fff',
                        textAlign: 'center', marginBottom: 10,
                    }}>
                        {isStep1 ? 'Kết thúc phiên khám?' : 'Xác nhận lần cuối'}
                    </Text>
                    <Text style={{
                        fontFamily: 'SpaceGrotesk_500Medium', fontSize: 14,
                        color: 'rgba(255,255,255,0.48)', textAlign: 'center',
                        lineHeight: 21, marginBottom: 26,
                    }}>
                        {isStep1
                            ? 'Hành động này sẽ đóng phiên tư vấn và không thể tiếp tục. Bạn có chắc muốn kết thúc?'
                            : 'Đây là xác nhận CUỐI CÙNG. Dữ liệu phiên sẽ được lưu lại và phòng khám đóng hoàn toàn.'}
                    </Text>

                    <View style={{ gap: 10 }}>
                        <Pressable
                            onPress={isStep1 ? onStep1 : onStep2}
                            style={({ pressed }) => ({
                                height: 52, borderRadius: 16,
                                backgroundColor: isStep1 ? '#FF3B30' : '#DC2626',
                                alignItems: 'center', justifyContent: 'center',
                                flexDirection: 'row', gap: 8,
                                opacity: pressed ? 0.82 : 1,
                            })}
                        >
                            <PhoneOff size={18} color="#fff" strokeWidth={2.5} />
                            <Text style={{ fontFamily: 'SpaceGrotesk_700Bold', fontSize: 15, color: '#fff' }}>
                                {isStep1 ? 'Có, tôi muốn kết thúc' : '🔴 Kết thúc phiên ngay'}
                            </Text>
                        </Pressable>
                        <Pressable
                            onPress={onCancel}
                            style={({ pressed }) => ({
                                height: 50, borderRadius: 16,
                                backgroundColor: 'rgba(255,255,255,0.07)',
                                borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.1)',
                                alignItems: 'center', justifyContent: 'center',
                                opacity: pressed ? 0.65 : 1,
                            })}
                        >
                            <Text style={{ fontFamily: 'SpaceGrotesk_600SemiBold', fontSize: 14, color: 'rgba(255,255,255,0.7)' }}>
                                {isStep1 ? 'Quay lại cuộc gọi' : 'Huỷ bỏ'}
                            </Text>
                        </Pressable>
                    </View>
                </Animated.View>
            </Animated.View>
        </Modal>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Cancel No-Show Modal (2 bước xác nhận)
// ─────────────────────────────────────────────────────────────────────────────
function CancelNoShowModal({ visible, step, onCancel, onStep1, onStep2 }: {
    visible: boolean; step: 1 | 2;
    onCancel: () => void; onStep1: () => void; onStep2: () => void;
}) {
    const scaleAnim = useRef(new Animated.Value(0.88)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            Animated.parallel([
                Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, tension: 80, friction: 9 }),
                Animated.timing(opacityAnim, { toValue: 1, duration: 160, useNativeDriver: true }),
            ]).start();
        } else {
            scaleAnim.setValue(0.88);
            opacityAnim.setValue(0);
        }
    }, [visible, step]);

    const isStep1 = step === 1;

    return (
        <Modal visible={visible} transparent animationType="none" onRequestClose={onCancel}>
            <Animated.View style={{
                flex: 1, backgroundColor: 'rgba(0,0,0,0.78)',
                justifyContent: 'center', alignItems: 'center', padding: 28,
                opacity: opacityAnim,
            }}>
                <Animated.View style={{
                    backgroundColor: '#18181C', borderRadius: 28, padding: 26,
                    width: '100%', borderWidth: 2,
                    borderColor: isStep1 ? 'rgba(234,179,8,0.4)' : 'rgba(234,179,8,0.7)',
                    transform: [{ scale: scaleAnim }],
                }}>
                    {/* Step progress */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'center', marginBottom: 20 }}>
                        {[1, 2].map(s => (
                            <View key={s} style={{
                                height: 4, width: s === step ? 36 : 16, borderRadius: 2,
                                backgroundColor: s <= step ? '#EAB308' : 'rgba(255,255,255,0.15)',
                            }} />
                        ))}
                        <Text style={{ fontFamily: 'SpaceGrotesk_500Medium', fontSize: 10, color: 'rgba(255,255,255,0.35)', marginLeft: 2 }}>
                            {step}/2
                        </Text>
                    </View>

                    {/* Icon */}
                    <View style={{
                        width: 68, height: 68, borderRadius: 34,
                        backgroundColor: isStep1 ? 'rgba(234,179,8,0.12)' : 'rgba(234,179,8,0.22)',
                        borderWidth: 2, borderColor: '#EAB308',
                        alignItems: 'center', justifyContent: 'center',
                        alignSelf: 'center', marginBottom: 18,
                    }}>
                        <Text style={{ fontSize: 32 }}>{isStep1 ? '🚨' : '⚠️'}</Text>
                    </View>

                    <Text style={{
                        fontFamily: 'SpaceGrotesk_700Bold', fontSize: 20, color: '#fff',
                        textAlign: 'center', marginBottom: 10,
                    }}>
                        {isStep1 ? 'Hủy do Bác sĩ vắng?' : 'Xác nhận lần cuối'}
                    </Text>
                    <Text style={{
                        fontFamily: 'SpaceGrotesk_500Medium', fontSize: 14,
                        color: 'rgba(255,255,255,0.48)', textAlign: 'center',
                        lineHeight: 21, marginBottom: 26,
                    }}>
                        {isStep1
                            ? 'Bác sĩ chưa tham gia sau khi đến giờ hẹn. Hủy phiên này sẽ được ghi nhận là bác sĩ vắng (No-Show).'
                            : 'Đây là xác nhận CUỐI CÙNG. Phiên sẽ được hủy và hệ thống sẽ ghi nhận trạng thái No-Show của bác sĩ.'}
                    </Text>

                    <View style={{ gap: 10 }}>
                        <Pressable
                            onPress={isStep1 ? onStep1 : onStep2}
                            style={({ pressed }) => ({
                                height: 52, borderRadius: 16,
                                backgroundColor: isStep1 ? '#EAB308' : '#CA8A04',
                                alignItems: 'center', justifyContent: 'center',
                                flexDirection: 'row', gap: 8,
                                opacity: pressed ? 0.82 : 1,
                            })}
                        >
                            <XCircle size={18} color="#000" strokeWidth={2.5} />
                            <Text style={{ fontFamily: 'SpaceGrotesk_700Bold', fontSize: 15, color: '#000' }}>
                                {isStep1 ? 'Có, Bác sĩ không vào' : '🟡 Xác nhận Hủy No-Show'}
                            </Text>
                        </Pressable>
                        <Pressable
                            onPress={onCancel}
                            style={({ pressed }) => ({
                                height: 50, borderRadius: 16,
                                backgroundColor: 'rgba(255,255,255,0.07)',
                                borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.1)',
                                alignItems: 'center', justifyContent: 'center',
                                opacity: pressed ? 0.65 : 1,
                            })}
                        >
                            <Text style={{ fontFamily: 'SpaceGrotesk_600SemiBold', fontSize: 14, color: 'rgba(255,255,255,0.7)' }}>
                                {isStep1 ? 'Tiếp tục chờ' : 'Huỷ bỏ'}
                            </Text>
                        </Pressable>
                    </View>
                </Animated.View>
            </Animated.View>
        </Modal>
    );
}

// ─── Call Timer ───────────────────────────────────────────────────────────────
function CallTimer({ running }: { running: boolean }) {
    const [secs, setSecs] = useState(0);
    useEffect(() => {
        if (!running) return;
        const iv = setInterval(() => setSecs(s => s + 1), 1000);
        return () => clearInterval(iv);
    }, [running]);
    if (!running) return null;
    const hh = Math.floor(secs / 3600);
    const mm = Math.floor((secs % 3600) / 60);
    const ss = secs % 60;
    const p = (n: number) => n.toString().padStart(2, '0');
    return (
        <Text style={{ fontFamily: 'SpaceGrotesk_700Bold', fontSize: 11, color: 'rgba(255,255,255,0.6)', letterSpacing: 1.5, marginTop: 3 }}>
            {hh > 0 ? `${p(hh)}:${p(mm)}:${p(ss)}` : `${p(mm)}:${p(ss)}`}
        </Text>
    );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function VideoCallScreen() {
    const router = useRouter();
    const toast = useToast();
    const { sessionId, appointmentId } = useLocalSearchParams();
    const { state: callState, startCall, minimize, updateCallState, endCall } = useVideoCallActions();

    const [hasJoined, setHasJoined] = useState(callState.isActive ? callState.hasJoined : false);
    const [remoteUids, setRemoteUids] = useState<number[]>(callState.isActive ? callState.remoteUids : []);
    const [isMuted, setIsMuted] = useState(callState.isActive ? callState.isMuted : false);
    const [isCameraOff, setIsCameraOff] = useState(callState.isActive ? callState.isCameraOff : false);

    const [pauseDialog, setPauseDialog] = useState(false);
    const [endDialog, setEndDialog] = useState(false);
    const [endStep, setEndStep] = useState<1 | 2>(1);
    const [noShowDialog, setNoShowDialog] = useState(false);
    const [noShowStep, setNoShowStep] = useState<1 | 2>(1);
    const [isCancellingNoShow, setIsCancellingNoShow] = useState(false);

    const agoraEngineRef = useRef<IRtcEngine | null>(getGlobalAgoraEngine());
    const sid = typeof sessionId === 'string' ? sessionId : (sessionId?.[0] || '');

    useEffect(() => {
        if (sid) {
            const aid = typeof appointmentId === 'string' ? appointmentId : (appointmentId?.[0] || '');
            if (callState.isMinimized && callState.sessionId === sid) {
                updateCallState({ isMinimized: false });
                setHasJoined(callState.hasJoined);
                setRemoteUids(callState.remoteUids || []);
                setIsMuted(callState.isMuted);
                setIsCameraOff(callState.isCameraOff);
                agoraEngineRef.current = getGlobalAgoraEngine();
            } else if (!callState.isActive) {
                startCall(sid, aid);
            }
        }
    }, [sid]);

    useEffect(() => {
        if (callState.isActive) {
            updateCallState({ hasJoined, remoteUids, isMuted, isCameraOff });
        }
    }, [hasJoined, remoteUids, isMuted, isCameraOff]);

    useEffect(() => {
        let isMounted = true;
        const initAgora = async () => {
            if (Platform.OS === 'android') {
                const granted = await PermissionsAndroid.requestMultiple([
                    PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
                    PermissionsAndroid.PERMISSIONS.CAMERA,
                ]);
                if (
                    granted[PermissionsAndroid.PERMISSIONS.RECORD_AUDIO] !== PermissionsAndroid.RESULTS.GRANTED ||
                    granted[PermissionsAndroid.PERMISSIONS.CAMERA] !== PermissionsAndroid.RESULTS.GRANTED
                ) {
                    toast.error("Thiết lập", "Vui lòng cấp quyền truy cập Mic và Camera");
                    router.back(); return;
                }
            }
            try {
                const existingEngine = getGlobalAgoraEngine();
                if (existingEngine) { agoraEngineRef.current = existingEngine; return; }

                const engine = createAgoraRtcEngine();
                engine.initialize({ appId: AGORA_APP_ID });
                engine.registerEventHandler({
                    onJoinChannelSuccess: () => { if (isMounted) setHasJoined(true); },
                    onUserJoined: (_: RtcConnection, uid: number) => { if (isMounted) setRemoteUids(p => p.includes(uid) ? p : [...p, uid]); },
                    onUserOffline: (_: RtcConnection, uid: number) => { if (isMounted) setRemoteUids(p => p.filter(u => u !== uid)); },
                    onError: (err, msg) => { console.error('Agora Error', err, msg); },
                });
                engine.enableVideo();
                engine.startPreview();

                let rtcToken = '';
                try { const tr = await getVideoCallToken(sid, "publisher"); if (tr.success && tr.data) rtcToken = tr.data; } catch { }
                try { await joinSession(sid, { role: "Member" }); } catch { }

                engine.joinChannel(rtcToken, sid, 0, {
                    clientRoleType: ClientRoleType.ClientRoleBroadcaster,
                    channelProfile: ChannelProfileType.ChannelProfileCommunication,
                });
                agoraEngineRef.current = engine;
                setGlobalAgoraEngine(engine);
            } catch (e) { console.error('Agora error:', e); }
        };

        if (getGlobalAgoraEngine()) { agoraEngineRef.current = getGlobalAgoraEngine(); return; }
        if (AGORA_APP_ID !== 'dummy_app_id') { initAgora(); }
        else { setTimeout(() => { if (isMounted) setHasJoined(true); }, 1000); }
        return () => { isMounted = false; };
    }, []);

    const toggleMute = () => { agoraEngineRef.current?.muteLocalAudioStream(!isMuted); setIsMuted(!isMuted); };
    const toggleCamera = () => { agoraEngineRef.current?.muteLocalVideoStream(!isCameraOff); setIsCameraOff(!isCameraOff); };
    const switchCamera = () => { agoraEngineRef.current?.switchCamera(); };

    // ── Pause = minimize ──────────────────────────────────────────────────────
    const handlePauseConfirmed = () => {
        setPauseDialog(false);
        updateCallState({ hasJoined, remoteUids, isMuted, isCameraOff });
        minimize();
        router.back();
        toast.info("Đã thu nhỏ", "Nhấn vào cửa sổ nhỏ để quay lại cuộc gọi bất kỳ lúc nào.");
    };

    // ── End session (2 steps) ────────────────────────────────────────────────────
    const handleEndStep2 = async () => {
        try { if (sid) await endSession(sid); } catch (e) { console.error(e); }
        endCall();
        setEndDialog(false);
        toast.info("Phiên khám đã kết thúc", "Cảm ơn bạn đã sử dụng MediMate.");
        router.back();
    };

    // ── Cancel No-Show (2 steps) ──────────────────────────────────────────────
    const handleNoShowStep2 = async () => {
        setIsCancellingNoShow(true);
        try {
            if (sid) await cancelNoShowSession(sid);
            endCall();
            setNoShowDialog(false);
            toast.info("🚨 Đã ghi nhận vắng mặt", "Phiên khám được hủy do bác sĩ không tham gia.");
            router.back();
        } catch (e) {
            console.error(e);
            toast.error("Lỗi", "Không thể hủy phiên. Vui lòng thử lại.");
        } finally {
            setIsCancellingNoShow(false);
        }
    };

    const isMocking = AGORA_APP_ID === 'dummy_app_id';
    const isConnected = remoteUids.length > 0;

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#000' }} edges={['top']}>
            <View style={{ flex: 1, backgroundColor: '#000', position: 'relative' }}>

                {/* ── Remote Video ── */}
                {hasJoined ? (
                    isConnected || isMocking ? (
                        <View style={{ flex: 1, backgroundColor: '#1C1C1E' }}>
                            {isConnected && agoraEngineRef.current ? (
                                remoteUids.length === 1 ? (
                                    <RtcSurfaceView canvas={{ uid: remoteUids[0] }} style={{ flex: 1 }} />
                                ) : (
                                    <View style={{ flex: 1 }}>
                                        <View style={{ flex: 1, borderBottomWidth: 2, borderColor: '#000' }}>
                                            <RtcSurfaceView canvas={{ uid: remoteUids[0] }} style={{ flex: 1 }} />
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <RtcSurfaceView canvas={{ uid: remoteUids[1] }} style={{ flex: 1 }} />
                                        </View>
                                    </View>
                                )
                            ) : (
                                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                                    <Text style={{ fontSize: 48, marginBottom: 8 }}>👨‍⚕️</Text>
                                    <Text style={{ color: 'rgba(255,255,255,0.55)', fontFamily: 'SpaceGrotesk_500Medium', fontSize: 15 }}>Bác sĩ đang vào...</Text>
                                    <ActivityIndicator size="large" color="#B3354B" style={{ marginTop: 14 }} />
                                </View>
                            )}
                        </View>
                    ) : (
                        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                            <Text style={{ fontSize: 48, marginBottom: 8 }}>👨‍⚕️</Text>
                            <Text style={{ color: 'rgba(255,255,255,0.55)', fontFamily: 'SpaceGrotesk_500Medium', fontSize: 15 }}>Đang chờ bác sĩ tham gia...</Text>
                        </View>
                    )
                ) : (
                    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                        <ActivityIndicator color="white" size="large" />
                        <Text style={{ fontFamily: 'SpaceGrotesk_700Bold', color: '#fff', marginTop: 16, letterSpacing: 2, textTransform: 'uppercase' }}>Đang kết nối...</Text>
                    </View>
                )}

                    {!isCameraOff
                        ? agoraEngineRef.current
                            ? <RtcSurfaceView canvas={{ uid: 0 }} style={{ flex: 1 }} />
                            : <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: '#fff', fontSize: 10, fontFamily: 'SpaceGrotesk_700Bold' }}>Bạn</Text></View>
                        : <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', alignItems: 'center', justifyContent: 'center' }}>
                            <Camera size={20} color="#666" />
                            <Text style={{ fontFamily: 'SpaceGrotesk_500Medium', fontSize: 9, color: 'rgba(255,255,255,0.3)', marginTop: 4 }}>Đã tắt</Text>
                        </View>
                    }
                </View>

                {/* ─────────────────────────────────────────────────────────── */}
                {/* ── TOP ACTION BAR (Bọc UI cho Thu Nhỏ và Kết Thúc) ── */}
                {/* ─────────────────────────────────────────────────────────── */}
                <View style={{
                    position: 'absolute', top: 20, left: 16, right: 16, zIndex: 50,
                    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
                    backgroundColor: 'rgba(14,14,20,0.85)', paddingHorizontal: 16, paddingVertical: 12,
                    borderRadius: 24, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.15)',
                    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 10, elevation: 8
                }}>
                    {/* Kết thúc phiên */}
                    <Pressable
                        onPress={() => { setEndStep(1); setEndDialog(true); }}
                        style={({ pressed }) => ({
                            flexDirection: 'row', alignItems: 'center', gap: 6,
                            paddingHorizontal: 12, paddingVertical: 8,
                            backgroundColor: pressed ? '#CC2F26' : 'rgba(255,59,48,0.15)',
                            borderRadius: 14, borderWidth: 1.5, borderColor: '#FF3B30'
                        })}
                    >
                        <PhoneOff size={14} color="#FF3B30" strokeWidth={2.5} />
                        <Text style={{ fontFamily: 'SpaceGrotesk_700Bold', fontSize: 13, color: '#FF3B30' }}>
                            Kết thúc
                        </Text>
                    </Pressable>

                    {/* Hủy No-Show — chỉ hiển khi bác sĩ chưa vào */}
                    {!isConnected && hasJoined && (
                        <Pressable
                            onPress={() => { setNoShowStep(1); setNoShowDialog(true); }}
                            style={({ pressed }) => ({
                                flexDirection: 'row', alignItems: 'center', gap: 6,
                                paddingHorizontal: 12, paddingVertical: 8,
                                backgroundColor: pressed ? 'rgba(234,179,8,0.3)' : 'rgba(234,179,8,0.15)',
                                borderRadius: 14, borderWidth: 1.5, borderColor: '#EAB308'
                            })}
                        >
                            <AlertTriangle size={14} color="#EAB308" strokeWidth={2.5} />
                            <Text style={{ fontFamily: 'SpaceGrotesk_700Bold', fontSize: 13, color: '#EAB308' }}>
                                Bác sĩ vắng
                            </Text>
                        </Pressable>
                    )}

                    {/* Thu nhỏ */}
                    <Pressable
                        onPress={() => setPauseDialog(true)}
                        style={({ pressed }) => ({
                            flexDirection: 'row', alignItems: 'center', gap: 6,
                            paddingHorizontal: 12, paddingVertical: 8,
                            backgroundColor: pressed ? 'rgba(251,191,36,0.3)' : 'rgba(251,191,36,0.15)',
                            borderRadius: 14, borderWidth: 1.5, borderColor: '#FBBF24'
                        })}
                    >
                        <Minimize2 size={14} color="#FBBF24" strokeWidth={2.5} />
                        <Text style={{ fontFamily: 'SpaceGrotesk_700Bold', fontSize: 13, color: '#FBBF24' }}>
                            Thu nhỏ
                        </Text>
                    </Pressable>
                </View>

                {/* ── Status + Timer ── */}
                <View style={{ position: 'absolute', top: 90, left: 24, zIndex: 10 }}>
                    <View style={{
                        paddingHorizontal: 10, paddingVertical: 5,
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        borderRadius: 999, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
                        flexDirection: 'row', alignItems: 'center', gap: 5,
                    }}>
                        <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: isConnected ? '#22C55E' : '#F59E0B' }} />
                        <Text style={{ color: '#fff', fontFamily: 'SpaceGrotesk_700Bold', letterSpacing: 1.2, fontSize: 9, textTransform: 'uppercase' }}>
                            {isConnected ? (remoteUids.length > 1 ? '3 người' : 'Đang tư vấn') : 'Đang chờ'}
                        </Text>
                    </View>
                    <CallTimer running={hasJoined && isConnected} />
                </View>

                {/* ── Self PiP (top-right) moved below header ── */}
                <View style={{
                    position: 'absolute', top: 90, right: 16,
                    width: 110, height: 156, borderRadius: 22,
                    backgroundColor: '#2C2C2E',
                    borderWidth: 2, borderColor: 'rgba(255,255,255,0.18)',
                    overflow: 'hidden', zIndex: 10
                }}>

                {/* ─────────────────────────────────────────────────────────── */}
                {/* ── BOTTOM DOCK — giữa bên dưới ── */}
                {/* ─────────────────────────────────────────────────────────── */}
                <View style={{ position: 'absolute', bottom: 40, left: 0, right: 0, alignItems: 'center', gap: 14 }}>

                    {/* Row: Mic | Camera | SwitchCamera */}
                    <View style={{
                        flexDirection: 'row', alignItems: 'center', gap: 14,
                        paddingHorizontal: 20, paddingVertical: 10,
                        backgroundColor: 'rgba(14,14,20,0.88)',
                        borderRadius: 32, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.1)',
                        shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 14, elevation: 10,
                    }}>
                        {/* Mic */}
                        <Pressable onPress={toggleMute} style={({ pressed }) => ({
                            width: 52, height: 52, borderRadius: 26,
                            alignItems: 'center', justifyContent: 'center',
                            backgroundColor: isMuted ? '#FF453A' : 'rgba(255,255,255,0.1)',
                            borderWidth: 1, borderColor: isMuted ? 'transparent' : 'rgba(255,255,255,0.15)',
                            transform: [{ scale: pressed ? 0.9 : 1 }],
                        })}>
                            {isMuted ? <MicOff size={22} color="#fff" /> : <Mic size={22} color="#fff" />}
                        </Pressable>

                        {/* Camera */}
                        <Pressable onPress={toggleCamera} style={({ pressed }) => ({
                            width: 52, height: 52, borderRadius: 26,
                            alignItems: 'center', justifyContent: 'center',
                            backgroundColor: isCameraOff ? '#FF453A' : 'rgba(255,255,255,0.1)',
                            borderWidth: 1, borderColor: isCameraOff ? 'transparent' : 'rgba(255,255,255,0.15)',
                            transform: [{ scale: pressed ? 0.9 : 1 }],
                        })}>
                            <Camera size={22} color="#fff" />
                        </Pressable>

                        {/* Switch Camera */}
                        <Pressable onPress={switchCamera} style={({ pressed }) => ({
                            width: 52, height: 52, borderRadius: 26,
                            alignItems: 'center', justifyContent: 'center',
                            backgroundColor: 'rgba(255,255,255,0.1)',
                            borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
                            transform: [{ scale: pressed ? 0.9 : 1 }],
                        })}>
                            <SwitchCamera size={22} color="#fff" />
                        </Pressable>
                    </View>

                </View>
            </View>

            {/* ── Pause confirm modal ── */}
            <PauseConfirmModal
                visible={pauseDialog}
                onCancel={() => setPauseDialog(false)}
                onConfirm={handlePauseConfirmed}
            />

            {/* ── End session confirm modal (2 steps) ── */}
            <EndSessionModal
                visible={endDialog}
                step={endStep}
                onCancel={() => { setEndDialog(false); setEndStep(1); }}
                onStep1={() => setEndStep(2)}
                onStep2={handleEndStep2}
            />
            {/* ── Cancel No-Show confirm modal (2 bước) ── */}
            <CancelNoShowModal
                visible={noShowDialog}
                step={noShowStep}
                onCancel={() => { setNoShowDialog(false); setNoShowStep(1); }}
                onStep1={() => setNoShowStep(2)}
                onStep2={handleNoShowStep2}
            />
        </SafeAreaView>
    );
}
