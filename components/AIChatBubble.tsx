import React, { useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    KeyboardAvoidingView,
    PanResponder,
    Platform,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    View,
} from 'react-native';
import { Bot, ChevronRight, Send, X } from 'lucide-react-native';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

const BUBBLE_W = 52;
const BUBBLE_H = 90;
const MARGIN = 0;
const BOTTOM_OFFSET = 120;

// ─── Hardcoded AI responses ───────────────────────────────────────────────────
const AI_SUGGESTIONS = [
    'Tôi nên uống thuốc vào lúc nào?',
    'Tác dụng phụ phổ biến của thuốc?',
    'Làm thế nào để không quên uống thuốc?',
    'Tôi có thể đặt lịch khám không?',
];

const AI_RESPONSES: Record<string, string> = {
    'Tôi nên uống thuốc vào lúc nào?':
        '💊 Thời điểm uống thuốc tốt nhất phụ thuộc vào loại thuốc:\n\n• Thuốc kháng sinh — nên uống đều các giờ trong ngày, ví dụ cách nhau 8 tiếng.\n• Thuốc huyết áp — thường uống buổi sáng sau khi thức dậy.\n• Thuốc tiểu đường — tùy loại, có thể trước hoặc sau bữa ăn.\n\nHãy luôn đọc kỹ hướng dẫn và hỏi bác sĩ để có lời khuyên chính xác nhất! 🩺',
    'Tác dụng phụ phổ biến của thuốc?':
        '⚠️ Một số tác dụng phụ thường gặp:\n\n• Buồn nôn, khó tiêu\n• Đau đầu, chóng mặt\n• Phát ban da\n• Mệt mỏi, buồn ngủ\n\nNếu bạn gặp bất kỳ phản ứng nghiêm trọng nào như khó thở, sưng mặt — hãy liên hệ cơ sở y tế ngay! 🚨',
    'Làm thế nào để không quên uống thuốc?':
        '⏰ Một số mẹo hay để nhớ uống thuốc:\n\n• Đặt báo thức nhắc nhở trên điện thoại\n• Để hộp thuốc cạnh bàn chải đánh răng\n• Sử dụng tính năng nhắc nhở trong ứng dụng MediMate\n• Nhờ người thân nhắc nhở\n\nMediMate có tính năng nhắc uống thuốc tự động — hãy thử ngay nhé! ✨',
    'Tôi có thể đặt lịch khám không?':
        '📅 Có, bạn hoàn toàn có thể đặt lịch khám trực tuyến qua MediMate!\n\n• Chọn bác sĩ phù hợp theo chuyên khoa\n• Xem lịch trống của bác sĩ\n• Đặt hẹn chỉ với vài thao tác\n• Nhận xác nhận và nhắc nhở tự động\n\nHãy vào mục "Đặt lịch khám" trên thanh điều hướng để bắt đầu! 🏥',
};

const DEFAULT_RESPONSE =
    '🤖 Xin chào! Tôi là trợ lý AI của MediMate.\n\nTôi có thể giúp bạn về:\n• Thông tin thuốc và cách dùng\n• Lịch khám và nhắc nhở\n• Sức khỏe tổng quát\n\nBạn hãy thử chọn một trong các câu hỏi gợi ý bên dưới, hoặc nhập câu hỏi của bạn nhé! 😊';

