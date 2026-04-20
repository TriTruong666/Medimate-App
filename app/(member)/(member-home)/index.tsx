import AIChatBubble from "@/components/AIChatBubble";
import { LogCard } from "@/components/MedicineCards";
import { useGetMemberMedicationLogs } from "@/hooks/useMedicationLog";
import { useGetMemberDailyReminders } from "@/hooks/useSchedule";
import { getDecodedToken } from "@/utils/token";
import dayjs from "dayjs";
import 'dayjs/locale/vi';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import {
    Calendar,
    ChevronDown,
    ChevronLeft, ChevronRight,
    Moon,
    Pill, Sun, Sunrise,
    X
} from "lucide-react-native";
import React, { useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator, Modal, Pressable, ScrollView, Text, View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { usePopup } from "@/stores/popupStore";
import ManagerHeader from "../../../components/ManagerHeader";

dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);
dayjs.locale('vi');

// --- Constants & Styles ---
const TABS = ['Lịch nhắc nhở', 'Lịch sử dùng thuốc'];
const BORDER_COLOR = '#000000';
const SOFT_PURPLE = '#D9AEF6';
const SHADOW_MD = {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1, // Neo-Brutalism thường dùng bóng đặc
    shadowRadius: 0,
    elevation: 4,
};

const VI_DAYS = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
const formatViDay = (d: dayjs.Dayjs) => VI_DAYS[d.day()];

// ─── Xác định icon theo buổi trong ngày ──────────────────────────────────────
function TimeOfDayIcon({ timeStr, size = 20, color = '#000' }: { timeStr?: string; size?: number; color?: string }) {
    if (!timeStr) return <Sun size={size} color={color} strokeWidth={2.5} />;
    const hour = dayjs(timeStr).hour();
    if (hour >= 5 && hour < 12) return <Sunrise size={size} color="#F59E0B" strokeWidth={2.5} />; // Buổi sáng
    if (hour >= 12 && hour < 18) return <Sun size={size} color="#EF4444" strokeWidth={2.5} />;   // Buổi trưa/chiều
    return <Moon size={size} color="#6366F1" strokeWidth={2.5} />;                                // Buổi tối/đêm
}

function getTimeOfDayBg(timeStr?: string): string {
    if (!timeStr) return '#FEF9C3';
    const hour = dayjs(timeStr).hour();
    if (hour >= 5 && hour < 12) return '#FEF3C7'; // vàng ấm - sáng
    if (hour >= 12 && hour < 18) return '#FEE2E2'; // cam đỏ nhạt - trưa/chiều
    return '#EDE9FE'; // tím nhạt - tối
}

