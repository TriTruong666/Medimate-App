import { useLocalSearchParams, useRouter } from "expo-router";
import { XCircle } from "lucide-react-native";
import React from "react";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function PaymentCancelledScreen() {
    const router = useRouter();

    // Nhận orderCode để hiển thị mã đơn bị hủy
    const { orderCode } = useLocalSearchParams<{ orderCode: string }>();

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#FFF8F8", alignItems: "center", justifyContent: "center", padding: 32 }}>
            <View style={{ width: 80, height: 80, borderRadius: 24, backgroundColor: "#FEE2E2", borderWidth: 2, borderColor: "#000", alignItems: "center", justifyContent: "center", marginBottom: 24 }}>
                <XCircle size={44} color="#EF4444" strokeWidth={2} />
            </View>

            <Text style={{ fontFamily: "SpaceGrotesk_700Bold", fontSize: 28, color: "#000", textAlign: "center", lineHeight: 36, letterSpacing: -0.5, marginBottom: 8 }}>
                Đã hủy{"\n"}thanh toán
            </Text>

            <Text style={{ fontFamily: "SpaceGrotesk_500Medium", fontSize: 14, color: "#888", textAlign: "center", marginBottom: 40 }}>
                Đơn hàng #{orderCode} đã bị hủy.{"\n"}Bạn có thể thử lại bất cứ lúc nào.
            </Text>

            <Pressable
                onPress={() => {
                    // Dọn dẹp luồng màn hình hiện tại và về thẳng Home
                    router.dismissAll();
                    router.replace("/(manager)/(home)");
                }}
                style={{
                    borderWidth: 2, borderColor: "#000", borderRadius: 20, paddingHorizontal: 48, paddingVertical: 16,
                    backgroundColor: "#fff", shadowColor: "#000", shadowOffset: { width: 3, height: 3 },
                    shadowOpacity: 1, shadowRadius: 0, elevation: 3
                }}
            >
                <Text style={{ fontFamily: "SpaceGrotesk_700Bold", fontSize: 16, color: "#000", textTransform: "uppercase", letterSpacing: 1 }}>
                    Về Trang Chủ
                </Text>
            </Pressable>
        </SafeAreaView>
    );
}