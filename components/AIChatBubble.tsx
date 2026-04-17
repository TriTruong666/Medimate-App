import { useGetAIModels, useChatWithAI } from '@/hooks/data/useRAGHook';
import type { AIModel } from '@/types/RAGAIModel';
import { Bot, ChevronDown, Send, StopCircle, X } from 'lucide-react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    KeyboardAvoidingView,
    Modal,
    PanResponder,
    Platform,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// ─── Constants ────────────────────────────────────────────────────────────────
const SCREEN_W = Dimensions.get('window').width;
const SCREEN_H = Dimensions.get('window').height;
const BUBBLE_SIZE = 56;
const MARGIN = 14;
const BRAND = '#B3354B';

// ─── Rotating hint messages ───────────────────────────────────────────────────
const HINT_MESSAGES = [
    '💬 Bạn có câu hỏi về sức khỏe?',
    '💊 Thắc mắc về thuốc?',
    '🩺 Muốn đặt lịch khám?',
    '🌡️ Theo dõi sức khỏe cả nhà?',
    '⏰ Nhắc uống thuốc đúng giờ?',
];

const QUICK_SUGGESTIONS = [
    '💊 Cách dùng thuốc',
    '📅 Đặt lịch khám',
    '⏰ Nhắc uống thuốc',
    '🩺 Tác dụng phụ',
];

interface Message {
    id: string;
    role: 'user' | 'ai';
    text: string;
    time: string;
    isPending?: boolean;
}

