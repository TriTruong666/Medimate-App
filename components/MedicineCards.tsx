import dayjs from "dayjs";
import { CalendarCheck, Clock } from "lucide-react-native";
import React from "react";
import { Image, Text, View } from "react-native";

export function ReminderCard({ item }: { item: any }) {
    const isTaken = item.status === "Taken";

    // So sánh thời gian để biết là Đã qua hay Chưa tới
    const reminderDateTimeStr = item.reminderDate ? `${item.reminderDate.split('T')[0]}T${item.reminderTime}` : undefined;
    const reminderDateTime = reminderDateTimeStr ? dayjs(reminderDateTimeStr) : dayjs();
    const now = dayjs();
    const isPast = reminderDateTimeStr ? reminderDateTime.isBefore(now) : false;
    const isFuture = reminderDateTimeStr ? reminderDateTime.isAfter(now) : false;

    let bgColor = "#FFD700";
    if (isPast && !isTaken) bgColor = "#E5E7EB";
    else if (isFuture) bgColor = "#BFDBFE";
    if (isTaken || item.status === "Done") bgColor = "#A3E6A1";

    return (
        <View className={`bg-white border-2 border-black rounded-[20px] p-4 shadow-sm flex-row items-center mb-3 ${isPast && !isTaken ? 'opacity-70' : ''}`}>
            <View className="w-12 h-12 rounded-full border-2 border-black items-center justify-center mr-3" style={{ backgroundColor: bgColor }}>
                <Clock size={20} color="#000" strokeWidth={2.5} />
            </View>
            <View className="flex-1">
                <Text className="text-xs font-space-bold text-gray-500 uppercase">Lúc {item.reminderTime?.substring(0, 5)}</Text>
                <Text className="text-base font-space-bold text-black" numberOfLines={1}>{item.scheduleName}</Text>
            </View>
            <View>
                {isTaken ? (
                    <View className="bg-[#A3E6A1] px-3 py-1.5 rounded-lg border-2 border-black">
                        <Text className="text-xs font-space-bold text-black uppercase">Đã uống</Text>
                    </View>
                ) : isPast ? (
                    <View className="bg-gray-200 px-3 py-1.5 rounded-lg border-2 border-black/20">
                        <Text className="text-xs font-space-bold text-gray-500 uppercase">Đã qua</Text>
                    </View>
                ) : (
                    <View className="bg-white px-3 py-1.5 rounded-lg border-2 border-[#BFDBFE]">
                        <Text className="text-xs font-space-bold text-[#3B82F6] uppercase">Sắp tới</Text>
                    </View>
                )}
            </View>
        </View>
    );
}

// ─── Status config ──────────────────────────────────────────────────────────
const LOG_STATUS_CONFIG: Record<string, { bg: string; border: string; text: string; label: string }> = {
    Taken: { bg: '#DCFCE7', border: '#16A34A', text: '#166534', label: 'Đã uống' },
    Missed: { bg: '#FEE2E2', border: '#DC2626', text: '#991B1B', label: 'Đã quên' },
    Skipped: { bg: '#F3F4F6', border: '#9CA3AF', text: '#6B7280', label: 'Bỏ qua' },
    Snoozed: { bg: '#FEF9C3', border: '#CA8A04', text: '#854D0E', label: 'Hoãn lại' },
};

export function LogCard({ item }: { item: any }) {
    const cfg = LOG_STATUS_CONFIG[item.status] || { bg: '#FEF3C7', border: '#F59E0B', text: '#92400E', label: item.status };

    const memberName: string = item.memberName || '';
    const avatarUrl: string | null = item.avatarUrl || item.memberAvatarUrl || null;
    const initial = memberName ? memberName[0].toUpperCase() : '?';

    const scheduledDisplay = item.scheduledTime
        ? dayjs(item.scheduledTime).isValid()
            ? dayjs(item.scheduledTime).format('HH:mm')
            : String(item.scheduledTime).substring(0, 5)
        : '--:--';

    const actualDisplay = item.actualTime
        ? dayjs(item.actualTime).isValid()
            ? dayjs(item.actualTime).format('HH:mm')
            : String(item.actualTime).substring(0, 5)
        : null;

    return (
        <View style={{
            backgroundColor: '#fff',
            borderWidth: 2,
            borderColor: '#000',
            borderRadius: 20,
            padding: 14,
            marginBottom: 10,
            flexDirection: 'row',
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.08,
            shadowRadius: 6,
            elevation: 2,
        }}>
            {/* Member avatar */}
            <View style={{
                width: 46,
                height: 46,
                borderRadius: 23,
                overflow: 'hidden',
                borderWidth: 2,
                borderColor: '#000',
                marginRight: 12,
                backgroundColor: cfg.bg,
                alignItems: 'center',
                justifyContent: 'center',
            }}>
                {avatarUrl ? (
                    <Image
                        source={{ uri: avatarUrl }}
                        style={{ width: 46, height: 46, borderRadius: 23 }}
                    />
                ) : (
                    <Text style={{ fontFamily: 'SpaceGrotesk_700Bold', fontSize: 18, color: cfg.text }}>
                        {initial}
                    </Text>
                )}
            </View>

            {/* Info */}
            <View style={{ flex: 1, marginRight: 10 }}>
                {memberName ? (
                    <Text style={{ fontFamily: 'SpaceGrotesk_700Bold', fontSize: 13, color: '#111', marginBottom: 1 }} numberOfLines={1}>
                        {memberName}
                    </Text>
                ) : null}
                <Text style={{ fontFamily: 'SpaceGrotesk_700Bold', fontSize: 13, color: '#374151' }} numberOfLines={1}>
                    {item.medicineName || 'Thuốc'}
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 3 }}>
                    <Clock size={11} color="#9CA3AF" strokeWidth={2} />
                    <Text style={{ fontFamily: 'SpaceGrotesk_500Medium', fontSize: 11, color: '#9CA3AF' }}>
                        {`Hẹn ${scheduledDisplay}${actualDisplay ? `  ·  Thực tế ${actualDisplay}` : ''}`}
                    </Text>
                </View>
                {item.notes ? (
                    <Text style={{ fontFamily: 'SpaceGrotesk_500Medium', fontSize: 11, color: '#A3A3A3', marginTop: 2 }} numberOfLines={1}>
                        {`📝 ${item.notes}`}
                    </Text>
                ) : null}
            </View>

            {/* Status badge */}
            <View style={{
                backgroundColor: cfg.bg,
                borderWidth: 1.5,
                borderColor: cfg.border,
                borderRadius: 10,
                paddingHorizontal: 10,
                paddingVertical: 6,
                alignItems: 'center',
            }}>
                <CalendarCheck size={13} color={cfg.text} strokeWidth={2.5} style={{ marginBottom: 2 }} />
                <Text style={{ fontFamily: 'SpaceGrotesk_700Bold', fontSize: 9, color: cfg.text, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    {cfg.label}
                </Text>
            </View>
        </View>
    );
}
