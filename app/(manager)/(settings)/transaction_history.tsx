import React, { useEffect, useState } from "react";
import { View, Text, FlatList, ActivityIndicator, Pressable, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ArrowLeft, ArrowUpRight, ArrowDownRight, RefreshCcw, FileText } from "lucide-react-native";
import dayjs from "dayjs";
import 'dayjs/locale/vi';

import { useGetTransactionsByUserId } from "@/hooks/useTransaction";
import { getDecodedToken } from "@/utils/token";

dayjs.locale('vi');

const STATUS_MAP: Record<string, { label: string; color: string; bg: string }> = {
    SUCCESS: { label: "Thành công", color: "#22C55E", bg: "#DCFCE7" },
    FAILED: { label: "Thất bại", color: "#EF4444", bg: "#FEE2E2" },
    CANCELLED: { label: "Đã hủy", color: "#94A3B8", bg: "#F1F5F9" },
    PENDING: { label: "Đang chờ", color: "#F59E0B", bg: "#FEF3C7" },
};

export default function TransactionHistoryScreen() {
    const router = useRouter();
    const [userId, setUserId] = useState<string | undefined>(undefined);
    
    // Simple pagination
    const [pageNumber, setPageNumber] = useState(1);
    const pageSize = 20;

    useEffect(() => {
        getDecodedToken().then(decoded => {
            if (decoded && decoded.Id) {
                setUserId(decoded.Id);
            }
        });
    }, []);

    const { data, isLoading, isFetching, refetch } = useGetTransactionsByUserId(userId, {
        PageNumber: pageNumber,
        PageSize: pageSize,
    });

    const transactions = data?.items || [];

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    const handleRefresh = () => {
        setPageNumber(1);
        refetch();
    };

    const renderItem = ({ item }: { item: any }) => {
        const isIncome = item.transactionType === "INCOME"; // Adjust if Types are different
        const statusConfig = STATUS_MAP[item.status.toUpperCase()] || { label: item.status, color: "#000", bg: "#E2E8F0" };

        return (
            <View style={{
                backgroundColor: '#fff',
                borderWidth: 2,
                borderColor: '#000',
                borderRadius: 20,
                padding: 16,
                marginBottom: 16,
                shadowColor: '#000',
                shadowOffset: { width: 3, height: 4 },
                shadowOpacity: 1,
                shadowRadius: 0,
                elevation: 4,
            }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <View style={{ flex: 1, paddingRight: 10 }}>
                        <Text style={{ fontFamily: 'SpaceGrotesk_700Bold', fontSize: 13, color: '#64748B' }}>MÃ GIAO DỊCH</Text>
                        <Text style={{ fontFamily: 'SpaceGrotesk_700Bold', fontSize: 16, color: '#000', marginTop: 2 }}>{item.transactionCode}</Text>
                    </View>
                    <View style={{ backgroundColor: statusConfig.bg, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, borderWidth: 1, borderColor: statusConfig.color }}>
                        <Text style={{ fontFamily: 'SpaceGrotesk_600SemiBold', fontSize: 11, color: statusConfig.color }}>{statusConfig.label}</Text>
                    </View>
                </View>

                <View style={{ height: 2, backgroundColor: 'rgba(0,0,0,0.05)', marginBottom: 12 }} />

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <View>
                        <Text style={{ fontFamily: 'SpaceGrotesk_500Medium', fontSize: 12, color: '#94A3B8' }}>{dayjs(item.transactionDate).format('HH:mm - DD/MM/YYYY')}</Text>
                        <Text style={{ fontFamily: 'SpaceGrotesk_600SemiBold', fontSize: 14, color: '#000', marginTop: 2 }}>{item.transactionType}</Text>
                    </View>

                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Text style={{ fontFamily: 'SpaceGrotesk_700Bold', fontSize: 18, color: '#000' }}>
                            {formatCurrency(item.totalAmount)}
                        </Text>
                        <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: isIncome ? '#DCFCE7' : '#FEE2E2', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: isIncome ? '#22C55E' : '#EF4444' }}>
                            {isIncome ? <ArrowDownRight size={16} color="#22C55E" /> : <ArrowUpRight size={16} color="#EF4444" />}
                        </View>
                    </View>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#F9F6FC' }} edges={["top"]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 12, paddingBottom: 16 }}>
                <Pressable
                    onPress={() => router.back()}
                    style={{ width: 48, height: 48, backgroundColor: '#fff', borderWidth: 2, borderColor: '#000', borderRadius: 18, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 1, shadowRadius: 0 }}
                >
                    <ArrowLeft size={22} color="#000" strokeWidth={2.5} />
                </Pressable>

                <View style={{ alignItems: 'center' }}>
                    <Text style={{ fontFamily: 'SpaceGrotesk_700Bold', fontSize: 18, color: '#000', textTransform: 'uppercase', letterSpacing: -0.5 }}>Lịch sử giao dịch</Text>
                    <Text style={{ fontFamily: 'SpaceGrotesk_500Medium', fontSize: 12, color: '#64748B' }}>Tất cả giao dịch của bạn</Text>
                </View>

                <Pressable
                    onPress={handleRefresh}
                    style={{ width: 48, height: 48, backgroundColor: '#FFD700', borderWidth: 2, borderColor: '#000', borderRadius: 18, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 1, shadowRadius: 0 }}
                >
                    <RefreshCcw size={20} color="#000" strokeWidth={2.5} />
                </Pressable>
            </View>

            <View style={{ flex: 1, paddingHorizontal: 20 }}>
                {isLoading && pageNumber === 1 ? (
                    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                        <ActivityIndicator size="large" color="#000" />
                        <Text style={{ fontFamily: 'SpaceGrotesk_500Medium', color: '#64748B', marginTop: 12 }}>Đang tải dữ liệu...</Text>
                    </View>
                ) : transactions.length === 0 ? (
                    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                        <FileText size={64} color="#000" strokeWidth={1} style={{ opacity: 0.2 }} />
                        <Text style={{ fontFamily: 'SpaceGrotesk_700Bold', fontSize: 16, color: 'rgba(0,0,0,0.35)', marginTop: 16 }}>Chưa có giao dịch nào</Text>
                    </View>
                ) : (
                    <FlatList
                        data={transactions}
                        keyExtractor={(item) => item.transactionId || item.transactionCode}
                        renderItem={renderItem}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: 40, paddingTop: 10 }}
                        refreshControl={
                            <RefreshControl refreshing={isFetching && pageNumber === 1} onRefresh={handleRefresh} tintColor="#000" colors={["#000"]} />
                        }
                    />
                )}
            </View>
        </SafeAreaView>
    );
}
