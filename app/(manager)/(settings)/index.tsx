import { useLogoutUser } from "@/hooks/useAuth";
import { useGetMemberById } from "@/hooks/useMember";
import { useGetMe } from "@/hooks/useUser";
import { getDecodedToken } from "@/utils/token";
import { useRouter } from "expo-router";
import {
    Bell,
    ChevronRight,
    HelpCircle,
    Info,
    LogOut,
    Shield,
    Users,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Image, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";



const MENU_ITEMS = [
    {
        icon: Users,
        label: "Quản lý gia đình",
        subtitle: "Sửa, xóa gia đình",
        color: "#A3E6A1",
        route: "/(manager)/(family)" as const,
    },
    {
        icon: Bell,
        label: "Thông báo",
        subtitle: "Tuỳ chỉnh nhắc nhở",
        color: "#FFD700",
    },
    {
        icon: Shield,
        label: "Bảo mật tài khoản",
        subtitle: "Thay đổi mật khẩu",
        color: "#D9AEF6",
        route: "/(manager)/(settings)/change-password" as const,
        onlyUser: true,
    },
    {
        icon: HelpCircle,
        label: "Trợ giúp & Hỗ trợ",
        subtitle: "Câu hỏi thường gặp",
        color: "#87CEFA",
    },
    {
        icon: Info,
        label: "Về Medimate",
        subtitle: "Phiên bản 1.0.0",
        color: "#FFA07A",
    },
];

export default function SettingsScreen() {
    const router = useRouter();

    // 1. State lưu trữ ID giải mã từ Token
    const [userId, setUserId] = useState<string | undefined>(undefined);
    const [memberId, setMemberId] = useState<string | undefined>(undefined);

    // 2. Hook Đăng xuất
    const { mutate: logout, isPending: isLoggingOut } = useLogoutUser();

    // Giải mã token khi màn hình được load
    useEffect(() => {
        const fetchToken = async () => {
            const decoded = await getDecodedToken();
            if (decoded) {
                setUserId(decoded.Id);
                setMemberId(decoded.MemberId);
            }
        };
        fetchToken();
    }, []);

    // 3. Gọi hook lấy thông tin dựa trên ID
    // Lấy User nếu có userId
    const { data: userProfile, isLoading: isUserLoading } = useGetMe(!!userId);

    // Lấy Member nếu không có userId mà chỉ có memberId
    const effectiveMemberId = (!userId && memberId) ? memberId : undefined;
    const { data: memberProfile, isLoading: isMemberLoading } = useGetMemberById(effectiveMemberId);

    // Gộp chung dữ liệu hiển thị (Ưu tiên User > Member)
    const displayData = userId ? userProfile : memberProfile;
    const isLoadingProfile = userId ? isUserLoading : isMemberLoading;

    // Xử lý Đăng xuất

    const handleLogout = () => {
        Alert.alert(
            "Xác nhận đăng xuất", // Tiêu đề
            "Bạn có chắc chắn muốn thoát khỏi tài khoản này không?", // Nội dung
            [
                {
                    text: "Hủy",
                    style: "cancel", // Kiểu nút Hủy (màu xanh/mặc định)
                },
                {
                    text: "Đăng xuất",
                    style: "destructive", // Kiểu nút nguy hiểm (thường có màu đỏ trên iOS)
                    onPress: () => {
                        // Chỉ thực hiện logout khi người dùng nhấn nút này
                        logout();
                    },
                },
            ],
            { cancelable: true } // Cho phép đóng alert bằng cách nhấn ra ngoài (Android)
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
            <ScrollView
                className="flex-1 px-5 pt-4"
                contentContainerStyle={{ paddingBottom: 100 }}
                showsVerticalScrollIndicator={true}
            >
                {/* Profile Card */}
                <Pressable
                    className="bg-white border-2 border-black rounded-[32px] p-6 mb-5 shadow-sm active:opacity-80"
                    onPress={() => {
                        router.push("/(manager)/(settings)/profile");
                    }}
                >
                    <View className="flex-row items-center">
                        <View className="w-16 h-16 rounded-2xl bg-[#D9AEF6] items-center justify-center border-2 border-black overflow-hidden">
                            {isLoadingProfile ? (
                                <ActivityIndicator color="#000" />
                            ) : (
                                <Image
                                    source={{ uri: displayData?.avatarUrl || "https://i.pravatar.cc/100" }}
                                    className="w-16 h-16"
                                    resizeMode="cover"
                                />
                            )}
                        </View>

                        <View className="ml-5 flex-1">
                            {isLoadingProfile ? (
                                <View className="w-2/3 h-5 bg-gray-200 rounded-md mb-2" />
                            ) : (
                                <>
                                    <Text className="text-xl text-black font-space-bold leading-tight" numberOfLines={1}>
                                        {displayData?.fullName || "Người dùng"}
                                    </Text>
                                    <Text className="text-[15px] text-gray-600 font-space-medium mt-0.5" numberOfLines={1}>
                                        {/* Hiển thị Email nếu là User, hiển thị SĐT nếu là Member */}
                                        {userId ? (displayData as any)?.email : (displayData as any)?.phoneNumber || "Chưa cập nhật thông tin"}
                                    </Text>
                                </>
                            )}
                        </View>
                        <View className="bg-black rounded-full p-1">
                            <ChevronRight size={20} color="#FFFFFF" strokeWidth={2.5} />
                        </View>
                    </View>
                </Pressable>

                {/* Menu Items */}
                <View className="bg-white border-2 border-black rounded-[32px] overflow-hidden mb-6 shadow-sm">
                    {MENU_ITEMS.map((item, index) => {
                        const IconComp = item.icon;

                        // Nếu là Dependent Member (không có userId), có thể bạn muốn ẩn menu "Quản lý gia đình" hoặc "Bảo mật" đi
                        // Ví dụ: if (!userId && item.label === "Quản lý gia đình") return null;

                        return (
                            <Pressable
                                key={item.label}
                                onPress={() => {
                                    if ("route" in item && item.route) {
                                        router.push(item.route as any);
                                    }
                                }}
                                className={`flex-row items-center px-5 py-5 active:bg-gray-50 ${index < MENU_ITEMS.length - 1 ? "border-b-2 border-black/10" : ""
                                    }`}
                            >
                                <View
                                    className="w-12 h-12 rounded-2xl items-center justify-center mr-4 border-2 border-black"
                                    style={{ backgroundColor: item.color }}
                                >
                                    <IconComp size={22} color="#000000" strokeWidth={2} />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-[17px] text-black font-space-bold">
                                        {item.label}
                                    </Text>
                                    <Text className="text-sm text-gray-500 font-space-medium mt-0.5">
                                        {item.subtitle}
                                    </Text>
                                </View>
                                <ChevronRight size={20} color="#000000" strokeWidth={2} />
                            </Pressable>
                        );
                    })}
                </View>

                {/* Logout Button */}
                <Pressable
                    onPress={handleLogout}
                    disabled={isLoggingOut}
                    className={`bg-black border-2 border-black rounded-[32px] flex-row items-center justify-center py-5 shadow-lg ${isLoggingOut ? 'opacity-70' : 'active:opacity-90'}`}
                >
                    {isLoggingOut ? (
                        <ActivityIndicator color="#FFFFFF" />
                    ) : (
                        <>
                            <LogOut size={22} color="#FFFFFF" strokeWidth={2.5} />
                            <Text className="text-lg text-white font-space-bold ml-3 uppercase tracking-wider">
                                Đăng xuất
                            </Text>
                        </>
                    )}
                </Pressable>

            </ScrollView>
        </SafeAreaView>
    );
}
