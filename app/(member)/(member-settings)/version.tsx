
import { useGetVersionsByPlatform } from '@/hooks/useVersionHook';
import type { AppVersion, VersionPlatform } from '@/types/AppVersion';
import dayjs from 'dayjs';
import { useRouter } from 'expo-router';
import {
    AlertTriangle,
    ArrowLeft,
    CheckCircle,
    Download,
    Smartphone,
    Tag,
} from 'lucide-react-native';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Linking,
    Platform,
    Pressable,
    ScrollView,
    Text,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const SHADOW = {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
};

const PLATFORMS: { key: VersionPlatform; label: string }[] = [
    { key: 'IOS', label: 'iOS' },
    { key: 'Android', label: 'Android' },
];

export default function AppVersionScreen() {
    const router = useRouter();

    // auto-detect current platform
    const defaultPlatform: VersionPlatform = Platform.OS === 'ios' ? 'IOS' : 'Android';
    const [selectedPlatform, setSelectedPlatform] = useState<VersionPlatform>(defaultPlatform);

    const { data: versions, isLoading } = useGetVersionsByPlatform(selectedPlatform);

    const versionList: AppVersion[] = Array.isArray(versions) ? versions : [];

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#F9F6FC' }} edges={['top']}>
            {/* Header */}
            <View style={{
                flexDirection: 'row', alignItems: 'center', gap: 12,
                paddingHorizontal: 20, paddingVertical: 14,
                borderBottomWidth: 1, borderBottomColor: '#E2E8F0',
                backgroundColor: '#fff',
            }}>
                <Pressable
                    onPress={() => router.back()}
                    hitSlop={10}
                    style={{ width: 38, height: 38, backgroundColor: '#F1F5F9', borderRadius: 12, alignItems: 'center', justifyContent: 'center' }}
                >
                    <ArrowLeft size={20} color="#0F172A" strokeWidth={2.5} />
                </Pressable>
                <View style={{ flex: 1 }}>
                    <Text style={{ fontFamily: 'SpaceGrotesk_700Bold', fontSize: 18, color: '#0F172A' }}>
                        Phiên bản ứng dụng
                    </Text>
                    <Text style={{ fontFamily: 'SpaceGrotesk_500Medium', fontSize: 12, color: '#64748B', marginTop: 1 }}>
                        Lịch sử cập nhật theo nền tảng
                    </Text>
                </View>
                <Smartphone size={22} color="#9370DB" strokeWidth={2} />
            </View>

            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ padding: 20, paddingBottom: 48 }}
                showsVerticalScrollIndicator={false}
            >
                {/* Platform selector */}
                <View style={{
                    flexDirection: 'row', backgroundColor: '#F3F4F6',
                    borderRadius: 18, borderWidth: 1.5, borderColor: '#E2E8F0',
                    padding: 4, marginBottom: 24,
                }}>
                    {PLATFORMS.map(p => {
                        const isActive = selectedPlatform === p.key;
                        return (
                            <Pressable
                                key={p.key}
                                onPress={() => setSelectedPlatform(p.key)}
                                style={{
                                    flex: 1, paddingVertical: 11, alignItems: 'center', borderRadius: 14,
                                    backgroundColor: isActive ? '#9370DB' : 'transparent',
                                    ...SHADOW,
                                    shadowOpacity: isActive ? 0.15 : 0,
                                    elevation: isActive ? 3 : 0,
                                }}
                            >
                                <Text style={{
                                    fontFamily: 'SpaceGrotesk_700Bold', fontSize: 13,
                                    color: isActive ? '#fff' : '#6B7280',
                                }}>
                                    {p.label}
                                </Text>
                            </Pressable>
                        );
                    })}
                </View>

                {/* Content */}
                {isLoading ? (
                    <View style={{ alignItems: 'center', paddingVertical: 60 }}>
                        <ActivityIndicator size="large" color="#9370DB" />
                        <Text style={{ fontFamily: 'SpaceGrotesk_500Medium', fontSize: 13, color: '#64748B', marginTop: 14 }}>
                            Đang tải danh sách phiên bản...
                        </Text>
                    </View>
                ) : versionList.length === 0 ? (
                    <View style={{ alignItems: 'center', paddingVertical: 60 }}>
                        <Tag size={48} color="#D1D5DB" strokeWidth={1.5} />
                        <Text style={{ fontFamily: 'SpaceGrotesk_500Medium', fontSize: 14, color: '#9CA3AF', marginTop: 14, textAlign: 'center' }}>
                            Chưa có phiên bản nào cho {selectedPlatform === 'IOS' ? 'iOS' : 'Android'}
                        </Text>
                    </View>
                ) : (
                    <View style={{ gap: 14 }}>
                        {versionList.map((v, idx) => {
                            const isActive = v.status === 'Active';
                            const isLatest = idx === 0;
                            return (
                                <VersionCard
                                    key={v.versionId}
                                    version={v}
                                    isLatest={isLatest}
                                    isActive={isActive}
                                />
                            );
                        })}
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

// ─── Version Card ─────────────────────────────────────────────────────────────
function VersionCard({ version, isLatest, isActive }: { version: AppVersion; isLatest: boolean; isActive: boolean }) {
    const releaseDate = dayjs(version.releaseDate).format('DD/MM/YYYY HH:mm');

    return (
        <View style={{
            backgroundColor: '#fff',
            borderRadius: 20,
            borderWidth: 2,
            borderColor: isLatest ? '#9370DB' : '#E2E8F0',
            padding: 16,
            ...SHADOW,
        }}>
            {/* Top row */}
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
                <View style={{
                    width: 44, height: 44, backgroundColor: isLatest ? '#F3E8FF' : '#F8FAFC',
                    borderRadius: 14, alignItems: 'center', justifyContent: 'center',
                    borderWidth: 1.5, borderColor: isLatest ? '#9370DB' : '#E2E8F0',
                }}>
                    <Tag size={20} color={isLatest ? '#9370DB' : '#94A3B8'} strokeWidth={2.5} />
                </View>

                <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <Text style={{ fontFamily: 'SpaceGrotesk_700Bold', fontSize: 16, color: '#0F172A' }}>
                            v{version.versionNumber}
                        </Text>
                        {isLatest && (
                            <View style={{ backgroundColor: '#9370DB', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 }}>
                                <Text style={{ fontFamily: 'SpaceGrotesk_700Bold', fontSize: 10, color: '#fff' }}>MỚI NHẤT</Text>
                            </View>
                        )}
                        {version.isForceUpdate && (
                            <View style={{ backgroundColor: '#FEE2E2', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                <AlertTriangle size={10} color="#DC2626" strokeWidth={2.5} />
                                <Text style={{ fontFamily: 'SpaceGrotesk_700Bold', fontSize: 10, color: '#DC2626' }}>BẮT BUỘC</Text>
                            </View>
                        )}
                    </View>
                    <Text style={{ fontFamily: 'SpaceGrotesk_500Medium', fontSize: 11, color: '#64748B', marginTop: 3 }}>
                        {version.platform} · {releaseDate}
                    </Text>
                </View>

                {/* Status */}
                <View style={{
                    flexDirection: 'row', alignItems: 'center', gap: 5,
                    backgroundColor: isActive ? '#DCFCE7' : '#F1F5F9',
                    borderRadius: 10, paddingHorizontal: 9, paddingVertical: 5,
                }}>
                    <CheckCircle size={12} color={isActive ? '#16A34A' : '#9CA3AF'} strokeWidth={2.5} />
                    <Text style={{ fontFamily: 'SpaceGrotesk_600SemiBold', fontSize: 11, color: isActive ? '#166534' : '#6B7280' }}>
                        {isActive ? 'Đang hoạt động' : version.status}
                    </Text>
                </View>
            </View>

            {/* Release notes */}
            {version.releaseNotes && version.releaseNotes !== 'none' && (
                <View style={{ backgroundColor: '#F8FAFC', borderRadius: 12, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: '#E2E8F0' }}>
                    <Text style={{ fontFamily: 'SpaceGrotesk_700Bold', fontSize: 11, color: '#64748B', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                        Ghi chú cập nhật
                    </Text>
                    <Text style={{ fontFamily: 'SpaceGrotesk_500Medium', fontSize: 13, color: '#334155', lineHeight: 20 }}>
                        {version.releaseNotes}
                    </Text>
                </View>
            )}

            {/* Download button */}
            {version.downloadUrl && (
                <Pressable
                    onPress={() => Linking.openURL(version.downloadUrl!)}
                    style={{
                        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
                        backgroundColor: '#9370DB', borderRadius: 14, paddingVertical: 11,
                        ...SHADOW, shadowColor: '#9370DB', shadowOpacity: 0.3,
                    }}
                >
                    <Download size={16} color="#fff" strokeWidth={2.5} />
                    <Text style={{ fontFamily: 'SpaceGrotesk_700Bold', fontSize: 13, color: '#fff' }}>
                        Tải xuống
                    </Text>
                </Pressable>
            )}
        </View>
    );
}
