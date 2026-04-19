import { createEmptyPrescription } from "@/apis/prescription.api";
import { useToast } from "@/stores/toastStore";
import { AntDesign } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { FileText } from "lucide-react-native";
import React, { useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AddEmptyPrescriptionScreen() {
    const { memberId } = useLocalSearchParams<{ memberId: string }>();
    const toast = useToast();
    const [isPending, setIsPending] = useState(false);

    const handleCreate = async () => {
        if (!memberId) return;
        setIsPending(true);
        try {
            const res = await createEmptyPrescription(memberId);
            if (res.success) {
                toast.success("Đã tạo đơn", "Đơn trống đã được tạo. Mở đơn để bổ sung thuốc.");
                router.back();
            } else {
                toast.error("Lỗi", res.message || "Không thể tạo đơn thuốc.");
            }
        } catch {
            toast.error("Lỗi", "Đã xảy ra lỗi khi tạo đơn.");
        } finally {
            setIsPending(false);
        }
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#FFFBEB" }} edges={["top"]}>
            {/* Header */}
            <View style={{ paddingHorizontal: 24, paddingVertical: 16, flexDirection: "row", alignItems: "center" }}>
                <Pressable
                    onPress={() => router.back()}
                    style={{ width: 48, height: 48, backgroundColor: "#fff", borderWidth: 2, borderColor: "#000", borderRadius: 16, alignItems: "center", justifyContent: "center" }}
                >
                    <AntDesign name="arrow-left" size={24} color="black" />
                </Pressable>
            </View>

            {/* Content */}
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 28 }}>

                {/* Icon */}
                <View style={{ width: 96, height: 96, backgroundColor: "#FDE68A", borderWidth: 3, borderColor: "#000", borderRadius: 28, alignItems: "center", justifyContent: "center", marginBottom: 28, shadowColor: "#000", shadowOffset: { width: 4, height: 4 }, shadowOpacity: 1, shadowRadius: 0, elevation: 4 }}>
                    <FileText size={44} color="#000" strokeWidth={2} />
                </View>

                {/* Title */}
                <Text style={{ fontFamily: "SpaceGrotesk_700Bold", fontSize: 28, color: "#000", textAlign: "center", marginBottom: 12, letterSpacing: -0.5 }}>
                    Đơn ngoài bệnh viện
                </Text>
                <Text style={{ fontFamily: "SpaceGrotesk_500Medium", fontSize: 14, color: "#6B7280", textAlign: "center", lineHeight: 22, marginBottom: 48, paddingHorizontal: 8 }}>
                    Hệ thống sẽ tạo ngay một đơn trống với mã tự động.{"\n"}
                    Bạn có thể thêm thuốc vào đơn sau khi tạo xong.
                </Text>

                {/* Info chips */}
                <View style={{ flexDirection: "row", gap: 10, marginBottom: 48, flexWrap: "wrap", justifyContent: "center" }}>
                    {[
                        { emoji: "🏪", label: "Nhà thuốc / Phòng khám tư" },
                        { emoji: "✅", label: "Bác sĩ đã xác nhận" },
                        { emoji: "💊", label: "Thêm thuốc sau" },
                    ].map((chip) => (
                        <View key={chip.label} style={{ flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "#fff", borderWidth: 2, borderColor: "#000", borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8 }}>
                            <Text style={{ fontSize: 14 }}>{chip.emoji}</Text>
                            <Text style={{ fontFamily: "SpaceGrotesk_600SemiBold", fontSize: 12, color: "#000" }}>{chip.label}</Text>
                        </View>
                    ))}
                </View>

                {/* CTA Button */}
                <Pressable
                    onPress={handleCreate}
                    disabled={isPending}
                    className={`w-full bg-[#F9F6FC] py-5 rounded-[24px] border-2 border-black flex-row items-center justify-center gap-x-2 shadow-md active:translate-y-0.5
                        } ${isPending ? "opacity-70" : ""}`}
                >
                    {isPending ? (
                        <ActivityIndicator color="#000" />
                    ) : (
                        <Text style={{ fontFamily: "SpaceGrotesk_700Bold", fontSize: 18, color: "#000", textTransform: "uppercase", letterSpacing: 1 }}>
                            ✦  Tạo đơn ngay
                        </Text>
                    )}
                </Pressable>

                <Text style={{ fontFamily: "SpaceGrotesk_500Medium", fontSize: 11, color: "#9CA3AF", textAlign: "center", marginTop: 16 }}>
                    Mã đơn sẽ được tạo tự động theo thời gian
                </Text>
            </View>
        </SafeAreaView>
    );
}
