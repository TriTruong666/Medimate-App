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
import { Image, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const MENU_ITEMS = [
  {
    icon: Users,
    label: "Quản lý gia đình",
    subtitle: "Thêm, xoá thành viên",
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
    label: "Bảo mật & Quyền riêng tư",
    subtitle: "Mật khẩu, xác thực 2 lớp",
    color: "#D9AEF6",
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

  const handleLogout = () => {
    // TODO: Xử lý đăng xuất
    console.log("Logout");
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <ScrollView
        className="flex-1 px-5 pt-4"
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={true}
      >
        {/* Profile Card */}
        <View className="bg-white border-2 border-black rounded-[32px] p-6 mb-5 shadow-sm">
          <View className="flex-row items-center">
            <View className="w-16 h-16 rounded-2xl bg-[#D9AEF6] items-center justify-center border-2 border-black overflow-hidden">
              <Image
                source={{ uri: "https://i.pravatar.cc/100" }}
                className="w-16 h-16"
                resizeMode="cover"
              />
            </View>
            <View className="ml-5 flex-1">
              <Text className="text-xl text-black font-space-bold leading-tight">
                Tri Truong
              </Text>
              <Text className="text-[15px] text-gray-600 font-space-medium mt-0.5">
                tritruong@email.com
              </Text>
            </View>
            <View className="bg-black rounded-full p-1">
              <ChevronRight size={20} color="#FFFFFF" strokeWidth={2.5} />
            </View>
          </View>
        </View>

        {/* Menu Items */}
        <View className="bg-white border-2 border-black rounded-[32px] overflow-hidden mb-6 shadow-sm">
          {MENU_ITEMS.map((item, index) => {
            const IconComp = item.icon;
            return (
              <Pressable
                key={item.label}
                onPress={() => {
                  if ("route" in item && item.route) {
                    router.push(item.route as any);
                  }
                }}
                className={`flex-row items-center px-5 py-5 active:bg-gray-50 ${index < MENU_ITEMS.length - 1
                  ? "border-b-2 border-black/10"
                  : ""
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
          className="bg-black border-2 border-black rounded-[32px] flex-row items-center justify-center py-5 shadow-lg active:opacity-90"
        >
          <LogOut size={22} color="#FFFFFF" strokeWidth={2.5} />
          <Text className="text-lg text-white font-space-bold ml-3 uppercase tracking-wider">
            Đăng xuất
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
