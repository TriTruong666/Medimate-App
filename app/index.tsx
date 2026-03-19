import { Link } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import "../global.css";

export default function RoleSelectionScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 px-8 pt-12 pb-8">
        {/* Brand Name */}
        <View className="pt-10 pb-8 overflow-hidden">
          <Text className="text-[52px] text-black text-center tracking-[-2px] leading-[72px] font-zen">
            MEDI
            <Text className="text-card-purple">MATE</Text>
          </Text>
        </View>

        {/* Role Cards */}
        <View className="flex-1 gap-5">
          {/* Card Quản lý */}
          <Link href="/(auth)/login" asChild>
            <Pressable className="flex-1 rounded-[32px] p-8 shadow-sm active:opacity-80 bg-white border-2 border-black justify-between">
              <View>
                <Text className="text-3xl text-black font-space-bold">
                  Quản lý
                </Text>
                <Text className="text-base text-black mt-3 opacity-60 leading-6 font-space-regular">
                  Thiết lập và theo dõi lịch uống thuốc cho người thân.
                </Text>
              </View>
              <View className="flex-row items-center justify-between mt-6">
                <Text className="text-sm text-black uppercase tracking-widest opacity-50 font-space-semibold">
                  Đăng nhập
                </Text>
                <Text className="text-2xl text-black opacity-30">→</Text>
              </View>
            </Pressable>
          </Link>

          {/* Card Thành viên */}
          <Link href="/(auth)/login_qr" asChild>
            <Pressable className="flex-1 rounded-[32px] p-8 shadow-sm active:opacity-80 bg-white border-2 border-black justify-between">
              <View>
                <Text className="text-3xl text-black font-space-bold">
                  Thành viên
                </Text>
                <Text className="text-base text-black mt-3 opacity-60 leading-6 font-space-regular">
                  Bạn là thành viên trong gia đình, đăng nhập bằng mã QR.
                </Text>
              </View>
              <View className="flex-row items-center justify-between mt-6">
                <Text className="text-sm text-black uppercase tracking-widest opacity-50 font-space-semibold">
                  Quét QR
                </Text>
                <Text className="text-2xl text-black opacity-30">→</Text>
              </View>
            </Pressable>
          </Link>
        </View>
      </View>
    </SafeAreaView>
  );
}
