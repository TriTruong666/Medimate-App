import { useRouter } from "expo-router";
import {
    Calendar,
    Clock,
    Mic,
    Search,
    SlidersHorizontal,
    Star,
    Video
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { Dimensions, Image, Pressable, ScrollView, Text, TextInput, View, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ManagerHeader from "../../../components/ManagerHeader";
import { usePopup } from "../../../stores/popupStore";
import { getDoctors } from "../../../apis/doctor.api";
import { DoctorListItem } from "../../../types/Doctor";
import { getMyAppointments } from "../../../apis/appointment.api";
import { AppointmentResponse } from "../../../types/Appointment";
import dayjs from "dayjs";

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ─── Mock Data ───────────────────────────────────────────────
const CATEGORIES = [
    { id: '1', name: 'Tim mạch', icon: '❤️', color: '#FFD1D1' },
    { id: '2', name: 'Thận', icon: '🧬', color: '#D1EFFF' },
    { id: '3', name: 'Gan', icon: '🍃', color: '#D1FFD1' },
    { id: '4', name: 'Tai mũi họng', icon: '👂', color: '#FFF4D1' },
    { id: '5', name: 'Thần kinh', icon: '🧠', color: '#E4D1FF' },
];

// Removed redundant mock data for doctors and upcoming schedules. Colors are randomly assigned for UI variation in mapping.
const CARD_COLORS = ['#A3E6A1', '#D9AEF6', '#FFD700', '#FFD1D1', '#D1EFFF'];

export default function DoctorScreen() {
    const router = useRouter();
    const [search, setSearch] = useState("");
    const [selectedCategory, setSelectedCategory] = useState('1');
    const [doctors, setDoctors] = useState<DoctorListItem[]>([]);
    const [appointments, setAppointments] = useState<AppointmentResponse[]>([]);
    const [loading, setLoading] = useState(true);

    const { open } = usePopup();

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [docRes, apptRes] = await Promise.all([
                    getDoctors(),
                    getMyAppointments({ status: "Confirmed" })
                ]);
                if (docRes.success) {
                    setDoctors(Array.isArray(docRes.data) ? docRes.data : (docRes.data?.items || []));
                }
                if (apptRes.success) {
                    setAppointments(Array.isArray(apptRes.data) ? apptRes.data : (apptRes.data?.items || []));
                }
            } catch (error) {
                console.error("Error fetching doctor tab data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const ongoingAppt = appointments[0]; // Assuming first is most imminent for simplicity
    const upcomingAppt = appointments.length > 1 ? appointments[1] : null;

    return (
        <SafeAreaView className="flex-1 bg-[#F9F6FC]" edges={["top"]}>
            <ManagerHeader />

            <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 110 }} showsVerticalScrollIndicator={false}>

                {/* 1. Search Bar (Khúc giữa - Theo hình 2) */}
                <View className="px-5 mb-6">
                    <View className="flex-row items-center gap-x-3">
                        <View className="flex-1 flex-row items-center bg-white border-2 border-black rounded-[20px] px-4 py-1 shadow-sm">
                            <Search size={20} color="#A0A0A0" strokeWidth={2.5} />
                            <TextInput
                                className="flex-1 h-12 ml-3 font-space-bold text-black"
                                placeholder="Tìm bác sĩ, chuyên khoa..."
                                value={search}
                                onChangeText={setSearch}
                            />
                            <Mic size={20} color="#A0A0A0" strokeWidth={2} />
                        </View>
                        <Pressable className="w-14 h-14 bg-black border-2 border-black rounded-[20px] items-center justify-center shadow-[4px_4px_0px_0px_rgba(163,230,161,1)]">
                            <SlidersHorizontal size={22} color="#FFF" strokeWidth={2.5} />
                        </Pressable>
                    </View>
                </View>

                {/* 2. Categories (Khúc giữa - Theo hình 2) */}
                <View className="mb-8">
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20 }}>
                        {CATEGORIES.map((cat) => (
                            <Pressable
                                key={cat.id}
                                onPress={() => setSelectedCategory(cat.id)}
                                className="items-center mr-6"
                            >
                                <View
                                    className={`w-16 h-16 rounded-full border-2 border-black items-center justify-center mb-2 shadow-sm ${selectedCategory === cat.id ? 'bg-black' : 'bg-white'}`}
                                    style={{ backgroundColor: selectedCategory === cat.id ? '#000' : cat.color }}
                                >
                                    <Text className="text-2xl">{cat.icon}</Text>
                                </View>
                                <Text className={`text-[11px] font-space-bold uppercase tracking-wider ${selectedCategory === cat.id ? 'text-black' : 'text-black/40'}`}>
                                    {cat.name}
                                </Text>
                            </Pressable>
                        ))}
                    </ScrollView>
                </View>

                {/* 3. Ongoing & Upcoming Schedule (Synchronized Design) */}
                <View className="px-5 mb-8">
                    <View className="flex-row items-center justify-between mb-4">
                        <Text className="text-xl font-space-bold text-black">Lịch hẹn của bạn ({appointments.length})</Text>
                        <Pressable onPress={() => router.push("/(manager)/(doctor)/appointments")}>
                            <Text className="text-sm font-space-bold text-[#B3354B]">Xem lịch</Text>
                        </Pressable>
                    </View>

                    {loading ? (
                        <ActivityIndicator size="small" color="#000" />
                    ) : appointments.length === 0 ? (
                        <View className="bg-white border-2 border-black/10 border-dashed rounded-[24px] p-5 items-center">
                            <Text className="text-sm font-space-medium text-black/40">Chưa có lịch hẹn nào</Text>
                        </View>
                    ) : (
                        <>
                            {/* Ongoing Card (Latest) */}
                            {ongoingAppt && (
                                <View className="bg-[#A3E6A1] border-2 border-black rounded-[28px] p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mb-4">
                                    <View className="flex-row items-center justify-between mb-3">
                                        <View className="bg-black/10 px-3 py-1 rounded-full border border-black/10">
                                            <Text className="text-[10px] font-space-bold uppercase text-black/60">
                                                {dayjs(ongoingAppt.appointmentDate).format("DD/MM/YYYY")}
                                            </Text>
                                        </View>
                                        <View className="flex-row items-center gap-x-1">
                                            <View className="w-2 h-2 rounded-full bg-red-500" />
                                            <Text className="text-[10px] font-space-bold text-red-500 uppercase">Trực tuyến</Text>
                                        </View>
                                    </View>

                                    <View className="flex-row items-center justify-between">
                                        <View className="flex-1">
                                            <Text className="text-lg font-space-bold text-black uppercase" numberOfLines={1}>{ongoingAppt.doctorName}</Text>
                                            <Text className="text-xs font-space-medium text-black/50 mt-1 uppercase tracking-tight">{ongoingAppt.doctorSpecialty || "Bác sĩ tư vấn"}</Text>
                                            <Text className="text-[11px] font-space-bold text-black/80 mt-1">Video Call: {ongoingAppt.appointmentTime}</Text>
                                        </View>

                                        <Pressable 
                                            onPress={() => router.push(`/(manager)/(doctor)/appointments` as any)}
                                            className="bg-black w-14 h-14 rounded-2xl items-center justify-center border-2 border-black shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] active:translate-y-0.5"
                                        >
                                            <Video size={24} color="#A3E6A1" strokeWidth={2.5} />
                                        </Pressable>
                                    </View>
                                </View>
                            )}

                            {/* Upcoming Schedule Link */}
                            {upcomingAppt && (
                                <View className="bg-white border-2 border-black rounded-[24px] p-4 flex-row items-center justify-between">
                                    <View className="flex-row items-center gap-x-3">
                                        <View className="w-10 h-10 bg-[#FFD1D1] rounded-xl border-2 border-black items-center justify-center">
                                            <Calendar size={18} color="#000" strokeWidth={2.5} />
                                        </View>
                                        <View>
                                            <Text className="text-sm font-space-bold text-black">Lịch hẹn tiếp theo</Text>
                                            <Text className="text-[10px] font-space-medium text-black/40 text-left">{dayjs(upcomingAppt.appointmentDate).format("DD/MM")} • {upcomingAppt.appointmentTime}</Text>
                                        </View>
                                    </View>
                                    <View className="w-10 h-10 bg-gray-50 border-2 border-black rounded-xl items-center justify-center">
                                        <Clock size={16} color="#000" strokeWidth={2.5} />
                                    </View>
                                </View>
                            )}
                        </>
                    )}
                </View>

                {/* 4. Popular Doctors (Khúc giữa - Theo hình 2) */}
                <View className="px-5">
                    <View className="flex-row items-center justify-between mb-5">
                        <Text className="text-xl font-space-bold text-black">Danh sách bác sĩ</Text>
                        <Pressable>
                            <Text className="text-sm font-space-bold text-[#B3354B]">Xem tất cả</Text>
                        </Pressable>
                    </View>

                    {loading ? (
                        <ActivityIndicator size="small" color="#000" className="mt-4" />
                    ) : doctors.length === 0 ? (
                        <Text className="text-center font-space-medium text-black/40 mt-5">Không tìm thấy bác sĩ</Text>
                    ) : (
                        doctors.map((doc, index) => {
                            const color = CARD_COLORS[index % CARD_COLORS.length];
                            return (
                                <Pressable
                                    key={doc.doctorId}
                                    onPress={() => router.push({ pathname: "/(manager)/(doctor)/doctor_detail", params: { id: doc.doctorId } } as any)}
                                    className="bg-white border-2 border-black rounded-[28px] p-4 flex-row items-center mb-4 shadow-sm active:translate-x-1 active:translate-y-1 active:shadow-none"
                                >
                                    <View
                                        className="w-20 h-20 rounded-2xl border-2 border-black items-center justify-center overflow-hidden"
                                        style={{ backgroundColor: color }}
                                    >
                                        <Image source={{ uri: doc.avatarUrl || 'https://cdn-icons-png.flaticon.com/512/3774/3774299.png' }} className="w-16 h-16" />
                                    </View>

                                    <View className="flex-1 ml-4 py-1">
                                        <View className="flex-row justify-between items-start">
                                            <View>
                                                <Text className="text-lg font-space-bold text-black leading-tight uppercase" numberOfLines={1}>{doc.fullName}</Text>
                                                <Text className="text-xs font-space-medium text-black/40 mt-0.5">{doc.specialty}</Text>
                                            </View>
                                        </View>

                                        <View className="flex-row items-center justify-between mt-auto pt-2">
                                            <View className="flex-row items-center gap-x-1">
                                                <Star size={14} color="#FFD700" fill="#FFD700" />
                                                <Text className="text-xs font-space-bold text-black">{doc.averageRating.toFixed(1)}</Text>
                                                <Text className="text-[10px] font-space-medium text-black/30">({doc.totalReviews})</Text>
                                            </View>

                                            <View className="bg-[#B3354B]/10 px-3 py-1 rounded-lg">
                                                <Text className="text-[#B3354B] font-space-bold text-[10px] uppercase">Khám ngay</Text>
                                            </View>
                                        </View>
                                    </View>
                                </Pressable>
                            );
                        })
                    )}
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}
