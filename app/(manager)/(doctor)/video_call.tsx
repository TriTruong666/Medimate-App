import { useLocalSearchParams, useRouter } from 'expo-router';
import { Camera, Mic, MicOff, PhoneOff, SwitchCamera, MessageSquare, X, Send } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import { Dimensions, PermissionsAndroid, Platform, Pressable, Text, View, ActivityIndicator, KeyboardAvoidingView, ScrollView, TextInput, Keyboard } from 'react-native';
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
import { getVideoCallToken } from '../../../apis/videoCall.api';
import { getMessages, sendMessage } from '../../../apis/chat.api';
import { MessageDto } from '../../../types/Chat';

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
    
    // Chat States
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [chatText, setChatText] = useState('');
    const [messages, setMessages] = useState<MessageDto[]>([]);
    const scrollViewRef = useRef<ScrollView>(null);

    // Agora Engine Reference
    const agoraEngineRef = useRef<IRtcEngine | null>(null);
    const isLocalCameraActive = !isCameraOff;
    const sid = typeof sessionId === 'string' ? sessionId : (sessionId?.[0] || '');

    // Chat Polling
    useEffect(() => {
        if (!sid) return;
        const fetchMsg = async () => {
            try {
                const res = await getMessages(sid);
                if (res.success && res.data) setMessages(res.data);
            } catch (e) {}
        };
        fetchMsg();
        const interval = setInterval(fetchMsg, 3000);
        return () => clearInterval(interval);
    }, [sid]);

    const handleSendChat = async () => {
        if (!chatText.trim() || !sid) return;
        const text = chatText.trim();
        setChatText('');
        try {
            const res = await sendMessage(sid, text);
            if (res.success && res.data) {
                setMessages(prev => {
                    if (prev.find(m => m.messageId === res.data!.messageId)) return prev;
                    return [...prev, res.data!];
                });
                setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
            }
        } catch (e) {
            toast.error("Lỗi", "Không thể gửi tin nhắn");
        }
    };

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

                    // Join Channel (ChannelName = sessionId)
                    agoraEngineRef.current.joinChannel(rtcToken, sid, 0, {
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
                    <View className="flex-row items-center gap-x-4 px-6 py-4 bg-black/60 rounded-[32px] backdrop-blur-xl border border-white/10 shadow-2xl">
                        
                        {/* Chat Toggle */}
                        <Pressable 
                            onPress={() => setIsChatOpen(!isChatOpen)}
                            className={`w-12 h-12 rounded-full items-center justify-center active:scale-90 ${isChatOpen ? 'bg-[#FFD700]' : 'bg-white/20'}`}
                        >
                            <MessageSquare size={20} color={isChatOpen ? "black" : "white"} />
                        </Pressable>

                        {/* Mic Toggle */}
                        <Pressable 
                            onPress={toggleMute}
                            className={`w-12 h-12 rounded-full items-center justify-center active:scale-90 ${isMuted ? 'bg-[#FF4A4A]' : 'bg-white/20'}`}
                        >
                            {isMuted ? <MicOff size={20} color="white" /> : <Mic size={20} color="white" />}
                        </Pressable>

                        {/* Camera Toggle */}
                        <Pressable 
                            onPress={toggleCamera}
                            className={`w-12 h-12 rounded-full items-center justify-center active:scale-90 ${isCameraOff ? 'bg-[#FF4A4A]' : 'bg-white/20'}`}
                        >
                            <Camera size={20} color="white" />
                        </Pressable>

                        {/* End Call */}
                        <Pressable 
                            onPress={handleEndCall}
                            className="w-14 h-14 rounded-full items-center justify-center bg-[#FF4A4A] shadow-[0_0_20px_rgba(255,74,74,0.5)] active:scale-90 border-2 border-[#FF4A4A]"
                        >
                            <PhoneOff size={24} color="white" strokeWidth={2.5} />
                        </Pressable>
                        
                    </View>
                </View>

                {/* Sliding Chat Panel */}
                {isChatOpen && (
                    <KeyboardAvoidingView 
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
                        className="absolute bottom-32 left-4 right-4 h-96 bg-[#1C1C1E]/95 backdrop-blur-3xl border border-white/20 rounded-3xl p-4 shadow-2xl"
                    >
                        <View className="flex-row justify-between items-center mb-3 pb-3 border-b border-white/10">
                            <Text className="text-white font-space-bold text-lg">Chat tư vấn</Text>
                            <Pressable onPress={() => { setIsChatOpen(false); Keyboard.dismiss(); }} className="w-8 h-8 bg-white/10 rounded-full items-center justify-center">
                                <X size={18} color="white"/>
                            </Pressable>
                        </View>
                        
                        <ScrollView 
                            ref={scrollViewRef}
                            className="flex-1 mb-2"
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={{ gap: 12, paddingBottom: 10 }}
                            onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
                        >
                            {messages.map((msg) => {
                                const isMe = msg.senderType === 1; // 1 is Doctor, 0 is User
                                return (
                                    <View key={msg.messageId} className={`flex-row ${isMe ? 'justify-end' : 'justify-start'}`}>
                                        <View className={`max-w-[80%] rounded-2xl px-4 py-3 ${isMe ? 'bg-[#FFD700] rounded-tr-sm' : 'bg-white/10 rounded-tl-sm'}`}>
                                            <Text className={`font-space-medium ${isMe ? 'text-black' : 'text-white'}`}>{msg.content}</Text>
                                        </View>
                                    </View>
                                );
                            })}
                        </ScrollView>

                        <View className="flex-row items-center gap-3 mt-2">
                            <TextInput 
                                className="flex-1 h-12 bg-black/50 text-white rounded-2xl px-4 font-space-medium border border-white/10" 
                                placeholder="Nhập tin nhắn..." 
                                placeholderTextColor="#888" 
                                value={chatText} 
                                onChangeText={setChatText}
                                onSubmitEditing={handleSendChat}
                            />
                            <Pressable onPress={handleSendChat} className="w-12 h-12 bg-[#FFD700] rounded-2xl items-center justify-center active:scale-95 shadow-lg">
                                <Send size={20} color="black"/>
                            </Pressable>
                        </View>
                    </KeyboardAvoidingView>
                )}

            </View>
        </SafeAreaView>
    );
}
