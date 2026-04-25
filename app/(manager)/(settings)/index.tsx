import { useLogoutUser } from "@/hooks/useAuth";
import { useGetMemberById } from "@/hooks/useMember";
import { useGetMe } from "@/hooks/useUser";
import { getDecodedToken } from "@/utils/token";
import { useRouter } from "expo-router";
import {
  ChevronRight,
  Crown,
  FileText,
  Info,
  LogOut,
  Shield,
  Users,
  Building
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const MENU_ITEMS = [
  {
    icon: Users,
    label: "Quản lý Gia đình",
    subtitle: "Thành viên & Quyền hạn",
    color: "#A3E6A1",
    route: "/(manager)/(family)" as const,
  },
  // {
  //   icon: Bell,
  //   label: "Thông báo",
  //   subtitle: "Tuỳ chỉnh nhắc nhở",
  //   color: "#FFD700",
  // },
  {
    icon: Shield,
    label: "Bảo mật tài khoản",
    subtitle: "Thay đổi mật khẩu",
    color: "#D9AEF6",
    route: "/(manager)/(settings)/change-password" as const,
    onlyUser: true,
  },
  {
    icon: FileText,
    label: "Lịch sử giao dịch",
    subtitle: "Gói cước & Thanh toán",
    color: "#FFD700",
    route: "/(manager)/(settings)/transaction_history" as const,
    onlyUser: true,
  },
  // {
  //   icon: HelpCircle,
  //   label: "Trợ giúp & Hỗ trợ",
  //   subtitle: "Câu hỏi thường gặp",
  //   color: "#87CEFA",
  // },
  {
    icon: Building,
    label: "Tài khoản hoàn tiền",
    subtitle: "Thiết lập thẻ ngân hàng",
    color: "#87CEFA",
    route: "/(manager)/(settings)/bank-account" as const,
    onlyUser: true,
  },
  {
    icon: Info,
    label: "Về Medimate",
    subtitle: "Phiên bản & Cập nhật",
    color: "#FFA07A",
    route: "/(manager)/(settings)/version" as const,
  },
];

export default function SettingsScreen() {
  const router = useRouter();

  const [userId, setUserId] = useState<string | undefined>(undefined);
  const [memberId, setMemberId] = useState<string | undefined>(undefined);

  const { mutate: logout, isPending: isLoggingOut } = useLogoutUser();

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

  const { data: userProfile, isLoading: isUserLoading } = useGetMe(!!userId);
  const effectiveMemberId = !userId && memberId ? memberId : undefined;
  const { data: memberProfile, isLoading: isMemberLoading } =
    useGetMemberById(effectiveMemberId);

  const displayData = userId ? userProfile : memberProfile;
  const isLoadingProfile = userId ? isUserLoading : isMemberLoading;

  const handleLogout = () => {
    Alert.alert(
      "Xác nhận đăng xuất",
      "Bạn có chắc chắn muốn thoát khỏi tài khoản này không?",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Đăng xuất",
          style: "destructive",
          onPress: () => logout(),
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F9F6FC]" edges={["top"]}>
      <ScrollView
        className="flex-1 px-5"
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Card */}
        <Pressable
          className="bg-white border-2 border-black rounded-[24px] p-5 mb-10 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
          onPress={() => router.push("/(manager)/(settings)/profile")}
        >
          <View className="flex-row items-center">
            <View className="w-16 h-16 rounded-2xl bg-[#D9AEF6] items-center justify-center border-2 border-black overflow-hidden shadow-sm">
              {isLoadingProfile ? (
                <ActivityIndicator color="#000" />
              ) : (
                <Image
                  source={{
                    uri: displayData?.avatarUrl || "https://tse4.mm.bing.net/th/id/OIP.V0f1oJi7BUElgXaX45v8ygAAAA?rs=1&pid=ImgDetMain&o=7&rm=3",
                  }}
                  className="w-full h-full"
                  resizeMode="cover"
                />
              )}
            </View>

            <View className="ml-4 flex-1">
              {isLoadingProfile ? (
                <View className="w-2/3 h-5 bg-gray-100 rounded-md mb-2" />
              ) : (
                <>
                  <Text
                    className="text-xl text-black font-space-bold leading-tight"
                    numberOfLines={1}
                  >
                    {displayData?.fullName || "Người dùng"}
                  </Text>
                  <View className="flex-row items-center mt-1.5 gap-x-2">
                    <View className="px-2 py-0.5 bg-[#A3E6A1] border border-black rounded-lg">
                      <Text className="text-[10px] text-black font-space-bold uppercase">
                        {userId ? "Quản trị" : "Thành viên"}
                      </Text>
                    </View>
                  </View>
                </>
              )}
            </View>
            <View className="w-10 h-10 rounded-xl bg-black border border-black items-center justify-center">
              <ChevronRight size={22} color="#FFFFFF" strokeWidth={3} />
            </View>
          </View>
        </Pressable>

        {/* PREMIUM SUBSCRIPTION CARD */}
        <Pressable
          className="bg-[#FFD700] border-2 border-black rounded-[24px] p-5 mb-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none overflow-hidden"
          onPress={() => router.push("/(manager)/(subscription)" as any)}
        >
          <View className="absolute -right-4 -top-4 opacity-10">
            <Crown size={120} color="#000" />
          </View>

          <View className="flex-row items-center justify-between">
            <View className="flex-1 mr-3">
              <View className="flex-row items-center mb-1 gap-x-2">
                <View className="w-9 h-9 bg-black rounded-xl items-center justify-center border border-black shadow-sm">
                  <Crown size={20} color="#FFD700" strokeWidth={2.5} />
                </View>
                <Text className="text-lg font-space-bold text-black uppercase tracking-tight">
                  Nâng cấp Gia Đình
                </Text>
              </View>
              <Text className="text-[13px] font-space-medium text-black/70 leading-4 pt-2">
                Thêm không giới hạn thành viên & quản lý thuốc thông minh.
              </Text>
            </View>

            <View className="bg-black py-2.5 px-4 rounded-xl border border-black">
              <Text className="text-white font-space-bold text-xs uppercase tracking-wider">
                Khám phá
              </Text>
            </View>
          </View>
        </Pressable>

        {/* Settings Section Title */}
        <Text className="text-xs font-space-bold text-gray-500 uppercase ml-1 mb-3 tracking-[2px]">
          Cài đặt chung
        </Text>

        {/* Menu Items List */}
        <View className="bg-white border-2 border-black rounded-[24px] overflow-hidden mb-8 shadow-sm">
          {MENU_ITEMS.filter(item => !item.onlyUser || userId).map((item, index, filteredArray) => {
            const IconComp = item.icon;
            return (
              <Pressable
                key={item.label}
                onPress={() => {
                  if ("route" in item && item.route) {
                    router.push(item.route as any);
                  }
                }}
                className={`flex-row items-center px-5 py-4 active:bg-gray-50 ${index < filteredArray.length - 1
                  ? "border-b-2 border-black/10"
                  : ""
                  }`}
              >
                <View
                  className="w-11 h-11 rounded-2xl items-center justify-center mr-4 border-2 border-black shadow-sm"
                  style={{ backgroundColor: item.color }}
                >
                  <IconComp size={20} color="#000000" strokeWidth={2} />
                </View>
                <View className="flex-1">
                  <Text className="text-[16px] text-black font-space-bold">
                    {item.label}
                  </Text>
                  <Text className="text-xs text-gray-500 font-space-medium mt-0.5">
                    {item.subtitle}
                  </Text>
                </View>
                <ChevronRight size={18} color="#000000" strokeWidth={2.5} />
              </Pressable>
            );
          })}
        </View>

        {/* Logout Button */}
        <Pressable
          onPress={handleLogout}
          disabled={isLoggingOut}
          className={`bg-black border-2 border-black rounded-[24px] flex-row items-center justify-center py-5 shadow-lg ${isLoggingOut ? "opacity-70" : "active:translate-y-1"}`}
        >
          {isLoggingOut ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <View className="flex-row items-center gap-x-2">
              <LogOut size={22} color="#FFFFFF" strokeWidth={2.5} />
              <Text className="text-lg text-white font-space-bold uppercase tracking-wider">
                Đăng xuất
              </Text>
            </View>
          )}
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
