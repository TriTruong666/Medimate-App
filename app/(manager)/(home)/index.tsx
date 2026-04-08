import AIChatBubble from "@/components/AIChatBubble";
import { LogCard } from "@/components/MedicineCards";
import { useGetFamilies, useGetFamilyMembers } from "@/hooks/useFamily";
import { useGetFamilyMedicationLogs } from "@/hooks/useMedicationLog";
import { useGetMemberDailyReminders } from "@/hooks/useSchedule";
import dayjs from "dayjs";
import 'dayjs/locale/vi';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import {
    Calendar,
    ChevronRight as CardArrow,
    ChevronDown, ChevronLeft, ChevronRight,
    Moon, Pill, Sun, Sunrise, Users, X
} from "lucide-react-native";
import React, { useMemo, useState } from "react";
import {
    ActivityIndicator, Image, Modal, Pressable, ScrollView, Text, View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ManagerHeader from "../../../components/ManagerHeader";

dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);
dayjs.locale('vi');

const TABS = ['Lịch nhắc nhở', 'Lịch sử dùng thuốc'];
const BORDER_COLOR = '#000000';
const SOFT_PURPLE = '#D9AEF6';
const SHADOW_MD = {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
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

    // Trong cửa sổ nhắc nhở: sau reminderTime nhưng chưa qua endTime
    const isWithinWindow = isPast && !isEndTimePast;
    // Hết cửa sổ mà chưa được xác nhận (backend chưa kịp set Missed)
    const isEffectivelyMissed = isPast && isEndTimePast && (item.status === 'Pending' || item.status === 'Snoozed');

    let statusColor = '#FFD700';
    let statusText = 'Sắp tới';
    let statusTextColor = '#854D0E';
    let dotColor = '#EAB308';

    if (isTaken) {
        statusColor = '#DCFCE7'; statusText = 'Đã uống'; statusTextColor = '#166534'; dotColor = '#16A34A';
    } else if (isMissed || isEffectivelyMissed) {
        // Backend đã set Missed HOẶC frontend tự tính (quá endTime mà chưa uống)
        statusColor = '#FEE2E2'; statusText = 'Đã bỏ lỡ'; statusTextColor = '#991B1B'; dotColor = '#DC2626';
    } else if (isSkipped) {
        statusColor = '#F3F4F6'; statusText = 'Bỏ qua'; statusTextColor = '#374151'; dotColor = '#9CA3AF';
    } else if (isWithinWindow) {
        // Đã qua giờ nhắc nhưng chưa qua endTime → đang trong cửa sổ uống
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

                {/* Status badge */}
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

// ─── Member Reminder Row (lazy-loaded on expand) ─────────────────────────────
function MemberReminderRow({ member, date }: { member: any; date: string }) {
    const [expanded, setExpanded] = useState(false);
    const { data: reminders, isLoading } = useGetMemberDailyReminders(
        expanded ? member.memberId : undefined,
        expanded ? date : undefined
    );

    return (
        <View style={{ marginBottom: 8 }}>
            <Pressable
                onPress={() => setExpanded(!expanded)}
                style={{
                    flexDirection: 'row', alignItems: 'center',
                    backgroundColor: '#F5F3FF',
                    borderWidth: 1.5, borderColor: '#C4B5FD',
                    borderRadius: 16, padding: 12,
                }}
            >
                {/* Member Avatar */}
                <View style={{
                    width: 36, height: 36, borderRadius: 18,
                    backgroundColor: '#DDD6FE', borderWidth: 1.5, borderColor: '#7C3AED',
                    alignItems: 'center', justifyContent: 'center', marginRight: 10,
                    overflow: 'hidden',
                }}>
                    {member.avatarUrl
                        ? <Image source={{ uri: member.avatarUrl }} style={{ width: 36, height: 36, borderRadius: 18 }} />
                        : <Text style={{ fontFamily: 'SpaceGrotesk_700Bold', fontSize: 14, color: '#7C3AED' }}>
                            {(member.fullName || '?')[0].toUpperCase()}
                        </Text>
                    }
                </View>
                <Text style={{ flex: 1, fontFamily: 'SpaceGrotesk_700Bold', fontSize: 14, color: '#1F1F1F' }}>
                    {member.fullName}
                </Text>
                {isLoading
                    ? <ActivityIndicator size="small" color="#7C3AED" />
                    : expanded
                        ? <ChevronDown size={16} color="#7C3AED" strokeWidth={2.5} />
                        : <CardArrow size={16} color="#7C3AED" strokeWidth={2.5} />
                }
            </Pressable>

            {expanded && !isLoading && (
                <View style={{ paddingLeft: 12, paddingTop: 8 }}>
                    {reminders?.length ? (
                        reminders.map((r: any) => <ReminderCard key={r.reminderId} item={r} />)
                    ) : (
                        <Text style={{ fontFamily: 'SpaceGrotesk_500Medium', color: '#9CA3AF', fontSize: 13, paddingVertical: 8, paddingLeft: 4 }}>
                            Không có lịch nhắc nào.
                        </Text>
                    )}
                </View>
            )}
        </View>
    );
}

// ─── Family Accordion ────────────────────────────────────────────────────────
function FamilyReminderAccordion({ family, date }: { family: any; date: string }) {
    const [expanded, setExpanded] = useState(true);
    const { data: members, isLoading } = useGetFamilyMembers(expanded ? family.familyId : undefined);

    return (
        <View style={{ marginBottom: 16 }}>
            <Pressable
                onPress={() => setExpanded(!expanded)}
                style={{
                    flexDirection: 'row', alignItems: 'center',
                    backgroundColor: SOFT_PURPLE,
                    borderWidth: 2, borderColor: BORDER_COLOR,
                    borderRadius: 20, padding: 14, ...SHADOW_MD,
                }}
            >
                {/* Family Avatar */}
                <View style={{
                    width: 42, height: 42, borderRadius: 14,
                    backgroundColor: '#fff', borderWidth: 2, borderColor: BORDER_COLOR,
                    alignItems: 'center', justifyContent: 'center', marginRight: 10,
                    overflow: 'hidden',
                }}>
                    {family.familyAvatarUrl
                        ? <Image source={{ uri: family.familyAvatarUrl }} style={{ width: 42, height: 42, borderRadius: 12 }} />
                        : <Users size={20} color="#7C3AED" strokeWidth={2.5} />
                    }
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={{ fontFamily: 'SpaceGrotesk_700Bold', fontSize: 15, color: '#000' }}>{family.familyName}</Text>
                    <Text style={{ fontFamily: 'SpaceGrotesk_500Medium', fontSize: 11, color: '#555' }}>
                        Nhấn để {expanded ? 'thu gọn' : 'xem thành viên'}
                    </Text>
                </View>
                {expanded ? <ChevronDown size={20} color="#000" strokeWidth={2.5} /> : <CardArrow size={20} color="#000" strokeWidth={2.5} />}
            </Pressable>

            {expanded && (
                <View style={{ paddingLeft: 16, paddingTop: 10 }}>
                    {isLoading
                        ? <ActivityIndicator size="small" color="#000" />
                        : members?.length
                            ? members.map((m: any) => <MemberReminderRow key={m.memberId} member={m} date={date} />)
                            : <Text style={{ fontFamily: 'SpaceGrotesk_500Medium', color: '#9CA3AF', fontSize: 13 }}>Không tìm thấy thành viên.</Text>
                    }
                </View>
            )}
        </View>
    );
}

// ─── Family Med Log ──────────────────────────────────────────────────────────
function FamilyMedLogSection({ family, date }: { family: any; date: string }) {
    const [expanded, setExpanded] = useState(true);
    const { data: logs, isLoading } = useGetFamilyMedicationLogs(
        expanded ? family.familyId : undefined,
        expanded ? date : undefined,
        expanded ? date : undefined,
    );
    return (
        <View style={{ marginBottom: 16 }}>
            <Pressable
                onPress={() => setExpanded(!expanded)}
                style={{
                    flexDirection: 'row', alignItems: 'center',
                    backgroundColor: '#FEF3C7', borderWidth: 2, borderColor: BORDER_COLOR,
                    borderRadius: 20, padding: 14, ...SHADOW_MD,
                }}
            >
                {/* Family Avatar */}
                <View style={{
                    width: 42, height: 42, borderRadius: 14,
                    backgroundColor: '#fff', borderWidth: 2, borderColor: BORDER_COLOR,
                    alignItems: 'center', justifyContent: 'center', marginRight: 10,
                    overflow: 'hidden',
                }}>
                    {family.familyAvatarUrl
                        ? <Image source={{ uri: family.familyAvatarUrl }} style={{ width: 42, height: 42, borderRadius: 12 }} />
                        : <Users size={20} color="#D97706" strokeWidth={2.5} />
                    }
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={{ fontFamily: 'SpaceGrotesk_700Bold', fontSize: 15, color: '#000' }}>{family.familyName}</Text>
                    <Text style={{ fontFamily: 'SpaceGrotesk_500Medium', fontSize: 11, color: '#555' }}>Lịch sử uống thuốc</Text>
                </View>
                {expanded ? <ChevronDown size={20} color="#000" strokeWidth={2.5} /> : <CardArrow size={20} color="#000" strokeWidth={2.5} />}
            </Pressable>
            {expanded && (
                <View style={{ paddingLeft: 8, paddingTop: 10 }}>
                    {isLoading
                        ? <ActivityIndicator size="small" color="#000" />
                        : logs?.length
                            ? logs.map((l: any) => <LogCard key={l.logId} item={l} />)
                            : <Text style={{ fontFamily: 'SpaceGrotesk_500Medium', color: '#9CA3AF', fontSize: 13 }}>Chưa có hoạt động.</Text>
                    }
                </View>
            )}
        </View>
    );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────
export default function ManagerHomeScreen() {
    const [selectedTab, setSelectedTab] = useState(TABS[0]);
    const today = dayjs();

    // --- Date state (same pattern as doctor_detail) ---
    const [selectedDateStr, setSelectedDateStr] = useState(today.format('YYYY-MM-DD'));
    const [showMonthCalendar, setShowMonthCalendar] = useState(false);
    const [currentMonthStr, setCurrentMonthStr] = useState(today.format('YYYY-MM-DD'));

    // Current week Mon–Sun
    const weekStart = today.startOf('week');
    const currentWeekDays = useMemo(() =>
        Array.from({ length: 7 }).map((_, i) => weekStart.add(i, 'day')),
        [weekStart.toString()]
    );

    // Month calendar grid
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

    const { data: families, isLoading: familiesLoading } = useGetFamilies();
    const activeFamilies = families?.filter((f: any) => f.type !== 'Personal') || [];

    const isDateOutsideCurrentWeek = !currentWeekDays.some(d => d.format('YYYY-MM-DD') === selectedDateStr);
    const selectedDayjs = dayjs(selectedDateStr);

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#F9F6FC' }} edges={["top"]}>
            <ManagerHeader />

            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ paddingBottom: 120, paddingTop: 16, paddingHorizontal: 20 }}
                showsVerticalScrollIndicator={false}
            >
                {/* ─── 1. Date Header ─── */}
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                    <Text style={{ fontFamily: 'SpaceGrotesk_700Bold', fontSize: 20, color: '#000' }}>Chọn ngày</Text>
                    <Pressable
                        onPress={() => setShowMonthCalendar(true)}
                        style={{
                            flexDirection: 'row', alignItems: 'center', gap: 6,
                            backgroundColor: '#fff', borderWidth: 2, borderColor: BORDER_COLOR,
                            borderRadius: 14, paddingHorizontal: 12, paddingVertical: 7, ...SHADOW_MD,
                        }}
                    >
                        <Calendar size={15} color="#000" strokeWidth={2.5} />
                        <Text style={{ fontFamily: 'SpaceGrotesk_700Bold', fontSize: 12, color: '#000' }}>Lịch tháng</Text>
                    </Pressable>
                </View>

                {/* Out-of-week badge */}
                {isDateOutsideCurrentWeek && (
                    <View style={{
                        flexDirection: 'row', alignItems: 'center',
                        backgroundColor: SOFT_PURPLE, borderWidth: 2, borderColor: BORDER_COLOR,
                        borderRadius: 16, paddingHorizontal: 14, paddingVertical: 10, marginBottom: 16, gap: 8,
                    }}>
                        <Calendar size={16} color="#000" strokeWidth={2.5} />
                        <Text style={{ fontFamily: 'SpaceGrotesk_700Bold', fontSize: 14, color: '#000', flex: 1 }}>
                            Đã chọn: {selectedDayjs.format('dddd, DD/MM/YYYY')}
                        </Text>
                        <Pressable onPress={() => setSelectedDateStr(today.format('YYYY-MM-DD'))}>
                            <X size={16} color="#000" strokeWidth={2.5} />
                        </Pressable>
                    </View>
                )}

                {/* ─── 2. Week selector pill (giống doctor_detail) ─── */}
                <View style={{
                    flexDirection: 'row', backgroundColor: '#fff',
                    borderWidth: 2, borderColor: BORDER_COLOR,
                    borderRadius: 28, padding: 6, marginBottom: 22, ...SHADOW_MD,
                }}>
                    {currentWeekDays.map(d => {
                        const fullDate = d.format('YYYY-MM-DD');
                        const isPast = d.isBefore(today, 'day');
                        const isSelected = fullDate === selectedDateStr;
                        const isToday = d.isSame(today, 'day');

                        return (
                            <Pressable
                                key={fullDate}
                                onPress={() => setSelectedDateStr(fullDate)}
                                style={{
                                    flex: 1, alignItems: 'center', justifyContent: 'center',
                                    paddingVertical: 12, paddingHorizontal: 4,
                                    borderRadius: 22,
                                    backgroundColor: isSelected ? '#000' : 'transparent',
                                    opacity: isPast ? 0.45 : 1,
                                }}
                            >
                                <Text style={{
                                    fontFamily: 'SpaceGrotesk_700Bold', fontSize: 9,
                                    marginBottom: 4, textTransform: 'uppercase',
                                    color: isSelected ? '#9CA3AF' : '#94A3B8',
                                }}>
                                    {formatViDay(d)}
                                </Text>
                                <View style={{
                                    width: 30, height: 30, borderRadius: 15,
                                    alignItems: 'center', justifyContent: 'center',
                                    backgroundColor: isToday && !isSelected ? '#FEF9C3' : 'transparent',
                                }}>
                                    <Text style={{
                                        fontFamily: 'SpaceGrotesk_700Bold', fontSize: 16,
                                        color: isSelected ? '#fff' : isPast ? '#94A3B8' : '#000',
                                    }}>
                                        {d.format('D')}
                                    </Text>
                                </View>
                                {/* Today dot */}
                                <View style={{ height: 5, marginTop: 3 }}>
                                    {isToday && (
                                        <View style={{
                                            width: 5, height: 5, borderRadius: 2.5,
                                            backgroundColor: isSelected ? '#A3E6A1' : '#EF4444',
                                        }} />
                                    )}
                                </View>
                            </Pressable>
                        );
                    })}
                </View>

                {/* ─── 3. Tab Selector ─── */}
                <View style={{
                    flexDirection: 'row', backgroundColor: '#F3F4F6',
                    borderRadius: 18, borderWidth: 2, borderColor: '#E5E7EB',
                    padding: 4, marginBottom: 22,
                }}>
                    {TABS.map(tab => (
                        <Pressable
                            key={tab}
                            onPress={() => setSelectedTab(tab)}
                            style={{
                                flex: 1, paddingVertical: 10,
                                borderRadius: 14, alignItems: 'center',
                                backgroundColor: selectedTab === tab ? '#9370DB' : 'transparent',
                                ...SHADOW_MD,
                                shadowOpacity: selectedTab === tab ? 0.15 : 0,
                                elevation: selectedTab === tab ? 3 : 0,
                            }}
                        >
                            <Text style={{
                                fontFamily: 'SpaceGrotesk_700Bold', fontSize: 12,
                                color: selectedTab === tab ? '#fff' : '#6B7280',
                            }}>
                                {tab}
                            </Text>
                        </Pressable>
                    ))}
                </View>

                {/* ─── 4a. Tab: Lịch nhắc nhở ─── */}
                {selectedTab === TABS[0] && (
                    <View>
                        {familiesLoading
                            ? <ActivityIndicator size="large" color="#9370DB" />
                            : activeFamilies.length === 0
                                ? <View style={{ alignItems: 'center', paddingVertical: 40 }}>
                                    <Users size={48} color="#D1D5DB" strokeWidth={1.5} />
                                    <Text style={{ fontFamily: 'SpaceGrotesk_500Medium', color: '#9CA3AF', marginTop: 12, textAlign: 'center' }}>
                                        Bạn chưa có gia đình nào.{'\n'}Hãy tạo hoặc tham gia gia đình để bắt đầu.
                                    </Text>
                                </View>
                                : activeFamilies.map((family: any) => (
                                    <FamilyReminderAccordion key={family.familyId} family={family} date={selectedDateStr} />
                                ))
                        }
                    </View>
                )}

                {/* ─── 4b. Tab: Lịch sử dùng thuốc ─── */}
                {selectedTab === TABS[1] && (
                    <View>
                        {familiesLoading
                            ? <ActivityIndicator size="large" color="#F59E0B" />
                            : activeFamilies.length === 0
                                ? <Text style={{ fontFamily: 'SpaceGrotesk_500Medium', color: '#9CA3AF', textAlign: 'center', marginTop: 40 }}>
                                    Chưa có gia đình nào.
                                </Text>
                                : activeFamilies.map((family: any) => (
                                    <FamilyMedLogSection key={family.familyId} family={family} date={selectedDateStr} />
                                ))
                        }
                    </View>
                )}
            </ScrollView>

            {/* ─── Month Calendar Modal (giống hệt doctor_detail) ─── */}
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
                    <Pressable
                        style={{
                            backgroundColor: '#F9F6FC',
                            borderTopLeftRadius: 32, borderTopRightRadius: 32,
                            borderTopWidth: 2, borderLeftWidth: 2, borderRightWidth: 2,
                            borderColor: BORDER_COLOR,
                            paddingTop: 20, paddingBottom: 40, paddingHorizontal: 20,
                        }}
                        onPress={e => e.stopPropagation()}
                    >
                        {/* Modal header */}
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                            <Text style={{ fontFamily: 'SpaceGrotesk_700Bold', fontSize: 20, color: '#000' }}>Chọn ngày</Text>
                            <Pressable
                                onPress={() => setShowMonthCalendar(false)}
                                style={{ width: 36, height: 36, backgroundColor: '#fff', borderWidth: 2, borderColor: BORDER_COLOR, borderRadius: 12, alignItems: 'center', justifyContent: 'center' }}
                            >
                                <X size={18} color="#000" strokeWidth={2.5} />
                            </Pressable>
                        </View>

                        {/* Month calendar grid */}
                        <View style={{ backgroundColor: '#fff', borderWidth: 2, borderColor: BORDER_COLOR, borderRadius: 24, padding: 14, ...SHADOW_MD }}>
                            {/* Day headers */}
                            <View style={{ flexDirection: 'row', marginBottom: 8 }}>
                                {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map((d, i) => (
                                    <Text key={i} style={{ flex: 1, textAlign: 'center', fontSize: 10, fontFamily: 'SpaceGrotesk_700Bold', color: '#94A3B8' }}>{d}</Text>
                                ))}
                            </View>

                            {/* Days grid */}
                            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                                {monthDays.map((day, idx) => {
                                    const isCurrentMonth = day.isSame(currentMonth, 'month');
                                    const isPast = day.isBefore(today, 'day');
                                    const isSelected = day.format('YYYY-MM-DD') === selectedDateStr;
                                    const isToday = day.isSame(today, 'day');
                                    const disabled = !isCurrentMonth;

                                    return (
                                        <Pressable
                                            key={idx}
                                            onPress={() => {
                                                if (disabled) return;
                                                setSelectedDateStr(day.format('YYYY-MM-DD'));
                                                setShowMonthCalendar(false);
                                            }}
                                            disabled={disabled}
                                            style={{
                                                width: '14.28%', aspectRatio: 1,
                                                alignItems: 'center', justifyContent: 'center', padding: 2,
                                                borderWidth: isSelected ? 2 : 1,
                                                borderColor: isSelected ? BORDER_COLOR : 'rgba(0,0,0,0.05)',
                                                backgroundColor: isSelected ? SOFT_PURPLE : isPast && isCurrentMonth ? 'transparent' : 'transparent',
                                                borderRadius: isSelected ? 12 : 0,
                                                opacity: !isCurrentMonth ? 0.2 : 1,
                                            }}
                                        >
                                            <Text style={{
                                                fontSize: 14, fontFamily: 'SpaceGrotesk_700Bold',
                                                color: isSelected ? '#000' : isCurrentMonth
                                                    ? (isToday ? '#9370DB' : isPast ? '#9CA3AF' : '#000')
                                                    : '#E2E8F0',
                                            }}>
                                                {day.format('D')}
                                            </Text>
                                            {isToday && !isSelected && (
                                                <View style={{ width: 3, height: 3, borderRadius: 1.5, backgroundColor: '#9370DB', marginTop: 1 }} />
                                            )}
                                        </Pressable>
                                    );
                                })}
                            </View>

                            {/* Month navigator */}
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 14, paddingTop: 14, borderTopWidth: 1.5, borderTopColor: 'rgba(0,0,0,0.05)' }}>
                                <Pressable
                                    onPress={() => setCurrentMonthStr(currentMonth.subtract(1, 'month').format('YYYY-MM-DD'))}
                                    style={{ padding: 8, backgroundColor: '#F9FAFB', borderWidth: 2, borderColor: BORDER_COLOR, borderRadius: 10 }}
                                >
                                    <ChevronLeft size={20} color="#000" strokeWidth={2.5} />
                                </Pressable>
                                <Text style={{ fontFamily: 'SpaceGrotesk_700Bold', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1.5, color: '#64748B' }}>
                                    {currentMonth.format('MMMM YYYY')}
                                </Text>
                                <Pressable
                                    onPress={() => setCurrentMonthStr(currentMonth.add(1, 'month').format('YYYY-MM-DD'))}
                                    style={{ padding: 8, backgroundColor: '#F9FAFB', borderWidth: 2, borderColor: BORDER_COLOR, borderRadius: 10 }}
                                >
                                    <ChevronRight size={20} color="#000" strokeWidth={2.5} />
                                </Pressable>
                            </View>
                        </View>

                        {/* Legend */}
                        <View style={{ flexDirection: 'row', gap: 20, marginTop: 16, justifyContent: 'center' }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: '#9370DB' }} />
                                <Text style={{ fontFamily: 'SpaceGrotesk_500Medium', fontSize: 11, color: '#64748B' }}>Hôm nay</Text>
                            </View>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: SOFT_PURPLE, borderWidth: 1.5, borderColor: BORDER_COLOR }} />
                                <Text style={{ fontFamily: 'SpaceGrotesk_500Medium', fontSize: 11, color: '#64748B' }}>Đã chọn</Text>
                            </View>
                        </View>
                    </Pressable>
                </Pressable>
            </Modal>

            {/* ── Floating AI Chat Bubble ── */}
            <AIChatBubble />
        </SafeAreaView>
    );
}
