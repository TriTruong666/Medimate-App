import dayjs from "dayjs";
import { Bell, Check, Clock, Moon, Pill, SkipForward, Sunrise, Sun, X, Timer } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import { Animated, Easing, Pressable, ScrollView, Text, View } from "react-native";
import { useLogMedicationAction } from "@/hooks/useMedicationLog";
import { useSnoozeReminder } from "@/hooks/useSchedule";
import { usePopup } from "@/stores/popupStore";

const BORDER_COLOR = '#000';

function TimeOfDayIcon({ hour }: { hour: number }) {
    if (hour >= 5 && hour < 12) return <Sunrise size={24} color="#F59E0B" strokeWidth={2.5} />;
    if (hour >= 12 && hour < 18) return <Sun size={24} color="#EF4444" strokeWidth={2.5} />;
    return <Moon size={24} color="#6366F1" strokeWidth={2.5} />;
}

function getTimeConfig(hour: number) {
    if (hour >= 5 && hour < 12) return { label: 'Buổi sáng', bg: '#FEF3C7', accent: '#F59E0B', textColor: '#92400E' };
    if (hour >= 12 && hour < 18) return { label: 'Buổi chiều', bg: '#FEE2E2', accent: '#EF4444', textColor: '#991B1B' };
    return { label: 'Buổi tối', bg: '#EDE9FE', accent: '#7C3AED', textColor: '#4C1D95' };
}

interface ReminderAlertPopupProps {
    data: {
        reminderId: string;
        scheduleName?: string;
        memberName?: string;
        reminderTime?: string;
        medicines?: Array<{
            medicineName: string;
            dosage?: string;
            instructions?: string;
        }>;
        autoSnooze?: boolean;
        endTime?: string;
    };
    onClose: () => void;
}

