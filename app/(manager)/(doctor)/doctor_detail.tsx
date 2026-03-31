import { useLocalSearchParams, useRouter } from "expo-router";
import {
    ArrowLeft,
    Calendar,
    Clock,
    Heart,
    MessageCircle,
    Share2,
    Star,
    Video
} from "lucide-react-native";
import React, { useState, useEffect } from "react";
import { Dimensions, Image, Pressable, ScrollView, Text, View, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { usePopup } from "../../../stores/popupStore";
import { getDoctorDetail, getDoctorAvailabilities, getDoctorReviews } from "../../../apis/doctor.api";
import { getDoctorAvailableSlots } from "../../../apis/appointment.api";
import { DoctorDetailResponse, DoctorAvailabilityResponse, DoctorReviewResponse } from "../../../types/Doctor";
import { AvailableSlotResponse } from "../../../types/Appointment";
import dayjs from "dayjs";
import 'dayjs/locale/vi';

// Set locale to Vietnamese for proper day formatting
dayjs.locale('vi');

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const TABS = ['Đặt lịch', 'Thông tin', 'Đánh giá'];

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
    const { id } = useLocalSearchParams();
    const doctorId = typeof id === 'string' ? id : (Array.isArray(id) ? id[0] : '');

    const [doctor, setDoctor] = useState<DoctorDetailResponse | null>(null);
    const [reviews, setReviews] = useState<DoctorReviewResponse[]>([]);
    const [availableDates, setAvailableDates] = useState<{ day: string, date: string, fullDate: string }[]>([]);
    
    // UI state
    const [selectedTab, setSelectedTab] = useState('Đặt lịch');
    const [selectedDateItem, setSelectedDateItem] = useState<{ day: string, date: string, fullDate: string } | null>(null);
    const [selectedSlot, setSelectedSlot] = useState<AvailableSlotResponse | null>(null);
    const [slots, setSlots] = useState<AvailableSlotResponse[]>([]);
    
    // Load state
    const [loading, setLoading] = useState(true);
    const [slotsLoading, setSlotsLoading] = useState(false);

    const { open } = usePopup();

    useEffect(() => {
        if (!doctorId) return;
        const fetchDoctorData = async () => {
            setLoading(true);
            try {
                const [docRes, availRes, reviewsRes] = await Promise.all([
                    getDoctorDetail(doctorId),
                    getDoctorAvailabilities(doctorId),
                    getDoctorReviews(doctorId)
                ]);

                if (docRes.success && docRes.data) {
                    setDoctor(docRes.data);
                }

                if (reviewsRes.success && reviewsRes.data) {
                    setReviews(reviewsRes.data);
                }

                if (availRes.success && availRes.data) {
                    // Compute next 14 days
                    const activeDays = availRes.data.filter(a => a.isActive).map(a => a.dayOfWeek);
                    const validDates = [];
                    for (let i = 0; i < 14; i++) {
                        const d = dayjs().add(i, 'day');
                        const enDay = formatDayOfWeekEn(d);
                        if (activeDays.includes(enDay)) {
                            validDates.push({
                                day: formatVietnameseDay(d),
                                date: d.format('DD'),
                                fullDate: d.format('YYYY-MM-DD')
                            });
                        }
                    }
                    setAvailableDates(validDates);
                    if (validDates.length > 0) {
                        setSelectedDateItem(validDates[0]);
                    }
                }
            } catch (error) {
                console.error("Error fetching doctor detail:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDoctorData();
    }, [doctorId]);

    useEffect(() => {
        if (!doctorId || !selectedDateItem) return;
        const fetchSlots = async () => {
            setSlotsLoading(true);
            try {
                const res = await getDoctorAvailableSlots(doctorId, selectedDateItem.fullDate);
                if (res.success && res.data) {
                    setSlots(res.data);
                } else {
                    setSlots([]);
                }
            } catch (error) {
                console.error("Error fetching slots:", error);
                setSlots([]);
            } finally {
                setSlotsLoading(false);
            }
        };
        fetchSlots();
    }, [doctorId, selectedDateItem]);

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

            <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
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
                                <Text className="text-sm font-space-bold text-[#B3354B] mt-2">{doctor?.currentHospital}</Text>
                            </View>
                        </View>

                        {/* Stats Row */}
                        <View className="flex-row justify-between bg-gray-50/50 border-2 border-black/5 rounded-2xl p-4">
                            <View className="items-center">
                                <Text className="text-base font-space-bold text-black">{doctor?.yearsOfExperience} năm</Text>
                                <Text className="text-[10px] font-space-bold text-black/30 uppercase tracking-tighter">Kinh nghiệm</Text>
                            </View>
                            <View className="w-[1px] h-8 bg-black/10" />
                            <View className="items-center">
                                <Text className="text-base font-space-bold text-black">{doctor?.totalReviews}</Text>
                                <Text className="text-[10px] font-space-bold text-black/30 uppercase tracking-tighter">Đánh giá</Text>
                            </View>
                            <View className="w-[1px] h-8 bg-black/10" />
                            <View className="items-center">
                                <View className="flex-row items-center gap-x-1">
                                    <Star size={14} color="#FFD700" fill="#FFD700" />
                                    <Text className="text-base font-space-bold text-black">{doctor?.averageRating.toFixed(1)}</Text>
                                </View>
                                <Text className="text-[10px] font-space-bold text-black/30 uppercase tracking-tighter">Sao</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Note: Upcoming Schedule removed from standard doctor detail as they are now dynamically processed in manager tab */}

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
                        {/* 3. Date Selection */}
                        <View style={{ paddingHorizontal: 20, marginBottom: 32 }}>
                            <Text style={{ fontFamily: 'SpaceGrotesk_700Bold', fontSize: 20, color: '#000', marginBottom: 20 }}>
                                Chọn ngày
                            </Text>
                            {availableDates.length > 0 ? (
                                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                    {availableDates.map((d) => {
                                        const isSelected = selectedDateItem?.fullDate === d.fullDate;
                                        return (
                                            <Pressable
                                                key={d.fullDate}
                                                onPress={() => {
                                                    setSelectedDateItem(d);
                                                    setSelectedSlot(null);
                                                }}
                                                style={{
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    width: 56,
                                                    height: 80,
                                                    borderRadius: 24,
                                                    borderWidth: 2,
                                                    marginRight: 16,
                                                    backgroundColor: isSelected ? '#B3354B' : '#FFF',
                                                    borderColor: isSelected ? '#000' : 'rgba(0,0,0,0.05)',
                                                    shadowColor: '#000',
                                                    shadowOffset: isSelected ? { width: 4, height: 4 } : { width: 0, height: 0 },
                                                    shadowOpacity: isSelected ? 1 : 0,
                                                    shadowRadius: 0,
                                                    elevation: isSelected ? 4 : 0,
                                                }}
                                            >
                                                <Text style={{
                                                    fontFamily: 'SpaceGrotesk_700Bold',
                                                    fontSize: 10,
                                                    marginBottom: 4,
                                                    color: isSelected ? '#FFF' : 'rgba(0,0,0,0.3)'
                                                }}>{d.day}</Text>
                                                <Text style={{
                                                    fontFamily: 'SpaceGrotesk_700Bold',
                                                    fontSize: 18,
                                                    color: isSelected ? '#FFF' : '#000'
                                                }}>{d.date}</Text>
                                            </Pressable>
                                        );
                                    })}
                                </ScrollView>
                            ) : (
                                <Text className="font-space-medium text-black/50">Không có ngày khám trống trong 14 ngày tới.</Text>
                            )}
                        </View>

                        {/* 4. Time Selection */}
                        <View style={{ paddingHorizontal: 20 }}>
                            <Text style={{ fontFamily: 'SpaceGrotesk_700Bold', fontSize: 20, color: '#000', marginBottom: 20 }}>
                                Thời gian
                            </Text>

                            {slotsLoading ? (
                                <ActivityIndicator size="small" color="#000" />
                            ) : slots.length === 0 ? (
                                <Text className="font-space-medium text-black/50">Không có khung giờ trống.</Text>
                            ) : (
                                <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                                    {slots.map((slot) => {
                                        const isSelected = selectedSlot?.availabilityId === slot.availabilityId;
                                        const isBooked = slot.isBooked;
                                        return (
                                            <Pressable
                                                key={slot.availabilityId}
                                                onPress={() => {
                                                    if (!isBooked) setSelectedSlot(slot);
                                                }}
                                                style={{
                                                    width: (SCREEN_WIDTH - 60) / 2 - 5, // Display times can be wider "16:00 - 17:00"
                                                    paddingVertical: 16,
                                                    borderRadius: 16,
                                                    borderWidth: 2,
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    marginBottom: 16,
                                                    backgroundColor: isBooked ? '#f5f5f5' : '#FFF',
                                                    borderColor: isSelected ? '#B3354B' : 'rgba(0,0,0,0.1)',
                                                    shadowColor: '#000',
                                                    shadowOffset: isSelected ? { width: 3, height: 3 } : { width: 0, height: 0 },
                                                    shadowOpacity: isSelected ? 1 : 0,
                                                    shadowRadius: 0,
                                                    elevation: isSelected ? 3 : 0,
                                                    opacity: isBooked ? 0.5 : 1
                                                }}
                                            >
                                                <Text style={{ 
                                                    fontFamily: 'SpaceGrotesk_700Bold', 
                                                    fontSize: 14, 
                                                    color: isBooked ? 'rgba(0,0,0,0.3)' : (isSelected ? '#B3354B' : '#000')
                                                }}>
                                                    {slot.displayTime}
                                                </Text>
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
                                GS. TS. Logan Mason là chuyên gia hàng đầu trong lĩnh vực Nha khoa với hơn 14 năm kinh nghiệm công tác tại các bệnh viện lớn trên thế giới. Ông nổi tiếng với các ca phẫu thuật hàm mặt phức tạp và các kỹ thuật phục hình răng thẩm mỹ tiên tiến.
                            </Text>
                        </View>
                        
                        <View className="flex-row flex-wrap gap-2">
                            {['Răng hàm mặt', 'Chỉnh nha', 'Implant', 'Phẫu thuật nướu'].map(item => (
                                <View key={item} className="bg-[#D1EFFF] border-2 border-black px-4 py-2 rounded-full">
                                    <Text className="text-xs font-space-bold text-black">{item}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                )}

                                {/* No static "Kinh nghiệm" implementation required as stats are in header */}

                {selectedTab === 'Đánh giá' && (
                    <View className="px-5">
                        <View className="bg-[#FFF4D1] border-2 border-black rounded-[24px] p-5 mb-6 flex-row items-center justify-between">
                            <View>
                                <Text className="text-3xl font-space-bold text-black">{doctor?.averageRating.toFixed(1)}</Text>
                                <Text className="text-xs font-space-medium text-black/40">Trên 5 sao</Text>
                            </View>
                            <View className="flex-row gap-x-1">
                                {[1,2,3,4,5].map(s => <Star key={s} size={20} color="#000" fill={s <= (doctor?.averageRating || 0) ? "#000" : "transparent"} />)}
                            </View>
                        </View>

                        {reviews.length === 0 ? (
                            <Text className="text-center font-space-medium text-black/40 mt-5">Chưa có đánh giá nào.</Text>
                        ) : (
                            reviews.map((rev) => (
                                <View key={rev.ratingId} className="bg-white border-2 border-black rounded-2xl p-4 mb-4 shadow-sm">
                                    <View className="flex-row justify-between mb-2 items-center">
                                        <View className="flex-row items-center gap-x-2">
                                            <Image source={{ uri: rev.memberAvatar || 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png' }} className="w-6 h-6 rounded-full" />
                                            <Text className="text-sm font-space-bold text-black">{rev.memberName}</Text>
                                        </View>
                                        <Text className="text-[10px] font-space-medium text-black/30">{dayjs(rev.createdAt).format("DD/MM/YYYY")}</Text>
                                    </View>
                                    <Text className="text-xs font-space-medium text-black/60 leading-5">{rev.comment}</Text>
                                </View>
                            ))
                        )}
                    </View>
                )}
            </ScrollView>

            {/* 5. Footer CTA */}
            <View className="absolute bottom-6 left-6 right-6 flex-row items-center gap-x-4">
                <Pressable 
                    onPress={() => open({ 
                        type: 'chat_detail', 
                        data: { 
                            name: 'Prof. Dr. Logan Mason', 
                            avatar: 'https://cdn-icons-png.flaticon.com/512/3845/3842326.png',
                            specialty: 'Nha khoa' 
                        } 
                    })}
                    className="w-16 h-16 bg-white border-2 border-black rounded-2xl items-center justify-center shadow-sm active:translate-y-1 active:shadow-none"
                >
                    <MessageCircle size={24} color="#000" strokeWidth={2.5} />
                </Pressable>

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
        </SafeAreaView>
    );
}
