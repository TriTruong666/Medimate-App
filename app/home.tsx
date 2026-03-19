// app/home.tsx
import { useGetFamilies, useGetSubscription } from "@/hooks/useHome";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, Text, View } from "react-native";

export default function HomeScreen() {
    // 1. Gọi API lấy danh sách gia đình để check hồ sơ
    const { data: families, isLoading: isFamiliesLoading, isError: isFamiliesError, refetch: refetchFamilies, isFetching: isFamiliesFetching } = useGetFamilies();

    // Xác định familyId đầu tiên (nếu có) để lấy gói dịch vụ
    const firstFamilyId = families && families.length > 0 ? families[0].familyId : undefined;

    // 2. Gọi API lấy gói dịch vụ (chỉ chạy nếu firstFamilyId tồn tại)
    const { data: subscription, isLoading: isSubLoading, isError: isSubError } = useGetSubscription(firstFamilyId);

    // Logic handle refresh toàn bộ trang
    const onRefresh = React.useCallback(() => {
        refetchFamilies();
    }, []);

    // Xử lý trạng thái đang tải lần đầu
    if (isFamiliesLoading) {
        return (
            <View className="flex-1 bg-[#F8FAFA] justify-center items-center">
                <ActivityIndicator size="large" color="#3B82F6" />
                <Text className="text-gray-500 mt-4 font-medium">Đang tải dữ liệu...</Text>
            </View>
        );
    }

    // Xử lý trạng thái lỗi
    if (isFamiliesError) {
        return (
            <View className="flex-1 bg-[#F8FAFA] justify-center items-center px-6">
                <Ionicons name="cloud-offline-outline" size={64} color="#EF4444" />
                <Text className="text-xl font-bold text-gray-900 mt-6 text-center">Mất kết nối server</Text>
                <Text className="text-gray-500 mt-2 text-center mb-8">Vui lòng kiểm tra lại đường truyền internet.</Text>
                <Pressable onPress={() => refetchFamilies()} className="bg-[#3B82F6] px-8 py-3 rounded-full active:opacity-80">
                    <Text className="text-white font-bold">Thử lại</Text>
                </Pressable>
            </View>
        );
    }

    const hasSetupProfile = families && families.length > 0;

    return (
        <ScrollView
            className="flex-1 bg-[#F8FAFA]"
            showsVerticalScrollIndicator={false}
            refreshControl={
                <RefreshControl refreshing={isFamiliesFetching} onRefresh={onRefresh} tintColor="#3B82F6" />
            }
        >
            {/* --- BẮT ĐẦU VÙNG NỘI DUNG CHÍNH (Thêm padding top để tránh status bar) --- */}
            <View className="px-6 pt-16 pb-10">

                {/* Header Section */}
                <View className="flex-row justify-between items-center mb-10">
                    <View>
                        <Text className="text-gray-500 text-sm font-medium">Chào bạn 👋</Text>
                        <Text className="text-2xl font-extrabold text-[#1F2937] mt-1">MediMate xin chào!</Text>
                    </View>
                    {/* Avatar Placeholder */}
                    <View className="w-14 h-14 bg-gray-200 rounded-full items-center justify-center border-2 border-white shadow-sm">
                        <Feather name="user" size={24} color="#9CA3AF" />
                    </View>
                </View>

                {/* --- KHU VỰC DỰA TRÊN LOGIC YÊU CẦU --- */}
                <View className="mb-10">
                    <Text className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Quản lý hồ sơ</Text>

                    {!hasSetupProfile ? (
                        // --- TRƯỜNG HỢP 1: CHƯA CÓ HỒ SƠ (Hiện 2 nút Tạo) ---
                        <View className="space-y-4">
                            {/* Nút Tạo hồ sơ cá nhân (Màu xanh pastel) */}
                            {/* <Link href="/families/create-personal" asChild> */}
                            <Pressable className="w-full bg-[#E5F0FF] rounded-3xl p-6 flex-row items-center border border-[#BFDBFE] active:opacity-80 shadow-sm">
                                <View className="w-12 h-12 bg-white rounded-full items-center justify-center mr-4">
                                    <Feather name="user-plus" size={22} color="#3B82F6" />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-[#1F2937] font-bold text-lg mb-1">Tạo hồ sơ cá nhân</Text>
                                    <Text className="text-[#6B7280] text-xs">Bắt đầu theo dõi sức khỏe cho chính bạn.</Text>
                                </View>
                                <Feather name="plus-circle" size={24} color="#3B82F6" className="ml-2" />
                            </Pressable>
                            {/* </Link> */}

                            {/* Nút Tạo hồ sơ Family (Màu vàng pastel) */}
                            {/* <Link href="/families/create-shared" asChild> */}
                            <Pressable className="w-full bg-[#FEF3C7] rounded-3xl p-6 flex-row items-center border border-[#FDE68A] active:opacity-80 shadow-sm">
                                <View className="w-12 h-12 bg-white rounded-full items-center justify-center mr-4">
                                    <MaterialCommunityIcons name="home-plus-outline" size={24} color="#D97706" />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-[#1F2937] font-bold text-lg mb-1">Tạo hồ sơ Family</Text>
                                    <Text className="text-[#6B7280] text-xs">Mời các thành viên cùng tham gia quản lý.</Text>
                                </View>
                                <Feather name="users" size={24} color="#D97706" className="ml-2" />
                            </Pressable>
                            {/* </Link> */}
                        </View>
                    ) : (
                        // --- TRƯỜNG HỢP 2: ĐÃ CÓ HỒ SƠ (Hiện 1 nút Xem) ---
                        // Nút Xem family (Màu xanh mint pastel)
                        // <Link href="/families/view-family" asChild>
                        <Pressable className="w-full bg-[#E1F8ED] rounded-3xl p-6 flex-row items-center border border-[#A7F3D0] active:opacity-80 shadow-sm">
                            <View className="w-12 h-12 bg-white rounded-full items-center justify-center mr-4">
                                <Ionicons name="people-outline" size={24} color="#059669" />
                            </View>
                            <View className="flex-1">
                                <Text className="text-[#1F2937] font-bold text-lg mb-1">Xem gia đình của bạn</Text>
                                <Text className="text-[#6B7280] text-xs">Quản lý lịch uống thuốc và thành viên.</Text>
                            </View>
                            <Feather name="chevron-right" size={24} color="#059669" className="ml-2" />
                        </Pressable>
                        // </Link>
                    )}
                </View>

                {/* --- KHU VỰC HIỂN THỊ GÓI DỊCH VỤ --- */}
                {hasSetupProfile && (
                    <View>
                        <Text className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Gói dịch vụ hiện tại</Text>

                        <View className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm relative overflow-hidden">
                            {/* Background trang trí mờ ảo */}
                            <View className="absolute top-0 right-0 w-24 h-24 bg-[#FFE5F1] rounded-full opacity-40 translate-x-10 translate-y--10" />

                            {isSubLoading ? (
                                <View className="py-4 items-center justify-center flex-row">
                                    <ActivityIndicator size="small" color="#E11D48" />
                                    <Text className="text-gray-500 ml-2 font-medium">Đang lấy thông tin gói...</Text>
                                </View>
                            ) : isSubError || !subscription ? (
                                <View className="py-2 flex-row items-center">
                                    <Feather name="alert-triangle" size={20} color="#EF4444" />
                                    <Text className="text-red-500 ml-2 font-medium">Không thể lấy thông tin gói.</Text>
                                </View>
                            ) : (
                                <>
                                    {/* Nội dung gói dịch vụ */}
                                    <View className="flex-row justify-between items-start mb-5">
                                        <View>
                                            <Text className="text-sm font-bold text-[#E11D48] tracking-widest uppercase">GÓI ĐĂNG KÝ</Text>
                                            <Text className="text-3xl font-extrabold text-[#1F2937] mt-1">{subscription.packageName}</Text>
                                        </View>
                                        <View className="px-3 py-1 bg-[#E1F8ED] rounded-full border border-[#A7F3D0]">
                                            <Text className="text-[#059669] font-bold text-xs">Đang hoạt động</Text>
                                        </View>
                                    </View>

                                    {/* Thông tin chi tiết */}
                                    <View className="flex-row items-center space-x-3 bg-gray-50 rounded-2xl p-4">
                                        <Feather name="calendar" size={18} color="#9CA3AF" />
                                        <Text className="text-gray-500 font-medium">Hạn dùng đến: </Text>
                                        <Text className="text-[#1F2937] font-bold">
                                            {new Date(subscription.endDate).toLocaleDateString('vi-VN')}
                                        </Text>
                                    </View>

                                    {/* Nút Xem chi tiết / Nâng cấp */}
                                    <Pressable className="mt-5 bg-[#E11D48] rounded-full py-4 items-center justify-center active:opacity-90">
                                        <Text className="text-white font-bold text-base">Xem chi tiết hoặc Nâng cấp</Text>
                                    </Pressable>
                                </>
                            )}
                        </View>
                    </View>
                )}

            </View>
            {/* --- KẾT THÚC VÙNG NỘI DUNG CHÍNH --- */}
        </ScrollView>
    );
}