export function ReminderAlertPopup({ data, onClose }: ReminderAlertPopupProps) {
    const { mutate: logAction, isPending } = useLogMedicationAction();
    const { mutate: snoozeAction, isPending: isSnoozing } = useSnoozeReminder();
    const [done, setDone] = useState(false);

    // ─── Pulse animation cho icon chuông ───
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const slideAnim = useRef(new Animated.Value(300)).current;

    useEffect(() => {
        // Slide in
        Animated.spring(slideAnim, {
            toValue: 0,
            useNativeDriver: true,
            damping: 18,
            stiffness: 200,
        }).start();

        // Pulse bell
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, { toValue: 1.2, duration: 400, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
                Animated.timing(pulseAnim, { toValue: 1.0, duration: 400, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
            ])
        ).start();
        
        let timeout: ReturnType<typeof setTimeout>;
        if (data.autoSnooze) {
            // Tự động Snooze sau 60 giây nếu người dùng không tương tác (Và chưa qua EndTime)
            const canSnoozeRightNow = data.endTime 
                ? dayjs().add(15, 'minute').isBefore(dayjs(data.endTime)) 
                : true;

            if (canSnoozeRightNow) {
                timeout = setTimeout(() => {
                    if (!done && !isPending && !isSnoozing) {
                        handleSnooze(15);
                    }
                }, 60000);
            }
        }

        return () => {
            if (timeout) clearTimeout(timeout);
        };
    }, [data.autoSnooze, data.endTime, done, isPending, isSnoozing]);

    const reminderDayjs = data.reminderTime ? dayjs(data.reminderTime) : dayjs();
    const hour = reminderDayjs.hour();
    const timeConfig = getTimeConfig(hour);
    const timeDisplay = reminderDayjs.format('HH:mm');
    const medicines = data.medicines || [];

    const canSnoozeBtn = data.endTime ? dayjs().add(15, 'minute').isBefore(dayjs(data.endTime)) : true;

    const handleTaken = () => {
        logAction({
            reminderId: data.reminderId,
            status: 'Taken',
            actualTime: new Date().toISOString(),
        }, {
            onSuccess: () => {
                setDone(true);
                setTimeout(onClose, 1200);
            }
        });
    };

    const handleSkip = () => {
        logAction({
            reminderId: data.reminderId,
            status: 'Skipped',
            actualTime: new Date().toISOString(),
        }, {
            onSuccess: () => {
                onClose();
            }
        });
    };

    const handleSnooze = (minutes: number = 15) => {
        snoozeAction({ id: data.reminderId, delayMinutes: minutes }, {
            onSuccess: () => {
                onClose();
            }
        });
    };

    return (
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.55)' }}>
            <Animated.View style={{
                transform: [{ translateY: slideAnim }],
                backgroundColor: '#F9F6FC',
                borderTopLeftRadius: 36,
                borderTopRightRadius: 36,
                borderTopWidth: 2,
                borderLeftWidth: 2,
                borderRightWidth: 2,
                borderColor: BORDER_COLOR,
                paddingTop: 12,
                paddingBottom: 48,
                paddingHorizontal: 20,
                maxHeight: '90%',
            }}>
                {/* Drag handle */}
                <View style={{ width: 40, height: 4, backgroundColor: '#CBD5E1', borderRadius: 2, alignSelf: 'center', marginBottom: 20 }} />

                {/* Header strip */}
                <View style={{
                    backgroundColor: timeConfig.bg,
                    borderWidth: 2,
                    borderColor: BORDER_COLOR,
                    borderRadius: 24,
                    padding: 18,
                    marginBottom: 20,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 14,
                }}>
                    {/* Pulse bell */}
                    <Animated.View style={{
                        transform: [{ scale: pulseAnim }],
                        width: 56, height: 56,
                        borderRadius: 20,
                        backgroundColor: '#fff',
                        borderWidth: 2,
                        borderColor: BORDER_COLOR,
                        alignItems: 'center',
                        justifyContent: 'center',
                        shadowColor: timeConfig.accent,
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.35,
                        shadowRadius: 10,
                        elevation: 6,
                    }}>
                        <Bell size={26} color={timeConfig.accent} strokeWidth={2.5} />
                    </Animated.View>

                    <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                            <TimeOfDayIcon hour={hour} />
                            <Text style={{ fontFamily: 'SpaceGrotesk_700Bold', fontSize: 11, color: timeConfig.textColor, textTransform: 'uppercase', letterSpacing: 1 }}>
                                {timeConfig.label} · {timeDisplay}
                            </Text>
                        </View>
                        <Text style={{ fontFamily: 'SpaceGrotesk_700Bold', fontSize: 18, color: '#000', lineHeight: 24 }}>
                            {done ? '✅ Đã xác nhận!' : '⏰ Đến giờ uống thuốc!'}
                        </Text>
                        {data.scheduleName && (
                            <Text style={{ fontFamily: 'SpaceGrotesk_500Medium', fontSize: 12, color: '#6B7280', marginTop: 2 }}>
                                Lịch: {data.scheduleName}
                                {data.memberName ? ` · ${data.memberName}` : ''}
                            </Text>
                        )}
                    </View>

                    <Pressable
                        onPress={onClose}
                        style={{ width: 36, height: 36, backgroundColor: '#fff', borderWidth: 2, borderColor: BORDER_COLOR, borderRadius: 12, alignItems: 'center', justifyContent: 'center' }}
                    >
                        <X size={18} color="#000" strokeWidth={2.5} />
                    </Pressable>
                </View>

                {/* Medicine list */}
                {medicines.length > 0 ? (
                    <ScrollView
                        style={{ maxHeight: 250 }}
                        showsVerticalScrollIndicator={false}
                    >
                        {medicines.map((med, idx) => (
                            <View
                                key={idx}
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'flex-start',
                                    backgroundColor: '#fff',
                                    borderWidth: 2,
                                    borderColor: '#E5E7EB',
                                    borderRadius: 18,
                                    padding: 14,
                                    marginBottom: 10,
                                    shadowColor: '#000',
                                    shadowOffset: { width: 0, height: 2 },
                                    shadowOpacity: 0.06,
                                    shadowRadius: 6,
                                    elevation: 2,
                                }}
                            >
                                <View style={{
                                    width: 40, height: 40, borderRadius: 14,
                                    backgroundColor: '#EDE9FE',
                                    borderWidth: 1.5, borderColor: '#7C3AED',
                                    alignItems: 'center', justifyContent: 'center',
                                    marginRight: 12,
                                }}>
                                    <Pill size={18} color="#7C3AED" strokeWidth={2.5} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={{ fontFamily: 'SpaceGrotesk_700Bold', fontSize: 14, color: '#111', marginBottom: 3 }}>
                                        {med.medicineName}
                                    </Text>
                                    {med.dosage && (
                                        <Text style={{ fontFamily: 'SpaceGrotesk_500Medium', fontSize: 12, color: '#6B7280', marginBottom: 1 }}>
                                            💊 Liều: {med.dosage}
                                        </Text>
                                    )}
                                    {med.instructions && (
                                        <Text style={{ fontFamily: 'SpaceGrotesk_500Medium', fontSize: 12, color: '#6B7280' }}>
                                            📋 {med.instructions}
                                        </Text>
                                    )}
                                </View>
                            </View>
                        ))}
                    </ScrollView>
                ) : (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#fff', borderWidth: 2, borderColor: '#E5E7EB', borderRadius: 18, padding: 14, marginBottom: 10 }}>
                        <Clock size={20} color="#9CA3AF" strokeWidth={2} />
                        <Text style={{ fontFamily: 'SpaceGrotesk_500Medium', fontSize: 13, color: '#9CA3AF' }}>
                            Uống thuốc theo lịch đã cài đặt.
                        </Text>
                    </View>
                )}

                {/* Action buttons */}
                {!done && (
                    <View style={{ gap: 12, marginTop: 16 }}>
                        {/* Taken (Full Width) */}
                        <Pressable
                            onPress={handleTaken}
                            disabled={isPending || isSnoozing}
                            style={{
                                height: 58,
                                backgroundColor: '#16A34A',
                                borderWidth: 2, borderColor: BORDER_COLOR,
                                borderRadius: 20,
                                flexDirection: 'row',
                                alignItems: 'center', justifyContent: 'center',
                                gap: 10,
                                shadowColor: '#16A34A',
                                shadowOffset: { width: 0, height: 6 },
                                shadowOpacity: 0.35,
                                shadowRadius: 12,
                                elevation: 6,
                            }}
                        >
                            <Check size={22} color="#fff" strokeWidth={3} />
                            <Text style={{ fontFamily: 'SpaceGrotesk_700Bold', fontSize: 16, color: '#fff', letterSpacing: 0.5 }}>
                                {isPending ? 'Đang lưu...' : 'Vâng, đã uống xong!'}
                            </Text>
                        </Pressable>

                        <View style={{ flexDirection: 'row', gap: 12 }}>
                            {/* Snooze (Hide if past end time) */}
                            {canSnoozeBtn && (
                                <Pressable
                                    onPress={() => handleSnooze(15)}
                                    disabled={isPending || isSnoozing}
                                    style={{
                                        flex: 1, height: 50,
                                        backgroundColor: '#FEF9C3',
                                        borderWidth: 2, borderColor: '#CA8A04',
                                        borderRadius: 16,
                                        flexDirection: 'row',
                                        alignItems: 'center', justifyContent: 'center',
                                        gap: 6,
                                    }}
                                >
                                    <Timer size={16} color="#A16207" strokeWidth={2.5} />
                                    <Text style={{ fontFamily: 'SpaceGrotesk_700Bold', fontSize: 13, color: '#A16207' }}>
                                        {isSnoozing ? 'Đang gửi...' : 'Báo lại 15p'}
                                    </Text>
                                </Pressable>
                            )}

                            {/* Skip */}
                            <Pressable
                                onPress={handleSkip}
                                disabled={isPending || isSnoozing}
                                style={{
                                    flex: 1, height: 50,
                                    backgroundColor: '#F3F4F6',
                                    borderWidth: 2, borderColor: '#D1D5DB',
                                    borderRadius: 16,
                                    flexDirection: 'row',
                                    alignItems: 'center', justifyContent: 'center',
                                    gap: 6,
                                }}
                            >
                                <SkipForward size={16} color="#6B7280" strokeWidth={2.5} />
                                <Text style={{ fontFamily: 'SpaceGrotesk_700Bold', fontSize: 13, color: '#6B7280' }}>
                                    Bỏ qua (Cancel)
                                </Text>
                            </Pressable>
                        </View>
                    </View>
                )}
            </Animated.View>
        </View>
    );
}
