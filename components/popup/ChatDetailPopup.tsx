import { useSetAtom } from "jotai";
import {
    Image as ImageIcon,
    Mic,
    Paperclip,
    Phone,
    Send,
    Video,
    X,
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
    View,
} from "react-native";
import { popupAtom } from "../../stores/popupStore";

// ─── Types ───────────────────────────────────────────────────
interface ChatMessage {
    id: string;
    text: string;
    sender: "me" | "other";
    time: string;
}

interface ChatDetailPopupProps {
    name?: string;
    avatar?: string;
    specialty?: string;
    onClose: () => void;
}

// ─── Mock Messages ───────────────────────────────────────────
const MOCK_MESSAGES: ChatMessage[] = [
    { id: '1', text: 'Chào bác sĩ, em muốn hỏi về tình trạng răng khôn ạ.', sender: 'me', time: '09:10' },
    { id: '2', text: 'Chào bạn! Bạn có thể mô tả triệu chứng cụ thể hơn không? Ví dụ như đau ở vị trí nào, đau khi nào, etc.', sender: 'other', time: '09:12' },
    { id: '3', text: 'Dạ em bị đau ở hàm dưới bên phải, đặc biệt khi ăn nhai. Có sưng nhẹ ở nướu.', sender: 'me', time: '09:15' },
    { id: '4', text: 'Trường hợp này có thể là răng khôn đang mọc lệch. Bạn nên chụp X-quang để xác định chính xác. Tôi có thể hẹn lịch cho bạn vào thứ 7 tuần này được không?', sender: 'other', time: '09:18' },
    { id: '5', text: 'Dạ được ạ, em rảnh buổi sáng ạ.', sender: 'me', time: '09:20' },
    { id: '6', text: 'Vậy tôi sẽ đặt lịch cho bạn vào 9:30 sáng thứ 7 nhé. Trước khi đến, bạn nhớ không ăn gì 2 tiếng trước. Nếu đau quá, bạn có thể uống thuốc giảm đau Paracetamol 500mg.', sender: 'other', time: '09:22' },
];

/**
 * ChatDetailPopup - Reusable Chat Detail Popup
 * Can be used for doctor-patient chat, support chat, etc.
 * Accepts name, avatar, specialty via props or popup data.
 */
