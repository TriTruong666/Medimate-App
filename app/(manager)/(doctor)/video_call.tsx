import { useLocalSearchParams, useRouter } from 'expo-router';
import { Camera, Mic, MicOff, PhoneOff, SwitchCamera } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import { Dimensions, PermissionsAndroid, Platform, Pressable, Text, View, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    ChannelProfileType,
    ClientRoleType,
    createAgoraRtcEngine,
    IRtcEngine,
    RtcSurfaceView,
    RtcConnection
} from 'react-native-agora';
import { useToast } from '../../../stores/toastStore';
import { endSession } from '../../../apis/session.api';

const { width, height } = Dimensions.get('window');

const AGORA_APP_ID = process.env.EXPO_PUBLIC_AGORA_APP_ID || 'dummy_app_id'; // Fallback for dev

export default function VideoCallScreen() {
    const router = useRouter();
    const toast = useToast();
    const { sessionId, appointmentId } = useLocalSearchParams();

    const [hasJoined, setHasJoined] = useState(false);
    const [remoteUid, setRemoteUid] = useState<number | null>(null);
    const [isMuted, setIsMuted] = useState(false);
    const [isCameraOff, setIsCameraOff] = useState(false);
    
    // Agora Engine Reference
    const agoraEngineRef = useRef<IRtcEngine | null>(null);
    const isLocalCameraActive = !isCameraOff;

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
                if (!agoraEngineRef.current) {
                    agoraEngineRef.current = createAgoraRtcEngine();
                    agoraEngineRef.current.initialize({ appId: AGORA_APP_ID });
                    
                    agoraEngineRef.current.registerEventHandler({
                        onJoinChannelSuccess: () => {
                            console.log('Successfully joined the channel');
                            if (isMounted) setHasJoined(true);
                        },
                        onUserJoined: (_connection: RtcConnection, uid: number) => {
                            console.log('Remote user joined', uid);
                            if (isMounted) setRemoteUid(uid);
                        },
                        onUserOffline: (_connection: RtcConnection, uid: number) => {
                            console.log('Remote user left', uid);
                            if (isMounted && remoteUid === uid) {
                                setRemoteUid(null);
                            }
                        },
                        onError: (err, msg) => {
                            console.error('Agora Error', err, msg);
                        }
                    });

                    agoraEngineRef.current.enableVideo();
                    agoraEngineRef.current.startPreview();

                    // Join Channel (ChannelName = sessionId)
                    agoraEngineRef.current.joinChannel('', typeof sessionId === 'string' ? sessionId : (sessionId?.[0] || 'test'), 0, {
                        clientRoleType: ClientRoleType.ClientRoleBroadcaster,
                        channelProfile: ChannelProfileType.ChannelProfileCommunication,
                    });
                }
            } catch (error) {
                console.error('Error initializing Agora:', error);
            }
        };

        if (AGORA_APP_ID !== 'dummy_app_id') {
           initAgora();
        } else {
           console.warn("Agora App ID is missing. Video call will not function correctly.");
           // We'll still simulate UI logic for demonstration
           setTimeout(() => {
               if (isMounted) setHasJoined(true);
           }, 1000);
        }

        return () => {
            isMounted = false;
            if (agoraEngineRef.current) {
                agoraEngineRef.current.leaveChannel();
                agoraEngineRef.current.unregisterEventHandler({});
                agoraEngineRef.current.release();
                agoraEngineRef.current = null;
            }
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

    const handleEndCall = async () => {
        try {
            if (typeof sessionId === 'string') {
               // We end the session formally on backend
               await endSession(sessionId);
            }
        } catch (e) {
            console.error(e);
        }
        toast.info("Cuộc gọi đã kết thúc", "Trở về trang lịch khám");
        router.back();
    };

    // Mocking remote UI for development if no token
    const isMocking = AGORA_APP_ID === 'dummy_app_id';

    return (
        <SafeAreaView className="flex-1 bg-black" edges={['top', 'bottom']}>
            <View className="flex-1 rounded-[40px] overflow-hidden m-2 bg-[#1C1C1E] border border-white/10 relative">
                
                {/* Remote Video Stream (Main Background) */}
                {hasJoined ? (
                    (remoteUid || isMocking) ? (
                        <View className="flex-1 bg-[#1C1C1E]">
                            {/* In a real app, render RtcSurfaceView for remote */}
                            {remoteUid && agoraEngineRef.current ? (
                                <RtcSurfaceView canvas={{ uid: remoteUid }} style={{ flex: 1 }} />
                            ) : (
                                <View className="flex-1 items-center justify-center">
                                    <Text className="text-white/50 font-space-medium text-lg">Bác sĩ chưa tham gia...</Text>
                                    <ActivityIndicator size="large" color="#FFD700" className="mt-4" />
                                </View>
                            )}
                        </View>
                    ) : (
                        <View className="flex-1 items-center justify-center">
                            <Text className="text-white/50 font-space-medium text-lg">Đang chờ bác sĩ tham gia...</Text>
                        </View>
                    )
                ) : (
                    <View className="flex-1 items-center justify-center">
                        <ActivityIndicator color="white" size="large" />
                        <Text className="font-space-bold text-white mt-4 tracking-widest uppercase">Đang kết nối...</Text>
                    </View>
                )}

                {/* Local Video Stream (Picture-in-Picture) */}
                <View className="absolute top-6 right-6 w-28 h-40 rounded-3xl bg-[#2C2C2E] border-2 border-white/20 overflow-hidden shadow-2xl">
                    {!isCameraOff ? (
                        agoraEngineRef.current ? (
                            <RtcSurfaceView canvas={{ uid: 0 }} style={{ flex: 1 }} />
                        ) : (
                            <View className="flex-1 bg-black/50 items-center justify-center rounded-3xl">
                                <Text className="font-space-bold text-white text-[10px]">Bạn</Text>
                            </View>
                        )
                    ) : (
                        <View className="flex-1 bg-black/80 items-center justify-center">
                            <Camera size={24} color="#666" />
                        </View>
                    )}
                </View>

                {/* Top Left info overlay */}
                <View className="absolute top-6 left-6 px-4 py-2 bg-black/40 rounded-full backdrop-blur-md border border-white/10">
                    <Text className="text-white font-space-bold tracking-widest text-[10px] uppercase">
                        {remoteUid ? '🟢 Đang tư vấn' : '🔴 Đang chờ'}
                    </Text>
                </View>

                {/* Controls Overlay */}
                <View className="absolute bottom-10 left-0 right-0 items-center">
                    <View className="flex-row items-center gap-x-6 px-8 py-5 bg-black/60 rounded-[32px] backdrop-blur-xl border border-white/10 shadow-2xl">
                        
                        {/* Mic Toggle */}
                        <Pressable 
                            onPress={toggleMute}
                            className={`w-14 h-14 rounded-full items-center justify-center active:scale-90 ${isMuted ? 'bg-[#FF4A4A]' : 'bg-white/20'}`}
                        >
                            {isMuted ? (
                                <MicOff size={24} color="white" />
                            ) : (
                                <Mic size={24} color="white" />
                            )}
                        </Pressable>

                        {/* Camera Toggle */}
                        <Pressable 
                            onPress={toggleCamera}
                            className={`w-14 h-14 rounded-full items-center justify-center active:scale-90 ${isCameraOff ? 'bg-[#FF4A4A]' : 'bg-white/20'}`}
                        >
                            <Camera size={24} color="white" />
                        </Pressable>

                        {/* Switch Camera */}
                        <Pressable 
                            onPress={switchCamera}
                            className="w-14 h-14 rounded-full items-center justify-center bg-white/20 active:scale-90"
                        >
                            <SwitchCamera size={24} color="white" />
                        </Pressable>

                        {/* End Call */}
                        <Pressable 
                            onPress={handleEndCall}
                            className="w-16 h-16 rounded-full items-center justify-center bg-[#FF4A4A] shadow-[0_0_20px_rgba(255,74,74,0.5)] active:scale-90 border-2 border-[#FF4A4A]"
                        >
                            <PhoneOff size={28} color="white" strokeWidth={2.5} />
                        </Pressable>
                        
                    </View>
                </View>

            </View>
        </SafeAreaView>
    );
}
