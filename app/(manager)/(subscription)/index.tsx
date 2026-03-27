import { useRouter } from "expo-router";
import {
    ArrowLeft,
    Check,
    Clock,
    Crown,
    Heart,
    Shield,
    Sparkles,
    Star,
    Users,
    Zap,
} from "lucide-react-native";
import React, { useState } from "react";
import {
    Dimensions,
    Image,
    Pressable,
    ScrollView,
    Text,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { usePopup } from "../../../stores/popupStore";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// ─── Mock Data ───────────────────────────────────────────────
const PLANS = [
    {
        id: "medimate",
        name: "Medimate",
        badge: "PHỔ BIẾN",
        price: "39.000đ",
        priceNote: "/ tháng",
        color: "#A3E6A1",
        badgeTextColor: "#000",
        isPopular: true,
        features: [
            { icon: Users, text: "Tối đa 10 thành viên", included: true },
            { icon: Clock, text: "Nhắc nhở uống thuốc cơ bản", included: true },
            { icon: Heart, text: "Theo dõi lịch sử chi tiết", included: true },
            { icon: Shield, text: "Quản lý 50 đơn thuốc", included: true },
            { icon: Sparkles, text: "Nhắc nhở AI một phần", included: true },
            { icon: Zap, text: "Báo cáo sức khỏe tuần", included: true },
            { icon: Star, text: "Hỗ trợ 24/7", included: false },
        ],
    },
    {
        id: "premium",
        name: "Premium",
        badge: "CAO CẤP",
        price: "89.000đ",
        priceNote: "/ tháng",
        color: "#FFD700",
        badgeTextColor: "#000",
        isPopular: false,
        features: [
            { icon: Users, text: "Không giới hạn thành viên", included: true },
            { icon: Clock, text: "Nhắc nhở đa kênh VIP", included: true },
            { icon: Heart, text: "Theo dõi lịch sử trọn đời", included: true },
            { icon: Shield, text: "Không giới hạn đơn thuốc", included: true },
            { icon: Sparkles, text: "AI Assistant chuyên sâu", included: true },
            { icon: Zap, text: "Báo cáo sức khỏe phân tích sâu", included: true },
            { icon: Star, text: "Hỗ trợ chuyên gia ưu tiên 24/7", included: true },
        ],
    },
];

// ─── 3D Pill Assets ──────────────────────────────────────────
const PILL_IMAGES = {
    green: require("../../../assets/images/pills/pill-green.png"),
    purple: require("../../../assets/images/pills/pill-purple.png"),
    yellow: require("../../../assets/images/pills/pill-yellow.png"),
    orange: require("../../../assets/images/pills/pill-orange.png"),
    blue: require("../../../assets/images/pills/pill-blue.png"),
};

export default function SubscriptionScreen() {
    const router = useRouter();
    const popup = usePopup();
    const [selectedPlan, setSelectedPlan] = useState("medimate");

    const currentPlan = PLANS.find((p) => p.id === selectedPlan)!;

    return (
        <SafeAreaView className="flex-1 bg-[#F9F6FC]" edges={["top"]}>
            <ScrollView
                className="flex-1"
                contentContainerStyle={{ paddingBottom: 40 }}
                showsVerticalScrollIndicator={false}
            >
                {/* ═══════════════════════════════════════════════
                    HERO SECTION - Floating 3D Pills (RESTORED)
                ═══════════════════════════════════════════════ */}
                <View className="relative" style={{ height: 380 }}>
                    {/* Gradient-like background layers */}
                    <View
                        className="absolute inset-0"
                        style={{
                            backgroundColor: "#F9F6FC",
                        }}
                    />
                    {/* Soft radial glow */}
                    <View
                        className="absolute rounded-full"
                        style={{
                            width: 300,
                            height: 300,
                            backgroundColor: "#D9AEF6",
                            opacity: 0.15,
                            top: 40,
                            left: SCREEN_WIDTH / 2 - 150,
                        }}
                    />

                    {/* Back Button */}
                    <View className="absolute top-4 left-5 z-10">
                        <Pressable
                            onPress={() => router.back()}
                            className="w-12 h-12 bg-white border-2 border-black rounded-2xl items-center justify-center shadow-sm active:bg-gray-50"
                        >
                            <ArrowLeft size={24} color="#000" strokeWidth={2.5} />
                        </Pressable>
                    </View>

                    {/* 3D Pill: Top Center */}
                    <Image
                        source={PILL_IMAGES.purple}
                        style={{
                            width: 90,
                            height: 90,
                            position: "absolute",
                            top: 20,
                            left: SCREEN_WIDTH / 2 - 20,
                            transform: [{ rotate: "-15deg" }],
                        }}
                        resizeMode="contain"
                    />

                    {/* 3D Pill: Top Left */}
                    <Image
                        source={PILL_IMAGES.green}
                        style={{
                            width: 75,
                            height: 75,
                            position: "absolute",
                            top: 80,
                            left: 20,
                            transform: [{ rotate: "25deg" }],
                        }}
                        resizeMode="contain"
                    />

                    {/* 3D Pill: Top Right */}
                    <Image
                        source={PILL_IMAGES.yellow}
                        style={{
                            width: 70,
                            height: 70,
                            position: "absolute",
                            top: 60,
                            right: 30,
                            transform: [{ rotate: "-30deg" }],
                        }}
                        resizeMode="contain"
                    />

                    {/* 3D Pill: Mid Left */}
                    <Image
                        source={PILL_IMAGES.orange}
                        style={{
                            width: 65,
                            height: 65,
                            position: "absolute",
                            top: 200,
                            left: 40,
                            transform: [{ rotate: "45deg" }],
                        }}
                        resizeMode="contain"
                    />

                    {/* 3D Pill: Mid Right */}
                    <Image
                        source={PILL_IMAGES.blue}
                        style={{
                            width: 80,
                            height: 80,
                            position: "absolute",
                            top: 220,
                            right: 25,
                            transform: [{ rotate: "-20deg" }],
                        }}
                        resizeMode="contain"
                    />

                    {/* Hero Text Content */}
                    <View className="absolute items-center" style={{ top: 130, left: 0, right: 0 }}>
                        <Text className="text-4xl font-space-bold text-black tracking-tighter text-center">
                            MEDIMATE
                        </Text>
                        <View className="bg-black px-5 py-1.5 rounded-full mt-2">
                            <Text className="text-white font-space-bold text-sm uppercase tracking-widest">
                                Premium
                            </Text>
                        </View>
                        <Text className="text-base font-space-medium text-black/50 mt-4 text-center px-10 leading-5">
                            Nâng tầm việc chăm sóc sức khỏe cho cả gia đình bạn
                        </Text>
                    </View>
                </View>

                {/* ═══════════════════════════════════════════════
                    PLAN SELECTOR TABS
                ═══════════════════════════════════════════════ */}
                <View className="px-5 mb-6">
                    <View className="flex-row bg-white border-2 border-black rounded-[20px] p-1.5 shadow-sm">
                        {PLANS.map((plan) => {
                            const isSelected = selectedPlan === plan.id;

                            return (
                                <Pressable
                                    key={plan.id}
                                    onPress={() => setSelectedPlan(plan.id)}
                                    className="flex-1 relative"
                                >
                                    <View
                                        className="py-3.5 rounded-2xl items-center justify-center"
                                        style={{
                                            backgroundColor: isSelected ? plan.color : "transparent",
                                            borderWidth: isSelected ? 2 : 0,
                                            borderColor: "black",
                                            // Hard shadow using elevation/shadow props for stability
                                            shadowColor: "#000",
                                            shadowOffset: isSelected ? { width: 3, height: 3 } : { width: 0, height: 0 },
                                            shadowOpacity: isSelected ? 1 : 0,
                                            shadowRadius: 0,
                                            elevation: isSelected ? 3 : 0,
                                        }}
                                    >
                                        {plan.isPopular && (
                                            <View className="absolute -top-2.5 right-3 bg-black px-2 py-0.5 rounded-md">
                                                <Text className="text-[9px] text-white font-space-bold uppercase text-center">
                                                    HOT
                                                </Text>
                                            </View>
                                        )}
                                        <Text
                                            style={{
                                                color: isSelected ? "#000" : "#A0A0A0",
                                            }}
                                            className="text-base font-space-bold uppercase tracking-wide"
                                        >
                                            {plan.name}
                                        </Text>
                                    </View>
                                </Pressable>
                            );
                        })}
                    </View>
                </View>

                {/* ═══════════════════════════════════════════════
                    PRICING CARD
                ═══════════════════════════════════════════════ */}
                <View className="px-5 mb-6">
                    <View
                        className="border-2 border-black rounded-[24px] p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden"
                        style={{ backgroundColor: currentPlan.color }}
                    >
                        {/* Decorative Crown for Premium */}
                        {currentPlan.id === "premium" && (
                            <View className="absolute -right-5 -top-5 opacity-10">
                                <Crown size={130} color="#000" />
                            </View>
                        )}

                        <View className="flex-row items-end gap-x-1">
                            <Text className="text-4xl font-space-bold text-black">
                                {currentPlan.price}
                            </Text>
                            <Text className="text-base font-space-medium text-black/60 pb-1">
                                {currentPlan.priceNote}
                            </Text>
                        </View>
                        <View className="flex-row items-center mt-3 gap-x-2">
                            <View className="bg-black px-3 py-1 rounded-lg">
                                <Text className="text-white font-space-bold text-[11px] uppercase tracking-wider">
                                    {currentPlan.badge}
                                </Text>
                            </View>
                            <Text className="text-sm font-space-medium text-black/60">
                                {currentPlan.id === "premium"
                                    ? "Hủy bất cứ lúc nào"
                                    : "Không cần thẻ"}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* ═══════════════════════════════════════════════
                    FEATURES LIST
                ═══════════════════════════════════════════════ */}
                <View className="px-5 mb-8">
                    {/* Section Title */}
                    <View className="flex-row items-center mb-4">
                        <Text className="text-xs font-space-bold text-gray-500 uppercase tracking-[2px]">
                            Tính năng bao gồm
                        </Text>
                        <View className="flex-1 h-[2px] bg-black/5 ml-3 rounded-full" />
                    </View>

                    {/* Feature Items */}
                    <View className="bg-white border-2 border-black rounded-[24px] overflow-hidden shadow-sm">
                        {currentPlan.features.map((feature, index) => {
                            const IconComp = feature.icon;
                            return (
                                <View
                                    key={feature.text}
                                    className={`flex-row items-center px-5 py-4 ${index < currentPlan.features.length - 1
                                        ? "border-b-2 border-black/5"
                                        : ""
                                        }`}
                                >
                                    <View
                                        className={`w-10 h-10 rounded-xl items-center justify-center border-2 mr-4 ${feature.included
                                            ? "bg-[#A3E6A1] border-black"
                                            : "bg-gray-100 border-black/10"
                                            }`}
                                    >
                                        {feature.included ? (
                                            <Check
                                                size={20}
                                                color="#000"
                                                strokeWidth={3}
                                            />
                                        ) : (
                                            <IconComp
                                                size={18}
                                                color="#BFBFBF"
                                                strokeWidth={2}
                                            />
                                        )}
                                    </View>
                                    <Text
                                        className={`flex-1 text-[15px] font-space-bold ${feature.included
                                            ? "text-black"
                                            : "text-gray-300 line-through"
                                            }`}
                                    >
                                        {feature.text}
                                    </Text>
                                    {feature.included && currentPlan.id === "premium" && (
                                        <Sparkles size={14} color="#FFD700" strokeWidth={2.5} />
                                    )}
                                </View>
                            );
                        })}
                    </View>
                </View>

                {/* ═══════════════════════════════════════════════
                    CTA BUTTONS
                ═══════════════════════════════════════════════ */}
                <View className="px-5">
                    <Pressable
                        className="border-2 border-black rounded-[24px] py-5 items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
                        style={{
                            backgroundColor: currentPlan.color === "#FFD700" ? "#000" : "#000",
                        }}
                        onPress={() => {
                            popup.open({
                                type: 'checkout',
                                data: {
                                    id: currentPlan.id,
                                    name: currentPlan.name,
                                    price: currentPlan.price,
                                    priceNote: currentPlan.priceNote,
                                    color: currentPlan.color,
                                    badge: currentPlan.badge,
                                },
                                onConfirm: () => {
                                    // Handle successful checkout
                                },
                            });
                        }}
                    >
                        <View className="flex-row items-center gap-x-2">
                            {currentPlan.id === "premium" ? (
                                <Crown size={22} color="#FFD700" strokeWidth={2.5} />
                            ) : (
                                <Star size={20} color="#A3E6A1" strokeWidth={2.5} />
                            )}
                            <Text className="text-white font-space-bold text-lg uppercase tracking-wider">
                                {currentPlan.id === "premium" ? "Đăng ký Premium" : "Đăng ký Medimate"}
                            </Text>
                        </View>
                    </Pressable>

                    <View className="items-center mt-6">
                        <Text className="text-[12px] font-space-medium text-black/30 text-center px-10 leading-4">
                            Đăng ký tự động gia hạn hàng tháng. Hủy bất kỳ lúc nào trong cài đặt App Store.
                        </Text>
                        <View className="flex-row mt-3 gap-x-4">
                            <Pressable>
                                <Text className="text-[12px] font-space-bold text-black/50 underline">Điều khoản</Text>
                            </Pressable>
                            <Pressable>
                                <Text className="text-[12px] font-space-bold text-black/50 underline">Bảo mật</Text>
                            </Pressable>
                            <Pressable>
                                <Text className="text-[12px] font-space-bold text-black/50 underline">Khôi phục</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
