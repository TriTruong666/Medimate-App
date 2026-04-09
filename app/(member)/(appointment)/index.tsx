import dayjs from "dayjs";
import 'dayjs/locale/vi';
import { useRouter } from "expo-router";
import { ArrowLeft, Calendar, Clock, MessageSquare } from "lucide-react-native";
import React, { useState } from "react";
import { ActivityIndicator, Image, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { getSessionByAppointmentId } from "@/apis/session.api";
import { useGetAppointmentDetail, useGetMemberAppointments } from "@/hooks/useAppointment";
import { useGetMemberById } from "@/hooks/useMember";
import { usePopup } from "@/stores/popupStore";
import { useToast } from "@/stores/toastStore";
import { getDecodedToken } from "@/utils/token";

dayjs.locale('vi');

const FILTERS = ['Tất cả', 'Sắp tới', 'Đã khám', 'Đã hủy'];
const STATUS_CONFIG: Record<string, { label: string; bg: string }> = {
    Pending: { label: 'Chờ xác nhận', bg: '#FFF4D1' },
    Approved: { label: 'Sắp tới', bg: '#A3E6A1' },
    Completed: { label: 'Đã hoàn thành', bg: '#E2E8F0' },
    Cancelled: { label: 'Đã hủy', bg: '#FFD1D1' },
};

// --- Reusable AppointmentCard for Member ---
function MemberAppointmentCard({
    appt,
    onJoin,
    onChat,
    onVideo,
    onViewHistory,
    joiningState,
}: any) {
    const popup = usePopup();
    const { data: detail, isFetching } = useGetAppointmentDetail(appt.appointmentId, {
        pollingInterval: 15_000,
    });


    const merged = { ...appt, ...detail };

    const [sessionId, setSessionId] = React.useState<string | undefined>(undefined);
    const [isSessionLoading, setIsSessionLoading] = React.useState(false);

    React.useEffect(() => {
        if (merged.status !== 'Completed') return;
        let cancelled = false;
        setIsSessionLoading(true);
        getSessionByAppointmentId(appt.appointmentId).then(res => {
            if (!cancelled && res.success && res.data) setSessionId(res.data.consultanSessionId);
        }).finally(() => { if (!cancelled) setIsSessionLoading(false); });
        return () => { cancelled = true; };
    }, [appt.appointmentId, merged.status]);

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

    const timeDisplay = merged.appointmentTime || 'Chờ xác nhận';

    const canJoinVideo = (() => {
        if (merged.status !== 'Approved') return false;
        if (!merged.appointmentDate || !merged.appointmentTime) return false;
        try {
            const startTimeStr = merged.appointmentTime.split(' - ')[0];
            const normalizedTime = startTimeStr.replace('h', ':');
            const [h, m] = normalizedTime.split(':').map(Number);
            const start = dayjs(merged.appointmentDate).hour(h).minute(m || 0).second(0);
            return dayjs().isAfter(start.subtract(5, 'minute'));
        } catch (e) { return false; }
    })();

    const handleShowDoctorInfo = () => {
        popup.open({
            type: 'doctor_info',
            data: {
                doctorId: merged.doctorId,
                name: doctorDisplay,
                avatar: doctorAva,
                specialty: doctorSpec
            }
        });
    };


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
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 20 }}>
                <Pressable onPress={handleShowDoctorInfo} style={{ width: 64, height: 64, backgroundColor: '#D9AEF6', borderRadius: 20, borderWidth: 2, borderColor: '#000', overflow: 'hidden' }}>
                    <Image source={{ uri: doctorAva }} style={{ width: '100%', height: '100%' }} />
                </Pressable>
                <View style={{ flex: 1 }}>
                    {/* Nhấn vào tên bác sĩ để xem popup */}
                    <Pressable onPress={handleShowDoctorInfo}>
                        <Text style={{ fontFamily: 'SpaceGrotesk_700Bold', fontSize: 18, color: '#000', textTransform: 'uppercase', marginBottom: 4 }} numberOfLines={1}>
                            {doctorDisplay}
                        </Text>
                    </Pressable>
                    <Text style={{ fontFamily: 'SpaceGrotesk_600SemiBold', fontSize: 14, color: '#64748B' }}>
                        {doctorSpec}
                    </Text>
                </View>
            </View>

            {/* --- Doctor Info --- */}
            {/* <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 20 }}>
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
            </View> */}

            {/* Phân cách */}
            <View style={{ height: 2, backgroundColor: 'rgba(0,0,0,0.06)', width: '100%', borderRadius: 2, marginBottom: 20 }} />

            {/* --- Member Info --- */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 24 }}>
                <View style={{ width: 44, height: 44, backgroundColor: '#F8FAFC', borderRadius: 14, borderWidth: 2, borderColor: '#000', overflow: 'hidden' }}>
                    <Image source={{ uri: memberAva }} style={{ width: '100%', height: '100%' }} />
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={{ fontFamily: 'SpaceGrotesk_700Bold', fontSize: 12, color: '#94A3B8', textTransform: 'uppercase', marginBottom: 2 }}>
                        Người nhận hẹn
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

            {/* --- CTA buttons --- */}
            {(() => {
                const btnBase: any = {
                    flex: 1, height: 52, borderRadius: 16, borderWidth: 2, borderColor: '#000',
                    alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8, backgroundColor: '#fff',
                };
                const txtBase: any = { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 13, color: '#000', textTransform: 'uppercase' };

                if (merged.status === 'Pending') {
                    return (
                        <View style={{ gap: 12 }}>
                            <View style={{ flexDirection: 'row', gap: 12 }}>
                                {/* CHỈ CÒN NÚT CHAT (Disabled) - ĐÃ BỎ NÚT THÔNG TIN BS */}
                                <Pressable style={[btnBase, { backgroundColor: '#F1F5F9', opacity: 0.55 }]} disabled>
                                    <MessageSquare size={18} color="#94A3B8" strokeWidth={2.5} />
                                    <Text style={[txtBase, { color: '#94A3B8' }]}>Đang chờ duyệt</Text>
                                </Pressable>
                            </View>
                            {/* Nút hủy (nếu có ở màn hình này) */}
                        </View>
                    );
                }
                if (merged.status === 'Approved') {
                    return (
                        <View style={{ gap: 12 }}>
                            <View style={{ flexDirection: 'row', gap: 12 }}>
                                {/* Chat */}
                                <Pressable
                                    style={[btnBase, isJoining && { opacity: 0.6 }]}
                                    disabled={isJoining}
                                    onPress={() => onChat(merged)}
                                >
                                    {isJoining
                                        ? <ActivityIndicator size="small" color="#000" />
                                        : <MessageSquare size={18} color="#000" strokeWidth={2.5} />
                                    }
                                    <Text style={txtBase}>Chat</Text>
                                </Pressable>

                                {/* Video Call — gate: 5 phút trước giờ */}
                                <Pressable
                                    style={[btnBase,
                                        { backgroundColor: canJoinVideo ? '#B3354B' : '#F1F5F9' },
                                        !canJoinVideo && { opacity: 0.55 }
                                    ]}
                                    onPress={() => onVideo(merged)}
                                >
                                    <Text style={[txtBase, { color: canJoinVideo ? '#fff' : '#94A3B8' }]}>Video Call</Text>
                                </Pressable>
                            </View>
                        </View>
                    );
                }

                if (merged.status === 'Completed') {
                    return (
                        <View style={{ gap: 14, marginTop: 4 }}>
                            {/* --- Nút 1: Xem hồ sơ tư vấn & Đơn thuốc --- */}
                            <Pressable
                                onPress={() => onViewHistory(merged)}
                                style={({ pressed }) => ([
                                    {
                                        flexDirection: 'row', alignItems: 'center', height: 58,
                                        borderRadius: 18, paddingHorizontal: 14,
                                        borderWidth: 2, borderColor: '#000', backgroundColor: '#fff',
                                        shadowColor: '#000', shadowOffset: { width: pressed ? 0 : 4, height: pressed ? 0 : 4 },
                                        shadowOpacity: 1, shadowRadius: 0, elevation: pressed ? 0 : 4,
                                        transform: [{ translateY: pressed ? 2 : 0 }]
                                    }
                                ])}
                            >
                                <View style={{ width: 38, height: 38, backgroundColor: '#FEF3C7', borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#000' }}>
                                    <MessageSquare size={18} color="#000" strokeWidth={2.5} />
                                </View>
                                <Text style={{ fontFamily: 'SpaceGrotesk_700Bold', fontSize: 13, color: '#000', marginLeft: 12, flex: 1 }} numberOfLines={1}>
                                    Hồ sơ tư vấn & Đơn thuốc
                                </Text>
                            </Pressable>
                        </View>
                    );
                }

                return null;
            })()}

        </View>
    );
}