function clamp(v: number, lo: number, hi: number) {
    return Math.max(lo, Math.min(hi, v));
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AIChatBubble() {
    const insets = useSafeAreaInsets();

    // ── State ─────────────────────────────────────────────────────────────────
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [showHint, setShowHint] = useState(true);
    const [showModelPicker, setShowModelPicker] = useState(false);
    const [selectedModel, setSelectedModel] = useState<AIModel | null>(null);
    const [hintIndex, setHintIndex] = useState(0);
    const hintOpacity = useRef(new Animated.Value(1)).current;

    const [messages, setMessages] = useState<Message[]>([{
        id: '0',
        role: 'ai',
        text: '👋 Xin chào! Tôi là MediMate AI.\n\n• 💊 Thông tin thuốc & cách dùng\n• 📅 Lịch khám & nhắc nhở\n• 🩺 Sức khỏe tổng quát\n\nHãy hỏi tôi bất cứ điều gì! 😊',
        time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    }]);
    const [input, setInput] = useState('');

    const scrollRef = useRef<ScrollView>(null);
    const abortRef = useRef<AbortController | null>(null);
    const pendingIdRef = useRef<string | null>(null);

    const { mutateAsync: sendToAI, isPending: isAITyping } = useChatWithAI();
    const { data: aiModels } = useGetAIModels();

    // auto-select first active model
    useEffect(() => {
        if (!selectedModel && aiModels && (aiModels as AIModel[]).length > 0) {
            const list = aiModels as AIModel[];
            setSelectedModel(list.find(m => m.is_active) ?? list[0]);
        }
    }, [aiModels, selectedModel]);

    // ── Rotating hint ─────────────────────────────────────────────────────────
    useEffect(() => {
        if (isChatOpen) return;
        const id = setInterval(() => {
            Animated.sequence([
                Animated.timing(hintOpacity, { toValue: 0, duration: 350, useNativeDriver: true }),
                Animated.timing(hintOpacity, { toValue: 1, duration: 350, useNativeDriver: true }),
            ]).start();
            setHintIndex(i => (i + 1) % HINT_MESSAGES.length);
        }, 5000);
        return () => clearInterval(id);
    }, [isChatOpen, hintOpacity]);

    // ── Draggable bubble ──────────────────────────────────────────────────────
    const initX = SCREEN_W - BUBBLE_SIZE - MARGIN;
    const initY = SCREEN_H * 0.65;
    const posX = useRef(new Animated.Value(initX)).current;
    const posY = useRef(new Animated.Value(initY)).current;
    const lastX = useRef(initX);
    const lastY = useRef(initY);
    const isDragging = useRef(false);

    const panResponder = useRef(PanResponder.create({
        onStartShouldSetPanResponder: () => false,
        onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 5 || Math.abs(g.dy) > 5,
        onPanResponderGrant: () => {
            isDragging.current = true;
            posX.setOffset(lastX.current);
            posX.setValue(0);
            posY.setOffset(lastY.current);
            posY.setValue(0);
        },
        onPanResponderMove: Animated.event([null, { dx: posX, dy: posY }], { useNativeDriver: false }),
        onPanResponderRelease: (_, g) => {
            isDragging.current = false;
            posX.flattenOffset();
            posY.flattenOffset();
            const nx = lastX.current + g.dx;
            const ny = lastY.current + g.dy;
            const snapX = nx + BUBBLE_SIZE / 2 < SCREEN_W / 2 ? MARGIN : SCREEN_W - BUBBLE_SIZE - MARGIN;
            const snapY = clamp(ny, insets.top + 20, SCREEN_H - BUBBLE_SIZE - insets.bottom - 80);
            lastX.current = snapX;
            lastY.current = snapY;
            Animated.parallel([
                Animated.spring(posX, { toValue: snapX, useNativeDriver: false, damping: 18, stiffness: 180 }),
                Animated.spring(posY, { toValue: snapY, useNativeDriver: false, damping: 18, stiffness: 180 }),
            ]).start();
        },
    })).current;

    // ── Cancel AI ─────────────────────────────────────────────────────────────
    const cancelAI = useCallback(() => {
        abortRef.current?.abort();
        if (pendingIdRef.current) {
            setMessages(prev => prev.map(m =>
                m.id === pendingIdRef.current
                    ? { ...m, text: '⏹️ Đã hủy câu trả lời.', isPending: false }
                    : m
            ));
            pendingIdRef.current = null;
        }
    }, []);

    // ── Send message ──────────────────────────────────────────────────────────
    const sendMessage = useCallback(async (text?: string) => {
        const msg = (text ?? input).trim();
        if (!msg || isAITyping || !selectedModel) return;

        const now = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
        const pendingId = `ai-${Date.now()}`;
        pendingIdRef.current = pendingId;

        const abort = new AbortController();
        abortRef.current = abort;

        setMessages(prev => [
            ...prev,
            { id: `u-${Date.now()}`, role: 'user', text: msg, time: now },
            { id: pendingId, role: 'ai', text: '', time: now, isPending: true },
        ]);
        setInput('');
        setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 80);

        try {
            const res = await sendToAI({ question: msg, ai_model_id: selectedModel.id });
            if (abort.signal.aborted) return;
            const aiText = res?.data?.answer ?? '🤖 Chưa thể trả lời, vui lòng thử lại.';
            setMessages(prev => prev.map(m =>
                m.id === pendingId
                    ? { ...m, text: aiText, time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }), isPending: false }
                    : m
            ));
        } catch (err: any) {
            if (abort.signal.aborted || err?.name === 'AbortError' || err?.code === 'ERR_CANCELED') return;
            setMessages(prev => prev.map(m =>
                m.id === pendingId
                    ? { ...m, text: '⚠️ Không kết nối được AI. Vui lòng thử lại.', isPending: false }
                    : m
            ));
        } finally {
            pendingIdRef.current = null;
        }
        setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 120);
    }, [input, isAITyping, selectedModel, sendToAI]);

    return (
        <>
            {/* ── Floating Bubble (always visible unless chat open) ─────────── */}
            {!isChatOpen && (
                <Animated.View
                    style={{
                        position: 'absolute', zIndex: 999,
                        transform: [{ translateX: posX }, { translateY: posY }],
                    }}
                    {...panResponder.panHandlers}
                >
                    {/* Hint tooltip */}
                    {showHint && (
                        <Animated.View style={{
                            opacity: hintOpacity,
                            position: 'absolute', right: BUBBLE_SIZE + 10, top: 4,
                            backgroundColor: '#fff',
                            borderWidth: 1.5, borderColor: '#E2E8F0', borderRadius: 14,
                            paddingHorizontal: 10, paddingVertical: 8, minWidth: 185,
                            shadowColor: '#000', shadowOffset: { width: 0, height: 3 },
                            shadowOpacity: 0.1, shadowRadius: 8, elevation: 6,
                        }}>
                            <Text style={{ fontFamily: 'SpaceGrotesk_600SemiBold', fontSize: 11, color: '#334155', lineHeight: 16 }}>
                                {HINT_MESSAGES[hintIndex]}
                            </Text>
                            <Pressable
                                hitSlop={10}
                                onPress={() => setShowHint(false)}
                                style={{
                                    position: 'absolute', top: -8, right: -8,
                                    width: 18, height: 18, borderRadius: 9,
                                    backgroundColor: '#94A3B8', alignItems: 'center', justifyContent: 'center',
                                }}
                            >
                                <X size={10} color="#fff" strokeWidth={3} />
                            </Pressable>
                        </Animated.View>
                    )}

                    {/* Bubble button */}
                    <Pressable
                        onPress={() => {
                            if (!isDragging.current) setIsChatOpen(true);
                        }}
                        style={{
                            width: BUBBLE_SIZE, height: BUBBLE_SIZE,
                            backgroundColor: BRAND, borderRadius: 18,
                            alignItems: 'center', justifyContent: 'center',
                            shadowColor: BRAND, shadowOffset: { width: 0, height: 6 },
                            shadowOpacity: 0.5, shadowRadius: 14, elevation: 10,
                        }}
                    >
                        <Bot size={24} color="#fff" strokeWidth={2.5} />
                    </Pressable>
                </Animated.View>
            )}

            {/* ── Chat Modal — full screen Modal fixes keyboard + touch issues ── */}
            <Modal
                visible={isChatOpen}
                transparent
                animationType="slide"
                onRequestClose={() => setIsChatOpen(false)}
                statusBarTranslucent
            >
                {/* Backdrop — tap to close */}
                <Pressable
                    style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.35)' }}
                    onPress={() => setIsChatOpen(false)}
                />

                {/* Chat sheet — anchored to bottom */}
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                    style={{
                        position: 'absolute', bottom: 0, left: 0, right: 0,
                    }}
                >
                    <View style={{
                        backgroundColor: '#fff',
                        borderTopLeftRadius: 28, borderTopRightRadius: 28,
                        overflow: 'hidden',
                        shadowColor: '#000', shadowOffset: { width: 0, height: -6 },
                        shadowOpacity: 0.14, shadowRadius: 24, elevation: 20,
                        minHeight: 420,
                        paddingBottom: insets.bottom,
                    }}>
                        {/* ── Header ── */}
                        <View style={{
                            backgroundColor: BRAND,
                            borderTopLeftRadius: 28, borderTopRightRadius: 28,
                            paddingHorizontal: 16, paddingTop: 14, paddingBottom: 12, gap: 10,
                        }}>
                            {/* Drag handle */}
                            <View style={{ width: 38, height: 4, backgroundColor: 'rgba(255,255,255,0.4)', borderRadius: 2, alignSelf: 'center', marginBottom: 4 }} />

                            {/* Title row */}
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                                <View style={{
                                    width: 36, height: 36, backgroundColor: 'rgba(255,255,255,0.2)',
                                    borderRadius: 12, alignItems: 'center', justifyContent: 'center',
                                }}>
                                    <Bot size={20} color="#fff" strokeWidth={2.5} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={{ fontFamily: 'SpaceGrotesk_700Bold', fontSize: 15, color: '#fff' }}>MediMate AI</Text>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 }}>
                                        <View style={{
                                            width: 6, height: 6, borderRadius: 3,
                                            backgroundColor: isAITyping ? '#FCD34D' : '#4ADE80',
                                        }} />
                                        <Text style={{ fontFamily: 'SpaceGrotesk_500Medium', fontSize: 11, color: 'rgba(255,255,255,0.82)' }}>
                                            {isAITyping ? 'Đang trả lời...' : 'Trợ lý sức khỏe'}
                                        </Text>
                                    </View>
                                </View>
                                <Pressable
                                    hitSlop={10}
                                    onPress={() => setIsChatOpen(false)}
                                    style={{
                                        width: 32, height: 32, backgroundColor: 'rgba(255,255,255,0.2)',
                                        borderRadius: 10, alignItems: 'center', justifyContent: 'center',
                                    }}
                                >
                                    <X size={16} color="#fff" strokeWidth={2.5} />
                                </Pressable>
                            </View>

                            {/* Model selector */}
                            <Pressable
                                onPress={() => setShowModelPicker(true)}
                                style={{
                                    flexDirection: 'row', alignItems: 'center', gap: 6,
                                    backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 10,
                                    paddingHorizontal: 12, paddingVertical: 8,
                                }}
                            >
                                <Text style={{ fontFamily: 'SpaceGrotesk_600SemiBold', fontSize: 12, color: '#fff', flex: 1 }} numberOfLines={1}>
                                    {selectedModel ? `${selectedModel.name}  ·  ${selectedModel.provider}` : 'Chọn mô hình AI...'}
                                </Text>
                                <ChevronDown size={14} color="rgba(255,255,255,0.75)" strokeWidth={2.5} />
                            </Pressable>
                        </View>

                        {/* ── Messages ── */}
                        <ScrollView
                            ref={scrollRef}
                            style={{ flex: 1, maxHeight: 300 }}
                            contentContainerStyle={{ padding: 14, gap: 10 }}
                            showsVerticalScrollIndicator={false}
                            keyboardShouldPersistTaps="handled"
                            onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
                        >
                            {messages.map(m => (
                                <View key={m.id} style={{ alignItems: m.role === 'user' ? 'flex-end' : 'flex-start', marginBottom: 2 }}>
                                    {m.role === 'ai' && (
                                        <View style={{
                                            width: 22, height: 22, backgroundColor: BRAND,
                                            borderRadius: 7, alignItems: 'center', justifyContent: 'center', marginBottom: 4,
                                        }}>
                                            <Bot size={12} color="#fff" strokeWidth={2.5} />
                                        </View>
                                    )}
                                    <View style={{
                                        maxWidth: '84%',
                                        backgroundColor: m.role === 'user' ? '#0F172A' : '#F8FAFC',
                                        borderRadius: 16,
                                        borderTopRightRadius: m.role === 'user' ? 4 : 16,
                                        borderTopLeftRadius: m.role === 'ai' ? 4 : 16,
                                        borderWidth: 1,
                                        borderColor: m.role === 'user' ? '#0F172A' : '#E2E8F0',
                                        paddingHorizontal: 13, paddingVertical: 10,
                                    }}>
                                        {m.isPending
                                            ? <TypingIndicator />
                                            : <Text style={{ fontFamily: 'SpaceGrotesk_500Medium', fontSize: 13, color: m.role === 'user' ? '#fff' : '#1E293B', lineHeight: 21 }}>{m.text}</Text>
                                        }
                                        <Text style={{ fontFamily: 'SpaceGrotesk_500Medium', fontSize: 10, color: m.role === 'user' ? 'rgba(255,255,255,0.4)' : '#94A3B8', marginTop: 5, textAlign: 'right' }}>
                                            {m.time}
                                        </Text>
                                    </View>
                                </View>
                            ))}
                        </ScrollView>

                        {/* ── Quick suggestions (ẩn khi AI đang typing) ── */}
                        {!isAITyping && (
                            <ScrollView
                                horizontal showsHorizontalScrollIndicator={false}
                                contentContainerStyle={{ paddingHorizontal: 14, gap: 8, paddingVertical: 8 }}
                                style={{ borderTopWidth: 1, borderTopColor: '#F1F5F9', maxHeight: 52 }}
                                keyboardShouldPersistTaps="handled"
                            >
                                {QUICK_SUGGESTIONS.map(s => (
                                    <Pressable
                                        key={s}
                                        onPress={() => void sendMessage(s)}
                                        disabled={!selectedModel}
                                        style={{
                                            paddingHorizontal: 12, paddingVertical: 7,
                                            borderRadius: 20, borderWidth: 1.5,
                                            borderColor: BRAND, backgroundColor: '#FFF5F7',
                                        }}
                                    >
                                        <Text style={{ fontFamily: 'SpaceGrotesk_600SemiBold', fontSize: 12, color: BRAND }}>{s}</Text>
                                    </Pressable>
                                ))}
                            </ScrollView>
                        )}

                        {/* ── Cancel bar ── */}
                        {isAITyping && (
                            <Pressable
                                onPress={cancelAI}
                                style={{
                                    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
                                    borderTopWidth: 1, borderTopColor: '#FEE2E2',
                                    backgroundColor: '#FFF5F5', paddingVertical: 11,
                                }}
                            >
                                <StopCircle size={16} color="#DC2626" strokeWidth={2.5} />
                                <Text style={{ fontFamily: 'SpaceGrotesk_700Bold', fontSize: 13, color: '#DC2626' }}>
                                    Hủy câu trả lời
                                </Text>
                            </Pressable>
                        )}

                        {/* ── Input bar ── */}
                        <View style={{
                            flexDirection: 'row', alignItems: 'center', gap: 10,
                            borderTopWidth: 1, borderTopColor: '#E2E8F0',
                            paddingHorizontal: 14, paddingVertical: 10,
                            backgroundColor: '#FAFAFA',
                        }}>
                            <TextInput
                                value={input}
                                onChangeText={setInput}
                                placeholder={selectedModel ? 'Hỏi về sức khỏe...' : 'Chọn model AI trước...'}
                                placeholderTextColor="#94A3B8"
                                editable={!isAITyping && !!selectedModel}
                                style={{
                                    flex: 1, height: 44,
                                    backgroundColor: '#fff',
                                    borderWidth: 1.5, borderColor: '#E2E8F0', borderRadius: 16,
                                    paddingHorizontal: 14,
                                    fontFamily: 'SpaceGrotesk_500Medium', fontSize: 14, color: '#0F172A',
                                }}
                                returnKeyType="send"
                                onSubmitEditing={() => void sendMessage()}
                                multiline={false}
                                blurOnSubmit={false}
                            />
                            <Pressable
                                onPress={() => void sendMessage()}
                                disabled={isAITyping || !input.trim() || !selectedModel}
                                style={{
                                    width: 44, height: 44, borderRadius: 16,
                                    backgroundColor: isAITyping || !input.trim() || !selectedModel ? '#E2E8F0' : BRAND,
                                    alignItems: 'center', justifyContent: 'center',
                                }}
                            >
                                <Send size={18} color={isAITyping || !input.trim() || !selectedModel ? '#94A3B8' : '#fff'} strokeWidth={2.5} />
                            </Pressable>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>

            {/* ── Model Picker Modal ── */}
            <Modal visible={showModelPicker} transparent animationType="slide" onRequestClose={() => setShowModelPicker(false)}>
                <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' }} onPress={() => setShowModelPicker(false)}>
                    <Pressable onPress={e => e.stopPropagation()} style={{
                        backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28,
                        paddingTop: 20, paddingBottom: 36 + insets.bottom, paddingHorizontal: 20,
                    }}>
                        <View style={{ width: 38, height: 4, backgroundColor: '#E2E8F0', borderRadius: 2, alignSelf: 'center', marginBottom: 18 }} />
                        <Text style={{ fontFamily: 'SpaceGrotesk_700Bold', fontSize: 18, color: '#0F172A', marginBottom: 4 }}>
                            Chọn mô hình AI
                        </Text>
                        <Text style={{ fontFamily: 'SpaceGrotesk_500Medium', fontSize: 12, color: '#64748B', marginBottom: 18 }}>
                            Mỗi mô hình có tốc độ và khả năng khác nhau
                        </Text>

                        {(!aiModels || (aiModels as AIModel[]).length === 0)
                            ? <Text style={{ fontFamily: 'SpaceGrotesk_500Medium', fontSize: 13, color: '#94A3B8', textAlign: 'center', paddingVertical: 24 }}>Đang tải...</Text>
                            : (
                                <View style={{ gap: 10 }}>
                                    {(aiModels as AIModel[]).filter(m => m.is_active).map(model => {
                                        const sel = selectedModel?.id === model.id;
                                        return (
                                            <Pressable
                                                key={model.id}
                                                onPress={() => { setSelectedModel(model); setShowModelPicker(false); }}
                                                style={{
                                                    flexDirection: 'row', alignItems: 'center', gap: 12,
                                                    padding: 14, borderRadius: 16,
                                                    borderWidth: 2, borderColor: sel ? BRAND : '#E2E8F0',
                                                    backgroundColor: sel ? '#FFF5F7' : '#F8FAFC',
                                                }}
                                            >
                                                <View style={{
                                                    width: 40, height: 40, borderRadius: 13,
                                                    backgroundColor: sel ? BRAND : '#E2E8F0',
                                                    alignItems: 'center', justifyContent: 'center',
                                                }}>
                                                    <Bot size={21} color={sel ? '#fff' : '#94A3B8'} strokeWidth={2.5} />
                                                </View>
                                                <View style={{ flex: 1 }}>
                                                    <Text style={{ fontFamily: 'SpaceGrotesk_700Bold', fontSize: 14, color: sel ? BRAND : '#0F172A' }}>{model.name}</Text>
                                                    <Text style={{ fontFamily: 'SpaceGrotesk_500Medium', fontSize: 11, color: '#64748B', marginTop: 2 }}>
                                                        {model.provider} · {(model.context_window / 1000).toFixed(0)}K ctx
                                                    </Text>
                                                </View>
                                                {sel && <View style={{ width: 22, height: 22, backgroundColor: BRAND, borderRadius: 11, alignItems: 'center', justifyContent: 'center' }}>
                                                    <X size={10} color="#fff" strokeWidth={3} />
                                                </View>}
                                            </Pressable>
                                        );
                                    })}
                                </View>
                            )
                        }
                    </Pressable>
                </Pressable>
            </Modal>
        </>
    );
}

// ─── Typing Indicator ─────────────────────────────────────────────────────────
function TypingIndicator() {
    return (
        <View style={{ flexDirection: 'row', gap: 5, paddingVertical: 5 }}>
            {[0, 130, 260].map((d, i) => <TypingDot key={i} delay={d} />)}
        </View>
    );
}

function TypingDot({ delay }: { delay: number }) {
    const anim = useRef(new Animated.Value(0)).current;
    useEffect(() => {
        const loop = Animated.loop(Animated.sequence([
            Animated.delay(delay),
            Animated.timing(anim, { toValue: 1, duration: 350, useNativeDriver: true }),
            Animated.timing(anim, { toValue: 0, duration: 350, useNativeDriver: true }),
            Animated.delay(Math.max(0, 750 - delay)),
        ]));
        loop.start();
        return () => loop.stop();
    }, [anim, delay]);
    return (
        <Animated.View style={{
            width: 7, height: 7, borderRadius: 3.5, backgroundColor: '#94A3B8',
            transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [0, -5] }) }],
        }} />
    );
}
