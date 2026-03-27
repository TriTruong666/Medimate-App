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
import React, { useState } from "react";
import { Dimensions, Image, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { usePopup } from "../../../stores/popupStore";

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ─── Mock Data ───────────────────────────────────────────────
const DATES = [
    { day: 'T2', date: '25' },
    { day: 'T3', date: '26' },
    { day: 'T4', date: '27' },
    { day: 'T5', date: '28' },
    { day: 'T6', date: '29' },
    { day: 'T7', date: '30' },
];

const TIME_SLOTS = [
    '8:00 AM', '8:30 AM', '8:45 AM',
    '9:00 AM', '9:30 AM', '10:00 AM'
];

const TABS = ['Đặt lịch', 'Thông tin', 'Kinh nghiệm', 'Đánh giá'];

export default function DoctorDetailScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams();

    const [selectedDate, setSelectedDate] = useState('27');
    const [selectedTime, setSelectedTime] = useState('8:30 AM');
    const [selectedTab, setSelectedTab] = useState('Đặt lịch');
    const [period, setPeriod] = useState('Morning');

    const { open } = usePopup();

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
                                    source={{ uri: 'https://cdn-icons-png.flaticon.com/512/3845/3842326.png' }}
                                    className="w-24 h-24"
                                />
                            </View>
                            <View className="flex-1">
                                <Text className="text-xl font-space-bold text-black leading-tight">Prof. Dr.{"\n"}Logan Mason</Text>
                                <Text className="text-sm font-space-medium text-black/40 mt-1">Nha khoa</Text>
                                <Text className="text-lg font-space-bold text-[#B3354B] mt-2">$20/hr</Text>
                            </View>
                        </View>

                        {/* Stats Row */}
                        <View className="flex-row justify-between bg-gray-50/50 border-2 border-black/5 rounded-2xl p-4">
                            <View className="items-center">
                                <Text className="text-base font-space-bold text-black">14 năm</Text>
                                <Text className="text-[10px] font-space-bold text-black/30 uppercase tracking-tighter">Kinh nghiệm</Text>
                            </View>
                            <View className="w-[1px] h-8 bg-black/10" />
                            <View className="items-center">
                                <Text className="text-base font-space-bold text-black">2456</Text>
                                <Text className="text-[10px] font-space-bold text-black/30 uppercase tracking-tighter">Bệnh nhân</Text>
                            </View>
                            <View className="w-[1px] h-8 bg-black/10" />
                            <View className="items-center">
                                <View className="flex-row items-center gap-x-1">
                                    <Star size={14} color="#FFD700" fill="#FFD700" />
                                    <Text className="text-base font-space-bold text-black">2.4k</Text>
                                </View>
                                <Text className="text-[10px] font-space-bold text-black/30 uppercase tracking-tighter">Đánh giá</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* New: Ongoing & Upcoming Schedule */}
                <View className="px-5 mb-8">
                    {/* Ongoing Card */}
                    <View className="bg-[#A3E6A1] border-2 border-black rounded-[28px] p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mb-4">
                        <View className="flex-row items-center justify-between mb-3">
                            <View className="bg-black/10 px-3 py-1 rounded-full border border-black/10">
                                <Text className="text-[10px] font-space-bold uppercase text-black/60">Đang diễn ra</Text>
                            </View>
                            <View className="flex-row items-center gap-x-1">
                                <View className="w-2 h-2 rounded-full bg-red-500" />
                                <Text className="text-[10px] font-space-bold text-red-500 uppercase">Trực tuyến</Text>
                            </View>
                        </View>
                        
                        <View className="flex-row items-center justify-between">
                            <View className="flex-1">
                                <Text className="text-lg font-space-bold text-black">Tư vấn trực tiếp</Text>
                                <Text className="text-xs font-space-medium text-black/40 mt-1">Kết thúc sau 15 phút</Text>
                            </View>
                            
                            <Pressable className="bg-black w-14 h-14 rounded-2xl items-center justify-center border-2 border-black shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]">
                                <Video size={24} color="#A3E6A1" strokeWidth={2.5} />
                            </Pressable>
                        </View>
                    </View>

                    {/* Upcoming Schedule Link */}
                    <View className="bg-white border-2 border-black rounded-[24px] p-4 flex-row items-center justify-between">
                        <View className="flex-row items-center gap-x-3">
                            <View className="w-10 h-10 bg-[#FFD1D1] rounded-xl border-2 border-black items-center justify-center">
                                <Calendar size={18} color="#000" strokeWidth={2.5} />
                            </View>
                            <View>
                                <Text className="text-sm font-space-bold text-black">Lịch hẹn sắp tới</Text>
                                <Text className="text-[10px] font-space-medium text-black/40">Thứ 7, 28/03 • 09:30 AM</Text>
                            </View>
                        </View>
                        <Pressable className="w-10 h-10 bg-gray-50 border-2 border-black rounded-xl items-center justify-center">
                           <Clock size={16} color="#000" strokeWidth={2.5} />
                        </Pressable>
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
                        {/* 3. Date Selection (Safe-UI) */}
                        <View style={{ paddingHorizontal: 20, marginBottom: 32 }}>
                            <Text style={{ fontFamily: 'SpaceGrotesk_700Bold', fontSize: 20, color: '#000', marginBottom: 20 }}>
                                Chọn ngày
                            </Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                {DATES.map((d) => {
                                    const isSelected = selectedDate === d.date;
                                    return (
                                        <Pressable
                                            key={d.date}
                                            onPress={() => setSelectedDate(d.date)}
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
                        </View>

                        {/* 4. Time Selection (Safe-UI) */}
                        <View style={{ paddingHorizontal: 20 }}>
                            <Text style={{ fontFamily: 'SpaceGrotesk_700Bold', fontSize: 20, color: '#000', marginBottom: 20 }}>
                                Thời gian
                            </Text>
                            <View style={{ flexDirection: 'row', backgroundColor: '#FFF', borderWidth: 2, borderColor: '#000', borderRadius: 20, padding: 6, marginBottom: 24 }}>
                                {['Morning', 'Afternoon', 'Evening', 'Night'].map((p) => {
                                    const isSelected = period === p;
                                    return (
                                        <Pressable
                                            key={p}
                                            onPress={() => setPeriod(p)}
                                            style={{ flex: 1, paddingVertical: 12, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: isSelected ? '#B3354B' : 'transparent' }}
                                        >
                                            <Text style={{ fontFamily: 'SpaceGrotesk_700Bold', fontSize: 10, textTransform: 'uppercase', letterSpacing: 1, color: isSelected ? '#FFF' : 'rgba(0,0,0,0.3)' }}>
                                                {p === 'Morning' ? 'Sáng' : p === 'Afternoon' ? 'Chiều' : p === 'Evening' ? 'Tối' : 'Đêm'}
                                            </Text>
                                        </Pressable>
                                    );
                                })}
                            </View>

                            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                                {TIME_SLOTS.map((slot) => {
                                    const isSelected = selectedTime === slot;
                                    return (
                                        <Pressable
                                            key={slot}
                                            onPress={() => setSelectedTime(slot)}
                                            style={{
                                                width: (SCREEN_WIDTH - 60) / 3,
                                                paddingVertical: 16,
                                                borderRadius: 16,
                                                borderWidth: 2,
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                marginBottom: 16,
                                                backgroundColor: '#FFF',
                                                borderColor: isSelected ? '#B3354B' : 'rgba(0,0,0,0.05)',
                                                shadowColor: '#000',
                                                shadowOffset: isSelected ? { width: 3, height: 3 } : { width: 0, height: 0 },
                                                shadowOpacity: isSelected ? 1 : 0,
                                                shadowRadius: 0,
                                                elevation: isSelected ? 3 : 0,
                                            }}
                                        >
                                            <Text style={{ fontFamily: 'SpaceGrotesk_700Bold', fontSize: 14, color: isSelected ? '#B3354B' : 'rgba(0,0,0,0.3)' }}>
                                                {slot}
                                            </Text>
                                        </Pressable>
                                    );
                                })}
                            </View>
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

                {selectedTab === 'Kinh nghiệm' && (
                    <View className="px-5">
                        {[
                            { year: '2020 - Nay', place: 'Bệnh viện Đa khoa Quốc tế Vinmec', role: 'Trưởng khoa Nha khoa' },
                            { year: '2015 - 2020', place: 'Bệnh viện Răng Hàm Mặt Trung ương', role: 'Bác sĩ Phẫu thuật chính' },
                            { year: '2010 - 2015', place: 'Đại học Y Dược TP.HCM', role: 'Giảng viên cấp cao' },
                        ].map((exp, idx) => (
                            <View key={idx} className="flex-row mb-6">
                                <View className="items-center mr-4">
                                    <View className="w-4 h-4 rounded-full bg-[#B3354B] border-2 border-black" />
                                    {idx !== 2 && <View className="w-[2px] flex-1 bg-black/10 mt-2" />}
                                </View>
                                <View className="flex-1 bg-white border-2 border-black rounded-2xl p-4 shadow-sm">
                                    <Text className="text-xs font-space-bold text-[#B3354B] mb-1">{exp.year}</Text>
                                    <Text className="text-sm font-space-bold text-black">{exp.place}</Text>
                                    <Text className="text-xs font-space-medium text-black/40 mt-1">{exp.role}</Text>
                                </View>
                            </View>
                        ))}
                    </View>
                )}

                {selectedTab === 'Đánh giá' && (
                    <View className="px-5">
                        <View className="bg-[#FFF4D1] border-2 border-black rounded-[24px] p-5 mb-6 flex-row items-center justify-between">
                            <View>
                                <Text className="text-3xl font-space-bold text-black">4.9</Text>
                                <Text className="text-xs font-space-medium text-black/40">Trên 5 sao</Text>
                            </View>
                            <View className="flex-row gap-x-1">
                                {[1,2,3,4,5].map(s => <Star key={s} size={20} color="#000" fill="#000" />)}
                            </View>
                        </View>

                        {[
                            { name: 'Nguyễn Văn A', date: '2 ngày trước', comment: 'Bác sĩ rất nhiệt tình và chuyên nghiệp. Răng mình sau khi làm rất đẹp và không bị đau.' },
                            { name: 'Trần Thị B', date: '1 tuần trước', comment: 'Dịch vụ tốt, bác sĩ tư vấn kỹ càng trước khi thực hiện phẫu thuật.' },
                        ].map((rev, idx) => (
                            <View key={idx} className="bg-white border-2 border-black rounded-2xl p-4 mb-4 shadow-sm">
                                <View className="flex-row justify-between mb-2">
                                    <Text className="text-sm font-space-bold text-black">{rev.name}</Text>
                                    <Text className="text-[10px] font-space-medium text-black/30">{rev.date}</Text>
                                </View>
                                <Text className="text-xs font-space-medium text-black/60 leading-5">{rev.comment}</Text>
                            </View>
                        ))}
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
                    onPress={() => open({ type: 'booking_confirm' })}
                    className="flex-1 h-16 bg-[#B3354B] border-2 border-black rounded-2xl items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none"
                >
                    <Text className="text-white font-space-bold text-lg uppercase tracking-widest">Đặt lịch ngay</Text>
                </Pressable>
            </View>
        </SafeAreaView>
    );
}
