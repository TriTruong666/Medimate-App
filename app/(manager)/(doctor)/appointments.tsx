import dayjs from "dayjs";
import 'dayjs/locale/vi';
import { useRouter } from "expo-router";
import { ArrowLeft, Calendar, Check, Clock, MessageSquare, RefreshCw } from "lucide-react-native";
import React, { useState } from "react";
import { ActivityIndicator, Image, Modal, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getSessionByAppointmentId, joinSession } from "../../../apis/session.api";
import { useCancelAppointment, useGetAppointmentDetail, useGetMyAppointments } from "../../../hooks/useAppointment";
import { useGetRatingBySession } from "../../../hooks/useRating";
import { usePopup } from "../../../stores/popupStore";
import { useToast } from "../../../stores/toastStore";
import { AppointmentDetailResponse, AppointmentResponse } from "../../../types/Appointment";

dayjs.locale('vi');

const FILTERS = ['Tất cả', 'Sắp tới', 'Đã khám', 'Đã hủy'];

const STATUS_CONFIG: Record<string, { label: string; bg: string }> = {
    Pending: { label: 'Chờ xác nhận', bg: '#FFF4D1' },
    Approved: { label: 'Sắp tới', bg: '#A3E6A1' },
    Completed: { label: 'Đã hoàn thành', bg: '#E2E8F0' },
    Cancelled: { label: 'Đã hủy', bg: '#FFD1D1' },
};

