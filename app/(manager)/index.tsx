import {
    Activity,
    Droplets,
    Moon,
    ShieldCheck,
    Wind,
    X
} from "lucide-react-native";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ManagerHeader from "../../components/ManagerHeader";

export default function HomeScreen() {
    return (
        <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
            <ManagerHeader name="Tri Truong" />

            <ScrollView
                className="flex-1 px-5"
                contentContainerStyle={{ paddingBottom: 100 }}
                showsVerticalScrollIndicator={false}
            >
                {/* Nhắc uống thuốc Banner */}
                <View className="bg-card-green/30 border border-card-green rounded-2xl px-4 py-3 flex-row items-center mb-3">
                    <View className="w-8 h-8 rounded-full bg-card-green items-center justify-center mr-3">
                        <Activity size={14} color="#000" strokeWidth={2} />
                    </View>
                    <Text className="flex-1 text-xs text-black font-space-medium">
                        Đến giờ uống thuốc rồi.
                    </Text>
                    <Pressable className="p-1">
                        <X size={14} color="#999" strokeWidth={1.5} />
                    </Pressable>
                </View>

                {/* Bento Grid */}
                <View className="gap-2.5">

                    {/* Row 1: Giấc ngủ */}
                    <View className="bg-white border border-gray-200 rounded-2xl p-4">
                        <View className="flex-row items-center justify-between mb-3">
                            <Text className="text-xs text-gray-400 font-space-regular">Giấc ngủ</Text>
                            <Text className="text-[10px] text-gray-300 font-space-regular">25 tháng 12, 2024</Text>
                        </View>
                        <View className="flex-row items-end">
                            <Text className="text-3xl text-black font-space-bold">5</Text>
                            <Text className="text-[10px] text-gray-400 font-space-regular ml-1 mb-1.5">giờ</Text>
                            <Text className="text-3xl text-black font-space-bold ml-3">42</Text>
                            <Text className="text-[10px] text-gray-400 font-space-regular ml-1 mb-1.5">phút</Text>
                            {/* Chart placeholder */}
                            <View className="flex-1 ml-4 flex-row items-end justify-end gap-[3px] h-8">
                                {[12, 20, 8, 16, 24, 14, 18, 10, 22, 16, 20, 14].map((h, i) => (
                                    <View
                                        key={i}
                                        className="w-[4px] rounded-full bg-card-purple/40"
                                        style={{ height: h }}
                                    />
                                ))}
                            </View>
                        </View>
                    </View>

                    {/* Section Title: Chỉ số sức khỏe */}
                    <View className="flex-row items-center justify-between mt-1">
                        <Text className="text-lg text-black font-space-bold">Chỉ số sức khỏe</Text>
                        <View className="flex-row gap-2">
                            <Pressable className="w-8 h-8 rounded-full bg-gray-100 items-center justify-center">
                                <Moon size={14} color="#000" strokeWidth={1.5} />
                            </Pressable>
                            <Pressable className="w-8 h-8 rounded-full bg-gray-100 items-center justify-center">
                                <Wind size={14} color="#000" strokeWidth={1.5} />
                            </Pressable>
                        </View>
                    </View>

                    {/* Row 2: Huyết áp (large) */}
                    <View className="bg-white border border-gray-200 rounded-2xl p-4">
                        <Text className="text-xs text-gray-400 font-space-regular mb-2">Huyết áp</Text>
                        <View className="flex-row items-end justify-between">
                            <View className="flex-row items-end">
                                <Text className="text-4xl text-black font-space-bold">120</Text>
                                <Text className="text-lg text-gray-300 font-space-light mb-1">/80</Text>
                            </View>
                            <Droplets size={40} color="#87CEFA" strokeWidth={1} />
                        </View>
                    </View>

                    {/* Row 3: Nhịp tim + Đường huyết */}
                    <View className="flex-row gap-2.5">
                        <View className="flex-1 bg-white border border-gray-200 rounded-2xl p-4">
                            <Text className="text-xs text-gray-400 font-space-regular mb-2">Nhịp tim</Text>
                            <View className="flex-row items-end">
                                <Text className="text-2xl text-red-400 font-space-bold">106</Text>
                                <Text className="text-[10px] text-gray-400 font-space-regular ml-1 mb-1">BPM</Text>
                            </View>
                            {/* Sparkline placeholder */}
                            <View className="flex-row items-end gap-[2px] mt-2 h-4">
                                {[6, 10, 4, 12, 8, 14, 6, 10, 8, 12, 6, 10, 14, 8].map((h, i) => (
                                    <View
                                        key={i}
                                        className="w-[3px] rounded-full bg-red-200"
                                        style={{ height: h }}
                                    />
                                ))}
                            </View>
                        </View>

                        <View className="flex-1 bg-white border border-gray-200 rounded-2xl p-4">
                            <Text className="text-xs text-gray-400 font-space-regular mb-2">Đường huyết</Text>
                            <View className="flex-row items-end">
                                <Text className="text-2xl text-black font-space-bold">115</Text>
                                <Text className="text-[10px] text-gray-400 font-space-regular ml-1 mb-1">mg/dl</Text>
                            </View>
                        </View>
                    </View>

                    {/* Row 4: SpO2 full width */}
                    <View className="bg-white border border-gray-200 rounded-2xl p-4 flex-row items-center justify-between">
                        <View>
                            <Text className="text-xs text-gray-400 font-space-regular mb-1">SpO2</Text>
                            <View className="flex-row items-end">
                                <Text className="text-2xl text-black font-space-bold">98</Text>
                                <Text className="text-[10px] text-gray-400 font-space-regular ml-1 mb-1">%</Text>
                            </View>
                        </View>
                        <ShieldCheck size={28} color="#A3E6A1" strokeWidth={1.5} />
                    </View>

                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