export const ChatDetailPopup: React.FC<ChatDetailPopupProps> = ({
    name = "Prof. Dr. Logan Mason",
    avatar = "https://cdn-icons-png.flaticon.com/512/3845/3842326.png",
    specialty = "Nha khoa",
    onClose,
}) => {
    const [messages, setMessages] = useState<ChatMessage[]>(MOCK_MESSAGES);
    const [inputText, setInputText] = useState("");
    const flatListRef = useRef<FlatList>(null);

    const handleSend = () => {
        if (!inputText.trim()) return;

        const newMsg: ChatMessage = {
            id: Date.now().toString(),
            text: inputText.trim(),
            sender: "me",
            time: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
        };

        setMessages((prev) => [...prev, newMsg]);
        setInputText("");

        // Scroll to bottom
        setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
    };

    const renderMessage = ({ item }: { item: ChatMessage }) => {
        const isMe = item.sender === "me";
        return (
            <View
                style={{
                    alignSelf: isMe ? "flex-end" : "flex-start",
                    maxWidth: "80%",
                    marginBottom: 12,
                }}
            >
                <View
                    style={{
                        backgroundColor: isMe ? "#000" : "#FFF",
                        borderWidth: 2,
                        borderColor: "#000",
                        borderRadius: 20,
                        borderBottomRightRadius: isMe ? 6 : 20,
                        borderBottomLeftRadius: isMe ? 20 : 6,
                        paddingHorizontal: 16,
                        paddingVertical: 12,
                        shadowColor: "#000",
                        shadowOffset: { width: isMe ? 3 : 2, height: isMe ? 3 : 2 },
                        shadowOpacity: isMe ? 1 : 0,
                        shadowRadius: 0,
                        elevation: isMe ? 3 : 0,
                    }}
                >
                    <Text
                        style={{
                            fontFamily: "SpaceGrotesk_500Medium",
                            fontSize: 14,
                            color: isMe ? "#FFF" : "#000",
                            lineHeight: 20,
                        }}
                    >
                        {item.text}
                    </Text>
                </View>
                <Text
                    style={{
                        fontFamily: "SpaceGrotesk_500Medium",
                        fontSize: 10,
                        color: "rgba(0,0,0,0.25)",
                        marginTop: 4,
                        textAlign: isMe ? "right" : "left",
                        paddingHorizontal: 4,
                    }}
                >
                    {item.time}
                </Text>
            </View>
        );
    };

    return (
        <View style={{ flex: 1, justifyContent: "flex-end" }}>
            {/* Backdrop */}
            <Pressable
                style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: "rgba(0,0,0,0.45)",
                }}
                onPress={onClose}
            />

            {/* Chat Sheet (85% height for tall initial appearance) */}
            <View
                style={{
                    height: "88%",
                    backgroundColor: "#F9F6FC",
                    borderTopLeftRadius: 32,
                    borderTopRightRadius: 32,
                    borderTopWidth: 4,
                    borderColor: "#000",
                    overflow: "hidden",
                }}
            >
                {/* ─── Chat Header ─── */}
                <View
                    style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                        paddingHorizontal: 20,
                        paddingTop: 16,
                        paddingBottom: 16,
                        borderBottomWidth: 2,
                        borderBottomColor: "rgba(0,0,0,0.05)",
                        backgroundColor: "#FFF",
                    }}
                >
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                        <View
                            style={{
                                width: 48,
                                height: 48,
                                borderRadius: 16,
                                borderWidth: 2,
                                borderColor: "#000",
                                backgroundColor: "#D9AEF6",
                                alignItems: "center",
                                justifyContent: "center",
                                overflow: "hidden",
                            }}
                        >
                            <Image
                                source={{ uri: avatar }}
                                style={{ width: 48, height: 48 }}
                            />
                        </View>
                        <View>
                            <Text
                                style={{
                                    fontFamily: "SpaceGrotesk_700Bold",
                                    fontSize: 16,
                                    color: "#000",
                                }}
                            >
                                {name}
                            </Text>
                            <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 2 }}>
                                <View
                                    style={{
                                        width: 8,
                                        height: 8,
                                        borderRadius: 4,
                                        backgroundColor: "#22C55E",
                                    }}
                                />
                                <Text
                                    style={{
                                        fontFamily: "SpaceGrotesk_500Medium",
                                        fontSize: 11,
                                        color: "rgba(0,0,0,0.4)",
                                    }}
                                >
                                    Đang hoạt động • {specialty}
                                </Text>
                            </View>
                        </View>
                    </View>

                    <View style={{ flexDirection: "row", gap: 8 }}>
                        <Pressable
                            style={{
                                width: 40,
                                height: 40,
                                borderRadius: 12,
                                borderWidth: 2,
                                borderColor: "#000",
                                backgroundColor: "#FFF",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <Phone size={18} color="#000" strokeWidth={2.5} />
                        </Pressable>
                        <Pressable
                            style={{
                                width: 40,
                                height: 40,
                                borderRadius: 12,
                                borderWidth: 2,
                                borderColor: "#000",
                                backgroundColor: "#A3E6A1",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <Video size={18} color="#000" strokeWidth={2.5} />
                        </Pressable>
                        <Pressable
                            onPress={onClose}
                            style={{
                                width: 40,
                                height: 40,
                                borderRadius: 20,
                                borderWidth: 2,
                                borderColor: "#000",
                                backgroundColor: "#FFF",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <X size={18} color="#000" strokeWidth={2.5} />
                        </Pressable>
                    </View>
                </View>

                {/* ─── Messages Area ─── */}
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    renderItem={renderMessage}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 10 }}
                    showsVerticalScrollIndicator={false}
                    onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
                />

                {/* ─── Input Area ─── */}
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : undefined}
                    keyboardVerticalOffset={0}
                >
                    <View
                        style={{
                            flexDirection: "row",
                            alignItems: "center",
                            paddingHorizontal: 16,
                            paddingVertical: 12,
                            paddingBottom: Platform.OS === "ios" ? 30 : 16,
                            backgroundColor: "#FFF",
                            borderTopWidth: 2,
                            borderTopColor: "rgba(0,0,0,0.05)",
                            gap: 10,
                        }}
                    >
                        {/* Attachment Buttons */}
                        <Pressable
                            style={{
                                width: 40,
                                height: 40,
                                borderRadius: 12,
                                borderWidth: 2,
                                borderColor: "rgba(0,0,0,0.1)",
                                backgroundColor: "#FFF",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <Paperclip size={18} color="rgba(0,0,0,0.3)" strokeWidth={2} />
                        </Pressable>

                        {/* Text Input */}
                        <View
                            style={{
                                flex: 1,
                                flexDirection: "row",
                                alignItems: "center",
                                backgroundColor: "#F5F3F8",
                                borderWidth: 2,
                                borderColor: "#000",
                                borderRadius: 20,
                                paddingHorizontal: 16,
                                height: 48,
                            }}
                        >
                            <TextInput
                                style={{
                                    flex: 1,
                                    fontFamily: "SpaceGrotesk_500Medium",
                                    fontSize: 14,
                                    color: "#000",
                                    height: 48,
                                }}
                                placeholder="Nhập tin nhắn..."
                                placeholderTextColor="rgba(0,0,0,0.25)"
                                value={inputText}
                                onChangeText={setInputText}
                                multiline={false}
                                onSubmitEditing={handleSend}
                                returnKeyType="send"
                            />
                        </View>

                        {/* Send Button */}
                        <Pressable
                            onPress={handleSend}
                            style={{
                                width: 48,
                                height: 48,
                                borderRadius: 16,
                                borderWidth: 2,
                                borderColor: "#000",
                                backgroundColor: inputText.trim() ? "#B3354B" : "#E5E7EB",
                                alignItems: "center",
                                justifyContent: "center",
                                shadowColor: "#000",
                                shadowOffset: inputText.trim() ? { width: 3, height: 3 } : { width: 0, height: 0 },
                                shadowOpacity: inputText.trim() ? 1 : 0,
                                shadowRadius: 0,
                                elevation: inputText.trim() ? 3 : 0,
                            }}
                        >
                            <Send size={20} color={inputText.trim() ? "#FFF" : "rgba(0,0,0,0.2)"} strokeWidth={2.5} />
                        </Pressable>
                    </View>
                </KeyboardAvoidingView>
            </View>
        </View>
    );
};
