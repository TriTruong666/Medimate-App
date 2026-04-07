import { useLocalSearchParams, useRouter } from 'expo-router';
import { Camera, Mic, MicOff, Minimize2, PhoneOff, SwitchCamera } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Dimensions, PermissionsAndroid, Platform, Pressable, Text, View } from 'react-native';
import {
    ChannelProfileType,
    ClientRoleType,
    createAgoraRtcEngine,
    IRtcEngine,
    RtcConnection,
    RtcSurfaceView
} from 'react-native-agora';
import { SafeAreaView } from 'react-native-safe-area-context';
import { endSession, joinSession } from '../../../apis/session.api';
import { getVideoCallToken } from '../../../apis/videoCall.api';
import { useToast } from '../../../stores/toastStore';
import {
    getGlobalAgoraEngine,
    setGlobalAgoraEngine,
    useVideoCallActions,
} from '../../../stores/videoCallStore';

const { width, height } = Dimensions.get('window');

const AGORA_APP_ID = process.env.EXPO_PUBLIC_AGORA_APP_ID || 'dummy_app_id';

export default function VideoCallScreen() {
    const router = useRouter();
    const toast = useToast();
    const { sessionId, appointmentId } = useLocalSearchParams();
    const { state: callState, startCall, minimize, updateCallState, endCall } = useVideoCallActions();

    const [hasJoined, setHasJoined] = useState(callState.isActive ? callState.hasJoined : false);
    const [remoteUids, setRemoteUids] = useState<number[]>(callState.isActive ? callState.remoteUids : []);
    const [isMuted, setIsMuted] = useState(callState.isActive ? callState.isMuted : false);
    const [isCameraOff, setIsCameraOff] = useState(callState.isActive ? callState.isCameraOff : false);

    const agoraEngineRef = useRef<IRtcEngine | null>(getGlobalAgoraEngine());
    const sid = typeof sessionId === 'string' ? sessionId : (sessionId?.[0] || '');

    // Mark call as active in the global store when entering this screen
    useEffect(() => {
        if (sid) {
            const aid = typeof appointmentId === 'string' ? appointmentId : (appointmentId?.[0] || '');
            // If returning from minimized state, just un-minimize
            if (callState.isMinimized && callState.sessionId === sid) {
                updateCallState({ isMinimized: false });
                // Restore state from global store
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

    // Sync local state to global store
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
                    router.back();
                    return;
                }
            }

            try {
                // Reuse existing engine if returning from minimized
                const existingEngine = getGlobalAgoraEngine();
                if (existingEngine) {
                    agoraEngineRef.current = existingEngine;
                    return; // Already initialized and connected
                }

                const engine = createAgoraRtcEngine();
                engine.initialize({ appId: AGORA_APP_ID });

                engine.registerEventHandler({
                    onJoinChannelSuccess: () => {
                        console.log('Successfully joined the channel');
                        if (isMounted) setHasJoined(true);
                    },
                    onUserJoined: (_connection: RtcConnection, uid: number) => {
                        console.log('Remote user joined', uid);
                        if (isMounted) setRemoteUids(prev => prev.includes(uid) ? prev : [...prev, uid]);
                    },
                    onUserOffline: (_connection: RtcConnection, uid: number) => {
                        console.log('Remote user left', uid);
                        if (isMounted) setRemoteUids(prev => prev.filter(u => u !== uid));
                    },
                    onError: (err, msg) => {
                        console.error('Agora Error', err, msg);
                    }
                });

                engine.enableVideo();
                engine.startPreview();

                // Fetch Token from API
                let rtcToken = '';
                try {
                    const tokenRes = await getVideoCallToken(sid, "publisher");
                    if (tokenRes.success && tokenRes.data) {
                        rtcToken = tokenRes.data;
                    }
                } catch (e) {
                    console.log('Error fetching Agora Token:', e);
                }

                // Call Backend Session Join
                try {
                    await joinSession(sid, { role: "Member" });
                } catch (e) {
                    console.log('Error joining session backend:', e);
                }

                // Join Channel
                engine.joinChannel(rtcToken, sid, 0, {
                    clientRoleType: ClientRoleType.ClientRoleBroadcaster,
                    channelProfile: ChannelProfileType.ChannelProfileCommunication,
                });

                agoraEngineRef.current = engine;
                setGlobalAgoraEngine(engine); // Store globally for PiP
            } catch (error) {
                console.error('Error initializing Agora:', error);
            }
        };

        // Don't re-init if returning from minimized with existing engine
        if (getGlobalAgoraEngine()) {
            agoraEngineRef.current = getGlobalAgoraEngine();
            return;
        }

        if (AGORA_APP_ID !== 'dummy_app_id') {
            initAgora();
        } else {
            console.warn("Agora App ID is missing. Video call will not function correctly.");
            setTimeout(() => {
                if (isMounted) setHasJoined(true);
            }, 1000);
        }

        // NOTE: We do NOT clean up Agora here — cleanup happens in endCall() from the store.
        return () => {
            isMounted = false;
        };
    }, []);

    const toggleMute = () => {
        if (agoraEngineRef.current) {
            agoraEngineRef.current.muteLocalAudioStream(!isMuted);
        }
        setIsMuted(!isMuted);
    };

    const switchCamera = () => {
        if (agoraEngineRef.current) {
            agoraEngineRef.current.switchCamera();
        }
    };

    const toggleCamera = () => {
        if (agoraEngineRef.current) {
            agoraEngineRef.current.muteLocalVideoStream(!isCameraOff);
        }
        setIsCameraOff(!isCameraOff);
    };

    const handleMinimize = () => {
        // Save current state to global store and go back
        updateCallState({ hasJoined, remoteUids, isMuted, isCameraOff });
        minimize();
        router.back();
    };

    const handleEndCall = async () => {
        try {
            if (sid) {
                await endSession(sid);
            }
        } catch (e) {
            console.error(e);
        }
        endCall(); // This cleans up Agora engine via the store
        toast.info("Cuộc gọi đã kết thúc", "Trở về trang lịch khám");
        router.back();
    };

    const isMocking = AGORA_APP_ID === 'dummy_app_id';

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#000' }} edges={['top']}>
            <View style={{ flex: 1, backgroundColor: '#000', position: 'relative' }}>

                {/* Remote Video Stream (Main Background) */}
                {hasJoined ? (
                    (remoteUids.length > 0 || isMocking) ? (
                        <View style={{ flex: 1, backgroundColor: '#1C1C1E' }}>
                            {remoteUids.length > 0 && agoraEngineRef.current ? (
                                remoteUids.length === 1 ? (
                                    // 1 Remote User -> Full Screen
                                    <RtcSurfaceView canvas={{ uid: remoteUids[0] }} style={{ flex: 1 }} />
                                ) : (
                                    // 2+ Remote Users -> Split Screen
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
                                    <Text style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'SpaceGrotesk_500Medium', fontSize: 16 }}>
                                        Bác sĩ đang vào...
                                    </Text>
                                    <ActivityIndicator size="large" color="#FFD700" style={{ marginTop: 16 }} />
                                </View>
                            )}
                        </View>
                    ) : (
                        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                            <Text style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'SpaceGrotesk_500Medium', fontSize: 16 }}>
                                Đang chờ bác sĩ tham gia...
                            </Text>
                        </View>
                    )
                ) : (
                    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                        <ActivityIndicator color="white" size="large" />
                        <Text style={{ fontFamily: 'SpaceGrotesk_700Bold', color: '#fff', marginTop: 16, letterSpacing: 2, textTransform: 'uppercase' }}>
                            Đang kết nối...
                        </Text>
                    </View>
                )}

                {/* Local Video Stream (Picture-in-Picture) */}
                <View style={{
                    position: 'absolute', top: 24, right: 24,
                    width: 112, height: 160,
                    borderRadius: 24, backgroundColor: '#2C2C2E',
                    borderWidth: 2, borderColor: 'rgba(255,255,255,0.2)',
                    overflow: 'hidden',
                }}>
                    {!isCameraOff ? (
                        agoraEngineRef.current ? (
                            <RtcSurfaceView canvas={{ uid: 0 }} style={{ flex: 1 }} />
                        ) : (
                            <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' }}>
                                <Text style={{ fontFamily: 'SpaceGrotesk_700Bold', color: '#fff', fontSize: 10 }}>Bạn</Text>
                            </View>
                        )
                    ) : (
                        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', alignItems: 'center', justifyContent: 'center' }}>
                            <Camera size={24} color="#666" />
                        </View>
                    )}
                </View>

                {/* Top Left info overlay */}
                <View style={{
                    position: 'absolute', top: 24, left: 24,
                    paddingHorizontal: 16, paddingVertical: 8,
                    backgroundColor: 'rgba(0,0,0,0.4)',
                    borderRadius: 999, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
                }}>
                    <Text style={{
                        color: '#fff', fontFamily: 'SpaceGrotesk_700Bold',
                        letterSpacing: 2, fontSize: 10, textTransform: 'uppercase',
                    }}>
                        {remoteUids.length > 0 ? (remoteUids.length > 1 ? '👥 Phòng 3 người' : '🟢 Đang tư vấn') : '🔴 Đang chờ'}
                    </Text>
                </View>

                {/* Compact Floating Dock Controls */}
                <View style={{
                    position: 'absolute', bottom: 48, left: 0, right: 0,
                    alignItems: 'center',
                }}>
                    <View style={{
                        flexDirection: 'row', alignItems: 'center', gap: 18,
                        paddingHorizontal: 18, paddingVertical: 12,
                        backgroundColor: 'rgba(28, 28, 30, 0.85)',
                        borderRadius: 36,
                        borderWidth: 1.5,
                        borderColor: 'rgba(255,255,255,0.15)',
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 10 },
                        shadowOpacity: 0.5,
                        shadowRadius: 20,
                        elevation: 12,
                    }}>

                        {/* Minimize */}
                        <Pressable
                            onPress={handleMinimize}
                            style={({ pressed }) => ({
                                width: 50, height: 50, borderRadius: 25,
                                alignItems: 'center', justifyContent: 'center',
                                backgroundColor: 'rgba(255,255,255,0.12)',
                                transform: [{ scale: pressed ? 0.92 : 1 }],
                            })}
                        >
                            <Minimize2 size={24} color="white" />
                        </Pressable>

                        {/* Mic */}
                        <Pressable
                            onPress={toggleMute}
                            style={({ pressed }) => ({
                                width: 50, height: 50, borderRadius: 25,
                                alignItems: 'center', justifyContent: 'center',
                                backgroundColor: isMuted ? '#FF453A' : 'rgba(255,255,255,0.12)',
                                transform: [{ scale: pressed ? 0.92 : 1 }],
                            })}
                        >
                            {isMuted ? <MicOff size={24} color="white" /> : <Mic size={24} color="white" />}
                        </Pressable>

                        {/* End Call (Main Action) */}
                        <Pressable
                            onPress={handleEndCall}
                            style={({ pressed }) => ({
                                width: 64, height: 64, borderRadius: 32,
                                alignItems: 'center', justifyContent: 'center',
                                backgroundColor: '#FF3B30',
                                shadowColor: '#FF3B30',
                                shadowOffset: { width: 0, height: 6 },
                                shadowOpacity: 0.6,
                                shadowRadius: 15,
                                transform: [{ scale: pressed ? 0.9 : 1 }],
                                borderWidth: 3.5,
                                borderColor: 'rgba(255,255,255,0.2)',
                                elevation: 8,
                            })}
                        >
                            <PhoneOff size={24} color="white" strokeWidth={2.5} />
                        </Pressable>

                        {/* Camera */}
                        <Pressable
                            onPress={toggleCamera}
                            style={({ pressed }) => ({
                                width: 50, height: 50, borderRadius: 25,
                                alignItems: 'center', justifyContent: 'center',
                                backgroundColor: isCameraOff ? '#FF453A' : 'rgba(255,255,255,0.12)',
                                transform: [{ scale: pressed ? 0.92 : 1 }],
                            })}
                        >
                            <Camera size={24} color="white" />
                        </Pressable>

                        {/* Switch Camera */}
                        <Pressable
                            onPress={switchCamera}
                            style={({ pressed }) => ({
                                width: 50, height: 50, borderRadius: 25,
                                alignItems: 'center', justifyContent: 'center',
                                backgroundColor: 'rgba(255,255,255,0.12)',
                                transform: [{ scale: pressed ? 0.92 : 1 }],
                            })}
                        >
                            <SwitchCamera size={24} color="white" />
                        </Pressable>

                    </View>
                </View>

            </View>
        </SafeAreaView>
    );
}
