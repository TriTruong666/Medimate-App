import {
    Activity,
    ArrowUpRight,
    Droplets,
    Heart,
    Moon,
    ShieldCheck,
    TrendingUp,
    X
} from "lucide-react-native";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ManagerHeader from "../../../components/ManagerHeader";

export default function HomeScreen() {
    return (
        <SafeAreaView className="flex-1 bg-[#F9F6FC]" edges={["top"]}>
            <ManagerHeader />

            <ScrollView
                className="flex-1 px-5"
                contentContainerStyle={{ paddingBottom: 100 }}
                showsVerticalScrollIndicator={false}
            >
                {/* Nhắc uống thuốc Banner - Neo-Brutalism Style */}
                <View className="bg-[#A3E6A1] border-2 border-black rounded-[24px] px-5 py-4 flex-row items-center mb-5 shadow-sm">
                    <View className="w-12 h-12 rounded-2xl bg-white border-2 border-black items-center justify-center mr-4">
                        <Activity size={24} color="#000" strokeWidth={2.5} />
                    </View>
                    <View className="flex-1">
                        <Text className="text-[17px] text-black font-space-bold">
                            Đến giờ uống thuốc rồi!
                        </Text>
                        <Text className="text-sm text-black/60 font-space-medium">
                            Panadol 500mg • 2 viên
                        </Text>
                    </View>
                    <Pressable className="bg-black rounded-full p-1.5 shadow-sm">
                        <X size={16} color="#FFF" strokeWidth={2.5} />
                    </Pressable>
                </View>

                {/* BIG CARD DEMO - Thẻ cực lớn */}
                <View className="bg-[#D9AEF6] border-2 border-black rounded-[32px] p-6 mb-6 shadow-md overflow-hidden relative">
                    {/* Background decoration */}
                    <View className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/20" />
                    <View className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-black/5" />

                    <View className="flex-row justify-between items-start mb-6">
                        <View>
                            <View className="bg-white/40 self-start px-3 py-1 rounded-full border-2 border-black mb-2">
                                <Text className="text-xs font-space-bold uppercase tracking-wider">Thống kê tuần</Text>
                            </View>
                            <Text className="text-3xl text-black font-space-bold leading-tight">
                                Tiến độ{"\n"}chăm sóc
                            </Text>
                        </View>
                        <View className="w-16 h-16 bg-white border-2 border-black rounded-3xl items-center justify-center shadow-sm">
                            <TrendingUp size={32} color="#000" strokeWidth={2.5} />
                        </View>
                    </View>

                    <View className="bg-white border-2 border-black rounded-[24px] p-4 flex-row items-center justify-between mb-2 shadow-sm">
                        <View className="flex-1">
                            <View className="flex-row items-center mb-1">
                                <Heart size={16} color="#EF4444" fill="#EF4444" />
                                <Text className="text-[15px] font-space-bold ml-1.5">Rất tốt!</Text>
                            </View>
                            <Text className="text-sm text-gray-500 font-space-medium">
                                Gia đình đã uống 95% thuốc đúng giờ trong 7 ngày qua.
                            </Text>
                        </View>
                        <View className="ml-4 items-center">
                            <Text className="text-3xl font-space-bold text-black">95%</Text>
                            <ArrowUpRight size={20} color="#000" strokeWidth={2.5} />
                        </View>
                    </View>
                </View>

                {/* Section Title: Chỉ số sức khỏe */}
                <View className="flex-row items-center justify-between mb-4">
                    <Text className="text-2xl text-black font-space-bold">Chỉ số sức khỏe</Text>
                    <Pressable className="bg-white border-2 border-black rounded-2xl px-4 py-2 flex-row items-center shadow-sm active:opacity-80">
                        <Activity size={18} color="#000" strokeWidth={2} />
                        <Text className="text-sm font-space-bold ml-2">Tất cả</Text>
                    </Pressable>
                </View>

                {/* Bento Grid layout with Neo-Brutalism Cards */}
                <View className="gap-3">
                    {/* Row 1: Huyết áp + Nhịp tim */}
                    <View className="flex-row gap-3">
                        <View className="flex-1 bg-white border-2 border-black rounded-[28px] p-5 shadow-sm">
                            <View className="w-10 h-10 bg-[#87CEFA] rounded-2xl border-2 border-black items-center justify-center mb-3">
                                <Activity size={20} color="#000" strokeWidth={2} />
                            </View>
                            <Text className="text-[15px] text-gray-500 font-space-bold mb-1">Huyết áp</Text>
                            <View className="flex-row items-baseline">
                                <Text className="text-3xl text-black font-space-bold">120</Text>
                                <Text className="text-lg text-black/40 font-space-medium ml-1">/80</Text>
                            </View>
                        </View>

                        <View className="flex-1 bg-[#FFA07A] border-2 border-black rounded-[28px] p-5 shadow-sm">
                            <View className="w-10 h-10 bg-white rounded-2xl border-2 border-black items-center justify-center mb-3">
                                <Heart size={20} color="#000" strokeWidth={2.5} />
                            </View>
                            <Text className="text-[15px] text-black/80 font-space-bold mb-1">Nhịp tim</Text>
                            <View className="flex-row items-baseline">
                                <Text className="text-3xl text-black font-space-bold">106</Text>
                                <Text className="text-xs text-black/60 font-space-bold ml-1">BPM</Text>
                            </View>
                        </View>
                    </View>

                    {/* Row 2: Đường huyết - Full width */}
                    <View className="bg-white border-2 border-black rounded-[28px] p-5 shadow-sm flex-row items-center justify-between">
                        <View className="flex-row items-center">
                            <View className="w-12 h-12 bg-[#FFD700] rounded-2xl border-2 border-black items-center justify-center mr-4">
                                <Droplets size={24} color="#000" strokeWidth={2} />
                            </View>
                            <View>
                                <Text className="text-[15px] text-gray-500 font-space-bold">Đường huyết</Text>
                                <View className="flex-row items-baseline">
                                    <Text className="text-2xl text-black font-space-bold">115</Text>
                                    <Text className="text-xs text-gray-400 font-space-medium ml-1">mg/dl</Text>
                                </View>
                            </View>
                        </View>
                        <View className="bg-black/5 rounded-2xl px-3 py-1 border-2 border-black/10">
                            <Text className="text-[13px] font-space-bold text-gray-500">Bình thường</Text>
                        </View>
                    </View>

                    {/* Row 3: SpO2 + Sleep */}
                    <View className="flex-row gap-3">
                        <View className="flex-1 bg-[#A3E6A1] border-2 border-black rounded-[28px] p-5 shadow-sm">
                            <View className="w-10 h-10 bg-white rounded-2xl border-2 border-black items-center justify-center mb-3">
                                <ShieldCheck size={20} color="#000" strokeWidth={2.5} />
                            </View>
                            <Text className="text-[15px] text-black/80 font-space-bold mb-1">SpO2</Text>
                            <View className="flex-row items-baseline">
                                <Text className="text-3xl text-black font-space-bold">98</Text>
                                <Text className="text-xs text-black/60 font-space-bold ml-1">%</Text>
                            </View>
                        </View>

                        <View className="flex-1 bg-white border-2 border-black rounded-[28px] p-5 shadow-sm">
                            <View className="w-10 h-10 bg-[#D9AEF6] rounded-2xl border-2 border-black items-center justify-center mb-3">
                                <Moon size={20} color="#000" strokeWidth={2.5} />
                            </View>
                            <Text className="text-[15px] text-gray-500 font-space-bold mb-1">Giấc ngủ</Text>
                            <View className="flex-row items-baseline">
                                <Text className="text-3xl text-black font-space-bold">7</Text>
                                <Text className="text-xs text-gray-400 font-space-bold ml-1">giờ</Text>
                            </View>
                        </View>
                    </View>

                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
