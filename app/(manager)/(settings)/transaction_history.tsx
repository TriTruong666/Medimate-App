import dayjs from "dayjs";
import 'dayjs/locale/vi';
import { useRouter } from "expo-router";
import { ArrowDownRight, ArrowLeft, ArrowUpRight, FileText, RefreshCcw } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, RefreshControl, Text, View, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useGetTransactionDetail, useGetTransactionsByUserId } from "@/hooks/useTransaction";
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

    const TransactionCard = ({ item }: { item: any }) => {
        const [isExpanded, setIsExpanded] = useState(false);
        const isIncome = item.transactionType === "INCOME";
        const statusConfig = STATUS_MAP[item.status.toUpperCase()] || { label: item.status, color: "#000", bg: "#E2E8F0" };

        const { data: detailData, isLoading: detailLoading } = useGetTransactionDetail(item.transactionId, {
            enabled: isExpanded,
        });

        return (
            <Pressable
                onPress={() => setIsExpanded(!isExpanded)}
                style={{
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

                {isExpanded && (
                    <View style={{ marginTop: 16, borderTopWidth: 1.5, borderTopColor: 'rgba(0,0,0,0.05)', paddingTop: 16 }}>
                        {detailLoading ? (
                            <ActivityIndicator size="small" color="#000" />
                        ) : detailData ? (
                            <View style={{ gap: 12 }}>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                    <Text style={{ fontFamily: 'SpaceGrotesk_500Medium', fontSize: 13, color: '#64748B' }}>Người gửi:</Text>
                                    <Text style={{ fontFamily: 'SpaceGrotesk_600SemiBold', fontSize: 13, color: '#000' }}>{detailData.senderName || '---'}</Text>
                                </View>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                    <Text style={{ fontFamily: 'SpaceGrotesk_500Medium', fontSize: 13, color: '#64748B' }}>Người nhận:</Text>
                                    <Text style={{ fontFamily: 'SpaceGrotesk_600SemiBold', fontSize: 13, color: '#000' }}>{detailData.receiverName || '---'}</Text>
                                </View>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                    <Text style={{ fontFamily: 'SpaceGrotesk_500Medium', fontSize: 13, color: '#64748B' }}>Nội dung:</Text>
                                    <Text style={{ fontFamily: 'SpaceGrotesk_600SemiBold', fontSize: 13, color: '#000', flex: 1, textAlign: 'right', marginLeft: 20 }}>{detailData.content || '---'}</Text>
                                </View>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                    <Text style={{ fontFamily: 'SpaceGrotesk_500Medium', fontSize: 13, color: '#64748B' }}>Phí giao dịch:</Text>
                                    <Text style={{ fontFamily: 'SpaceGrotesk_600SemiBold', fontSize: 13, color: '#000' }}>{formatCurrency(detailData.transactionFee || 0)}</Text>
                                </View>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                    <Text style={{ fontFamily: 'SpaceGrotesk_500Medium', fontSize: 13, color: '#64748B' }}>Phương thức:</Text>
                                    <Text style={{ fontFamily: 'SpaceGrotesk_600SemiBold', fontSize: 13, color: '#000' }}>{detailData.paymentMethod || 'PayOS'}</Text>
                                </View>
                                {detailData.gatewayResponse && (detailData.gatewayResponse.startsWith('http') || detailData.gatewayResponse.startsWith('https')) && (
                                    <View style={{ marginTop: 8 }}>
                                        <Text style={{ fontFamily: 'SpaceGrotesk_500Medium', fontSize: 13, color: '#64748B', marginBottom: 8 }}>Ảnh chứng từ / Hoàn tiền:</Text>
                                        <Image
                                            source={{ uri: detailData.gatewayResponse }}
                                            style={{ width: '100%', height: 250, borderRadius: 12 }}
                                            resizeMode="cover"
                                        />
                                    </View>
                                )}
                            </View>
                        ) : (
                            <Text style={{ fontFamily: 'SpaceGrotesk_500Medium', fontSize: 12, color: '#EF4444', textAlign: 'center' }}>Không tải được chi tiết giao dịch.</Text>
                        )}
                    </View>
                )}
            </Pressable>
        );
    };

    const handleRefresh = () => {
        setPageNumber(1);
        refetch();
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
                        renderItem={({ item }) => <TransactionCard item={item} />}
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
