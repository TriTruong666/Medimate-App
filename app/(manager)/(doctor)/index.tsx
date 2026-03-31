import { useRouter } from "expo-router";
import {
    Calendar,
    Clock,
    Mic,
    Search,
    Star,
    Video
} from "lucide-react-native";
import React, { useState, useCallback, useMemo } from "react";
import { Dimensions, Image, Pressable, ScrollView, Text, TextInput, View, ActivityIndicator, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ManagerHeader from "../../../components/ManagerHeader";
import { useGetDoctors } from "../../../hooks/useDoctor";
import { useGetMyAppointments } from "../../../hooks/useAppointment";
import dayjs from "dayjs";

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const CARD_COLORS = ['#A3E6A1', '#D9AEF6', '#FFD700', '#FFD1D1', '#D1EFFF'];

// Specialty icon mapping (fallback to 🩺)
const SPECIALTY_ICONS: Record<string, string> = {
    'Tim mạch': '❤️',
    'Thần kinh': '🧠',
    'Nha khoa': '🦷',
    'Nhi khoa': '👶',
    'Da liễu': '🌿',
    'Mắt': '👁️',
    'Tai mũi họng': '👂',
    'Xương khớp': '🦴',
    'Tiêu hóa': '🫀',
    'Thận': '🧬',
    'Gan': '🍃',
    'Phổi': '🫁',
    'Sản phụ khoa': '🌸',
    'Ung bướu': '🔬',
    'Nội tiết': '⚗️',
    'Tâm thần': '🧘',
};

const getSpecialtyIcon = (specialty: string) => {
    for (const key in SPECIALTY_ICONS) {
        if (specialty?.toLowerCase().includes(key.toLowerCase())) return SPECIALTY_ICONS[key];
    }
    return '🩺';
};

const SPECIALTY_BG_COLORS = [
    '#FFD1D1', '#D1EFFF', '#D1FFD1', '#FFF4D1', '#E4D1FF',
    '#FFE4D1', '#D1FFF4', '#F4D1FF', '#D1FFFF', '#FFD1F4'
];

export default function DoctorScreen() {
    const router = useRouter();
    const [search, setSearch] = useState("");
    const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null);

    const { data: doctorsData, isLoading: isDoctorsLoading, refetch: refetchDoctors } = useGetDoctors();
    const { data: appointmentsData, isLoading: isAppointmentsLoading, refetch: refetchAppointments } = useGetMyAppointments({ status: "Confirmed" });
    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await Promise.all([refetchDoctors(), refetchAppointments()]);
        setRefreshing(false);
    }, [refetchDoctors, refetchAppointments]);

    const doctors = doctorsData || [];
    const appointments = appointmentsData || [];
    const loading = isDoctorsLoading || isAppointmentsLoading;

    // Derive unique specialties from actual doctor data
    const specialties = useMemo(() => {
        const set = new Set<string>();
        doctors.forEach(doc => {
            if (doc.specialty) set.add(doc.specialty);
        });
        return Array.from(set).sort();
    }, [doctors]);

    // Filter doctors by search + specialty
    const filteredDoctors = useMemo(() => {
        return doctors.filter(doc => {
            const matchSearch = !search || doc.fullName.toLowerCase().includes(search.toLowerCase()) || doc.specialty?.toLowerCase().includes(search.toLowerCase());
            const matchSpecialty = !selectedSpecialty || doc.specialty === selectedSpecialty;
            return matchSearch && matchSpecialty;
        });
    }, [doctors, search, selectedSpecialty]);

    const ongoingAppt = appointments[0];
    const upcomingAppt = appointments.length > 1 ? appointments[1] : null;

    return (
        <SafeAreaView className="flex-1 bg-[#F9F6FC]" edges={["top"]}>
            <ManagerHeader />

            <ScrollView
                className="flex-1"
                contentContainerStyle={{ paddingBottom: 110 }}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >

                {/* 1. Search Bar */}
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
                            {search.length > 0 && (
                                <Pressable onPress={() => setSearch('')}>
                                    <Text style={{ fontSize: 18, color: '#A0A0A0' }}>✕</Text>
                                </Pressable>
                            )}
                        </View>
                    </View>
                </View>

                {/* 2. Specialty Filter – derived from actual doctors */}
                <View className="mb-8">
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20 }}>
                        {/* "Tất cả" chip */}
                        <Pressable
                            onPress={() => setSelectedSpecialty(null)}
                            className="items-center mr-5"
                        >
                            <View
                                className="w-16 h-16 rounded-full border-2 border-black items-center justify-center mb-2 shadow-sm"
                                style={{ backgroundColor: selectedSpecialty === null ? '#000' : '#fff' }}
                            >
                                <Text className="text-2xl">🏥</Text>
                            </View>
                            <Text
                                className="text-[11px] font-space-bold uppercase tracking-wider"
                                style={{ color: selectedSpecialty === null ? '#000' : 'rgba(0,0,0,0.35)' }}
                                numberOfLines={1}
                            >
                                Tất cả
                            </Text>
                        </Pressable>

                        {isDoctorsLoading ? (
                            <View className="justify-center px-4">
                                <ActivityIndicator size="small" color="#000" />
                            </View>
                        ) : (
                            specialties.map((spec, idx) => {
                                const isActive = selectedSpecialty === spec;
                                const bgColor = SPECIALTY_BG_COLORS[idx % SPECIALTY_BG_COLORS.length];
                                return (
                                    <Pressable
                                        key={spec}
                                        onPress={() => setSelectedSpecialty(isActive ? null : spec)}
                                        className="items-center mr-5"
                                    >
                                        <View
                                            className="w-16 h-16 rounded-full border-2 border-black items-center justify-center mb-2 shadow-sm"
                                            style={{ backgroundColor: isActive ? '#000' : bgColor }}
                                        >
                                            <Text className="text-2xl">{getSpecialtyIcon(spec)}</Text>
                                        </View>
                                        <Text
                                            className="text-[10px] font-space-bold uppercase tracking-tight text-center"
                                            style={{ color: isActive ? '#000' : 'rgba(0,0,0,0.35)', maxWidth: 64 }}
                                            numberOfLines={2}
                                        >
                                            {spec}
                                        </Text>
                                    </Pressable>
                                );
                            })
                        )}
                    </ScrollView>
                </View>

                {/* 3. Ongoing & Upcoming Schedule */}
                <View className="px-5 mb-8">
                    <View className="flex-row items-center justify-between mb-4">
                        <Text className="text-xl font-space-bold text-black">Lịch hẹn của bạn ({appointments.length})</Text>
                        <Pressable onPress={() => router.push("/(manager)/(doctor)/appointments")}>
                            <Text className="text-sm font-space-bold text-[#B3354B]">Xem lịch</Text>
                        </Pressable>
                    </View>

                    {isAppointmentsLoading ? (
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

                {/* 4. Doctor List */}
                <View className="px-5">
                    <View className="flex-row items-center justify-between mb-5">
                        <Text className="text-xl font-space-bold text-black">
                            {selectedSpecialty ? `Khoa ${selectedSpecialty}` : 'Danh sách bác sĩ'}
                            {filteredDoctors.length > 0 ? ` (${filteredDoctors.length})` : ''}
                        </Text>
                        {selectedSpecialty && (
                            <Pressable onPress={() => setSelectedSpecialty(null)}>
                                <Text className="text-sm font-space-bold text-[#B3354B]">Xem tất cả</Text>
                            </Pressable>
                        )}
                    </View>

                    {isDoctorsLoading ? (
                        <ActivityIndicator size="small" color="#000" className="mt-4" />
                    ) : filteredDoctors.length === 0 ? (
                        <View className="bg-white border-2 border-dashed border-black/20 rounded-[24px] p-10 items-center">
                            <Text className="text-3xl mb-3">🔍</Text>
                            <Text className="text-center font-space-medium text-black/40">
                                {search ? `Không tìm thấy bác sĩ "${search}"` : 'Không có bác sĩ trong khoa này'}
                            </Text>
                        </View>
                    ) : (
                        filteredDoctors.map((doc, index) => {
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
                                            <View className="flex-1 mr-2">
                                                <Text className="text-base font-space-bold text-black leading-tight uppercase" numberOfLines={1}>{doc.fullName}</Text>
                                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 }}>
                                                    <View style={{ backgroundColor: SPECIALTY_BG_COLORS[index % SPECIALTY_BG_COLORS.length], paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(0,0,0,0.08)' }}>
                                                        <Text style={{ fontFamily: 'SpaceGrotesk_700Bold', fontSize: 10, color: '#000' }}>{doc.specialty}</Text>
                                                    </View>
                                                </View>
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
