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

// ─── Mốc giờ theo backend GetBlockNameConvention ───────────────────────────
// Sáng:   0 ≤ h < 11  (00:00 – 10:59)
// Trưa:  11 ≤ h < 14  (11:00 – 13:59)
// Chiều: 14 ≤ h < 18  (14:00 – 17:59)
// Tối:   18 ≤ h ≤ 23  (18:00 – 23:59)
const ALL_MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));
function makeHours(min: number, max: number) {
    return Array.from({ length: max - min + 1 }, (_, i) => String(i + min).padStart(2, '0'));
}
const MORNING_HOURS = makeHours(0, 10);
const NOON_HOURS = makeHours(11, 13);
const AFTERNOON_HOURS = makeHours(14, 17);
const EVENING_HOURS = makeHours(18, 23);

// Clamp giờ vào đúng khoảng rồi trả về index trong mảng
function clampedIndex(hour: number, hourItems: string[]): number {
    const minH = parseInt(hourItems[0], 10);
    const maxH = parseInt(hourItems[hourItems.length - 1], 10);
    const clamped = Math.max(minH, Math.min(hour, maxH));
    return clamped - minH;
}

// ─── DrumPicker ────────────────────────────────────────────────────────────
interface DrumPickerProps {
    items: string[];
    initialIndex: number;
    onSelect: (index: number) => void;
    label: string;
}

const DrumPicker: React.FC<DrumPickerProps> = ({ items, initialIndex, onSelect, label }) => {
    const scrollRef = useRef<ScrollView>(null);
    const safeInit = Math.max(0, Math.min(initialIndex, items.length - 1));
    const [selectedIndex, setSelectedIndex] = useState(safeInit);

    const onMomentumScrollEnd = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
        const y = e.nativeEvent.contentOffset.y;
        const index = Math.round(y / ITEM_HEIGHT);
        const clamped = Math.max(0, Math.min(index, items.length - 1));
        setSelectedIndex(clamped);
        onSelect(clamped);
    }, [items, onSelect]);

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
                <View style={{
                    position: 'absolute',
                    top: ITEM_HEIGHT * 2,
                    left: 0, right: 0,
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
                    contentOffset={{ x: 0, y: safeInit * ITEM_HEIGHT }}
                    onMomentumScrollEnd={onMomentumScrollEnd}
                    contentContainerStyle={{ paddingVertical: ITEM_HEIGHT * 2 }}
                >
                    {items.map((item, i) => (
                        <View key={i} style={{ height: ITEM_HEIGHT, alignItems: 'center', justifyContent: 'center' }}>
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
            </View>
        </View>
    );
};

// ─── TimeSlotPicker ────────────────────────────────────────────────────────
interface TimeSlotPickerProps {
    label: string;
    icon: React.ReactNode;
    accentColor: string;
    hourItems: string[];
    initialHourIndex: number;
    initialMinuteIndex: number;
    onHourIndexChange: (idx: number) => void;
    onMinuteChange: (m: number) => void;
    rangeHint: string;
}

const TimeSlotPicker: React.FC<TimeSlotPickerProps> = ({
    label, icon, accentColor,
    hourItems, initialHourIndex, initialMinuteIndex,
    onHourIndexChange, onMinuteChange,
    rangeHint,
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
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4, gap: 10 }}>
            <View style={{
                width: 36, height: 36, borderRadius: 10,
                backgroundColor: accentColor,
                borderWidth: 2, borderColor: '#000',
                alignItems: 'center', justifyContent: 'center'
            }}>
                {icon}
            </View>
            <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: 'SpaceGrotesk_700Bold', fontSize: 15, color: '#000' }}>{label}</Text>
                <Text style={{ fontFamily: 'SpaceGrotesk_500Medium', fontSize: 11, color: '#94A3B8', marginTop: 1 }}>
                    Khoảng cho phép: {rangeHint}
                </Text>
            </View>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, marginTop: 8 }}>
            <DrumPicker
                items={hourItems}
                initialIndex={initialHourIndex}
                onSelect={onHourIndexChange}
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
                items={ALL_MINUTES}
                initialIndex={initialMinuteIndex}
                onSelect={onMinuteChange}
                label="Phút"
            />
        </View>
    </View>
);

// ─── Main Popup ────────────────────────────────────────────────────────────
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

    // Index trong mỗi mảng giờ giới hạn (default hợp lệ nếu không có initialTimes)
    const [morningHIdx, setMorningHIdx] = useState(clampedIndex(morning.h || 8, MORNING_HOURS));
    const [morningM, setMorningM] = useState(morning.m);
    const [noonHIdx, setNoonHIdx] = useState(clampedIndex(noon.h || 12, NOON_HOURS));
    const [noonM, setNoonM] = useState(noon.m);
    const [afternoonHIdx, setAfternoonHIdx] = useState(clampedIndex(afternoon.h || 15, AFTERNOON_HOURS));
    const [afternoonM, setAfternoonM] = useState(afternoon.m);
    const [eveningHIdx, setEveningHIdx] = useState(clampedIndex(evening.h || 20, EVENING_HOURS));
    const [eveningM, setEveningM] = useState(evening.m);

    const { mutate: updateTimes, isPending } = useUpdatePreferredTimes();

    // Giờ thực = offset từ đầu mảng
    const morningH = parseInt(MORNING_HOURS[morningHIdx], 10);
    const noonH = parseInt(NOON_HOURS[noonHIdx], 10);
    const afternoonH = parseInt(AFTERNOON_HOURS[afternoonHIdx], 10);
    const eveningH = parseInt(EVENING_HOURS[eveningHIdx], 10);

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
                        hourItems={MORNING_HOURS}
                        initialHourIndex={morningHIdx}
                        initialMinuteIndex={morningM}
                        onHourIndexChange={setMorningHIdx}
                        onMinuteChange={setMorningM}
                        rangeHint="00:00 – 10:59"
                    />
                    <TimeSlotPicker
                        label="Buổi trưa"
                        icon={<Coffee size={18} color="#000" strokeWidth={2.5} />}
                        accentColor="#FED7AA"
                        hourItems={NOON_HOURS}
                        initialHourIndex={noonHIdx}
                        initialMinuteIndex={noonM}
                        onHourIndexChange={setNoonHIdx}
                        onMinuteChange={setNoonM}
                        rangeHint="11:00 – 13:59"
                    />
                    <TimeSlotPicker
                        label="Buổi chiều"
                        icon={<Sunset size={18} color="#000" strokeWidth={2.5} />}
                        accentColor="#C7D2FE"
                        hourItems={AFTERNOON_HOURS}
                        initialHourIndex={afternoonHIdx}
                        initialMinuteIndex={afternoonM}
                        onHourIndexChange={setAfternoonHIdx}
                        onMinuteChange={setAfternoonM}
                        rangeHint="14:00 – 17:59"
                    />
                    <TimeSlotPicker
                        label="Buổi tối"
                        icon={<Moon size={18} color="#000" strokeWidth={2.5} />}
                        accentColor="#E9D5FF"
                        hourItems={EVENING_HOURS}
                        initialHourIndex={eveningHIdx}
                        initialMinuteIndex={eveningM}
                        onHourIndexChange={setEveningHIdx}
                        onMinuteChange={setEveningM}
                        rangeHint="18:00 – 23:59"
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
