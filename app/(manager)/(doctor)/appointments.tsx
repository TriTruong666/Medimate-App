import dayjs from "dayjs";
import 'dayjs/locale/vi';
import { useRouter } from "expo-router";
import { ArrowLeft, ArrowRight, Calendar, Clock, Filter, MessageSquare, RefreshCw } from "lucide-react-native";
import React, { useState } from "react";
import { ActivityIndicator, Image, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getSessionByAppointmentId } from "../../../apis/session.api";
import { useGetAppointmentDetail, useGetMyAppointments } from "../../../hooks/useAppointment";
import { useToast } from "../../../stores/toastStore";
import { AppointmentDetailResponse, AppointmentResponse } from "../../../types/Appointment";

dayjs.locale('vi');

const FILTERS = ['Tất cả', 'Sắp tới', 'Đã khám', 'Đã hủy'];

const STATUS_CONFIG: Record<string, { label: string; bg: string }> = {
    Pending: { label: 'Chờ xác nhận', bg: '#FFF4D1' },
    Approved: { label: 'Sắp tới', bg: '#A3E6A1' },
    Completed: { label: 'Đã khám', bg: '#E2E8F0' },
    Cancelled: { label: 'Đã hủy', bg: '#FFD1D1' },
};

// ─────────────────────────────────────────────────────────────────
// AppointmentCard: tự fetch detail để lấy thêm doctorName,
// appointmentTime và poll status realtime mỗi 15s
// ─────────────────────────────────────────────────────────────────
function AppointmentCard({
    appt,
    onJoin,
    onViewHistory,
    joiningState,
}: {
    appt: AppointmentResponse;
    onJoin: (a: AppointmentResponse) => void;
    onViewHistory: (a: AppointmentResponse) => void;
    joiningState: Record<string, boolean>;
}) {
    // Fetch chi tiết từ API mới cập nhật
    const { data: detail, isFetching } = useGetAppointmentDetail(appt.appointmentId, {
        pollingInterval: 15_000,
    });

    const merged: AppointmentResponse & Partial<AppointmentDetailResponse> = {
        ...appt,
        ...detail,
    };

    const isUpcoming = merged.status === 'Approved' || merged.status === 'Pending';
    const isCompleted = merged.status === 'Completed';
    const isJoining = joiningState[appt.appointmentId];
    const statusCfg = STATUS_CONFIG[merged.status] ?? { label: merged.status, bg: '#E2E8F0' };

    // Bác sĩ
    const doctorDisplay = merged.doctorName || `Bác sĩ #${merged.doctorId?.slice(0, 8)}`;
    const doctorAva = merged.doctorAvatar || merged.doctorAvatarUrl || 'https://cdn-icons-png.flaticon.com/512/3845/3842326.png';
    const doctorSpec = merged.specialty || merged.doctorSpecialty || 'Chuyên khoa tư vấn';

    // Bệnh nhân
    const memberDisplay = merged.memberName || `Bệnh nhân #${merged.memberId?.slice(0, 8)}`;
    const memberAva = merged.memberAvatar || 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png';
    const memberGender = merged.memberGender || 'Chưa rõ';
    const memberAge = merged.memberDateOfBirth ? `${dayjs().diff(dayjs(merged.memberDateOfBirth), 'year')} tuổi` : 'N/A';

    // Thời gian
    const timeDisplay = merged.appointmentTime || 'Chờ xác nhận';

    return (
        <View style={{
            backgroundColor: '#fff',
            borderWidth: 2,
            borderColor: '#000',
            borderRadius: 28,
            padding: 24,
            marginBottom: 24,
            shadowColor: '#000',
            shadowOffset: { width: 4, height: 6 },
            shadowOpacity: 1,
            shadowRadius: 0,
            elevation: 4,
        }}>
            {/* --- Header: Status --- */}
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
                <View style={{ backgroundColor: statusCfg.bg, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, borderWidth: 2, borderColor: '#000' }}>
                    <Text style={{ fontFamily: 'SpaceGrotesk_700Bold', fontSize: 11, color: '#000', textTransform: 'uppercase' }}>
                        {statusCfg.label}
                    </Text>
                </View>
                {isFetching ? (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <RefreshCw size={12} color="#94A3B8" />
                        <Text style={{ fontFamily: 'SpaceGrotesk_500Medium', fontSize: 11, color: '#94A3B8' }}>Đang tải...</Text>
                    </View>
                ) : (
                    <Text style={{ fontFamily: 'SpaceGrotesk_600SemiBold', fontSize: 11, color: '#94A3B8' }}>
                        ID: {merged.appointmentId?.slice(0, 8).toUpperCase()}
                    </Text>
                )}
            </View>

            {/* --- Doctor Info --- */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 20 }}>
                <View style={{ width: 64, height: 64, backgroundColor: '#D9AEF6', borderRadius: 20, borderWidth: 2, borderColor: '#000', overflow: 'hidden' }}>
                    <Image source={{ uri: doctorAva }} style={{ width: '100%', height: '100%' }} />
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={{ fontFamily: 'SpaceGrotesk_700Bold', fontSize: 18, color: '#000', textTransform: 'uppercase', marginBottom: 4 }} numberOfLines={1}>
                        {doctorDisplay}
                    </Text>
                    <Text style={{ fontFamily: 'SpaceGrotesk_600SemiBold', fontSize: 14, color: '#64748B' }}>
                        {doctorSpec}
                    </Text>
                </View>
            </View>

            {/* Phân cách */}
            <View style={{ height: 2, backgroundColor: 'rgba(0,0,0,0.06)', width: '100%', borderRadius: 2, marginBottom: 20 }} />

            {/* --- Member Info --- */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 24 }}>
                <View style={{ width: 44, height: 44, backgroundColor: '#F8FAFC', borderRadius: 14, borderWidth: 2, borderColor: '#000', overflow: 'hidden' }}>
                    <Image source={{ uri: memberAva }} style={{ width: '100%', height: '100%' }} />
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={{ fontFamily: 'SpaceGrotesk_700Bold', fontSize: 12, color: '#94A3B8', textTransform: 'uppercase', marginBottom: 2 }}>
                        Bệnh nhân
                    </Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <Text style={{ fontFamily: 'SpaceGrotesk_700Bold', fontSize: 15, color: '#000' }} numberOfLines={1}>
                            {memberDisplay}
                        </Text>
                        <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: '#CBD5E1' }} />
                        <Text style={{ fontFamily: 'SpaceGrotesk_600SemiBold', fontSize: 13, color: '#64748B' }}>
                            {memberGender}
                        </Text>
                        <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: '#CBD5E1' }} />
                        <Text style={{ fontFamily: 'SpaceGrotesk_600SemiBold', fontSize: 13, color: '#64748B' }}>
                            {memberAge}
                        </Text>
                    </View>
                </View>
            </View>

            {/* --- Date & Time --- */}
            <View style={{ flexDirection: 'row', gap: 12, marginBottom: 24 }}>
                <View style={{ flex: 1, backgroundColor: '#F8FAFC', padding: 14, borderRadius: 18, borderWidth: 2, borderColor: '#000' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                        <Calendar size={16} color="#64748B" strokeWidth={2.5} />
                        <Text style={{ fontFamily: 'SpaceGrotesk_700Bold', fontSize: 11, color: '#64748B', textTransform: 'uppercase' }}>Ngày khám</Text>
                    </View>
                    <Text style={{ fontFamily: 'SpaceGrotesk_700Bold', fontSize: 15, color: '#000' }}>
                        {dayjs(merged.appointmentDate).format('DD/MM/YYYY')}
                    </Text>
                </View>

                <View style={{ flex: 1, backgroundColor: '#F8FAFC', padding: 14, borderRadius: 18, borderWidth: 2, borderColor: '#000' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                        <Clock size={16} color="#B3354B" strokeWidth={2.5} />
                        <Text style={{ fontFamily: 'SpaceGrotesk_700Bold', fontSize: 11, color: '#64748B', textTransform: 'uppercase' }}>Giờ bắt đầu</Text>
                    </View>
                    <Text style={{ fontFamily: 'SpaceGrotesk_700Bold', fontSize: 15, color: '#000' }}>
                        {timeDisplay}
                    </Text>
                </View>
            </View>

            {/* --- CTA button --- */}
            {/* --- Nút bấm thay đổi theo trạng thái --- */}
            {isUpcoming ? (
                <Pressable
                    onPress={() => onJoin(merged)}
                    disabled={isJoining}
                    style={{ /* style nút Tham gia (Màu đỏ/Nâu) */ backgroundColor: isJoining ? '#94A3B8' : '#B3354B' }}
                >
                    {isJoining ? <ActivityIndicator color="white" /> : <Text style={{ color: '#fff' }}>Tham gia phòng khám</Text>}
                    {!isJoining && <ArrowRight size={20} color="#fff" />}
                </Pressable>
            ) : isCompleted ? (
                <Pressable
                    onPress={() => onViewHistory(merged)}
                    style={{
                        width: '100%', height: 56, backgroundColor: '#fff',
                        borderWidth: 2, borderColor: '#000', borderRadius: 18,
                        alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 10
                    }}
                >
                    <MessageSquare size={20} color="#000" />
                    <Text style={{ fontFamily: 'SpaceGrotesk_700Bold', fontSize: 15, color: '#000', textTransform: 'uppercase' }}>
                        Xem lại tư vấn & Đơn thuốc
                    </Text>
                </Pressable>
            ) : null}
        </View>
    );
}

// ─────────────────────────────────────────────────────────────────
// Main screen
// ─────────────────────────────────────────────────────────────────
export default function AppointmentsScreen() {
    const router = useRouter();
    const toast = useToast();

    const [filter, setFilter] = useState('Sắp tới');
    const [joiningState, setJoiningState] = useState<Record<string, boolean>>({});

    const { data: rawAppointments, isLoading: loading, isFetching, dataUpdatedAt } = useGetMyAppointments();
    const appointments = rawAppointments || [];

    const handleJoinSession = async (appt: AppointmentResponse) => {
        setJoiningState(prev => ({ ...prev, [appt.appointmentId]: true }));
        try {
            const res = await getSessionByAppointmentId(appt.appointmentId);
            if (res.success && res.data) {
                router.push({
                    pathname: "/(manager)/(doctor)/video_call",
                    params: { sessionId: res.data.consultanSessionId, appointmentId: appt.appointmentId }
                } as any);
            } else {
                toast.error("Chưa có phòng", res.message || "Phòng khám chưa được mở. Vui lòng đợi đến giờ!");
            }
        } catch {
            toast.error("Lỗi", "Lỗi lấy thông tin session phòng chờ!");
        } finally {
            setJoiningState(prev => ({ ...prev, [appt.appointmentId]: false }));
        }
    };

    const filteredAppointments = appointments.filter(appt => {
        if (filter === 'Sắp tới') return appt.status === 'Approved' || appt.status === 'Pending';
        if (filter === 'Đã khám') return appt.status === 'Completed';
        if (filter === 'Đã hủy') return appt.status === 'Cancelled';
        return true;
    });

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#F9F6FC' }} edges={["top"]}>
            {/* Header */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 12, paddingBottom: 16 }}>
                <Pressable
                    onPress={() => router.back()}
                    style={{ width: 48, height: 48, backgroundColor: '#fff', borderWidth: 2, borderColor: '#000', borderRadius: 18, alignItems: 'center', justifyContent: 'center' }}
                >
                    <ArrowLeft size={22} color="#000" strokeWidth={2.5} />
                </Pressable>

                <View style={{ alignItems: 'center' }}>
                    <Text style={{ fontFamily: 'SpaceGrotesk_700Bold', fontSize: 18, color: '#000', textTransform: 'uppercase', letterSpacing: -0.5 }}>
                        Lịch hẹn của bạn
                    </Text>
                    {/* Realtime sync badge */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
                        <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: isFetching ? '#F59E0B' : '#22C55E' }} />
                        <Text style={{ fontFamily: 'SpaceGrotesk_500Medium', fontSize: 10, color: '#94A3B8' }}>
                            {isFetching ? 'Đang đồng bộ...' : `Cập nhật lúc ${dayjs(dataUpdatedAt).format('HH:mm:ss')}`}
                        </Text>
                    </View>
                </View>

                <View style={{ width: 48, height: 48, backgroundColor: '#fff', borderWidth: 2, borderColor: '#000', borderRadius: 18, alignItems: 'center', justifyContent: 'center' }}>
                    <Filter size={20} color="#000" />
                </View>
            </View>

            {/* Filter tabs */}
            <View style={{ marginBottom: 16 }}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 10 }}>
                    {FILTERS.map((f) => {
                        const isSelected = filter === f;
                        const count = f === 'Tất cả'
                            ? appointments.length
                            : appointments.filter(a =>
                                f === 'Sắp tới' ? (a.status === 'Approved' || a.status === 'Pending') :
                                    f === 'Đã khám' ? a.status === 'Completed' :
                                        a.status === 'Cancelled'
                            ).length;
                        return (
                            <Pressable
                                key={f}
                                onPress={() => setFilter(f)}
                                style={{
                                    paddingHorizontal: 16,
                                    paddingVertical: 10,
                                    borderRadius: 14,
                                    borderWidth: 2,
                                    borderColor: '#000',
                                    backgroundColor: isSelected ? '#000' : '#fff',
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    gap: 6,
                                }}
                            >
                                <Text style={{
                                    fontFamily: 'SpaceGrotesk_700Bold',
                                    fontSize: 11,
                                    color: isSelected ? '#fff' : 'rgba(0,0,0,0.5)',
                                    textTransform: 'uppercase',
                                }}>
                                    {f}
                                </Text>
                                {count > 0 && (
                                    <View style={{ backgroundColor: isSelected ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.08)', borderRadius: 8, paddingHorizontal: 5, paddingVertical: 1 }}>
                                        <Text style={{ fontFamily: 'SpaceGrotesk_700Bold', fontSize: 10, color: isSelected ? '#fff' : '#000' }}>{count}</Text>
                                    </View>
                                )}
                            </Pressable>
                        );
                    })}
                </ScrollView>
            </View>

            {/* List */}
            <ScrollView style={{ flex: 1, paddingHorizontal: 20 }} contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
                {loading ? (
                    <View style={{ paddingTop: 80, alignItems: 'center' }}>
                        <ActivityIndicator size="large" color="#000" />
                        <Text style={{ fontFamily: 'SpaceGrotesk_500Medium', color: 'rgba(0,0,0,0.4)', marginTop: 12 }}>Đang tải lịch hẹn...</Text>
                    </View>
                ) : filteredAppointments.length === 0 ? (
                    <View style={{ paddingTop: 80, alignItems: 'center' }}>
                        <Calendar size={64} color="#000" strokeWidth={1} style={{ opacity: 0.15 }} />
                        <Text style={{ fontFamily: 'SpaceGrotesk_700Bold', color: 'rgba(0,0,0,0.35)', fontSize: 15, marginTop: 16 }}>
                            Không có lịch {filter.toLowerCase()}
                        </Text>
                    </View>
                ) : (
                    filteredAppointments.map(appt => (
                        <AppointmentCard
                            key={appt.appointmentId}
                            appt={appt}
                            onJoin={handleJoinSession}
                            onViewHistory={handleJoinSession}
                            joiningState={joiningState}
                        />
                    ))
                )}
            </ScrollView>
        </SafeAreaView>
    );
}
