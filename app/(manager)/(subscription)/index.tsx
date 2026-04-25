import { getFamilies, getSubscription } from "@/apis/family.api";
import { getMembershipPackages } from "@/apis/package.api";
import { FamilyData, SubscriptionData } from "@/types/Family";
import { MembershipPackage } from "@/types/Package";
import { useFocusEffect, useRouter } from "expo-router";
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
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { usePopup } from "../../../stores/popupStore";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const PILL_IMAGES = {
  green: require("../../../assets/images/pills/pill-green.jpg"),
  purple: require("../../../assets/images/pills/pill-purple.jpg"),
  yellow: require("../../../assets/images/pills/pill-yellow.jpg"),
  orange: require("../../../assets/images/pills/pill-orange.jpg"),
  blue: require("../../../assets/images/pills/pill-blue.jpg"),
};

const PLAN_COLORS = ["#A3E6A1", "#FFD700", "#A8D8EA", "#FFB3BA"];

function formatPrice(price: number, currency: string): string {
  if (currency === "VND") return price.toLocaleString("vi-VN") + "đ";
  return price.toLocaleString() + " " + currency;
}

function buildFeatures(pkg: MembershipPackage) {
  return [
    {
      icon: Users,
      text: `Tối đa ${pkg.memberLimit === 0 ? "không giới hạn" : pkg.memberLimit} thành viên`,
      included: true,
    },
    { icon: Clock, text: "Nhắc nhở uống thuốc", included: true },
    { icon: Heart, text: "Theo dõi lịch sử chi tiết", included: true },
    {
      icon: Shield,
      text: `${pkg.ocrLimit === 0 ? "Không giới hạn" : pkg.ocrLimit + " lượt"} quét đơn thuốc (OCR)`,
      included: true,
    },
    {
      icon: Zap,
      text: "Báo cáo sức khỏe nâng cao",
      included: pkg.memberLimit === 0 || pkg.memberLimit > 5,
    },
    {
      icon: Star,
      text: "Hỗ trợ ưu tiên 24/7",
      included: pkg.memberLimit === 0,
    },
  ];
}

// Kiểu dữ liệu gom chung Gia đình + Gói đăng ký hiện tại của họ
type FamilySubscriptionPair = {
  family: FamilyData;
  subscription: SubscriptionData;
};

