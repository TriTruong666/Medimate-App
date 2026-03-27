import { useGetFamilyActivityLogs } from "@/hooks/useActivityLog";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Activity, Bell, FileEdit, User, Trash2, Calendar, Pill, Plus } from "lucide-react-native";
import React, { useState } from "react";
import { ActivityIndicator, FlatList, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AntDesign } from "@expo/vector-icons";

const getIconForAction = (actionType: string) => {
    switch (actionType.toUpperCase()) {
        case "CREATE": return <Plus size={20} color="#000" />;
        case "UPDATE": return <FileEdit size={20} color="#000" />;
        case "DELETE": return <Trash2 size={20} color="#000" />;
        case "TAKE_MEDICATION": return <Pill size={20} color="#000" />;
        case "NOTIFICATION": return <Bell size={20} color="#000" />;
        default: return <Activity size={20} color="#000" />;
    }
};

const getColorForAction = (actionType: string) => {
    switch (actionType.toUpperCase()) {
        case "CREATE": return "bg-[#A3E6A1]";
        case "UPDATE": return "bg-[#FFD700]";
        case "DELETE": return "bg-[#FFA07A]";
        case "TAKE_MEDICATION": return "bg-[#D9AEF6]";
        case "NOTIFICATION": return "bg-blue-300";
        default: return "bg-gray-200";
    }
};

const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }) + " - " + date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
};

export default function ActivityLogsScreen() {
    const router = useRouter();
    const { familyId } = useLocalSearchParams<{ familyId: string }>();
    const [page, setPage] = useState(1);

    const { data: logPage, isLoading, isFetching } = useGetFamilyActivityLogs(familyId, page, 20);

    const logs = logPage?.items || [];
    const totalPages = logPage?.totalPages || 1;

    const renderLogItem = ({ item }: { item: any }) => {
        const bgIconColor = getColorForAction(item.actionType);
        const IconCmp = getIconForAction(item.actionType);

        return (
            <View className="bg-white border-2 border-black rounded-[20px] p-4 mb-3 shadow-sm flex-row gap-x-3 items-start">
                <View className={`w-12 h-12 rounded-xl border-2 border-black items-center justify-center mt-1 ${bgIconColor}`}>
                    {IconCmp}
                </View>

                <View className="flex-1">
                    <View className="flex-row items-center justify-between mb-1">
                        <Text className="text-[15px] font-space-bold text-black" numberOfLines={1}>
                            <User size={14} color="#000" className="mr-1" /> {item.memberName || "Hệ thống"}
                        </Text>
                        <Text className="text-[10px] font-space-bold text-gray-400 uppercase tracking-wider">
                            {formatDate(item.createdAt)}
                        </Text>
                    </View>
                    <Text className="text-[13px] font-space-medium text-black/70 leading-relaxed">
                        {item.description}
                    </Text>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-[#F9F6FC]" edges={["top"]}>
            {/* Header */}
            <View className="px-5 pt-3 pb-4 flex-row items-center justify-between z-10">
                <Pressable
                    onPress={() => router.back()}
                    className="w-12 h-12 bg-white border-2 border-black rounded-2xl items-center justify-center active:opacity-80 shadow-sm"
                >
                    <AntDesign name="arrow-left" size={24} color="#000" />
                </Pressable>
                <View className="items-center flex-1 mx-2">
                    <Text className="text-xl text-black font-space-bold text-center">Lịch sử Hoạt động</Text>
                    <Text className="text-[12px] text-gray-500 font-space-medium uppercase tracking-wider">Nhật ký gia đình</Text>
                </View>
                <View className="w-12 h-12" />
            </View>

            {isLoading ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#000" />
                    <Text className="mt-4 font-space-medium text-gray-500 text-sm">Đang tải lịch sử...</Text>
                </View>
            ) : logs.length === 0 ? (
                <View className="flex-1 items-center justify-center px-10">
                    <Activity size={48} color="#D1D5DB" strokeWidth={1.5} />
                    <Text className="mt-4 font-space-bold text-black text-lg text-center">Chưa có hoạt động nào</Text>
                    <Text className="mt-2 font-space-medium text-gray-500 text-sm text-center">Tất cả những thay đổi và lịch sử uống thuốc sẽ được ghi nhận tại đây.</Text>
                </View>
            ) : (
                <FlatList
                    data={logs}
                    keyExtractor={(item, idx) => item.logId || idx.toString()}
                    renderItem={renderLogItem}
                    contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 10, paddingBottom: 100 }}
                    showsVerticalScrollIndicator={false}
                    // Pagination controls at bottom
                    ListFooterComponent={
                        <View className="flex-row items-center justify-between mt-6">
                            <Pressable 
                                onPress={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1 || isFetching}
                                className={`px-4 py-2 border-2 border-black rounded-xl bg-white ${page === 1 ? 'opacity-50' : 'active:bg-gray-100'}`}
                            >
                                <Text className="font-space-bold text-sm uppercase">Trang trước</Text>
                            </Pressable>
                            <Text className="font-space-bold text-sm text-gray-500">Trang {page} / {totalPages}</Text>
                            <Pressable 
                                onPress={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages || isFetching}
                                className={`px-4 py-2 border-2 border-black rounded-xl bg-white ${page === totalPages ? 'opacity-50' : 'active:bg-gray-100'}`}
                            >
                                <Text className="font-space-bold text-sm uppercase">Trang sau</Text>
                            </Pressable>
                        </View>
                    }
                />
            )}
            
            {/* Loading top-overlay for pagination */}
            {isFetching && !isLoading && (
                <View className="absolute top-24 left-1/2 -ml-4 bg-black px-4 py-2 rounded-full shadow-lg z-50 flex-row items-center">
                    <ActivityIndicator size="small" color="#FFF" />
                </View>
            )}
        </SafeAreaView>
    );
}