export default function MemberAppointmentsScreen() {
    const router = useRouter();
    const toast = useToast();
    const popup = usePopup();

    const [memberId, setMemberId] = useState<string | undefined>(undefined);
    const [loadingToken, setLoadingToken] = useState(true);

    React.useEffect(() => {
        const fetchToken = async () => {
            try {
                const decoded = await getDecodedToken();
                if (decoded) setMemberId(decoded.MemberId);
            } finally {
                setLoadingToken(false);
            }
        };
        fetchToken();
    }, []);

    const { data: memberProfile } = useGetMemberById(memberId);
    const memberName = memberProfile?.fullName || "Thành viên";

    const [filter, setFilter] = useState('Sắp tới');
    const [joiningState, setJoiningState] = useState<Record<string, boolean>>({});

    // Fetch đúng lịch hẹn của MemberId này
    const { data: rawAppointments, isLoading: isLoadingAppointments } = useGetMemberAppointments(memberId as string);
    const appointments = rawAppointments || [];

    const isLoading = loadingToken || isLoadingAppointments;

    const filteredAppointments = appointments.filter(appt => {
        if (filter === 'Sắp tới') return appt.status === 'Approved' || appt.status === 'Pending';
        if (filter === 'Đã khám') return appt.status === 'Completed';
        if (filter === 'Đã hủy') return appt.status === 'Cancelled';
        return true;
    });

    const handleChatSession = async (appt: any) => {
        setJoiningState(prev => ({ ...prev, [appt.appointmentId]: true }));
        try {
            const res = await getSessionByAppointmentId(appt.appointmentId);
            if (res.success && res.data) {
                popup.open({
                    type: 'chat_detail',
                    data: {
                        name: appt.doctorName || `Bác sĩ #${appt.doctorId?.slice(0, 8)}`,
                        avatar: appt.doctorAvatar || appt.doctorAvatarUrl || 'https://cdn-icons-png.flaticon.com/512/3845/3842326.png',
                        specialty: appt.specialty || appt.doctorSpecialty || "Nha khoa",
                        sessionId: res.data.consultanSessionId,
                        isCompleted: appt.status === 'Completed'
                    }
                });
            } else {
                toast.info("Chưa thể chat", "Phòng khám chưa mở. Vui lòng quay lại gần đến giờ hẹn!");
            }
        } catch {
            toast.error("Lỗi", "Không thể mở chat. Vui lòng thử lại!");
        } finally {
            setJoiningState(prev => ({ ...prev, [appt.appointmentId]: false }));
        }
    };

    const handleVideoSession = async (appt: any) => {
        const canJoin = (() => {
            if (!appt.appointmentDate || !appt.appointmentTime) return false;
            try {
                const startTimeStr = appt.appointmentTime.split(' - ')[0];
                const normalizedTime = startTimeStr.replace('h', ':');
                const [h, m] = normalizedTime.split(':').map(Number);
                const start = dayjs(appt.appointmentDate).hour(h).minute(m || 0).second(0);
                return dayjs().isAfter(start.subtract(5, 'minute'));
            } catch { return false; }
        })();

        if (!canJoin) {
            const timeStr = appt.appointmentTime || 'giờ hẹn';
            const dateStr = appt.appointmentDate ? dayjs(appt.appointmentDate).format('DD/MM/YYYY') : '';
            toast.info(
                "Chưa đến giờ",
                `Phòng khám mở 5 phút trước giờ hẹn (${timeStr}${dateStr ? ` ngày ${dateStr}` : ''}).`
            );
            return;
        }

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

    const handleOpenChatPopup = async (appt: any) => {
        setJoiningState(prev => ({ ...prev, [appt.appointmentId]: true }));
        try {
            const res = await getSessionByAppointmentId(appt.appointmentId);
            if (res.success && res.data) {
                popup.open({
                    type: 'chat_detail',
                    data: {
                        name: appt.doctorName || `Bác sĩ #${appt.doctorId?.slice(0, 8)}`,
                        avatar: appt.doctorAvatar || appt.doctorAvatarUrl || 'https://cdn-icons-png.flaticon.com/512/3845/3842326.png',
                        specialty: appt.specialty || appt.doctorSpecialty || "Nha khoa",
                        sessionId: res.data.consultanSessionId,
                        isCompleted: appt.status === 'Completed'
                    }
                });
            } else {
                toast.error("Lỗi", "Không tìm thấy session cho lượt khám này.");
            }
        } catch {
            toast.error("Lỗi", "Lỗi lấy thông tin session phòng chờ!");
        } finally {
            setJoiningState(prev => ({ ...prev, [appt.appointmentId]: false }));
        }
    };

    const handleJoinSession = (appt: any) => {
        // Có thể navigate sang thông tin bác sĩ nếu cần, hiện tại map sang DoctorInfo Popup hoặc Route
    };

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
                    <Text style={{ fontFamily: 'SpaceGrotesk_700Bold', fontSize: 10, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                        Lịch hẹn của
                    </Text>
                    <Text style={{ fontFamily: 'SpaceGrotesk_700Bold', fontSize: 18, color: '#000', textTransform: 'uppercase', letterSpacing: -0.5 }}>
                        {memberName || "Thành viên"}
                    </Text>
                </View>

                <View style={{ width: 48, height: 48 }} />
            </View>

            {/* Filter Tabs */}
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
                                }}>{f}</Text>
                                {count > 0 && (
                                    <View style={{ backgroundColor: isSelected ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.08)', borderRadius: 8, paddingHorizontal: 5, paddingVertical: 1 }}>
                                        <Text style={{ fontFamily: 'SpaceGrotesk_700Bold', fontSize: 10, color: isSelected ? '#fff' : '#000' }}>{count}</Text>
                                    </View>
                                )}
                            </Pressable>
                        )
                    })}
                </ScrollView>
            </View>

            <ScrollView style={{ flex: 1, paddingHorizontal: 20 }} contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
                {isLoading ? (
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
                        <MemberAppointmentCard
                            key={appt.appointmentId}
                            appt={appt}
                            onJoin={handleJoinSession}
                            onChat={handleChatSession}
                            onVideo={handleVideoSession}
                            onViewHistory={handleOpenChatPopup}
                            joiningState={joiningState}
                        />
                    ))
                )}
            </ScrollView>
        </SafeAreaView>
    );
}