// ─── ReminderCard nâng cấp: hiển thị đầy đủ medicines ──────────────────────
function ReminderCard({ item }: { item: any }) {
    const [expanded, setExpanded] = useState(false);
    const popup = usePopup();

    const reminderDateTimeStr = item.reminderTime || undefined;

    // Nếu reminderTime có dạng "08:00:00" thì ta parse cẩn thận
    let reminderDateTime = null;
    let timeDisplay = '--:--';
    if (reminderDateTimeStr) {
        if (reminderDateTimeStr.includes('T')) {
            reminderDateTime = dayjs(reminderDateTimeStr);
            timeDisplay = reminderDateTime.format('HH:mm');
        } else {
            // Dạng "08:00:00"
            const [h, m] = reminderDateTimeStr.split(':');
            reminderDateTime = dayjs().hour(Number(h)).minute(Number(m)).second(0);
            timeDisplay = `${h}:${m}`;
        }
    }

    const now = dayjs();
    const isPast = reminderDateTime ? reminderDateTime.isBefore(now) : false;
    const isFuture = reminderDateTime ? reminderDateTime.isAfter(now) : false;
    const isTaken = item.status === "Taken" || item.status === "Done";
    const isMissed = item.status === "Missed";
    const isSkipped = item.status === "Skipped";

    // Parse endTime nếu có (cùng pattern với reminderTime)
    let endDateTime: dayjs.Dayjs | null = null;
    if (item.endTime) {
        if (item.endTime.includes('T')) {
            endDateTime = dayjs(item.endTime);
        } else {
            const [h, m] = item.endTime.split(':');
            endDateTime = dayjs().hour(Number(h)).minute(Number(m)).second(0);
        }
    }
    const isEndTimePast = endDateTime ? endDateTime.isBefore(now) : false;

    const isWithinWindow = isPast && !isEndTimePast;
    const isEffectivelyMissed = isPast && isEndTimePast && (item.status === 'Pending' || item.status === 'Snoozed');

    let statusColor = '#FFD700';
    let statusText = 'Sắp tới';
    let statusTextColor = '#854D0E';
    let dotColor = '#EAB308';

    if (isTaken) {
        statusColor = '#DCFCE7'; statusText = 'Đã uống'; statusTextColor = '#166534'; dotColor = '#16A34A';
    } else if (isMissed || isEffectivelyMissed) {
        statusColor = '#FEE2E2'; statusText = 'Đã bỏ lỡ'; statusTextColor = '#991B1B'; dotColor = '#DC2626';
    } else if (isSkipped) {
        statusColor = '#F3F4F6'; statusText = 'Bỏ qua'; statusTextColor = '#374151'; dotColor = '#9CA3AF';
    } else if (isWithinWindow) {
        statusColor = '#FEF9C3'; statusText = 'Hiện tại'; statusTextColor = '#854D0E'; dotColor = '#EAB308';
    } else if (isFuture || (!isPast && !isFuture)) {
        statusColor = '#EFF6FF'; statusText = 'Sắp tới'; statusTextColor = '#1D4ED8'; dotColor = '#3B82F6';
    }

    const rawMedicines: any[] = item.medicines || [];
    const medicines = rawMedicines.filter(m => {
        const d = m.dosage?.toLowerCase().trim() || "";
        return !d.startsWith("0") && !d.includes("0 viên");
    });
    const timeOfDayBg = getTimeOfDayBg(item.reminderTime);

    return (
        <View style={{
            backgroundColor: '#fff',
            borderWidth: 2,
            borderColor: BORDER_COLOR,
            borderRadius: 20,
            marginBottom: 12,
            overflow: 'hidden',
            opacity: (isPast && !isTaken && !isWithinWindow) ? 0.75 : 1,
            ...SHADOW_MD,
        }}>
            {/* Header row */}
            <Pressable
                onPress={() => medicines.length > 0 && setExpanded(!expanded)}
                style={{ flexDirection: 'row', alignItems: 'center', padding: 14 }}
            >
                {/* Icon circle — đổi theo buổi */}
                <View style={{
                    width: 46, height: 46, borderRadius: 23,
                    backgroundColor: timeOfDayBg,
                    borderWidth: 2, borderColor: BORDER_COLOR,
                    alignItems: 'center', justifyContent: 'center',
                    marginRight: 12,
                }}>
                    <TimeOfDayIcon timeStr={item.reminderTime} size={20} />
                </View>

                {/* Info */}
                <View style={{ flex: 1 }}>
                    <Text style={{ fontFamily: 'SpaceGrotesk_700Bold', fontSize: 15, color: '#000', marginBottom: 2 }} numberOfLines={1}>
                        {item.scheduleName || 'Lịch uống thuốc'}
                    </Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: dotColor }} />
                        <Text style={{ fontFamily: 'SpaceGrotesk_700Bold', fontSize: 11, color: '#6B7280' }}>
                            {timeDisplay}
                        </Text>
                        {item.memberName ? (
                            <>
                                <Text style={{ fontFamily: 'SpaceGrotesk_500Medium', fontSize: 11, color: '#9CA3AF' }}>·</Text>
                                <Text style={{ fontFamily: 'SpaceGrotesk_500Medium', fontSize: 11, color: '#9CA3AF' }} numberOfLines={1}>
                                    {item.memberName}
                                </Text>
                            </>
                        ) : null}
                    </View>
                    {medicines.length > 0 && (
                        <Text style={{ fontFamily: 'SpaceGrotesk_500Medium', fontSize: 11, color: '#A3A3A3', marginTop: 2 }}>
                            {medicines.length} loại thuốc — nhấn để xem
                        </Text>
                    )}
                </View>

                {/* Status badge & Action */}
                {isWithinWindow && medicines.length > 0 ? (
                    <Pressable
                        onPress={() => popup.open({ type: 'reminder_alert', data: item })}
                        style={{
                            marginLeft: 8,
                            backgroundColor: '#16A34A',
                            paddingHorizontal: 16,
                            paddingVertical: 10,
                            borderRadius: 14,
                            borderWidth: 2,
                            borderColor: BORDER_COLOR,
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: 4
                        }}
                    >
                        <Pill size={14} color="#fff" strokeWidth={2.5} />
                        <Text style={{ fontFamily: 'SpaceGrotesk_700Bold', fontSize: 13, color: '#fff' }}>UỐNG</Text>
                    </Pressable>
                ) : (
                    <View style={{
                        backgroundColor: statusColor,
                        borderWidth: 1.5, borderColor: statusTextColor + '40',
                        borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5,
                        flexDirection: 'row', alignItems: 'center', gap: 4,
                        marginLeft: 8,
                    }}>
                        <Text style={{ fontFamily: 'SpaceGrotesk_700Bold', fontSize: 10, color: statusTextColor, textTransform: 'uppercase' }}>
                            {statusText}
                        </Text>
                        {medicines.length > 0 && (
                            <ChevronDown
                                size={12}
                                color={statusTextColor}
                                strokeWidth={2.5}
                                style={{ transform: [{ rotate: expanded ? '180deg' : '0deg' }] }}
                            />
                        )}
                    </View>
                )}
            </Pressable>

            {/* Medicines expand section */}
            {expanded && medicines.length > 0 && (
                <View style={{
                    borderTopWidth: 1.5,
                    borderTopColor: '#F3F4F6',
                    backgroundColor: '#FAFAFA',
                    paddingHorizontal: 14,
                    paddingVertical: 10,
                }}>
                    {medicines.map((med: any, idx: number) => (
                        <View
                            key={med.detailId || idx}
                            style={{
                                flexDirection: 'row',
                                alignItems: 'flex-start',
                                paddingVertical: 8,
                                borderBottomWidth: idx < medicines.length - 1 ? 1 : 0,
                                borderBottomColor: '#E5E7EB',
                            }}
                        >
                            <View style={{
                                width: 32, height: 32, borderRadius: 10,
                                backgroundColor: '#EDE9FE',
                                borderWidth: 1.5, borderColor: '#7C3AED',
                                alignItems: 'center', justifyContent: 'center',
                                marginRight: 10, marginTop: 2,
                            }}>
                                <Pill size={15} color="#7C3AED" strokeWidth={2.5} />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={{ fontFamily: 'SpaceGrotesk_700Bold', fontSize: 13, color: '#1F1F1F', marginBottom: 2 }}>
                                    {med.medicineName}
                                </Text>
                                {med.dosage ? (
                                    <Text style={{ fontFamily: 'SpaceGrotesk_500Medium', fontSize: 11, color: '#6B7280', marginBottom: 1 }}>
                                        💊 Liều: {med.dosage.split('.')[0].trim()}
                                    </Text>
                                ) : null}
                                {med.instructions ? (
                                    <Text style={{ fontFamily: 'SpaceGrotesk_500Medium', fontSize: 11, color: '#6B7280', marginBottom: 1 }}>
                                        📋 {med.instructions}
                                    </Text>
                                ) : null}
                                {med.startDate && med.endDate && (
                                    <Text style={{ fontFamily: 'SpaceGrotesk_500Medium', fontSize: 10, color: '#9CA3AF' }}>
                                        {dayjs(med.startDate).format('DD/MM')} → {dayjs(med.endDate).format('DD/MM/YYYY')}
                                    </Text>
                                )}
                            </View>
                        </View>
                    ))}
                </View>
            )}
        </View>
    );
}

