import dayjs from "dayjs";
import 'dayjs/locale/vi';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import { useLocalSearchParams, useRouter } from "expo-router";
import {
    ArrowLeft,
    Calendar,
    ChevronLeft,
    ChevronRight,
    Heart,
    Share2,
    Star,
    X
} from "lucide-react-native";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Dimensions,
    Image,
    Modal,
    Pressable,
    RefreshControl,
    ScrollView,
    Text,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useGetDoctorAvailableSlots } from "../../../hooks/useAppointment";
import { useGetDoctorAvailabilities, useGetDoctorDetail, useGetDoctorReviews } from "../../../hooks/useDoctor";
import { usePopup } from "../../../stores/popupStore";
import { AvailableSlotResponse } from "../../../types/Appointment";

dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);

// Set locale to Vietnamese for proper day formatting
dayjs.locale('vi');

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const TABS = ['Đặt lịch', 'Thông tin'];

const BORDER_COLOR = '#000000';
const SOFT_PURPLE = '#D9AEF6';

const SHADOW_MD = {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
};

// Utility to convert english day part to Vietnamese abbreviations
const formatVietnameseDay = (d: dayjs.Dayjs) => {
    switch (d.day()) {
        case 0: return 'CN';
        case 1: return 'T2';
        case 2: return 'T3';
        case 3: return 'T4';
        case 4: return 'T5';
        case 5: return 'T6';
        case 6: return 'T7';
        default: return '';
    }
};

const formatDayOfWeekEn = (d: dayjs.Dayjs) => {
    switch (d.day()) {
        case 0: return 'Sunday';
        case 1: return 'Monday';
        case 2: return 'Tuesday';
        case 3: return 'Wednesday';
        case 4: return 'Thursday';
        case 5: return 'Friday';
        case 6: return 'Saturday';
        default: return '';
    }
};