// ─────────────────────────────────────────────────────────────────
// AppointmentCard: tự fetch detail để lấy thêm doctorName,
// appointmentTime và poll status realtime mỗi 15s
// ─────────────────────────────────────────────────────────────────
function AppointmentCard({
    appt,
    onJoin,
    onChat,
    onVideo,
    onViewHistory,
    onCancel,
    onRateDoctor,
    onViewRating,
    joiningState,
}: {
    appt: AppointmentResponse;
    onJoin: (a: AppointmentResponse) => void;
    onChat: (a: AppointmentResponse) => void;
    onVideo: (a: AppointmentResponse) => void;
    onViewHistory: (a: AppointmentResponse) => void;
    onCancel: (a: AppointmentResponse) => void;
    onRateDoctor: (a: AppointmentResponse & Partial<AppointmentDetailResponse>, sessionId: string | undefined) => void;
    onViewRating: (a: AppointmentResponse & Partial<AppointmentDetailResponse>, rating: any) => void;
    joiningState: Record<string, boolean>;
}) {
    // Fetch chi tiết từ API mới cập nhật
    const popup = usePopup();
    const { data: detail, isFetching } = useGetAppointmentDetail(appt.appointmentId);

    const merged: AppointmentResponse & Partial<AppointmentDetailResponse> = {
        ...appt,
        ...detail,
    };

    // Khi Completed, fetch session 1 lần để biết sessionId → check rating
    const [sessionId, setSessionId] = React.useState<string | undefined>(undefined);
    const [isSessionLoading, setIsSessionLoading] = React.useState(false);
    React.useEffect(() => {
        if (merged.status !== 'Completed') return;
        let cancelled = false;
        setIsSessionLoading(true);
        import('../../../apis/session.api').then(({ getSessionByAppointmentId }) => {
            getSessionByAppointmentId(appt.appointmentId).then(res => {
                if (!cancelled && res.success && res.data) {
                    setSessionId(res.data.consultanSessionId);
                }
            }).catch(() => { }).finally(() => {
                if (!cancelled) setIsSessionLoading(false);
            });
        });
        return () => { cancelled = true; };
    }, [appt.appointmentId, merged.status]);

    // Query rating status từ API thật (null = chưa đánh giá)
    const { data: existingRating } = useGetRatingBySession(
        merged.status === 'Completed' ? sessionId : undefined
    );
    const isRated = !!existingRating;

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

    // Thời gian — format gọn để không bị xuống dòng
    const rawTime: string = merged.appointmentTime || '';
    // Tách "7h30 - 8h30" → startTime = "7h30", endTime = "8h30"
    const timeParts = rawTime.split(' - ');
    const startTime = timeParts[0]?.trim() || rawTime;
    const endTime = timeParts[1]?.trim() || '';
    const timeDisplay = rawTime || 'Chờ xác nhận';

    // Logic enable video call: cho phép 5 phút trước giờ bắt đầu
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
                name: merged.doctorName || `Bác sĩ #${merged.doctorId?.slice(0, 8)}`,
                avatar: merged.doctorAvatar || merged.doctorAvatarUrl,
                specialty: merged.specialty || merged.doctorSpecialty
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
                <Pressable onPress={handleShowDoctorInfo}>
                    <View style={{ width: 64, height: 64, backgroundColor: '#D9AEF6', borderRadius: 20, borderWidth: 2, borderColor: '#000', overflow: 'hidden' }}>
                        <Image source={{ uri: merged.doctorAvatar || merged.doctorAvatarUrl || 'https://cdn-icons-png.flaticon.com/512/3845/3842326.png' }} style={{ width: '100%', height: '100%' }} />
                    </View>
                </Pressable>
                <View style={{ flex: 1 }}>
                    <Pressable onPress={handleShowDoctorInfo}>
                        <Text style={{ fontFamily: 'SpaceGrotesk_700Bold', fontSize: 18, color: '#000', textTransform: 'uppercase', marginBottom: 4 }}>
                            {merged.doctorName || "Bác sĩ"}
                        </Text>
                    </Pressable>
                    <Text style={{ fontFamily: 'SpaceGrotesk_600SemiBold', fontSize: 14, color: '#64748B' }}>
                        {merged.specialty || "Chuyên khoa"}
                    </Text>
                </View>
            </View>

            {/* Phân cách */}
            <View style={{ height: 2, backgroundColor: 'rgba(0,0,0,0.06)', width: '100%', borderRadius: 2, marginBottom: 20 }} />

            {/* --- Member Info --- */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 24 }}>
                <View style={{ flex: 1 }}>
                    <Text style={{ fontFamily: 'SpaceGrotesk_700Bold', fontSize: 12, color: '#94A3B8', textTransform: 'uppercase', marginBottom: 2 }}>
                        Bệnh nhân
                    </Text>

                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        {/* TÊN BỆNH NHÂN - CỰC KỲ QUAN TRỌNG: flexShrink: 1 */}
                        <Text
                            style={{
                                fontFamily: 'SpaceGrotesk_700Bold',
                                fontSize: 15,
                                color: '#000',
                                flexShrink: 1 // Nếu hàng bị chật, Tên sẽ tự động cắt ngắn và hiện dấu "..."
                            }}
                            numberOfLines={1}
                            ellipsizeMode="tail"
                        >
                            {memberDisplay}
                        </Text>

                        {/* Dấu chấm ngăn cách và các thông số phụ - Dùng flexShrink: 0 để KHÔNG bị cắt */}
                        <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: '#CBD5E1', flexShrink: 0 }} />

                        <Text style={{
                            fontFamily: 'SpaceGrotesk_600SemiBold',
                            fontSize: 13,
                            color: '#64748B',
                            flexShrink: 0 // Đảm bảo giới tính luôn hiển thị đủ
                        }}>
                            {memberGender}
                        </Text>

                        <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: '#CBD5E1', flexShrink: 0 }} />

                        <Text style={{
                            fontFamily: 'SpaceGrotesk_600SemiBold',
                            fontSize: 13,
                            color: '#64748B',
                            flexShrink: 0 // Đảm bảo tuổi luôn hiển thị đủ
                        }}>
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
                    <Text
                        style={{ fontFamily: 'SpaceGrotesk_700Bold', fontSize: 14, color: '#000' }}
                        numberOfLines={1}
                        adjustsFontSizeToFit
                        minimumFontScale={0.75}
                    >
                        {dayjs(merged.appointmentDate).format('DD/MM/YYYY')}
                    </Text>
                </View>

                <View style={{ flex: 1, backgroundColor: '#F8FAFC', padding: 14, borderRadius: 18, borderWidth: 2, borderColor: '#000' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                        <Clock size={16} color="#B3354B" strokeWidth={2.5} />
                        <Text style={{ fontFamily: 'SpaceGrotesk_700Bold', fontSize: 11, color: '#64748B', textTransform: 'uppercase' }}>Giờ hẹn</Text>
                    </View>
                    {endTime ? (
                        <View>
                            <Text style={{ fontFamily: 'SpaceGrotesk_700Bold', fontSize: 14, color: '#000' }} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.75}>
                                {startTime}
                            </Text>
                            <Text style={{ fontFamily: 'SpaceGrotesk_500Medium', fontSize: 11, color: '#94A3B8' }} numberOfLines={1}>
                                → {endTime}
                            </Text>
                        </View>
                    ) : (
                        <Text style={{ fontFamily: 'SpaceGrotesk_700Bold', fontSize: 14, color: '#000' }} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.75}>
                            {timeDisplay}
                        </Text>
                    )}
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
                                {/* CHỈ GIỮ NÚT CHAT - ĐÃ BỎ NÚT THÔNG TIN BS THEO YÊU CẦU */}
                                <Pressable style={[btnBase, { backgroundColor: '#F1F5F9', opacity: 0.55 }]} disabled>
                                    <MessageSquare size={18} color="#94A3B8" strokeWidth={2.5} />
                                    <Text style={[txtBase, { color: '#94A3B8' }]}>Chat</Text>
                                </Pressable>
                            </View>
                            <Pressable
                                style={[btnBase, { height: 44, borderRadius: 12, backgroundColor: '#FFF5F5', borderColor: '#FFB8B8', borderWidth: 1 }]}
                                onPress={() => onCancel(merged)}
                            >
                                <Text style={[txtBase, { color: '#DC2626', fontSize: 12 }]}>Hủy lịch hẹn</Text>
                            </Pressable>
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
                            <Pressable
                                style={[btnBase, { height: 44, borderRadius: 12, backgroundColor: '#FFF5F5', borderColor: '#FFB8B8', borderWidth: 1 }]}
                                onPress={() => onCancel(merged)}
                            >
                                <Text style={[txtBase, { color: '#DC2626', fontSize: 12 }]}>Hủy lịch hẹn</Text>
                            </Pressable>
                        </View>
                    );
                }

                if (merged.status === 'Completed') {
                    // Style chung cho các nút hành động Neo-Brutalism
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
                                <View style={{ padding: 5, backgroundColor: '#FEF3C7', borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#000' }}>
                                    <MessageSquare size={18} color="#000" strokeWidth={2.5} />
                                    <Text style={{ fontFamily: 'SpaceGrotesk_700Bold', fontSize: 15, color: '#000', marginLeft: 12 }} numberOfLines={1}>
                                        Hồ sơ tư vấn & Đơn thuốc
                                    </Text>
                                </View>

                            </Pressable>

                            {/* --- Nút 2: Phần Đánh giá (Nút bấm hoặc Trạng thái đã xong) --- */}
                            {isRated ? (
                                <Pressable
                                    onPress={() => onViewRating(merged, existingRating)}
                                    style={({ pressed }) => ([
                                        {
                                            flexDirection: 'row', alignItems: 'center', height: 58,
                                            borderRadius: 18, paddingHorizontal: 14,
                                            borderWidth: 2, borderColor: '#000', backgroundColor: '#A3E6A1',
                                            shadowColor: '#000', shadowOffset: { width: pressed ? 0 : 4, height: pressed ? 0 : 4 },
                                            shadowOpacity: 1, shadowRadius: 0, elevation: pressed ? 0 : 4,
                                            transform: [{ translateY: pressed ? 2 : 0 }]
                                        }
                                    ])}
                                >
                                    <View style={{ padding: 5, backgroundColor: '#fff', borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#000' }}>
                                        <Check size={20} color="#000" strokeWidth={4} />
                                        <Text style={{ fontFamily: 'SpaceGrotesk_700Bold', fontSize: 13, color: '#000', marginLeft: 12, flex: 1 }} numberOfLines={1}>
                                            Bạn đã hoàn tất đánh giá
                                        </Text>
                                    </View>

                                </Pressable>
                            ) : (
                                <Pressable
                                    onPress={() => onRateDoctor(merged, sessionId)}
                                    disabled={isSessionLoading}
                                    style={({ pressed }) => ([
                                        {
                                            flexDirection: 'row', alignItems: 'center', height: 58,
                                            borderRadius: 18, paddingHorizontal: 14,
                                            borderWidth: 2, borderColor: '#000', backgroundColor: '#D9AEF6',
                                            shadowColor: '#000', shadowOffset: { width: pressed ? 0 : 4, height: pressed ? 0 : 4 },
                                            shadowOpacity: 1, shadowRadius: 0, elevation: pressed ? 0 : 4,
                                            transform: [{ translateY: pressed ? 2 : 0 }],
                                            opacity: isSessionLoading ? 0.7 : 1
                                        }
                                    ])}
                                >
                                    <View style={{ padding: 5, backgroundColor: '#fff', borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#000' }}>
                                        {isSessionLoading ? <ActivityIndicator size="small" color="#000" /> : <Text style={{ fontSize: 18 }}>⭐</Text>}
                                        <Text style={{ fontFamily: 'SpaceGrotesk_700Bold', fontSize: 13, color: '#000', marginLeft: 12, flex: 1 }} numberOfLines={1}>
                                            {isSessionLoading ? 'Đang tải phiên...' : 'Đánh giá trải nghiệm khám'}
                                        </Text>
                                    </View>

                                </Pressable>
                            )}
                        </View>
                    );
                }

                if (merged.status === 'Cancelled') {
                    return (
                        <View style={{ gap: 14, marginTop: 4 }}>
                            <View style={{ backgroundColor: '#FFF5F5', padding: 14, borderRadius: 16, borderWidth: 2, borderColor: '#DC2626' }}>
                                <Text style={{ fontFamily: 'SpaceGrotesk_700Bold', fontSize: 13, color: '#DC2626', textTransform: 'uppercase', marginBottom: 4 }}>
                                    Lý do hủy lịch
                                </Text>
                                <Text style={{ fontFamily: 'SpaceGrotesk_500Medium', fontSize: 14, color: '#991B1B', lineHeight: 20 }}>
                                    {merged.cancelReason || 'Không có lý do cụ thể'}
                                </Text>
                            </View>
                        </View>
                    );
                }

                return null;
            })()}

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

    const [cancelModalVisible, setCancelModalVisible] = useState(false);
    const [cancelApptId, setCancelApptId] = useState<string | null>(null);
    const [cancelReason, setCancelReason] = useState("");

    const popup = usePopup();

    const { data: rawAppointments, isLoading: loading, isFetching, dataUpdatedAt } = useGetMyAppointments();
    const appointments = rawAppointments || [];

    const { mutate: cancelAppointmentMutation, isPending: isCanceling } = useCancelAppointment();

    const handleChatSession = async (appt: AppointmentResponse & Partial<AppointmentDetailResponse>) => {
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
                        startedAt: res.data.startedAt,
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

    const handleVideoSession = async (appt: AppointmentResponse & Partial<AppointmentDetailResponse>) => {
        // Kiểm tra thời gian trước khi gọi API
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
                try {
                    // Gọi API joinSession trước khi vào màn hình video call
                    await joinSession(res.data.consultanSessionId, { role: "User" });
                } catch (e) {
                    console.warn("Failed to join session API:", e);
                }

                router.push({
                    pathname: "./video_call",
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

    const handleOpenChatPopup = async (appt: AppointmentResponse & Partial<AppointmentDetailResponse>) => {
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
                        startedAt: res.data.startedAt,
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

    const handleRateDoctor = (
        appt: AppointmentResponse & Partial<AppointmentDetailResponse>,
        sessionId: string | undefined
    ) => {
        if (!sessionId) {
            toast.error('Lỗi', 'Thông tin phiên khám chưa sẵn sàng. Vui lòng thử lại sau giây lát.');
            return;
        }
        popup.open({
            type: 'rate_doctor',
            data: {
                sessionId,
                doctorName: appt.doctorName || `Bác sĩ #${appt.doctorId?.slice(0, 8)}`,
                doctorSpecialty: appt.specialty || appt.doctorSpecialty || '',
            }
        });
    };

    const handleViewRating = (
        appt: AppointmentResponse & Partial<AppointmentDetailResponse>,
        rating: any
    ) => {
        popup.open({
            type: 'view_rating',
            data: {
                doctorName: appt.doctorName || `Bác sĩ #${appt.doctorId?.slice(0, 8)}`,
                doctorSpecialty: appt.specialty || appt.doctorSpecialty || '',
                rating: rating
            }
        });
    };

    const handleJoinSession = async (appt: AppointmentResponse) => {
        setJoiningState(prev => ({ ...prev, [appt.appointmentId]: true }));
        try {
            const res = await getSessionByAppointmentId(appt.appointmentId);
            if (res.success && res.data) {
                router.push({
                    pathname: "./video_call",
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

    const handleOpenCancelModal = (appt: AppointmentResponse) => {
        setCancelApptId(appt.appointmentId);
        setCancelReason("");
        setCancelModalVisible(true);
    };

    const handleSubmitCancel = () => {
        if (!cancelApptId) return;
        const finalReason = cancelReason.trim() ? cancelReason : "Người dùng yêu cầu hủy";
        cancelAppointmentMutation(
            { id: cancelApptId, data: { reason: finalReason } },
            {
                onSuccess: () => {
                    setCancelModalVisible(false);
                }
            }
        );
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

                <View style={{ width: '100%', alignItems: 'center' }}>
                    <Text
                        style={{
                            fontFamily: 'SpaceGrotesk_700Bold',
                            fontSize: 18,
                            color: '#000',
                            textTransform: 'uppercase',
                            letterSpacing: -0.5,
                            textAlign: 'center',
                            marginRight: 40
                        }}
                    >
                        Lịch hẹn của bạn
                    </Text>

                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2, marginRight: 30 }}>
                        <View
                            style={{
                                width: 6,
                                height: 6,
                                borderRadius: 3,
                                backgroundColor: isFetching ? '#F59E0B' : '#22C55E'
                            }}
                        />
                        <Text style={{ fontFamily: 'SpaceGrotesk_500Medium', fontSize: 10, color: '#94A3B8' }}>
                            {isFetching ? 'Đang đồng bộ...' : `Cập nhật lúc ${dayjs(dataUpdatedAt).format('HH:mm:ss')}`}
                        </Text>
                    </View>
                </View>

                {/* <View style={{ width: 48, height: 48, backgroundColor: '#fff', borderWidth: 2, borderColor: '#000', borderRadius: 18, alignItems: 'center', justifyContent: 'center' }}>
                    <Filter size={20} color="#000" />
                </View> */}
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
                            onChat={handleChatSession as any}
                            onVideo={handleVideoSession as any}
                            onViewHistory={handleOpenChatPopup as any}
                            onCancel={handleOpenCancelModal}
                            onRateDoctor={handleRateDoctor as any}
                            onViewRating={handleViewRating as any}
                            joiningState={joiningState}
                        />
                    ))
                )}
            </ScrollView>

            {/* Cancel Modal */}
            <Modal visible={cancelModalVisible} animationType="fade" transparent>
                <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "center", alignItems: "center", padding: 24 }}>
                    <View style={{ backgroundColor: "#fff", width: "100%", borderRadius: 24, padding: 24, borderWidth: 2, borderColor: "#000" }}>
                        <Text style={{ fontFamily: "SpaceGrotesk_700Bold", fontSize: 20, marginBottom: 12, color: "#000" }}>
                            Bạn muốn hủy lịch?
                        </Text>
                        <Text style={{ fontFamily: "SpaceGrotesk_500Medium", fontSize: 13, color: "#64748B", marginBottom: 16 }}>
                            Vui lòng cho chúng tôi biết lý do (tùy chọn) để cải thiện dịch vụ tốt hơn.
                        </Text>
                        <TextInput
                            style={{
                                fontFamily: "SpaceGrotesk_500Medium", fontSize: 14, color: "#000",
                                borderWidth: 2, borderColor: "rgba(0,0,0,0.1)", borderRadius: 12,
                                padding: 16, height: 100, textAlignVertical: 'top', backgroundColor: '#F8FAFC',
                                marginBottom: 24
                            }}
                            placeholder="Lý do hủy lịch..."
                            placeholderTextColor="#94A3B8"
                            multiline
                            value={cancelReason}
                            onChangeText={setCancelReason}
                        />
                        <View style={{ flexDirection: "row", gap: 12 }}>
                            <Pressable
                                onPress={() => setCancelModalVisible(false)}
                                style={{ flex: 1, paddingVertical: 14, borderRadius: 14, borderWidth: 2, borderColor: 'rgba(0,0,0,0.1)', alignItems: 'center' }}
                            >
                                <Text style={{ fontFamily: "SpaceGrotesk_700Bold", fontSize: 13, color: "#64748B" }}>Đóng</Text>
                            </Pressable>
                            <Pressable
                                onPress={handleSubmitCancel}
                                disabled={isCanceling}
                                style={{ flex: 1, paddingVertical: 14, borderRadius: 14, borderWidth: 2, borderColor: '#000', backgroundColor: '#DC2626', alignItems: 'center', opacity: isCanceling ? 0.6 : 1 }}
                            >
                                {isCanceling ? (
                                    <ActivityIndicator size="small" color="#fff" />
                                ) : (
                                    <Text style={{ fontFamily: "SpaceGrotesk_700Bold", fontSize: 13, color: "#fff" }}>Xác nhận Hủy</Text>
                                )}
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>

        </SafeAreaView>
    );
}
