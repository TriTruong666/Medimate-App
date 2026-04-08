import { useGetFamilyNotificationSetting, useUpdateFamilyNotificationSetting } from "@/hooks/useNotification";
import { AntDesign } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function NotificationSettingsScreen() {
    const router = useRouter();
    const { familyId } = useLocalSearchParams<{ familyId: string }>();

    const { data: currentSettings, isLoading } = useGetFamilyNotificationSetting(familyId);
    const { mutate: updateSettings, isPending: isSaving } = useUpdateFamilyNotificationSetting();

    const [pushEnabled, setPushEnabled] = useState(false);
    const [emailEnabled, setEmailEnabled] = useState(false);
    const [familyAlertEnabled, setFamilyAlertEnabled] = useState(false);
    const [advanceMinutes, setAdvanceMinutes] = useState(15);
    const [autoSnooze, setAutoSnooze] = useState(false);

    // Advanced Safety Settings
    const [minimumHoursGap, setMinimumHoursGap] = useState(4);
    const [maxDosesPerDay, setMaxDosesPerDay] = useState(6);
    const [missedDosesThreshold, setMissedDosesThreshold] = useState(3);

    useEffect(() => {
        if (currentSettings) {
            setPushEnabled(currentSettings.enablePushNotification);
            setEmailEnabled(currentSettings.enableEmailNotification);
            setFamilyAlertEnabled(currentSettings.enableFamilyAlert);
            setAdvanceMinutes(currentSettings.reminderAdvanceMinutes);
            setMinimumHoursGap(currentSettings.minimumHoursGap || 4);
            setMaxDosesPerDay(currentSettings.maxDosesPerDay || 6);
            setMissedDosesThreshold(currentSettings.missedDosesThreshold || 3);
            
            try {
                const custom = JSON.parse(currentSettings.customSetting || '{}');
                setAutoSnooze(!!custom.autoSnooze);
            } catch (e) {
                setAutoSnooze(false);
            }
        }
    }, [currentSettings]);

    const handleSave = () => {
        updateSettings({
            familyId,
            data: {
                enablePushNotification: pushEnabled,
                enableEmailNotification: emailEnabled,
                enableFamilyAlert: familyAlertEnabled,
                reminderAdvanceMinutes: advanceMinutes,
                minimumHoursGap: minimumHoursGap,
                maxDosesPerDay: maxDosesPerDay,
                missedDosesThreshold: missedDosesThreshold,
                customSetting: JSON.stringify({ autoSnooze }),
            }
        }, {
            onSuccess: () => {
                router.back();
            }
        });
    };

    const ToggleRow = ({ title, description, value, onToggle }: any) => (
        <View className="flex-row items-center justify-between bg-white border-2 border-black rounded-[24px] p-5 shadow-sm mb-4">
            <View className="flex-1 pr-6">
                <Text className="text-[16px] font-space-bold text-black mb-1">{title}</Text>
                <Text className="text-[13px] font-space-medium text-gray-500 leading-snug">{description}</Text>
            </View>
            <Pressable
                onPress={() => onToggle(!value)}
                className={`w-14 h-8 rounded-full border-2 border-black justify-center transition-colors ${value ? 'bg-[#A3E6A1]' : 'bg-gray-200'}`}
                style={{ paddingHorizontal: 2 }}
            >
                <View className={`w-6 h-6 rounded-full border-2 border-black bg-white transition-transform ${value ? 'translate-x-[20px]' : 'translate-x-0'}`} />
            </Pressable>
        </View>
    );

    const NumberStepper = ({ title, description, value, onValueChange, min = 0, max = 24, suffix = '' }: any) => (
        <View className="flex-row items-center justify-between bg-white border-2 border-black rounded-[24px] p-5 shadow-sm mb-4">
            <View className="flex-1 pr-6">
                <Text className="text-[16px] font-space-bold text-black mb-1">{title}</Text>
                <Text className="text-[13px] font-space-medium text-gray-500 leading-snug">{description}</Text>
            </View>
            <View className="flex-row items-center bg-gray-100 rounded-xl border-2 border-black overflow-hidden">
                <Pressable
                    onPress={() => { if (value > min) onValueChange(value - 1) }}
                    className="w-10 h-10 items-center justify-center border-r-2 border-black bg-white active:bg-gray-200"
                >
                    <Text className="font-space-bold text-xl text-black">-</Text>
                </Pressable>
                <View className="w-12 h-10 items-center justify-center bg-white">
                    <Text className="font-space-bold text-sm text-black">{value}{suffix}</Text>
                </View>
                <Pressable
                    onPress={() => { if (value < max) onValueChange(value + 1) }}
                    className="w-10 h-10 items-center justify-center border-l-2 border-black bg-[#FFD700] active:bg-[#EAB308]"
                >
                    <Text className="font-space-bold text-xl text-black">+</Text>
                </Pressable>
            </View>
        </View>
    );

    const TimeOption = ({ minutes, label }: any) => (
        <Pressable
            onPress={() => setAdvanceMinutes(minutes)}
            className={`flex-1 items-center justify-center py-4 rounded-xl border-2 border-black ${advanceMinutes === minutes ? 'bg-[#FFD700]' : 'bg-white'}`}
        >
            <Text className="font-space-bold text-black text-[13px]">{label}</Text>
        </Pressable>
    );

    return (
        <SafeAreaView className="flex-1 bg-[#F9F6FC]" edges={["top"]}>
            {/* Header */}
            <View className="px-5 pt-3 pb-4 flex-row items-center justify-between">
                <Pressable
                    onPress={() => router.back()}
                    className="w-12 h-12 bg-white border-2 border-black rounded-2xl items-center justify-center active:opacity-80 shadow-sm"
                >
                    <AntDesign name="arrow-left" size={24} color="#000" />
                </Pressable>
                <Text className="text-xl text-black font-space-bold flex-1 text-center mx-2">Cài đặt Thông báo</Text>
                <View className="w-12 h-12" />
            </View>

            {isLoading ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#000" />
                    <Text className="mt-4 font-space-medium text-gray-500 text-sm">Đang lấy dữ liệu...</Text>
                </View>
            ) : (
                <ScrollView
                    className="flex-1 px-5 pt-4"
                    contentContainerStyle={{ paddingBottom: 100 }}
                    showsVerticalScrollIndicator={false}
                >
                    <Text className="text-[28px] font-space-bold text-black mb-2 tracking-tight">Chi tiết Cảnh báo</Text>
                    <Text className="text-[14px] font-space-medium text-gray-500 mb-8 leading-relaxed">
                        Điều chỉnh các tuỳ chọn để không bao giờ bỏ lỡ các cập nhật quan trọng của gia đình bạn.
                    </Text>

                    <ToggleRow
                        title="Thông báo Toàn hệ thống"
                        description="Nhận lời nhắc và cảnh báo đẩy trực tiếp trên thiết bị của bạn."
                        value={pushEnabled}
                        onToggle={setPushEnabled}
                    />

                    <ToggleRow
                        title="Tự động báo lại (Auto-Snooze)"
                        description="Nếu thông báo hiển thị mà người dùng không tương tác, hệ thống sẽ mặc định hoãn và báo lại sau."
                        value={autoSnooze}
                        onToggle={setAutoSnooze}
                    />

                    <ToggleRow
                        title="Nhắc nhở qua Email"
                        description="Nhận báo cáo và nhắc nhở vào hòm thư Email cá nhân của bạn."
                        value={emailEnabled}
                        onToggle={setEmailEnabled}
                    />

                    <ToggleRow
                        title="Cảnh báo Hoạt động Nhóm"
                        description="Thông báo cho chủ gia đình mỗi khi người thân quên uống thuốc."
                        value={familyAlertEnabled}
                        onToggle={setFamilyAlertEnabled}
                    />

                    <View className="mt-6 mb-6">
                        <Text className="text-sm font-space-bold text-gray-500 mb-4 ml-1 uppercase tracking-wider">Thời gian nhắc trước giờ uống thuốc</Text>
                        <View className="flex-row gap-x-2">
                            <TimeOption minutes={0} label="Đúng giờ" />
                            <TimeOption minutes={5} label="5 phút" />
                            <TimeOption minutes={15} label="15 phút" />
                            <TimeOption minutes={30} label="30 phút" />
                        </View>
                    </View>

                    <Text className="text-[22px] font-space-bold text-black mb-2 mt-2 tracking-tight">Cài đặt Cảnh báo An toàn</Text>
                    <Text className="text-[14px] font-space-medium text-gray-500 mb-6 leading-relaxed">
                        Hệ thống thông minh chống quá liều và theo dõi rủi ro tuân thủ thuốc.
                    </Text>

                    <NumberStepper
                        title="Khoảng cách an toàn"
                        description="Số giờ tối thiểu bắt buộc giữa 2 lần uống cùng một loại thuốc."
                        value={minimumHoursGap}
                        onValueChange={setMinimumHoursGap}
                        min={1} max={24} suffix={'h'}
                    />

                    <NumberStepper
                        title="Giới hạn tối đa/ngày"
                        description="Tránh uống vượt liều quy định trong một ngày."
                        value={maxDosesPerDay}
                        onValueChange={setMaxDosesPerDay}
                        min={1} max={20} suffix={' lần'}
                    />

                    <NumberStepper
                        title="Ngưỡng bỏ lỡ cảnh báo"
                        description="Số lần quên thuốc liên tiếp trước khi gọi cảnh báo khẩn cấp cho gia đình."
                        value={missedDosesThreshold}
                        onValueChange={setMissedDosesThreshold}
                        min={1} max={10} suffix={' lần'}
                    />

                    <Pressable
                        onPress={handleSave}
                        disabled={isSaving}
                        className={`bg-black rounded-2xl border-2 border-black py-4 mt-6 items-center flex-row justify-center shadow-md ${isSaving ? 'opacity-80' : 'active:opacity-90 active:translate-y-0.5'}`}
                    >
                        {isSaving ? (
                            <ActivityIndicator color="#FFF" />
                        ) : (
                            <Text className="text-white font-space-bold text-lg uppercase tracking-wider">Lưu Thay Đổi</Text>
                        )}
                    </Pressable>
                </ScrollView>
            )}
        </SafeAreaView>
    );
}