interface Message {
    id: string;
    role: 'user' | 'ai';
    text: string;
    time: string;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function AIChatBubble() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '0',
            role: 'ai',
            text: DEFAULT_RESPONSE,
            time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        },
    ]);
    const [input, setInput] = useState('');
    const scrollRef = useRef<ScrollView>(null);

    const slideAnim = useRef(new Animated.Value(0)).current;

    // ── Draggable position ────────────────────────────────────────────────────
    // Vị trí ban đầu: cạnh phải, bottom = BOTTOM_OFFSET
    const posX = useRef(new Animated.Value(SCREEN_W - BUBBLE_W - MARGIN)).current;
    const posY = useRef(new Animated.Value(SCREEN_H - BOTTOM_OFFSET - BUBBLE_H)).current;
    const lastX = useRef(SCREEN_W - BUBBLE_W - MARGIN);
    const lastY = useRef(SCREEN_H - BOTTOM_OFFSET - BUBBLE_H);

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: (_, g) =>
                Math.abs(g.dx) > 4 || Math.abs(g.dy) > 4,
            onPanResponderGrant: () => {
                posX.setOffset(lastX.current);
                posY.setOffset(lastY.current);
                posX.setValue(0);
                posY.setValue(0);
            },
            onPanResponderMove: Animated.event(
                [null, { dx: posX, dy: posY }],
                { useNativeDriver: false }
            ),
            onPanResponderRelease: (_, g) => {
                posX.flattenOffset();
                posY.flattenOffset();

                // Snap sang trái hoặc phải
                const newX = g.moveX < SCREEN_W / 2
                    ? MARGIN
                    : SCREEN_W - BUBBLE_W - MARGIN;
                const rawY = lastY.current + g.dy;
                const newY = Math.max(60, Math.min(rawY, SCREEN_H - BUBBLE_H - 90));

                lastX.current = newX;
                lastY.current = newY;

                Animated.spring(posX, {
                    toValue: newX,
                    useNativeDriver: false,
                    damping: 18,
                    stiffness: 180,
                }).start();
                Animated.spring(posY, {
                    toValue: newY,
                    useNativeDriver: false,
                    damping: 18,
                    stiffness: 180,
                }).start();
            },
        })
    ).current;

    const openChat = () => {
        setIsOpen(true);
        Animated.spring(slideAnim, {
            toValue: 1,
            useNativeDriver: true,
            tension: 65,
            friction: 9,
        }).start();
    };

    const closeChat = () => {
        Animated.timing(slideAnim, {
            toValue: 0,
            duration: 220,
            useNativeDriver: true,
        }).start(() => setIsOpen(false));
    };

    const sendMessage = (text?: string) => {
        const msg = (text || input).trim();
        if (!msg) return;

        const now = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
        const newMessages: Message[] = [
            ...messages,
            { id: Date.now().toString(), role: 'user', text: msg, time: now },
        ];
        setMessages(newMessages);
        setInput('');

        setTimeout(() => {
            const reply = AI_RESPONSES[msg] || `🤖 Cảm ơn câu hỏi của bạn về "${msg}".\n\nHiện tại tôi đang trong giai đoạn phát triển và chưa thể trả lời câu hỏi này. Vui lòng liên hệ bác sĩ hoặc dược sĩ để được tư vấn chính xác nhất! 💙`;
            setMessages(prev => [
                ...prev,
                { id: (Date.now() + 1).toString(), role: 'ai', text: reply, time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) },
            ]);
            scrollRef.current?.scrollToEnd({ animated: true });
        }, 800);

        scrollRef.current?.scrollToEnd({ animated: true });
    };

    // Chat panel slide từ phải vào
    const chatTranslateX = slideAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [340, 0],
    });

    // Bubble ở bên trái → panel trượt sang phải; ở phải → panel sang trái
    // Chỉ cần panel không bị cắt là được

    return (
        <>
            {/* ── Floating Toggle Button (draggable) ── */}
            {!isOpen && (
                <Animated.View
                    style={{
                        position: 'absolute',
                        zIndex: 999,
                        transform: [{ translateX: posX }, { translateY: posY }],
                    }}
                    {...panResponder.panHandlers}
                >
                    <Pressable
                        onPress={openChat}
                        style={{
                            backgroundColor: '#B3354B',
                            borderWidth: 2,
                            borderColor: '#000',
                            borderRadius: 20,
                            paddingVertical: 14,
                            paddingHorizontal: 12,
                            alignItems: 'center',
                            gap: 6,
                            shadowColor: '#000',
                            shadowOffset: { width: 3, height: 4 },
                            shadowOpacity: 1,
                            shadowRadius: 0,
                            elevation: 6,
                        }}
                    >
                        <Bot size={20} color="#fff" strokeWidth={2.5} />
                        <ChevronRight size={14} color="rgba(255,255,255,0.7)" strokeWidth={3} />
                    </Pressable>
                </Animated.View>
            )}

            {/* ── Expanded Chat Panel ── */}
            {isOpen && (
                <Animated.View
                    style={{
                        position: 'absolute',
                        right: 0,
                        bottom: 80,
                        zIndex: 1000,
                        width: 320,
                        maxHeight: 480,
                        transform: [{ translateX: chatTranslateX }],
                    }}
                >
                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                        keyboardVerticalOffset={80}
                    >
                        <View style={{
                            backgroundColor: '#fff',
                            borderWidth: 2,
                            borderRightWidth: 0,
                            borderColor: '#000',
                            borderTopLeftRadius: 24,
                            borderBottomLeftRadius: 24,
                            overflow: 'hidden',
                            shadowColor: '#000',
                            shadowOffset: { width: -4, height: 6 },
                            shadowOpacity: 1,
                            shadowRadius: 0,
                            elevation: 8,
                        }}>
                            {/* Header */}
                            <View style={{
                                flexDirection: 'row', alignItems: 'center',
                                backgroundColor: '#B3354B',
                                paddingHorizontal: 16, paddingVertical: 12,
                                borderBottomWidth: 2, borderBottomColor: '#000',
                            }}>
                                <View style={{
                                    width: 36, height: 36,
                                    backgroundColor: 'rgba(255,255,255,0.2)',
                                    borderRadius: 12, borderWidth: 2, borderColor: 'rgba(255,255,255,0.5)',
                                    alignItems: 'center', justifyContent: 'center', marginRight: 10,
                                }}>
                                    <Bot size={20} color="#fff" strokeWidth={2.5} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={{ fontFamily: 'SpaceGrotesk_700Bold', fontSize: 14, color: '#fff' }}>
                                        MediMate AI
                                    </Text>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 }}>
                                        <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#4ADE80' }} />
                                        <Text style={{ fontFamily: 'SpaceGrotesk_500Medium', fontSize: 10, color: 'rgba(255,255,255,0.8)' }}>
                                            Đang hoạt động
                                        </Text>
                                    </View>
                                </View>
                                <Pressable
                                    onPress={closeChat}
                                    style={{
                                        width: 32, height: 32,
                                        backgroundColor: 'rgba(255,255,255,0.2)',
                                        borderRadius: 10, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.4)',
                                        alignItems: 'center', justifyContent: 'center',
                                    }}
                                >
                                    <X size={16} color="#fff" strokeWidth={3} />
                                </Pressable>
                            </View>

                            {/* Messages */}
                            <ScrollView
                                ref={scrollRef}
                                style={{ flex: 0, maxHeight: 260 }}
                                contentContainerStyle={{ padding: 12, gap: 10 }}
                                showsVerticalScrollIndicator={false}
                                onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
                                keyboardShouldPersistTaps="handled"
                            >
                                {messages.map((m) => (
                                    <View key={m.id} style={{
                                        alignItems: m.role === 'user' ? 'flex-end' : 'flex-start',
                                        marginBottom: 4,
                                    }}>
                                        {m.role === 'ai' && (
                                            <View style={{
                                                width: 24, height: 24,
                                                backgroundColor: '#B3354B', borderRadius: 8,
                                                borderWidth: 1.5, borderColor: '#000',
                                                alignItems: 'center', justifyContent: 'center',
                                                marginBottom: 4,
                                            }}>
                                                <Bot size={13} color="#fff" strokeWidth={2.5} />
                                            </View>
                                        )}
                                        <View style={{
                                            maxWidth: '88%',
                                            backgroundColor: m.role === 'user' ? '#000' : '#F8FAFC',
                                            borderRadius: 14,
                                            borderTopRightRadius: m.role === 'user' ? 4 : 14,
                                            borderTopLeftRadius: m.role === 'ai' ? 4 : 14,
                                            borderWidth: 1.5,
                                            borderColor: m.role === 'user' ? '#000' : 'rgba(0,0,0,0.12)',
                                            padding: 10,
                                        }}>
                                            <Text style={{
                                                fontFamily: 'SpaceGrotesk_500Medium',
                                                fontSize: 13,
                                                color: m.role === 'user' ? '#fff' : '#1E293B',
                                                lineHeight: 19,
                                            }}>
                                                {m.text}
                                            </Text>
                                            <Text style={{
                                                fontFamily: 'SpaceGrotesk_500Medium',
                                                fontSize: 10,
                                                color: m.role === 'user' ? 'rgba(255,255,255,0.5)' : '#94A3B8',
                                                marginTop: 4,
                                                textAlign: 'right',
                                            }}>
                                                {m.time}
                                            </Text>
                                        </View>
                                    </View>
                                ))}
                            </ScrollView>

                            {/* Quick Suggestions */}
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={{ paddingHorizontal: 12, gap: 8, paddingVertical: 8 }}
                                style={{ borderTopWidth: 1.5, borderTopColor: 'rgba(0,0,0,0.06)', maxHeight: 52 }}
                                keyboardShouldPersistTaps="handled"
                            >
                                {AI_SUGGESTIONS.map((s) => (
                                    <Pressable
                                        key={s}
                                        onPress={() => sendMessage(s)}
                                        style={{
                                            paddingHorizontal: 10, paddingVertical: 6,
                                            borderRadius: 10, borderWidth: 1.5, borderColor: '#000',
                                            backgroundColor: '#F8FAFC',
                                        }}
                                    >
                                        <Text style={{
                                            fontFamily: 'SpaceGrotesk_600SemiBold',
                                            fontSize: 11, color: '#000',
                                        }}>
                                            {s}
                                        </Text>
                                    </Pressable>
                                ))}
                            </ScrollView>

                            {/* Input */}
                            <View style={{
                                flexDirection: 'row', alignItems: 'center',
                                borderTopWidth: 2, borderTopColor: '#000',
                                paddingHorizontal: 12, paddingVertical: 10,
                                backgroundColor: '#F9F6FC',
                                gap: 8,
                            }}>
                                <TextInput
                                    value={input}
                                    onChangeText={setInput}
                                    placeholder="Nhập câu hỏi..."
                                    placeholderTextColor="#94A3B8"
                                    style={{
                                        flex: 1, height: 38,
                                        backgroundColor: '#fff',
                                        borderWidth: 2, borderColor: '#000',
                                        borderRadius: 12,
                                        paddingHorizontal: 12,
                                        fontFamily: 'SpaceGrotesk_500Medium',
                                        fontSize: 13, color: '#000',
                                    }}
                                    returnKeyType="send"
                                    onSubmitEditing={() => sendMessage()}
                                />
                                <Pressable
                                    onPress={() => sendMessage()}
                                    style={{
                                        width: 38, height: 38,
                                        backgroundColor: '#000',
                                        borderRadius: 12, borderWidth: 2, borderColor: '#000',
                                        alignItems: 'center', justifyContent: 'center',
                                    }}
                                >
                                    <Send size={16} color="#fff" strokeWidth={2.5} />
                                </Pressable>
                            </View>
                        </View>
                    </KeyboardAvoidingView>
                </Animated.View>
            )}
        </>
    );
}