export default function MemberHomeScreen() {
    const today = dayjs();
    const [memberId, setMemberId] = useState<string | undefined>();
    const [isLoaded, setIsLoaded] = useState(false);
    const [selectedTab, setSelectedTab] = useState(TABS[0]);

    // --- Date State ---
    const [selectedDateStr, setSelectedDateStr] = useState(today.format('YYYY-MM-DD'));
    const [showMonthCalendar, setShowMonthCalendar] = useState(false);
    const [currentMonthStr, setCurrentMonthStr] = useState(today.format('YYYY-MM-DD'));

    useEffect(() => {
        getDecodedToken().then(t => {
            if (t) setMemberId(t.MemberId);
            setIsLoaded(true);
        });
    }, []);

    // --- Hooks lấy dữ liệu theo MemberId ---
    const { data: reminders, isLoading: loadingRems } = useGetMemberDailyReminders(memberId, selectedDateStr);
    const { data: logs, isLoading: loadingLogs } = useGetMemberMedicationLogs(memberId, selectedDateStr, selectedDateStr);

    // --- Tính toán tuần hiện tại (Pill Selector) ---
    const weekStart = today.startOf('week');
    const currentWeekDays = useMemo(() =>
        Array.from({ length: 7 }).map((_, i) => weekStart.add(i, 'day')),
        [weekStart.toString()]
    );

    // --- Tính toán lưới lịch tháng ---
    const currentMonth = useMemo(() => dayjs(currentMonthStr), [currentMonthStr]);
    const monthDays = useMemo(() => {
        const startOfMonth = currentMonth.startOf('month');
        const daysInMonth = currentMonth.daysInMonth();
        const startDay = startOfMonth.day();
        const days: dayjs.Dayjs[] = [];
        for (let i = startDay - 1; i >= 0; i--) days.push(startOfMonth.subtract(i + 1, 'day'));
        for (let i = 0; i < daysInMonth; i++) days.push(startOfMonth.add(i, 'day'));
        const remaining = (7 - (days.length % 7)) % 7;
        for (let i = 0; i < remaining; i++) days.push(startOfMonth.add(daysInMonth + i, 'day'));
        return days;
    }, [currentMonthStr]);

    const isDateOutsideCurrentWeek = !currentWeekDays.some(d => d.format('YYYY-MM-DD') === selectedDateStr);

    if (!isLoaded) {
        return (
            <SafeAreaView className="flex-1 bg-[#F9F6FC] items-center justify-center">
                <ActivityIndicator size="large" color="#000" />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#F9F6FC' }} edges={["top"]}>
            <ManagerHeader />

            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ paddingBottom: 120, paddingTop: 16, paddingHorizontal: 20 }}
                showsVerticalScrollIndicator={false}
            >
                {/* ─── 1. Header Chọn Ngày ─── */}
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                    <Text style={{ fontFamily: 'SpaceGrotesk_700Bold', fontSize: 22, color: '#000' }}>Lịch trình của tôi</Text>
                    <Pressable
                        onPress={() => setShowMonthCalendar(true)}
                        style={{
                            flexDirection: 'row', alignItems: 'center', gap: 6,
                            backgroundColor: '#fff', borderWidth: 2, borderColor: BORDER_COLOR,
                            borderRadius: 14, paddingHorizontal: 12, paddingVertical: 8, ...SHADOW_MD,
                        }}
                    >
                        <Calendar size={16} color="#000" strokeWidth={2.5} />
                        <Text style={{ fontFamily: 'SpaceGrotesk_700Bold', fontSize: 12 }}>Tháng {today.format('MM')}</Text>
                    </Pressable>
                </View>

                {/* Badge thông báo nếu chọn ngày xa tuần hiện tại */}
                {isDateOutsideCurrentWeek && (
                    <View style={{
                        flexDirection: 'row', alignItems: 'center', backgroundColor: SOFT_PURPLE,
                        borderWidth: 2, borderColor: BORDER_COLOR, borderRadius: 16,
                        paddingHorizontal: 14, paddingVertical: 10, marginBottom: 16, gap: 8,
                    }}>
                        <Calendar size={16} color="#000" strokeWidth={2.5} />
                        <Text style={{ fontFamily: 'SpaceGrotesk_700Bold', fontSize: 13, flex: 1 }}>
                            Đang xem: {dayjs(selectedDateStr).format('dddd, DD/MM/YYYY')}
                        </Text>
                        <Pressable onPress={() => setSelectedDateStr(today.format('YYYY-MM-DD'))}>
                            <X size={18} color="#000" strokeWidth={2.5} />
                        </Pressable>
                    </View>
                )}

                {/* ─── 2. Week Pill Selector (Đồng bộ UI Manager) ─── */}
                <View style={{
                    flexDirection: 'row', backgroundColor: '#fff', borderWidth: 2, borderColor: BORDER_COLOR,
                    borderRadius: 28, padding: 6, marginBottom: 22, ...SHADOW_MD,
                }}>
                    {currentWeekDays.map(d => {
                        const fullDate = d.format('YYYY-MM-DD');
                        const isSelected = fullDate === selectedDateStr;
                        const isToday = d.isSame(today, 'day');

                        return (
                            <Pressable
                                key={fullDate}
                                onPress={() => setSelectedDateStr(fullDate)}
                                style={{
                                    flex: 1, alignItems: 'center', justifyContent: 'center',
                                    paddingVertical: 12, borderRadius: 22,
                                    backgroundColor: isSelected ? '#000' : 'transparent',
                                }}
                            >
                                <Text adjustsFontSizeToFit numberOfLines={1} style={{
                                    fontFamily: 'SpaceGrotesk_700Bold', fontSize: 9,
                                    marginBottom: 4, textTransform: 'uppercase',
                                    color: isSelected ? '#9CA3AF' : '#94A3B8',
                                }}>
                                    {formatViDay(d)}
                                </Text>
                                <Text adjustsFontSizeToFit numberOfLines={1} style={{
                                    fontFamily: 'SpaceGrotesk_700Bold', fontSize: 16,
                                    color: isSelected ? '#fff' : '#000',
                                }}>
                                    {d.format('D')}
                                </Text>
                                {isToday && (
                                    <View style={{
                                        width: 5, height: 5, borderRadius: 2.5, marginTop: 4,
                                        backgroundColor: isSelected ? '#A3E6A1' : '#EF4444',
                                    }} />
                                )}
                            </Pressable>
                        );
                    })}
                </View>

                {/* ─── 3. Tab Selector ─── */}
                <View style={{
                    flexDirection: 'row', backgroundColor: '#F3F4F6', borderRadius: 18,
                    borderWidth: 2, borderColor: '#E5E7EB', padding: 4, marginBottom: 22,
                }}>
                    {TABS.map(tab => (
                        <Pressable
                            key={tab}
                            onPress={() => setSelectedTab(tab)}
                            style={{
                                flex: 1, paddingVertical: 10, borderRadius: 14, alignItems: 'center',
                                backgroundColor: selectedTab === tab ? '#9370DB' : 'transparent',
                            }}
                        >
                            <Text adjustsFontSizeToFit numberOfLines={1} style={{
                                fontFamily: 'SpaceGrotesk_700Bold', fontSize: 12,
                                color: selectedTab === tab ? '#fff' : '#6B7280',
                            }}>
                                {tab}
                            </Text>
                        </Pressable>
                    ))}
                </View>

                {/* ─── 4. Nội dung Danh sách ─── */}
                <View>
                    {selectedTab === TABS[0] ? (
                        <View>
                            {loadingRems ? (
                                <ActivityIndicator size="small" color="#9370DB" />
                            ) : reminders?.length ? (
                                reminders.map((r: any) => <ReminderCard key={r.reminderId} item={r} />)
                            ) : (
                                <View style={{ alignItems: 'center', marginTop: 30 }}>
                                    <Text style={{ fontFamily: 'SpaceGrotesk_500Medium', color: '#9CA3AF' }}>Không có lịch nhắc nào hôm nay.</Text>
                                </View>
                            )}
                        </View>
                    ) : (
                        <View>
                            {loadingLogs ? (
                                <ActivityIndicator size="small" color="#F59E0B" />
                            ) : logs?.length ? (
                                logs.map((l: any) => <LogCard key={l.logId} item={l} />)
                            ) : (
                                <View style={{ alignItems: 'center', marginTop: 30 }}>
                                    <Text style={{ fontFamily: 'SpaceGrotesk_500Medium', color: '#9CA3AF' }}>Chưa có lịch sử dùng thuốc.</Text>
                                </View>
                            )}
                        </View>
                    )}
                </View>
            </ScrollView>

            {/* ─── Modal Lịch Tháng (Giống Manager) ─── */}
            <Modal
                visible={showMonthCalendar}
                transparent
                animationType="slide"
                onRequestClose={() => setShowMonthCalendar(false)}
            >
                <Pressable
                    style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}
                    onPress={() => setShowMonthCalendar(false)}
                >
                    <View style={{
                        backgroundColor: '#F9F6FC', borderTopLeftRadius: 32, borderTopRightRadius: 32,
                        borderTopWidth: 2, borderColor: BORDER_COLOR, padding: 24, paddingBottom: 40
                    }}>
                        <View className="flex-row justify-between items-center mb-6">
                            <Text style={{ fontFamily: 'SpaceGrotesk_700Bold', fontSize: 20 }}>Chọn ngày khám</Text>
                            <Pressable onPress={() => setShowMonthCalendar(false)}>
                                <X size={24} color="#000" />
                            </Pressable>
                        </View>

                        <View style={{ backgroundColor: '#fff', borderWidth: 2, borderColor: BORDER_COLOR, borderRadius: 24, padding: 15, ...SHADOW_MD }}>
                            {/* Grid Lịch */}
                            <View className="flex-row mb-2">
                                {VI_DAYS.map(d => <Text key={d} className="flex-1 text-center font-space-bold text-gray-400 text-[10px]">{d}</Text>)}
                            </View>
                            <View className="flex-row flex-wrap">
                                {monthDays.map((day, idx) => {
                                    const isCurrentMonth = day.isSame(currentMonth, 'month');
                                    const isSelected = day.format('YYYY-MM-DD') === selectedDateStr;
                                    return (
                                        <Pressable
                                            key={idx}
                                            onPress={() => {
                                                if (!isCurrentMonth) return;
                                                setSelectedDateStr(day.format('YYYY-MM-DD'));
                                                setShowMonthCalendar(false);
                                            }}
                                            style={{
                                                width: '14.28%', aspectRatio: 1, alignItems: 'center', justifyContent: 'center',
                                                backgroundColor: isSelected ? SOFT_PURPLE : 'transparent',
                                                borderRadius: 12, opacity: isCurrentMonth ? 1 : 0.2,
                                                borderWidth: isSelected ? 2 : 0, borderColor: BORDER_COLOR
                                            }}
                                        >
                                            <Text style={{ fontFamily: 'SpaceGrotesk_700Bold', color: isSelected ? '#000' : '#000' }}>{day.date()}</Text>
                                        </Pressable>
                                    );
                                })}
                            </View>

                            {/* Điều hướng tháng */}
                            <View className="flex-row justify-between items-center mt-6 pt-4 border-t border-gray-100">
                                <Pressable onPress={() => setCurrentMonthStr(currentMonth.subtract(1, 'month').format('YYYY-MM-DD'))}>
                                    <ChevronLeft size={24} color="#000" />
                                </Pressable>
                                <Text style={{ fontFamily: 'SpaceGrotesk_700Bold', textTransform: 'uppercase' }}>{currentMonth.format('MMMM YYYY')}</Text>
                                <Pressable onPress={() => setCurrentMonthStr(currentMonth.add(1, 'month').format('YYYY-MM-DD'))}>
                                    <ChevronRight size={24} color="#000" />
                                </Pressable>
                            </View>
                        </View>
                    </View>
                </Pressable>
            </Modal>

            {/* ── Floating AI Chat Bubble ── */}
            <AIChatBubble />
        </SafeAreaView>
    );
}