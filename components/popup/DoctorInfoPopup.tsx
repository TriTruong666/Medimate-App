import React from 'react';
import { ActivityIndicator, Image, Pressable, Text, View, ScrollView } from 'react-native';
import { X, Star, MapPin, Phone, GraduationCap } from 'lucide-react-native';
import { useGetDoctorDetail } from '../../hooks/useDoctor';
import { BottomSheetBase } from './BottomSheetBase';

interface DoctorInfoPopupProps {
    doctorId: string;
    fallbackName?: string;
    fallbackAvatar?: string;
    fallbackSpecialty?: string;
    onClose: () => void;
}

export const DoctorInfoPopup: React.FC<DoctorInfoPopupProps> = ({
    doctorId,
    fallbackName,
    fallbackAvatar,
    fallbackSpecialty,
    onClose
}) => {
    const { data: doctor, isLoading } = useGetDoctorDetail(doctorId);

    // Dữ liệu hiển thị (kết hợp fallback từ appt nếu đang tải hoặc call api lỗi)
    const displayAvatar = doctor?.user?.avatarUrl || doctor?.avatarUrl || fallbackAvatar || 'https://cdn-icons-png.flaticon.com/512/3845/3842326.png';
    const displayName = doctor?.user?.fullName || doctor?.fullName || fallbackName || `Bác sĩ #${doctorId?.slice(0, 8)}`;
    const displaySpecialty = doctor?.specialty || fallbackSpecialty || 'Chuyên khoa tư vấn';
    
    // Some stats we can infer or mock using Neo-Brutalism pattern if not available
    const clinicName = doctor?.clinicName || doctor?.clinic?.name || 'Phòng khám Đa khoa MediMate';
    
    return (
        <BottomSheetBase onClose={onClose} height="70%">
            {/* Thanh kéo & Close Button */}
            <View style={{ width: 40, height: 6, backgroundColor: '#CBD5E1', borderRadius: 3, alignSelf: 'center', marginBottom: 20 }} />

            <View style={{ position: 'absolute', right: 20, top: 20, zIndex: 10 }}>
                <Pressable
                    onPress={onClose}
                    style={{ width: 36, height: 36, backgroundColor: '#fff', borderWidth: 2, borderColor: '#000', borderRadius: 12, alignItems: 'center', justifyContent: 'center' }}
                >
                    <X size={18} color="#000" strokeWidth={3} />
                </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

                {/* Avatar & Basic Info */}
                <View style={{ alignItems: 'center', marginBottom: 24, marginTop: 10 }}>
                    <View style={{ width: 100, height: 100, backgroundColor: '#D9AEF6', borderRadius: 30, borderWidth: 3, borderColor: '#000', overflow: 'hidden', marginBottom: 16 }}>
                        <Image source={{ uri: displayAvatar }} style={{ width: '100%', height: '100%' }} />
                    </View>
                    <Text style={{ fontFamily: 'SpaceGrotesk_700Bold', fontSize: 22, color: '#000', textAlign: 'center', marginBottom: 4 }}>
                        {displayName}
                    </Text>
                    <Text style={{ fontFamily: 'SpaceGrotesk_600SemiBold', fontSize: 15, color: '#64748B', textAlign: 'center' }}>
                        {displaySpecialty}
                    </Text>
                </View>

                {/* Phân cách */}
                <View style={{ height: 2, backgroundColor: 'rgba(0,0,0,0.06)', width: '100%', borderRadius: 2, marginBottom: 24 }} />

                {isLoading ? (
                    <View style={{ alignItems: 'center', padding: 20 }}>
                        <ActivityIndicator size="large" color="#000" />
                        <Text style={{ fontFamily: 'SpaceGrotesk_500Medium', color: '#64748B', marginTop: 12 }}>Đang tải thêm thông tin...</Text>
                    </View>
                ) : (
                    <View style={{ gap: 16 }}>
                        {/* Detail Info Block */}
                        <View style={{ backgroundColor: '#F8FAFC', padding: 16, borderRadius: 20, borderWidth: 2, borderColor: '#000', gap: 12 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                                <View style={{ width: 36, height: 36, backgroundColor: '#FEF3C7', borderRadius: 10, borderWidth: 1.5, borderColor: '#000', alignItems: 'center', justifyContent: 'center' }}>
                                    <MapPin size={16} color="#000" strokeWidth={2.5} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={{ fontFamily: 'SpaceGrotesk_500Medium', fontSize: 12, color: '#64748B', marginBottom: 2 }}>Nơi công tác</Text>
                                    <Text style={{ fontFamily: 'SpaceGrotesk_700Bold', fontSize: 14, color: '#000' }}>{clinicName}</Text>
                                </View>
                            </View>

                            <View style={{ height: 1, backgroundColor: 'rgba(0,0,0,0.1)', marginVertical: 4 }} />

                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                                <View style={{ width: 36, height: 36, backgroundColor: '#E0F2FE', borderRadius: 10, borderWidth: 1.5, borderColor: '#000', alignItems: 'center', justifyContent: 'center' }}>
                                    <GraduationCap size={16} color="#000" strokeWidth={2.5} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={{ fontFamily: 'SpaceGrotesk_500Medium', fontSize: 12, color: '#64748B', marginBottom: 2 }}>Chuyên khoa</Text>
                                    <Text style={{ fontFamily: 'SpaceGrotesk_700Bold', fontSize: 14, color: '#000' }}>{displaySpecialty}</Text>
                                </View>
                            </View>
                        </View>

                        {doctor?.description && (
                            <View style={{ backgroundColor: '#fff', padding: 16, borderRadius: 20, borderWidth: 2, borderColor: '#000' }}>
                                <Text style={{ fontFamily: 'SpaceGrotesk_700Bold', fontSize: 13, color: '#94A3B8', textTransform: 'uppercase', marginBottom: 8, letterSpacing: 0.5 }}>
                                    Tiểu sử Bác sĩ
                                </Text>
                                <Text style={{ fontFamily: 'SpaceGrotesk_500Medium', fontSize: 15, color: '#1E293B', lineHeight: 22 }}>
                                    {doctor.description}
                                </Text>
                            </View>
                        )}
                    </View>
                )}

            </ScrollView>
        </BottomSheetBase>
    );
};