export default function DoctorDetailScreen() {
    const router = useRouter();
    const { id, sessionId, status } = useLocalSearchParams();
    const doctorId = typeof id === 'string' ? id : (Array.isArray(id) ? id[0] : '');

    const [selectedTab, setSelectedTab] = useState('Đặt lịch');
    const [selectedDateItem, setSelectedDateItem] = useState<{ day: string, date: string, fullDate: string } | null>(null);
    const [selectedSlot, setSelectedSlot] = useState<AvailableSlotResponse | null>(null);

    // Month calendar modal state
    const [showMonthCalendar, setShowMonthCalendar] = useState(false);
    const [currentMonthStr, setCurrentMonthStr] = useState(dayjs().format('YYYY-MM-DD'));

    const { open } = usePopup();

    const isCompleted = status === 'Completed' || status === 'completed' || status === 'Đã khám';

    const { data: doctor, isLoading: isDoctorLoading, refetch: refetchDoctor } = useGetDoctorDetail(doctorId);
    const { data: reviewsData, isLoading: isReviewsLoading, refetch: refetchReviews } = useGetDoctorReviews(doctorId);
    const { data: availabilities, isLoading: isAvailLoading, refetch: refetchAvail } = useGetDoctorAvailabilities(doctorId);
    const { data: slotsData, isLoading: slotsLoading, refetch: refetchSlots } = useGetDoctorAvailableSlots(doctorId, selectedDateItem?.fullDate);

    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await Promise.all([
            refetchDoctor(),
            refetchReviews(),
            refetchAvail(),
            selectedDateItem ? refetchSlots() : Promise.resolve()
        ]);
        setRefreshing(false);
    }, [refetchDoctor, refetchReviews, refetchAvail, refetchSlots, selectedDateItem]);

    const computedAverage = 0;

    const slots = Array.isArray(slotsData) ? slotsData : [];
    const loading = isDoctorLoading || isReviewsLoading || isAvailLoading;

    // Active doctor days-of-week (English)
    const activeDays = useMemo(() => {
        if (!availabilities) return [];
        return availabilities.filter(a => a.isActive).map(a => a.dayOfWeek);
    }, [availabilities]);

    // Is a given date available (doctor works that day)?
    const isAvailableDate = useCallback((d: dayjs.Dayjs) => {
        return activeDays.includes(formatDayOfWeekEn(d));
    }, [activeDays]);

    // Current week (Mon → Sun of THIS week) days
    const today = dayjs();
    const weekStart = today.startOf('week'); // Sunday=0
    const currentWeekDays = useMemo(() => {
        return Array.from({ length: 7 }).map((_, i) => weekStart.add(i, 'day'));
    }, [weekStart.toString()]);

    // Auto-select first available future or today date when availabilities load
    useEffect(() => {
        if (!availabilities || activeDays.length === 0) return;
        if (selectedDateItem) return; // don't override user selection
        // Find first available day in current week starting from today
        for (let i = 0; i < 7; i++) {
            const d = today.add(i, 'day');
            if (isAvailableDate(d)) {
                setSelectedDateItem({
                    day: formatVietnameseDay(d),
                    date: d.format('DD'),
                    fullDate: d.format('YYYY-MM-DD')
                });
                return;
            }
        }
    }, [availabilities, activeDays.length]);

    // Month calendar data
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

    const handleSelectMonthDay = (d: dayjs.Dayjs) => {
        // Only allow future dates (today or after) that are available
        if (d.isBefore(today, 'day')) return;
        if (!isAvailableDate(d)) return;
        setSelectedDateItem({
            day: formatVietnameseDay(d),
            date: d.format('DD'),
            fullDate: d.format('YYYY-MM-DD')
        });
        setSelectedSlot(null);
        setShowMonthCalendar(false);
    };

    const handleBooking = () => {
        if (!selectedDateItem || !selectedSlot) return;
        if (selectedSlot.isBooked) return;

        open({
            type: 'booking_confirm',
            data: {
                doctorId: doctor?.doctorId,
                doctorName: doctor?.fullName,
                avatar: doctor?.avatarUrl,
                specialty: doctor?.specialty,
                date: selectedDateItem.fullDate,
                availabilityId: selectedSlot.availabilityId,
                displayTime: selectedSlot.displayTime,
                time: selectedSlot.time
            }
        });
    };

    if (loading) {
        return (
            <SafeAreaView className="flex-1 bg-[#F9F6FC] justify-center items-center" edges={["top"]}>
                <ActivityIndicator size="large" color="#000" />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-[#F9F6FC]" edges={["top"]}>
            {/* Header */}
            <View className="flex-row items-center justify-between px-5 pt-3 pb-4">
                <Pressable
                    onPress={() => router.back()}
                    className="w-12 h-12 bg-white border-2 border-black rounded-2xl items-center justify-center shadow-sm active:translate-y-0.5"
                >
                    <ArrowLeft size={22} color="#000" strokeWidth={2.5} />
                </Pressable>

                <View className="flex-row items-center gap-x-3">
                    <Pressable className="w-12 h-12 bg-white border-2 border-black rounded-2xl items-center justify-center shadow-sm">
                        <Heart size={22} color="#000" />
                    </Pressable>
                    <Pressable className="w-12 h-12 bg-white border-2 border-black rounded-2xl items-center justify-center shadow-sm">
                        <Share2 size={22} color="#000" />
                    </Pressable>
                </View>
            </View>

            <ScrollView
                className="flex-1"
                contentContainerStyle={{ paddingBottom: 100 }}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                {/* 1. Doctor Profile Card */}
                <View className="px-5 mb-6">
                    <View className="bg-white border-2 border-black rounded-[32px] p-6 shadow-sm overflow-hidden">
                        <View className="flex-row items-center gap-x-5 mb-6">
                            <View className="w-24 h-24 rounded-[28px] border-2 border-black bg-[#D9AEF6] items-center justify-center overflow-hidden shadow-sm">
                                <Image
                                    source={{ uri: doctor?.avatarUrl || 'https://cdn-icons-png.flaticon.com/512/3845/3842326.png' }}
                                    className="w-24 h-24"
                                />
                            </View>
                            <View className="flex-1">
                                <Text className="text-xl font-space-bold text-black leading-tight uppercase">{doctor?.fullName}</Text>
                                <Text className="text-sm font-space-medium text-black/40 mt-1">{doctor?.specialty}</Text>
                                <Text className="text-sm font-space-bold text-[#B3354B] mt-2">{doctor?.clinicName}</Text>
                            </View>
                        </View>

                        {/* Stats Row */}
                        <View className="flex-row justify-between bg-gray-50/50 border-2 border-black/5 rounded-2xl p-4">
                            <View className="items-center flex-1">
                                <Text className="text-base font-space-bold text-black">{doctor?.yearsOfExperience || 0} năm</Text>
                                <Text className="text-[10px] font-space-bold text-black/30 uppercase tracking-tighter mt-1">Kinh nghiệm làm việc</Text>
                            </View>
                            <View className="w-[1px] h-10 bg-black/10 mx-2" />
                            <View className="items-center flex-1">
                                <Text className="text-base font-space-bold text-black">{doctor?.consultationFee ? doctor.consultationFee.toLocaleString('vi-VN') : '0'}đ</Text>
                                <Text className="text-[10px] font-space-bold text-black/30 uppercase tracking-tighter mt-1">Phí tư vấn</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* 2. Tabs Selector */}
                <View className="mb-6">
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20 }}>
                        {TABS.map((tab) => (
                            <Pressable
                                key={tab}
                                onPress={() => setSelectedTab(tab)}
                                className="mr-6 pb-2"
                                style={{ borderBottomWidth: selectedTab === tab ? 3 : 0, borderBottomColor: '#B3354B' }}
                            >
                                <Text className={`text-[15px] font-space-bold ${selectedTab === tab ? 'text-black' : 'text-black/30'}`}>
                                    {tab}
                                </Text>
                            </Pressable>
                        ))}
                    </ScrollView>
                </View>

                {/* ─── Conditional Content Based on Tabs ─── */}

                {selectedTab === 'Đặt lịch' && (
                    <View>
                        {/* 3. Date Selection – Current Week */}
                        <View style={{ paddingHorizontal: 20, marginBottom: 32 }}>
                            {/* Section header with month calendar button */}
                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                                <Text style={{ fontFamily: 'SpaceGrotesk_700Bold', fontSize: 20, color: '#000' }}>
                                    Chọn ngày
                                </Text>
                                <Pressable
                                    onPress={() => setShowMonthCalendar(true)}
                                    style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        gap: 6,
                                        backgroundColor: '#fff',
                                        borderWidth: 2,
                                        borderColor: BORDER_COLOR,
                                        borderRadius: 14,
                                        paddingHorizontal: 12,
                                        paddingVertical: 7,
                                        ...SHADOW_MD
                                    }}
                                >
                                    <Calendar size={15} color="#000" strokeWidth={2.5} />
                                    <Text style={{ fontFamily: 'SpaceGrotesk_700Bold', fontSize: 12, color: '#000' }}>
                                        Lịch tháng
                                    </Text>
                                </Pressable>
                            </View>

                            {/* Selected date outside current week badge */}
                            {selectedDateItem && !currentWeekDays.some(d => d.format('YYYY-MM-DD') === selectedDateItem.fullDate) && (
                                <View style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    backgroundColor: SOFT_PURPLE,
                                    borderWidth: 2,
                                    borderColor: BORDER_COLOR,
                                    borderRadius: 16,
                                    paddingHorizontal: 14,
                                    paddingVertical: 10,
                                    marginBottom: 16,
                                    gap: 8
                                }}>
                                    <Calendar size={16} color="#000" strokeWidth={2.5} />
                                    <Text style={{ fontFamily: 'SpaceGrotesk_700Bold', fontSize: 14, color: '#000', flex: 1 }}>
                                        Đã chọn: {dayjs(selectedDateItem.fullDate).format('dddd, DD/MM/YYYY')}
                                    </Text>
                                    <Pressable onPress={() => {
                                        setSelectedDateItem(null);
                                        setSelectedSlot(null);
                                    }}>
                                        <X size={16} color="#000" strokeWidth={2.5} />
                                    </Pressable>
                                </View>
                            )}

                            {/* Current week horizontal selector */}
                            <View style={{
                                flexDirection: 'row',
                                backgroundColor: '#fff',
                                borderWidth: 2,
                                borderColor: BORDER_COLOR,
                                borderRadius: 28,
                                padding: 6,
                                ...SHADOW_MD
                            }}>
                                {currentWeekDays.map((d) => {
                                    const fullDate = d.format('YYYY-MM-DD');
                                    const isPast = d.isBefore(today, 'day');
                                    const available = isAvailableDate(d);
                                    const disabled = isPast || !available;
                                    const isSelected = selectedDateItem?.fullDate === fullDate;
                                    const isToday = d.isSame(today, 'day');

                                    return (
                                        <Pressable
                                            key={fullDate}
                                            onPress={() => {
                                                if (disabled) return;
                                                setSelectedDateItem({
                                                    day: formatVietnameseDay(d),
                                                    date: d.format('DD'),
                                                    fullDate
                                                });
                                                setSelectedSlot(null);
                                            }}
                                            style={{
                                                flex: 1,
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                paddingVertical: 12,
                                                paddingHorizontal: 4,
                                                borderRadius: 22,
                                                backgroundColor: isSelected ? '#000' : 'transparent',
                                                opacity: disabled ? 0.35 : 1,
                                            }}
                                        >
                                            <Text adjustsFontSizeToFit numberOfLines={1} style={{
                                                fontFamily: 'SpaceGrotesk_700Bold',
                                                fontSize: 9,
                                                marginBottom: 4,
                                                color: isSelected ? '#9CA3AF' : (disabled ? '#94A3B8' : '#94A3B8'),
                                                textTransform: 'uppercase'
                                            }}>
                                                {formatVietnameseDay(d)}
                                            </Text>
                                            <View style={{
                                                width: 30,
                                                height: 30,
                                                borderRadius: 15,
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                backgroundColor: isToday && !isSelected ? '#FEF9C3' : 'transparent'
                                            }}>
                                                <Text style={{
                                                    fontFamily: 'SpaceGrotesk_700Bold',
                                                    fontSize: 16,
                                                    color: isSelected ? '#FFF' : (disabled ? '#94A3B8' : '#000')
                                                }}>
                                                    {d.format('D')}
                                                </Text>
                                            </View>
                                            {/* Available dot indicator */}
                                            <View style={{ height: 5, marginTop: 3 }}>
                                                {available && !isPast && (
                                                    <View style={{
                                                        width: 5,
                                                        height: 5,
                                                        borderRadius: 2.5,
                                                        backgroundColor: isSelected ? '#A3E6A1' : '#A3E6A1'
                                                    }} />
                                                )}
                                            </View>
                                        </Pressable>
                                    );
                                })}
                            </View>
                        </View>

                        {/* 4. Time Selection */}
                        <View style={{ paddingHorizontal: 20 }}>
                            <Text style={{ fontFamily: 'SpaceGrotesk_700Bold', fontSize: 20, color: '#000', marginBottom: 20 }}>
                                Thời gian
                            </Text>

                            {!selectedDateItem ? (
                                <Text className="font-space-medium text-black/50">Vui lòng chọn ngày để xem khung giờ.</Text>
                            ) : slotsLoading ? (
                                <ActivityIndicator size="small" color="#000" />
                            ) : slots.length === 0 ? (
                                <Text className="font-space-medium text-black/50">Không có khung giờ trống.</Text>
                            ) : (
                                <View style={{
                                    backgroundColor: '#fff',
                                    borderWidth: 2,
                                    borderColor: '#000',
                                    borderRadius: 28,
                                    padding: 10,
                                    shadowColor: '#000',
                                    shadowOffset: { width: 0, height: 4 },
                                    shadowOpacity: 0.1,
                                    shadowRadius: 8,
                                    elevation: 4,
                                    flexDirection: 'row',
                                    flexWrap: 'wrap',
                                    gap: 8,
                                }}>
                                    {[...slots].sort((a, b) => {
                                        if (a.time < b.time) return -1;
                                        if (a.time > b.time) return 1;
                                        return 0;
                                    }).map((slot) => {
                                        const isSelected = selectedSlot?.time === slot.time;
                                        const isBooked = slot.isBooked;
                                        return (
                                            <Pressable
                                                key={slot.availabilityId + '_' + slot.time}
                                                onPress={() => {
                                                    if (!isBooked) setSelectedSlot(slot);
                                                }}
                                                style={{
                                                    // ~3 per row: (100% - 2*gap) / 3
                                                    width: '31%',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    paddingVertical: 16,
                                                    borderRadius: 18,
                                                    borderWidth: 2,
                                                    borderColor: isBooked
                                                        ? 'rgba(0,0,0,0.06)'
                                                        : isSelected
                                                            ? '#000'
                                                            : 'rgba(0,0,0,0.08)',
                                                    backgroundColor: isBooked
                                                        ? 'rgba(0,0,0,0.03)'
                                                        : isSelected
                                                            ? '#000'
                                                            : '#F8FAFC',
                                                    opacity: isBooked ? 0.45 : 1,
                                                }}
                                            >
                                                <Text style={{
                                                    fontFamily: 'SpaceGrotesk_700Bold',
                                                    fontSize: 13,
                                                    color: isBooked
                                                        ? 'rgba(0,0,0,0.35)'
                                                        : isSelected
                                                            ? '#FFF'
                                                            : '#000',
                                                }}>
                                                    {slot.displayTime}
                                                </Text>
                                                {isBooked && (
                                                    <Text style={{
                                                        fontFamily: 'SpaceGrotesk_700Bold',
                                                        fontSize: 9,
                                                        color: 'rgba(0,0,0,0.3)',
                                                        marginTop: 3,
                                                        textTransform: 'uppercase',
                                                    }}>
                                                        Đã đặt
                                                    </Text>
                                                )}
                                            </Pressable>
                                        );
                                    })}
                                </View>
                            )}
                        </View>
                    </View>
                )}

                {selectedTab === 'Thông tin' && (
                    <View className="px-5">
                        <View className="bg-white border-2 border-black rounded-[24px] p-6 shadow-sm mb-6">
                            <Text className="text-lg font-space-bold text-black mb-3">Tiểu sử</Text>
                            <Text className="text-sm font-space-medium text-black/60 leading-6">
                                {doctor?.bio || 'Chưa có thông tin tiểu sử.'}
                            </Text>
                        </View>

                        <View className="bg-white border-2 border-black rounded-[24px] p-6 shadow-sm mb-6">
                            <Text className="text-lg font-space-bold text-black mb-3">Thông tin công tác</Text>
                            
                            <View className="mb-4">
                                <Text className="text-xs font-space-bold text-black/40 uppercase tracking-wider mb-1">Phòng khám / Bệnh viện</Text>
                                <Text className="text-base font-space-bold text-black">{doctor?.clinicName || 'Chưa cập nhật'}</Text>
                            </View>

                            <View className="mb-4">
                                <Text className="text-xs font-space-bold text-black/40 uppercase tracking-wider mb-1">Chuyên khoa</Text>
                                <View className="flex-row flex-wrap mt-1">
                                    {doctor?.specialty ? (
                                        <View className="bg-[#D1EFFF] border-2 border-black px-4 py-2 rounded-xl">
                                            <Text className="text-sm font-space-bold text-black">{doctor.specialty}</Text>
                                        </View>
                                    ) : (
                                        <Text className="text-base font-space-medium text-black/60">Chưa cập nhật</Text>
                                    )}
                                </View>
                            </View>
                        </View>
                    </View>
                )}
            </ScrollView>

            {/* 5. Footer CTA */}
            <View className="absolute bottom-6 left-6 right-6 flex-row items-center gap-x-4">
                {/* <Pressable
                    onPress={() => open({
                        type: 'chat_detail',
                        data: {
                            name: doctor?.fullName || 'Bác sĩ',
                            avatar: doctor?.avatarUrl || 'https://cdn-icons-png.flaticon.com/512/3845/3842326.png',
                            specialty: doctor?.specialty || '',
                            sessionId: typeof sessionId === 'string' ? sessionId : (Array.isArray(sessionId) ? sessionId[0] : undefined),
                            isCompleted: isCompleted,
                        }
                    })}
                    className="w-16 h-16 bg-white border-2 border-black rounded-2xl items-center justify-center shadow-sm active:translate-y-1 active:shadow-none"
                >
                    <MessageCircle size={24} color="#000" strokeWidth={2.5} />
                </Pressable> */}

                <Pressable
                    onPress={handleBooking}
                    className={`flex-1 h-16 border-2 border-black rounded-2xl items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none ${(!selectedDateItem || !selectedSlot) ? 'bg-gray-300' : 'bg-[#B3354B]'}`}
                    disabled={!selectedDateItem || !selectedSlot}
                >
                    <Text className="text-white font-space-bold text-lg uppercase tracking-widest">
                        {(!selectedDateItem || !selectedSlot) ? 'Chọn lịch khám' : 'Đặt lịch ngay'}
                    </Text>
                </Pressable>
            </View>

            {/* ─── Month Calendar Modal ─── */}
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
                            borderTopLeftRadius: 32,
                            borderTopRightRadius: 32,
                            borderTopWidth: 2,
                            borderLeftWidth: 2,
                            borderRightWidth: 2,
                            borderColor: BORDER_COLOR,
                            paddingTop: 20,
                            paddingBottom: 40,
                            paddingHorizontal: 20,
                        }}
                        onPress={e => e.stopPropagation()}
                    >
                        {/* Modal header */}
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                            <Text style={{ fontFamily: 'SpaceGrotesk_700Bold', fontSize: 20, color: '#000' }}>
                                Chọn ngày khám
                            </Text>
                            <Pressable
                                onPress={() => setShowMonthCalendar(false)}
                                style={{ width: 36, height: 36, backgroundColor: '#fff', borderWidth: 2, borderColor: BORDER_COLOR, borderRadius: 12, alignItems: 'center', justifyContent: 'center' }}
                            >
                                <X size={18} color="#000" strokeWidth={2.5} />
                            </Pressable>
                        </View>

                        {/* Month calendar */}
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
                                    const available = isCurrentMonth && isAvailableDate(day) && !isPast;
                                    const isSelected = selectedDateItem?.fullDate === day.format('YYYY-MM-DD');
                                    const isToday = day.isSame(today, 'day');
                                    const disabled = !isCurrentMonth || isPast || !isAvailableDate(day);

                                    return (
                                        <Pressable
                                            key={idx}
                                            onPress={() => handleSelectMonthDay(day)}
                                            disabled={disabled}
                                            style={{
                                                width: '14.28%',
                                                aspectRatio: 1,
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                padding: 2,
                                                borderWidth: isSelected ? 2 : 1,
                                                borderColor: isSelected ? BORDER_COLOR : 'rgba(0,0,0,0.05)',
                                                backgroundColor: isSelected ? SOFT_PURPLE : (available ? 'rgba(163,230,161,0.15)' : 'transparent'),
                                                borderRadius: isSelected ? 12 : (available ? 10 : 0),
                                                opacity: disabled && isCurrentMonth ? 0.3 : 1,
                                            }}
                                        >
                                            <Text style={{
                                                fontSize: 14,
                                                fontFamily: 'SpaceGrotesk_700Bold',
                                                color: isSelected ? '#000' : isCurrentMonth
                                                    ? (isToday ? '#B3354B' : (available ? '#000' : '#94A3B8'))
                                                    : '#E2E8F0'
                                            }}>
                                                {day.format('D')}
                                            </Text>
                                            {available && !isSelected && (
                                                <View style={{ width: 3, height: 3, borderRadius: 1.5, backgroundColor: '#A3E6A1', marginTop: 1 }} />
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
                                <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: '#A3E6A1' }} />
                                <Text style={{ fontFamily: 'SpaceGrotesk_500Medium', fontSize: 11, color: '#64748B' }}>Có lịch khám</Text>
                            </View>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: SOFT_PURPLE, borderWidth: 1.5, borderColor: BORDER_COLOR }} />
                                <Text style={{ fontFamily: 'SpaceGrotesk_500Medium', fontSize: 11, color: '#64748B' }}>Đã chọn</Text>
                            </View>
                        </View>
                    </Pressable>
                </Pressable>
            </Modal>
        </SafeAreaView>
    );
}
