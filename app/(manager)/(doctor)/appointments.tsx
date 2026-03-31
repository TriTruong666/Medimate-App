import dayjs from "dayjs";
import 'dayjs/locale/vi';
import { useRouter } from "expo-router";
import { ArrowLeft, Calendar, Clock, Filter, Video } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Dimensions, Image, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getMyAppointments } from "../../../apis/appointment.api";
import { getSessionByAppointmentId } from "../../../apis/session.api";
import { useToast } from "../../../stores/toastStore";
import { AppointmentResponse } from "../../../types/Appointment";

dayjs.locale('vi');

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const FILTERS = ['Tất cả', 'Sắp tới', 'Đã khám', 'Đã hủy'];

export default function AppointmentsScreen() {
    const router = useRouter();
    const toast = useToast();

    const [appointments, setAppointments] = useState<AppointmentResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('Sắp tới');
    const [joiningState, setJoiningState] = useState<Record<string, boolean>>({});

    useEffect(() => {
        fetchAppointments();
    }, []);

    const fetchAppointments = async () => {
        setLoading(true);
        try {
            // Fetch all appointments for simplicity and do local filtering
            // Or use API status filter if needed. Here we fetch Confirmed or Pending.
            const res = await getMyAppointments();
            if (res.success) {
                // Sorting by most recent / upcoming
                setAppointments(Array.isArray(res.data) ? res.data : (res.data?.items || []));
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleJoinSession = async (appt: AppointmentResponse) => {
        setJoiningState(prev => ({ ...prev, [appt.appointmentId]: true }));
        try {
            // First fetch the session created by Hangfire or immediately available
            const res = await getSessionByAppointmentId(appt.appointmentId);
            if (res.success && res.data) {
                // Route to the video call screen
                router.push({
                    pathname: "/(manager)/(doctor)/video_call",
                    params: { sessionId: res.data.consultanSessionId, appointmentId: appt.appointmentId }
                } as any);
            } else {
                toast.error("Chưa có phòng", res.message || "Phòng khám chưa được mở. Vui lòng đợi đến giờ!");
            }
        } catch (error) {
            toast.error("Lỗi", "Lỗi lấy thông tin session phòng chờ!");
        } finally {
            setJoiningState(prev => ({ ...prev, [appt.appointmentId]: false }));
        }
    };

    const filteredAppointments = appointments.filter(appt => {
        if (filter === 'Sắp tới') return appt.status === 'Confirmed' || appt.status === 'Pending';
        if (filter === 'Đã khám') return appt.status === 'Completed';
        if (filter === 'Đã hủy') return appt.status === 'Cancelled';
        return true;
    });

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
                <Text className="text-xl font-space-bold text-black uppercase tracking-tight">Lịch khám của bạn</Text>
                <View className="w-12 h-12 bg-white border-2 border-black rounded-2xl items-center justify-center shadow-sm">
                    <Filter size={20} color="#000" />
                </View>
            </View>

            {/* Filters */}
            <View className="mb-4">
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20 }}>
                    {FILTERS.map((f) => {
                        const isSelected = filter === f;
                        return (
                            <Pressable
                                key={f}
                                onPress={() => setFilter(f)}
                                className={`mr-3 px-5 py-2.5 rounded-full border-2 border-black shadow-sm active:translate-y-0.5 ${isSelected ? 'bg-black' : 'bg-white'}`}
                            >
                                <Text className={`font-space-bold uppercase text-[12px] ${isSelected ? 'text-white' : 'text-black/60'}`}>
                                    {f}
                                </Text>
                            </Pressable>
                        );
                    })}
                </ScrollView>
            </View>

            {/* List */}
            <ScrollView className="flex-1 px-5" contentContainerStyle={{ paddingBottom: 100 }}>
                {loading ? (
                    <ActivityIndicator size="large" color="#000" className="mt-10" />
                ) : filteredAppointments.length === 0 ? (
                    <View className="items-center justify-center py-20">
                        <Calendar size={64} color="#000" strokeWidth={1} style={{ opacity: 0.2 }} />
                        <Text className="mt-4 font-space-bold text-black/40 text-base">Không có lịch {filter.toLowerCase()}</Text>
                    </View>
                ) : (
                    filteredAppointments.map(appt => {
                        const isUpcoming = appt.status === 'Confirmed' || appt.status === 'Pending';
                        const isJoining = joiningState[appt.appointmentId];
                        return (
                            <View key={appt.appointmentId} className="bg-white border-2 border-black rounded-[28px] p-5 mb-5 shadow-sm">
                                <View className="flex-row items-center justify-between mb-4 border-b-2 border-dashed border-black/10 pb-4">
                                    <View className="flex-row items-center gap-x-3">
                                        <View className="w-14 h-14 bg-[#D9AEF6] rounded-2xl border-2 border-black overflow-hidden items-center justify-center">
                                            <Image source={{ uri: appt.doctorAvatarUrl || 'https://cdn-icons-png.flaticon.com/512/3845/3842326.png' }} className="w-full h-full" />
                                        </View>
                                        <View>
                                            <Text className="text-[10px] font-space-bold text-[#B3354B] uppercase mb-0.5">{appt.doctorSpecialty || 'Chuyên gia'}</Text>
                                            <Text className="text-base font-space-bold text-black uppercase leading-tight" numberOfLines={1}>{appt.doctorName}</Text>
                                        </View>
                                    </View>

                                    <View className={`px-3 py-1.5 rounded-xl border-2 border-black ${appt.status === 'Confirmed' || appt.status === 'Pending' ? 'bg-[#A3E6A1]' :
                                            appt.status === 'Completed' ? 'bg-gray-200' : 'bg-[#FFD1D1]'
                                        }`}>
                                        <Text className="text-[10px] font-space-bold text-black uppercase">
                                            {appt.status === 'Pending' ? 'Chờ xác nhận' :
                                                appt.status === 'Confirmed' ? 'Sắp tới' :
                                                    appt.status === 'Completed' ? 'Đã khám' : 'Đã hủy'}
                                        </Text>
                                    </View>
                                </View>

                                <View className="flex-row items-center gap-x-2 bg-gray-50 p-3 rounded-2xl border-2 border-black/5 mb-4">
                                    <View className="w-8 h-8 bg-white border border-black/10 rounded-full items-center justify-center shadow-sm">
                                        <Text className="text-[14px]">👤</Text>
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-[10px] font-space-medium text-black/40">Bệnh nhân</Text>
                                        <Text className="text-sm font-space-bold text-black" numberOfLines={1}>{appt.memberName}</Text>
                                    </View>
                                </View>

                                <View className="flex-row items-center gap-x-3 mb-5">
                                    <View className="flex-1 flex-row items-center px-4 py-3 bg-white border-2 border-black rounded-2xl shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)]">
                                        <Calendar size={18} color="#000" />
                                        <Text className="text-xs font-space-bold text-black ml-2">{dayjs(appt.appointmentDate).format("DD/MM/YYYY")}</Text>
                                    </View>
                                    <View className="flex-1 flex-row items-center px-4 py-3 bg-white border-2 border-black rounded-2xl shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)]">
                                        <Clock size={18} color="#000" />
                                        <Text className="text-xs font-space-bold text-black ml-2">{appt.appointmentTime || '--:--'}</Text>
                                    </View>
                                </View>

                                {isUpcoming && (
                                    <Pressable
                                        onPress={() => handleJoinSession(appt)}
                                        disabled={isJoining}
                                        className={`w-full h-14 border-2 border-black rounded-2xl items-center justify-center flex-row gap-x-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none ${isJoining ? 'bg-[#ff7b8f]' : 'bg-[#B3354B]'}`}
                                    >
                                        {isJoining ? (
                                            <ActivityIndicator color="white" size="small" />
                                        ) : (
                                            <Video size={20} color="white" strokeWidth={2.5} />
                                        )}
                                        <Text className="text-white font-space-bold text-sm uppercase tracking-wider">{isJoining ? 'Đang vào...' : 'Tham gia cuộc gọi'}</Text>
                                    </Pressable>
                                )}
                            </View>
                        );
                    })
                )}
            </ScrollView>
        </SafeAreaView>
    );
}
