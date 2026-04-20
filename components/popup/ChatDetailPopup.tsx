import * as FileSystem from 'expo-file-system/legacy';
import * as MediaLibrary from 'expo-media-library';
import { useRouter } from "expo-router";
import {
    Download,
    Paperclip,
    Phone,
    Send,
    X
} from "lucide-react-native";
import React, { useRef, useState } from "react";
import {
    FlatList,
    Image,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    Text,
    TextInput,
    View
} from "react-native";
import { getMessages, sendMessage } from "../../apis/chat.api";
import { useChatSignalR } from "../../hooks/useSignalR";
import { useToast } from "../../stores/toastStore";

// ─── Types ───────────────────────────────────────────────────
interface ChatMessage {
    id: string;
    text: string;
    sender: "me" | "other";
    time: string;
    attachmentUrl?: string | null;
}

interface ChatDetailPopupProps {
    name?: string;
    avatar?: string;
    specialty?: string;
    sessionId?: string;
    appointmentId?: string;
    startedAt?: string | null;
    isCompleted?: boolean;
    onClose: () => void;
}

// ─── Mock Messages ───────────────────────────────────────────
const MOCK_MESSAGES: ChatMessage[] = [

];

/**
 * ChatDetailPopup - Reverted to High-Performance Modal Style
 */
