import { useUpdatePreferredTimes } from '@/hooks/useSchedule';
import { Coffee, Moon, Sun, Sunset, X } from 'lucide-react-native';
import React, { useCallback, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    NativeScrollEvent,
    NativeSyntheticEvent,
    Pressable,
    ScrollView,
    Text,
    View,
} from 'react-native';

const ITEM_HEIGHT = 52;
const VISIBLE_ITEMS = 5;
const PICKER_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;

// Tạo mảng giờ và phút
const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));

interface DrumPickerProps {
    items: string[];
    initialIndex: number;
    onSelect: (index: number) => void;
    label: string;
}

const DrumPicker: React.FC<DrumPickerProps> = ({ items, initialIndex, onSelect, label }) => {
    const scrollRef = useRef<ScrollView>(null);

    const onMomentumScrollEnd = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
        const y = e.nativeEvent.contentOffset.y;
        const index = Math.round(y / ITEM_HEIGHT);
        const clamped = Math.max(0, Math.min(index, items.length - 1));
        onSelect(clamped);
    }, [items, onSelect]);

    const [selectedIndex, setSelectedIndex] = useState(initialIndex);

    return (
        <View style={{ alignItems: 'center', flex: 1 }}>
            <Text style={{
                fontFamily: 'SpaceGrotesk_700Bold',
                fontSize: 11,
                color: '#94A3B8',
                textTransform: 'uppercase',
                letterSpacing: 1.5,
                marginBottom: 6
            }}>
                {label}
            </Text>
            <View style={{ height: PICKER_HEIGHT, overflow: 'hidden', width: 72 }}>
                {/* Selection Indicator */}
                <View style={{
                    position: 'absolute',
                    top: ITEM_HEIGHT * 2,
                    left: 0,
                    right: 0,
                    height: ITEM_HEIGHT,
                    backgroundColor: 'rgba(163,230,161,0.25)',
                    borderTopWidth: 2,
                    borderBottomWidth: 2,
                    borderColor: '#000',
                    borderRadius: 12,
                    zIndex: 10,
                    pointerEvents: 'none'
                }} />
                <ScrollView
                    ref={scrollRef}
                    showsVerticalScrollIndicator={false}
                    nestedScrollEnabled={true}
                    snapToInterval={ITEM_HEIGHT}
                    decelerationRate="fast"
                    contentOffset={{ x: 0, y: initialIndex * ITEM_HEIGHT }}
                    onMomentumScrollEnd={(e) => {
                        const y = e.nativeEvent.contentOffset.y;
                        const index = Math.round(y / ITEM_HEIGHT);
                        const clamped = Math.max(0, Math.min(index, items.length - 1));
                        setSelectedIndex(clamped);
                        onSelect(clamped);
                    }}
                    contentContainerStyle={{
                        paddingVertical: ITEM_HEIGHT * 2
                    }}
                >
                    {items.map((item, i) => (
                        <View
                            key={i}
                            style={{
                                height: ITEM_HEIGHT,
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <Text style={{
                                fontFamily: 'SpaceGrotesk_700Bold',
                                fontSize: i === selectedIndex ? 28 : 20,
                                color: i === selectedIndex ? '#000' : '#CBD5E1',
                            }}>
                                {item}
                            </Text>
                        </View>
                    ))}
                </ScrollView>
                {/* Top fade */}
                <View style={{
                    position: 'absolute', top: 0, left: 0, right: 0,
                    height: ITEM_HEIGHT * 2,
                    backgroundColor: 'transparent',
                    pointerEvents: 'none'
                }} />
            </View>
        </View>
    );
};

interface TimeSlotPickerProps {
    label: string;
    icon: React.ReactNode;
    accentColor: string;
    initialHour: number;
    initialMinute: number;
    onHourChange: (h: number) => void;
    onMinuteChange: (m: number) => void;
}

const TimeSlotPicker: React.FC<TimeSlotPickerProps> = ({
    label, icon, accentColor, initialHour, initialMinute, onHourChange, onMinuteChange
}) => (
    <View style={{
        backgroundColor: '#fff',
        borderWidth: 2,
        borderColor: '#000',
        borderRadius: 20,
        padding: 16,
        marginBottom: 14,
        shadowColor: '#000',
        shadowOffset: { width: 3, height: 3 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 3,
    }}>
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 10 }}>
            <View style={{
                width: 36, height: 36, borderRadius: 10,
                backgroundColor: accentColor,
                borderWidth: 2, borderColor: '#000',
                alignItems: 'center', justifyContent: 'center'
            }}>
                {icon}
            </View>
            <Text style={{ fontFamily: 'SpaceGrotesk_700Bold', fontSize: 15, color: '#000' }}>{label}</Text>
        </View>

        {/* Drum rollers */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
            <DrumPicker
                items={HOURS}
                initialIndex={initialHour}
                onSelect={onHourChange}
                label="Giờ"
            />
            <Text style={{
                fontFamily: 'SpaceGrotesk_700Bold',
                fontSize: 32,
                color: '#000',
                marginTop: 16,
                paddingHorizontal: 4,
            }}>:</Text>
            <DrumPicker
                items={MINUTES}
                initialIndex={initialMinute}
                onSelect={onMinuteChange}
                label="Phút"
            />
        </View>
    </View>
);

interface PreferredTimesPopupProps {
    memberId: string;
    initialTimes?: {
        morningTime?: string;
        noonTime?: string;
        afternoonTime?: string;
        eveningTime?: string;
    };
    onClose: () => void;
    onSave?: () => void;
}

const parseHM = (timeStr?: string) => {
    if (!timeStr) return { h: 0, m: 0 };
    const parts = timeStr.split(':');
    return {
        h: parseInt(parts[0] || '0', 10),
        m: parseInt(parts[1] || '0', 10),
    };
};

export const PreferredTimesPopup: React.FC<PreferredTimesPopupProps> = ({
    memberId,
    initialTimes,
    onClose,
    onSave,
}) => {
    const morning = parseHM(initialTimes?.morningTime);
    const noon = parseHM(initialTimes?.noonTime);
    const afternoon = parseHM(initialTimes?.afternoonTime);
    const evening = parseHM(initialTimes?.eveningTime);

    const [morningH, setMorningH] = useState(morning.h || 8);
    const [morningM, setMorningM] = useState(morning.m);
    const [noonH, setNoonH] = useState(noon.h || 12);
    const [noonM, setNoonM] = useState(noon.m);
    const [afternoonH, setAfternoonH] = useState(afternoon.h || 17);
    const [afternoonM, setAfternoonM] = useState(afternoon.m);
    const [eveningH, setEveningH] = useState(evening.h || 20);
    const [eveningM, setEveningM] = useState(evening.m);

    const { mutate: updateTimes, isPending } = useUpdatePreferredTimes();

    const fmt = (h: number, m: number) =>
        `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00`;

    const handleSave = () => {
        updateTimes({
            memberId,
            data: {
                morningTime: fmt(morningH, morningM),
                noonTime: fmt(noonH, noonM),
                afternoonTime: fmt(afternoonH, afternoonM),
                eveningTime: fmt(eveningH, eveningM),
            }
        }, {
            onSuccess: (res) => {
                if (res.success) {
                    if (onSave) onSave();
                    onClose();
                } else {
                    Alert.alert("Lỗi", res.message || "Không thể cập nhật.");
                }
            },
            onError: () => Alert.alert("Lỗi kết nối", "Không thể kết nối đến máy chủ.")
        });
    };

    return (
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' }}>
            <View style={{
                backgroundColor: '#F9F6FC',
                borderTopLeftRadius: 32,
                borderTopRightRadius: 32,
                borderTopWidth: 2.5,
                borderLeftWidth: 2.5,
                borderRightWidth: 2.5,
                borderColor: '#000',
                maxHeight: '92%',
            }}>
                {/* Handle bar */}
                <View style={{ alignItems: 'center', paddingTop: 12, paddingBottom: 4 }}>
                    <View style={{ width: 44, height: 5, borderRadius: 3, backgroundColor: 'rgba(0,0,0,0.15)' }} />
                </View>

                {/* Header */}
                <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingHorizontal: 24,
                    paddingVertical: 16,
                    borderBottomWidth: 2,
                    borderBottomColor: 'rgba(0,0,0,0.06)',
                }}>
                    <View>
                        <Text style={{ fontFamily: 'SpaceGrotesk_700Bold', fontSize: 22, color: '#000' }}>
                            Giờ uống thuốc
                        </Text>
                        <Text style={{ fontFamily: 'SpaceGrotesk_500Medium', fontSize: 13, color: '#64748B', marginTop: 2 }}>
                            Kéo cuộn để chọn giờ phù hợp
                        </Text>
                    </View>
                    <Pressable
                        onPress={onClose}
                        style={({ pressed }) => ({
                            width: 42, height: 42,
                            backgroundColor: pressed ? '#f1f5f9' : '#fff',
                            borderWidth: 2, borderColor: '#000',
                            borderRadius: 13,
                            alignItems: 'center', justifyContent: 'center',
                        })}
                    >
                        <X size={20} color="#000" strokeWidth={2.5} />
                    </Pressable>
                </View>

                {/* Pickers */}
                <ScrollView
                    contentContainerStyle={{ padding: 20, paddingBottom: 12 }}
                    showsVerticalScrollIndicator={false}
                    nestedScrollEnabled={true}
                >
                    <TimeSlotPicker
                        label="Buổi sáng"
                        icon={<Sun size={18} color="#000" strokeWidth={2.5} />}
                        accentColor="#FEF9C3"
                        initialHour={morningH}
                        initialMinute={morningM}
                        onHourChange={setMorningH}
                        onMinuteChange={setMorningM}
                    />
                    <TimeSlotPicker
                        label="Buổi trưa"
                        icon={<Coffee size={18} color="#000" strokeWidth={2.5} />}
                        accentColor="#FED7AA"
                        initialHour={noonH}
                        initialMinute={noonM}
                        onHourChange={setNoonH}
                        onMinuteChange={setNoonM}
                    />
                    <TimeSlotPicker
                        label="Buổi chiều"
                        icon={<Sunset size={18} color="#000" strokeWidth={2.5} />}
                        accentColor="#C7D2FE"
                        initialHour={afternoonH}
                        initialMinute={afternoonM}
                        onHourChange={setAfternoonH}
                        onMinuteChange={setAfternoonM}
                    />
                    <TimeSlotPicker
                        label="Buổi tối"
                        icon={<Moon size={18} color="#000" strokeWidth={2.5} />}
                        accentColor="#E9D5FF"
                        initialHour={eveningH}
                        initialMinute={eveningM}
                        onHourChange={setEveningH}
                        onMinuteChange={setEveningM}
                    />
                </ScrollView>

                {/* Save Button */}
                <View style={{ paddingHorizontal: 20, paddingBottom: 36, paddingTop: 8 }}>
                    <Pressable
                        onPress={handleSave}
                        disabled={isPending}
                        className={`w-full py-5 rounded-[24px] border-2 border-black flex-row items-center justify-center gap-x-2 shadow-md active:translate-y-0.5 "bg-[#A3E6A1]" : "bg-gray-200 border-gray-400"
                        } ${isPending ? "opacity-70" : ""}`}
                    >
                        {isPending ? (
                            <ActivityIndicator color="#000" />
                        ) : (
                            <Text style={{
                                fontFamily: 'SpaceGrotesk_700Bold',
                                fontSize: 16,
                                color: '#000',
                                textTransform: 'uppercase',
                                letterSpacing: 1,
                            }}>
                                ✓  Lưu cấu hình giờ
                            </Text>
                        )}
                    </Pressable>
                </View>
            </View>
        </View>
    );
};
