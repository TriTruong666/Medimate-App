import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ManagerHeader from "../../../components/ManagerHeader";
import { useEffect, useState } from "react";
import { getDecodedToken } from "@/utils/token";
import dayjs from "dayjs";

import { useGetMemberDailyReminders } from "@/hooks/useSchedule";
import { useGetMemberMedicationLogs } from "@/hooks/useMedicationLog";
import { ReminderCard, LogCard } from "@/components/MedicineCards";
import DateSelector from "@/components/DateSelector";

export default function MemberHomeScreen() {
    const [memberId, setMemberId] = useState<string | undefined>();
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        getDecodedToken().then(t => {
            if (t) {
                setMemberId(t.MemberId);
            }
            setIsLoaded(true);
        });
    }, []);

    const [selectedDate, setSelectedDate] = useState(dayjs().format("YYYY-MM-DD"));
    const { data: reminders, isLoading: loadingRems } = useGetMemberDailyReminders(memberId, selectedDate);
    const { data: logs, isLoading: loadingLogs } = useGetMemberMedicationLogs(memberId, selectedDate, selectedDate);

    return (
        <SafeAreaView className="flex-1 bg-[#F9F6FC]" edges={["top"]}>
            <ManagerHeader />

            <ScrollView
                className="flex-1 px-5 pt-4"
                contentContainerStyle={{ paddingBottom: 100 }}
                showsVerticalScrollIndicator={false}
            >
                {!isLoaded ? (
                    <ActivityIndicator size="large" color="#000" className="mt-10" />
                ) : (
                    <View>
                        {/* DATE SELECTOR */}
                        <DateSelector selectedDate={selectedDate} onSelect={(d) => setSelectedDate(d)} />

                        {/* LỊCH REMINDER TỰ NHÂN */}
                        <View className="mb-6">
                            <Text className="text-2xl text-black font-space-bold mb-4">Lịch uống thuốc của tôi</Text>
                            {loadingRems ? (
                                <ActivityIndicator size="small" color="#000" />
                            ) : reminders?.length ? (
                                reminders.map(r => <ReminderCard key={r.reminderId} item={r} />)
                            ) : (
                                <Text className="font-space-medium text-gray-500">Bạn đã rảnh rỗi hôm nay!</Text>
                            )}
                        </View>

                        <View className="h-[2px] bg-black/10 w-full mb-6" />

                        {/* LỊCH SỬ TÁC ĐỘNG TỰ NHÂN */}
                        <View className="mb-6">
                            <Text className="text-2xl text-black font-space-bold mb-4">Lịch sử báo cáo</Text>
                            {loadingLogs ? (
                                <ActivityIndicator size="small" color="#000" />
                            ) : logs?.length ? (
                                logs.map(l => <LogCard key={l.logId} item={l} />)
                            ) : (
                                <Text className="font-space-medium text-gray-500">Chưa ghi nhận hoạt động nào.</Text>
                            )}
                        </View>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}