export default function SubscriptionScreen() {
  const router = useRouter();
  const popup = usePopup();

  const [packages, setPackages] = useState<MembershipPackage[]>([]);
  const [activeFamilySubs, setActiveFamilySubs] = useState<
    FamilySubscriptionPair[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(0);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const loadData = async () => {
        // Tải song song danh sách gói và danh sách gia đình
        const [pkgRes, famRes] = await Promise.all([
          getMembershipPackages(),
          getFamilies(),
        ]);

        if (!isActive) return;

        // 1. Set Packages
        if (pkgRes.success && pkgRes.data) {
          const activePkgs = pkgRes.data.filter((p) => p.isActive);
          setPackages(activePkgs);
        }

        // 2. Lấy danh sách các gia đình và check gói của TỪNG gia đình
        if (famRes.success && famRes.data) {
          const sharedFamilies = famRes.data.filter((f) => f.type === "Shared");

          // Tạo mảng Promise để gọi API getSubscription cho tất cả gia đình cùng lúc
          const subPromises = sharedFamilies.map(async (family) => {
            const subRes = await getSubscription(family.familyId);
            return { family, subRes };
          });

          const subResults = await Promise.all(subPromises);

          // Lọc ra những gia đình đang có gói Active
          const activeSubsList = subResults
            .filter(
              (item) =>
                item.subRes.success &&
                item.subRes.data &&
                item.subRes.data.status === "Active",
            )
            .map((item) => ({
              family: item.family,
              subscription: item.subRes.data!,
            }));

          if (isActive) {
            setActiveFamilySubs(activeSubsList);
          }
        }

        if (isActive) setLoading(false);
      };

      loadData();

      return () => {
        isActive = false;
      };
    }, []),
  );

  const currentPkg = packages[selectedIndex];
  const currentColor = PLAN_COLORS[selectedIndex % PLAN_COLORS.length];

  return (
    <SafeAreaView className="flex-1 bg-[#F9F6FC]" edges={["top"]}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ═══════ HERO ═══════ */}
        <View className="relative" style={{ height: 380 }}>
          <View
            className="absolute inset-0"
            style={{ backgroundColor: "#F9F6FC" }}
          />
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

          <View className="absolute top-4 left-5 z-10">
            <Pressable
              onPress={() => router.back()}
              className="w-12 h-12 bg-white border-2 border-black rounded-2xl items-center justify-center shadow-sm active:bg-gray-50"
            >
              <ArrowLeft size={24} color="#000" strokeWidth={2.5} />
            </Pressable>
          </View>

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

          <View
            className="absolute items-center"
            style={{ top: 130, left: 0, right: 0 }}
          >
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

        {/* ═══════ LOADING ═══════ */}
        {loading && (
          <View className="items-center py-16">
            <ActivityIndicator size="large" color="#000" />
            <Text className="mt-3 font-space-medium text-black/40 text-sm">
              Đang tải dữ liệu...
            </Text>
          </View>
        )}

        {!loading && packages.length === 0 && (
          <View className="items-center py-16 px-8">
            <Text className="font-space-bold text-black/60 text-center text-base">
              Không có gói dịch vụ nào hiện tại.
            </Text>
          </View>
        )}

        {!loading && packages.length > 0 && (
          <>
            {/* ═══════════════════════════════════════════════
                            DANH SÁCH GÓI ĐANG SỬ DỤNG (CỦA CÁC GIA ĐÌNH)
                        ═══════════════════════════════════════════════ */}
            {activeFamilySubs.length > 0 && (
              <View className="px-5 mb-8">
                <View className="flex-row items-center mb-4">
                  <Text className="text-xs font-space-bold text-gray-500 uppercase tracking-[2px]">
                    Gói gia đình đang dùng
                  </Text>
                  <View className="flex-1 h-[2px] bg-black/5 ml-3 rounded-full" />
                </View>

                <View className="gap-y-4">
                  {activeFamilySubs.map((item, index) => (
                    <View
                      key={item.family.familyId}
                      style={{
                        borderWidth: 2,
                        borderColor: "#000",
                        borderRadius: 20,
                        padding: 16,
                        backgroundColor: "#fff",
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 14,
                        shadowColor: "#000",
                        shadowOffset: { width: 3, height: 3 },
                        shadowOpacity: 1,
                        shadowRadius: 0,
                        elevation: 3,
                      }}
                    >
                      {/* Icon */}
                      <View
                        style={{
                          width: 48,
                          height: 48,
                          borderRadius: 14,
                          borderWidth: 2,
                          borderColor: "#000",
                          backgroundColor: "#F0FDF4",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Check size={24} color="#22C55E" strokeWidth={3} />
                      </View>

                      <View style={{ flex: 1 }}>
                        <Text
                          style={{
                            fontFamily: "SpaceGrotesk_500Medium",
                            fontSize: 11,
                            color: "#888",
                            textTransform: "uppercase",
                            letterSpacing: 1,
                          }}
                          numberOfLines={1}
                        >
                          GĐ · {item.family.familyName}
                        </Text>
                        <Text
                          style={{
                            fontFamily: "SpaceGrotesk_700Bold",
                            fontSize: 17,
                            color: "#000",
                            marginTop: 2,
                          }}
                        >
                          {item.subscription.packageName}
                        </Text>
                      </View>

                      {/* Remaining OCR stats */}
                      <View style={{ alignItems: "flex-end", gap: 4 }}>
                        <View
                          style={{
                            backgroundColor: "#F9F6FC",
                            borderWidth: 1.5,
                            borderColor: "#000",
                            borderRadius: 10,
                            paddingHorizontal: 8,
                            paddingVertical: 3,
                          }}
                        >
                          <Text
                            style={{
                              fontFamily: "SpaceGrotesk_700Bold",
                              fontSize: 10,
                              color: "#000",
                            }}
                          >
                            {item.subscription.remainingOcrCount}/
                            {item.subscription.ocrLimit} OCR
                          </Text>
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* ═══════ PLAN SELECTOR TABS ═══════ */}
            <View className="px-5 mb-6">
              <View className="flex-row items-center mb-4">
                <Text className="text-xs font-space-bold text-gray-500 uppercase tracking-[2px]">
                  Khám phá gói mới
                </Text>
                <View className="flex-1 h-[2px] bg-black/5 ml-3 rounded-full" />
              </View>
              <View className="flex-row bg-white border-2 border-black rounded-[20px] p-1.5 shadow-sm">
                {packages.map((pkg, idx) => {
                  const isSelected = selectedIndex === idx;
                  const color = PLAN_COLORS[idx % PLAN_COLORS.length];
                  const isFirstPaid = idx === 1; // Gắn mác HOT cho gói trả phí đầu tiên

                  return (
                    <Pressable
                      key={pkg.packageId}
                      onPress={() => setSelectedIndex(idx)}
                      className="flex-1 relative"
                    >
                      <View
                        className="py-3.5 rounded-2xl items-center justify-center"
                        style={{
                          backgroundColor: isSelected ? color : "transparent",
                          borderWidth: isSelected ? 2 : 0,
                          borderColor: "black",
                          shadowColor: "#000",
                          shadowOffset: isSelected
                            ? { width: 3, height: 3 }
                            : { width: 0, height: 0 },
                          shadowOpacity: isSelected ? 1 : 0,
                          shadowRadius: 0,
                          elevation: isSelected ? 3 : 0,
                        }}
                      >
                        {/* Badges */}
                        {isFirstPaid && (
                          <View
                            style={{
                              position: "absolute",
                              top: -10,
                              right: 4,
                              backgroundColor: "#000",
                              paddingHorizontal: 6,
                              paddingVertical: 2,
                              borderRadius: 6,
                            }}
                          >
                            <Text
                              style={{
                                fontFamily: "SpaceGrotesk_700Bold",
                                fontSize: 8,
                                color: "#fff",
                                textTransform: "uppercase",
                              }}
                            >
                              HOT
                            </Text>
                          </View>
                        )}
                        <Text
                          style={{ color: isSelected ? "#000" : "#A0A0A0" }}
                          className="text-base font-space-bold uppercase tracking-wide"
                          numberOfLines={1}
                        >
                          {pkg.packageName}
                        </Text>
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* ═══════ PRICING CARD ═══════ */}
            <View className="px-5 mb-6">
              <View
                className="border-2 border-black rounded-[24px] p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden"
                style={{ backgroundColor: currentColor }}
              >
                {selectedIndex > 0 && (
                  <View className="absolute -right-5 -top-5 opacity-10">
                    <Crown size={130} color="#000" />
                  </View>
                )}

                <View className="flex-row items-end gap-x-1">
                  <Text className="text-4xl font-space-bold text-black">
                    {formatPrice(currentPkg.price, currentPkg.currency)}
                  </Text>
                  <Text className="text-base font-space-medium text-black/60 pb-1">
                    / {currentPkg.durationDays} ngày
                  </Text>
                </View>

                <View
                  className="flex-row items-center mt-3 gap-x-2 flex-wrap"
                  style={{ gap: 8 }}
                >
                  <View className="bg-black px-3 py-1 rounded-lg">
                    <Text className="text-white font-space-bold text-[11px] uppercase tracking-wider">
                      {currentPkg.activeSubscriberCount > 0
                        ? `${currentPkg.activeSubscriberCount} đang dùng`
                        : "MỚI"}
                    </Text>
                  </View>

                  <Text className="text-sm font-space-medium text-black/60">
                    {currentPkg.price === 0
                      ? "Miễn phí mãi mãi"
                      : currentPkg.durationDays >= 365
                        ? "Hủy bất cứ lúc nào"
                        : "Không cần thẻ tín dụng"}
                  </Text>
                </View>

                {currentPkg.description ? (
                  <Text className="mt-3 text-sm font-space-medium text-black/70 leading-5">
                    {currentPkg.description}
                  </Text>
                ) : null}
              </View>
            </View>

            {/* ═══════ FEATURES ═══════ */}
            <View className="px-5 mb-8">
              <View className="flex-row items-center mb-4">
                <Text className="text-xs font-space-bold text-gray-500 uppercase tracking-[2px]">
                  Tính năng bao gồm
                </Text>
                <View className="flex-1 h-[2px] bg-black/5 ml-3 rounded-full" />
              </View>
              <View className="bg-white border-2 border-black rounded-[24px] overflow-hidden shadow-sm">
                {buildFeatures(currentPkg).map((feature, index, arr) => {
                  const IconComp = feature.icon;
                  return (
                    <View
                      key={index}
                      className={`flex-row items-center px-5 py-4 ${index < arr.length - 1 ? "border-b-2 border-black/5" : ""}`}
                    >
                      <View
                        className={`w-10 h-10 rounded-xl items-center justify-center border-2 mr-4 ${feature.included ? "bg-[#A3E6A1] border-black" : "bg-gray-100 border-black/10"}`}
                      >
                        {feature.included ? (
                          <Check size={20} color="#000" strokeWidth={3} />
                        ) : (
                          <IconComp size={18} color="#BFBFBF" strokeWidth={2} />
                        )}
                      </View>
                      <Text
                        className={`flex-1 text-[15px] font-space-bold ${feature.included ? "text-black" : "text-gray-300 line-through"}`}
                      >
                        {feature.text}
                      </Text>
                      {feature.included && selectedIndex > 0 && (
                        <Sparkles size={14} color="#FFD700" strokeWidth={2.5} />
                      )}
                    </View>
                  );
                })}
              </View>
            </View>

            {/* ═══════ CTA ═══════ */}
            <View className="px-5">
              {currentPkg.price === 0 ? (
                /* Gói Free -> Hiển thị nút trạng thái mặc định (không cho bấm) */
                <View
                  className="border-2 border-black/10 rounded-[24px] py-5 items-center justify-center"
                  style={{ backgroundColor: "#F3F4F6" }}
                >
                  <View className="flex-row items-center gap-x-2">
                    <Check size={20} color="#888" strokeWidth={3} />
                    <Text className="text-[#888] font-space-bold text-lg uppercase tracking-wider">
                      Gói mặc định
                    </Text>
                  </View>
                </View>
              ) : (
                /* Các gói trả phí -> Nút đăng ký bình thường */
                <Pressable
                  className="border-2 border-black rounded-[24px] py-5 items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
                  style={{ backgroundColor: "#000" }}
                  onPress={() => {
                    popup.open({
                      type: "checkout",
                      data: {
                        packageId: currentPkg.packageId,
                        name: currentPkg.packageName,
                        price: formatPrice(
                          currentPkg.price,
                          currentPkg.currency,
                        ),
                        priceNote: `/ ${currentPkg.durationDays} ngày`,
                        color: currentColor,
                        badge: "CAO CẤP",
                      },
                      onConfirm: () => {},
                    });
                  }}
                >
                  <View className="flex-row items-center gap-x-2">
                    <Crown size={22} color="#FFD700" strokeWidth={2.5} />
                    <Text className="text-white font-space-bold text-lg uppercase tracking-wider">
                      Đăng ký {currentPkg.packageName}
                    </Text>
                  </View>
                </Pressable>
              )}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