export const ChatDetailPopup: React.FC<ChatDetailPopupProps> = ({
    name = "Prof. Dr. Logan Mason",
    avatar = "https://cdn-icons-png.flaticon.com/512/3845/3842326.png",
    specialty = "Nha khoa",
    sessionId,
    appointmentId,
    startedAt,
    isCompleted = false,
    onClose,
}) => {
    const router = useRouter();
    const [messages, setMessages] = useState<ChatMessage[]>(MOCK_MESSAGES);
    const [inputText, setInputText] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [isDownloading, setIsDownloading] = useState(false);
    const [timeLeft, setTimeLeft] = useState<string | null>(null);
    const flatListRef = useRef<FlatList>(null);
    const toast = useToast();
    // Ref lưu fetchMsgs function để SignalR có thể gọi mà không cần re-subscribe
    const fetchMsgsRef = useRef<() => Promise<void>>(async () => { });

    React.useEffect(() => {
        if (!startedAt) return;

        const startTime = new Date(startedAt).getTime();
        const endTime = startTime + 125 * 60 * 1000;

        const updateTimer = () => {
            const now = Date.now();
            const diff = endTime - now;

            if (diff <= 0) {
                setTimeLeft("Đã hết giờ");
                return false;
            }

            const h = Math.floor(diff / (1000 * 60 * 60));
            const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const s = Math.floor((diff % (1000 * 60)) / 1000);

            const timeStr = [
                h > 0 ? h.toString().padStart(2, '0') : null,
                m.toString().padStart(2, '0'),
                s.toString().padStart(2, '0')
            ].filter(Boolean).join(':');

            setTimeLeft(timeStr);
            return true;
        };

        if (updateTimer()) {
            const interval = setInterval(() => {
                if (!updateTimer()) clearInterval(interval);
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [startedAt, isCompleted]);

    React.useEffect(() => {
        if (!sessionId) return;

        const fetchMsgs = async () => {
            setIsLoading(true);
            try {
                const res = await getMessages(sessionId);
                if (res.success && res.data) {
                    const sorted = res.data.sort((a, b) => new Date(a.sendAt).getTime() - new Date(b.sendAt).getTime());
                    const mapped: ChatMessage[] = sorted.map(m => ({
                        id: m.messageId,
                        text: m.content || "",
                        sender: m.senderType === 1 ? "me" : "other", // 1 = User, 2 = Doctor
                        time: new Date(m.sendAt).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
                        attachmentUrl: m.attachmentUrl,
                    }));
                    setMessages(mapped);
                }
            } catch (e) {
            } finally {
                setIsLoading(false);
            }
        };

        // Lưu ref để SignalR handler có thể gọi
        fetchMsgsRef.current = fetchMsgs;

        // Fetch lần đầu khi mở popup
        fetchMsgs();

        // Không còn polling — tin mới sẽ được nhận qua SignalR
    }, [sessionId]);

    // ⎯⎯ Kết nối SignalR realtime — nhận tin nhắn mới theo sessionId ⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯
    useChatSignalR(sessionId, (data) => {
        // Nếu tin do chính mình gửi (senderType=1=User) thì optimistic message đã có sẵn, không fetch
        // Nếu là tin từ bác sĩ (senderType=2) đầy phải fetch lại mới có nội dung đầy đủ
        const senderType = data?.senderType ?? data?.SenderType ?? data?.Type;
        const isFromMe = senderType === 1; // 1 = User (member)
        if (!isFromMe) {
            fetchMsgsRef.current();
        }
    });

    const handleSend = async () => {
        if (!inputText.trim()) return;
        const text = inputText.trim();
        setInputText("");

        const newMsg: ChatMessage = {
            id: Date.now().toString(),
            text: text,
            sender: "me",
            time: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
        };

        setMessages((prev) => [...prev, newMsg]);

        if (sessionId) {
            try {
                await sendMessage(sessionId, text);
            } catch (e) {
                console.error(e);
            }
        }

        setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
    };

    const handleDownloadImage = async (url: string) => {
        try {
            setIsDownloading(true);
            const { status } = await MediaLibrary.requestPermissionsAsync();
            if (status !== 'granted') {
                toast.error('Thiếu quyền', 'Vui lòng cấp quyền truy cập thư viện ảnh để lưu đơn thuốc.');
                return;
            }

            toast.info('Đang tải xuống', 'Vui lòng đợi trong giây lát...');
            const fileName = `medimate_prescription_${Date.now()}.jpg`;
            const fileUri = `${FileSystem.documentDirectory}${fileName}`;

            const downloadedFile = await FileSystem.downloadAsync(url, fileUri);

            if (downloadedFile.status === 200) {
                await MediaLibrary.saveToLibraryAsync(downloadedFile.uri);
                toast.success('Thành công', 'Đã lưu ảnh vào thư viện của bạn!');
            } else {
                toast.error('Lỗi tải ảnh', 'Tải ảnh thất bại. Vui lòng thử lại.');
            }
        } catch (error) {
            console.error('Download error:', error);
            toast.error('Lỗi', 'Đã xảy ra lỗi khi lưu ảnh.');
        } finally {
            setIsDownloading(false);
        }
    };

    const renderMessage = ({ item }: { item: ChatMessage }) => {
        const isMe = item.sender === "me";
        return (
            <View style={{ alignSelf: isMe ? "flex-end" : "flex-start", maxWidth: "85%", marginBottom: 12 }}>
                <View style={{
                    backgroundColor: isMe ? "#000" : "#FFF",
                    borderWidth: 2,
                    borderColor: "#000",
                    borderRadius: 20,
                    borderBottomRightRadius: isMe ? 4 : 20,
                    borderBottomLeftRadius: isMe ? 20 : 4,
                    paddingHorizontal: 16,
                    paddingVertical: 10,
                    shadowColor: "#000",
                    shadowOffset: { width: isMe ? 3 : 0, height: isMe ? 3 : 0 },
                    shadowOpacity: isMe ? 1 : 0,
                    shadowRadius: 0,
                }}>
                    {item.text ? (
                        <Text style={{ fontFamily: "SpaceGrotesk_500Medium", fontSize: 13, color: isMe ? "#FFF" : "#000", lineHeight: 18 }}>
                            {item.text}
                        </Text>
                    ) : null}

                    {item.attachmentUrl ? (
                        <Pressable onPress={() => setPreviewImage(item.attachmentUrl || null)}>
                            <Image
                                source={{ uri: item.attachmentUrl }}
                                style={{
                                    width: 220,
                                    height: 220,
                                    borderRadius: 12,
                                    marginTop: item.text ? 10 : 0,
                                    backgroundColor: isMe ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                                    borderWidth: 1,
                                    borderColor: isMe ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'
                                }}
                                resizeMode="cover"
                            />
                        </Pressable>
                    ) : null}
                </View>
                <Text style={{ fontFamily: "SpaceGrotesk_500Medium", fontSize: 9, color: "rgba(0,0,0,0.25)", marginTop: 4, textAlign: isMe ? "right" : "left", paddingHorizontal: 4 }}>
                    {item.time}
                </Text>
            </View>
        );
    };

    return (
        <View style={{ flex: 1, justifyContent: "flex-end" }}>
            {/* Backdrop */}
            <Pressable
                style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.45)" }}
                onPress={onClose}
            />

            {/* Main Chat Sheet */}
            <KeyboardAvoidingView 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{
                    height: "90%",
                    backgroundColor: "#F9F6FC",
                    borderTopLeftRadius: 32,
                    borderTopRightRadius: 32,
                    borderTopWidth: 4,
                    borderColor: "#000",
                    overflow: "hidden"
                }}
            >
                {/* 1. Header Area */}
                <View style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingHorizontal: 20,
                    paddingTop: 16,
                    paddingBottom: 16,
                    borderBottomWidth: 1,
                    borderBottomColor: "rgba(0,0,0,0.06)",
                    backgroundColor: "#FFF"
                }}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                        <View style={{ width: 44, height: 44, borderRadius: 14, borderWidth: 2, borderColor: "#000", backgroundColor: "#D9AEF6", overflow: "hidden" }}>
                            <Image source={{ uri: avatar }} style={{ width: 44, height: 44 }} />
                        </View>
                        <View>
                            <Text style={{ fontFamily: "SpaceGrotesk_700Bold", fontSize: 15, color: "#000" }}>{name}</Text>
                            <View style={{ flexDirection: "row", alignItems: "center", gap: 5, marginTop: 2 }}>
                                <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: "#22C55E" }} />
                                <Text style={{ fontFamily: "SpaceGrotesk_500Medium", fontSize: 10, color: "rgba(0,0,0,0.4)" }}>Online • {specialty}</Text>
                            </View>
                        </View>
                    </View>

                    <View style={{ flexDirection: "row", gap: 8 }}>
                        {!isCompleted && (
                            <Pressable
                                onPress={() => {
                                    onClose();
                                    router.push({
                                        pathname: "/(manager)/(doctor)/video_call",
                                        params: { sessionId, appointmentId }
                                    } as any);
                                }}
                                style={{ width: 36, height: 36, borderRadius: 10, borderWidth: 2, borderColor: "#000", backgroundColor: "#34D399", alignItems: "center", justifyContent: "center" }}
                            >
                                <Phone size={16} color="#000" strokeWidth={2.5} />
                            </Pressable>
                        )}
                        <Pressable onPress={onClose} style={{ width: 36, height: 36, borderRadius: 18, borderWidth: 2, borderColor: "#000", backgroundColor: "#FFF", alignItems: "center", justifyContent: "center" }}>
                            <X size={16} color="#000" strokeWidth={2.5} />
                        </Pressable>
                    </View>
                </View>

                {/* Optional Timer Banner */}
                {startedAt && timeLeft !== "Đã hết giờ" && (
                    <View style={{ backgroundColor: "#FEF3C7", paddingVertical: 8, alignItems: "center", borderBottomWidth: 1, borderBottomColor: "rgba(0,0,0,0.06)" }}>
                        <Text style={{ fontFamily: "SpaceGrotesk_600SemiBold", fontSize: 12, color: "#D97706" }}>
                            Thời gian chat còn lại: {timeLeft || "Đang tính..."}
                        </Text>
                    </View>
                )}

                {/* 2. Chat History (Fills Flex Space) */}
                <View style={{ flex: 1 }}>
                    <FlatList
                        ref={flatListRef}
                        data={messages}
                        renderItem={renderMessage}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 15, paddingBottom: 20 }}
                        showsVerticalScrollIndicator={false}
                        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
                    />
                </View>

                {/* 3. Input Area (Seamless Bottom White) */}
                {timeLeft === "Đã hết giờ" ? (
                    <View style={{
                        backgroundColor: "#FFF",
                        borderTopWidth: 2,
                        borderTopColor: "rgba(0,0,0,0.06)",
                        paddingHorizontal: 16,
                        paddingVertical: 20,
                        alignItems: "center"
                    }}>
                        <Text style={{ fontFamily: "SpaceGrotesk_500Medium", fontSize: 13, color: "rgba(0,0,0,0.4)", textAlign: "center" }}>
                            Phòng chat đã tự động đóng khi hết giờ. Bạn không thể gửi thêm tin nhắn.
                        </Text>
                    </View>
                ) : (
                    <View style={{
                        backgroundColor: "#FFF",
                        borderTopWidth: 2,
                        borderTopColor: "rgba(0,0,0,0.06)",
                        paddingHorizontal: 16,
                        paddingTop: 12,
                        paddingBottom: Platform.OS === "ios" ? 40 : 25,
                    }}>
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                            <Pressable style={{ width: 42, height: 42, borderRadius: 12, borderWidth: 2, borderColor: "rgba(0,0,0,0.05)", backgroundColor: "#FFF", alignItems: "center", justifyContent: "center" }}>
                                <Paperclip size={18} color="rgba(0,0,0,0.2)" strokeWidth={2} />
                            </Pressable>

                            <View style={{ flex: 1, backgroundColor: "#F5F3F8", borderWidth: 2, borderColor: "#000", borderRadius: 18, paddingHorizontal: 15, height: 46, justifyContent: 'center' }}>
                                <TextInput
                                    style={{ fontFamily: "SpaceGrotesk_500Medium", fontSize: 13, color: "#000" }}
                                    placeholder="Nhập tin nhắn..."
                                    placeholderTextColor="rgba(0,0,0,0.2)"
                                    value={inputText}
                                    onChangeText={setInputText}
                                    onSubmitEditing={handleSend}
                                />
                            </View>

                            <Pressable
                                onPress={handleSend}
                                style={{
                                    width: 46,
                                    height: 46,
                                    borderRadius: 14,
                                    borderWidth: 2,
                                    borderColor: "#000",
                                    backgroundColor: inputText.trim() ? "#000" : "#E5E7EB",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    shadowColor: "#000",
                                    shadowOffset: inputText.trim() ? { width: 3, height: 3 } : { width: 0, height: 0 },
                                    shadowOpacity: inputText.trim() ? 1 : 0,
                                    shadowRadius: 0,
                                }}
                            >
                                <Send size={18} color={inputText.trim() ? "#FFF" : "rgba(0,0,0,0.2)"} strokeWidth={2.5} />
                            </Pressable>
                        </View>
                    </View>
                )}
            </KeyboardAvoidingView>

            {/* Image Preview Modal Overlay */}
            {previewImage && (
                <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.95)', zIndex: 9999 }}>
                    <View style={{ position: 'absolute', top: 50, right: 20, zIndex: 10000, flexDirection: 'row', gap: 16 }}>
                        <Pressable
                            onPress={() => handleDownloadImage(previewImage)}
                            disabled={isDownloading}
                            style={{ width: 44, height: 44, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 22, alignItems: 'center', justifyContent: 'center', opacity: isDownloading ? 0.5 : 1 }}
                        >
                            <Download size={20} color="#FFF" />
                        </Pressable>
                        <Pressable
                            onPress={() => setPreviewImage(null)}
                            style={{ width: 44, height: 44, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 22, alignItems: 'center', justifyContent: 'center' }}
                        >
                            <X size={20} color="#FFF" />
                        </Pressable>
                    </View>
                    <Pressable style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }} onPress={() => setPreviewImage(null)}>
                        <Image source={{ uri: previewImage }} style={{ width: '100%', height: '80%' }} resizeMode="contain" />
                    </Pressable>
                </View>
            )}
        </View>
    );
};
