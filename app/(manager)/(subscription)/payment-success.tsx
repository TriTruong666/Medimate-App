import { useLocalSearchParams, useRouter } from "expo-router";
import { CheckCircle } from "lucide-react-native";
import React from "react";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function PaymentSuccessScreen() {
    const router = useRouter();

    // Nhận params được gửi sang từ trang webview
    const { planName, familyName } = useLocalSearchParams<{ planName: string; familyName: string }>();

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#F0FDF4", alignItems: "center", justifyContent: "center", padding: 32 }}>
            <View style={{ width: 80, height: 80, borderRadius: 24, backgroundColor: "#DCFCE7", borderWidth: 2, borderColor: "#000", alignItems: "center", justifyContent: "center", marginBottom: 24 }}>
                <CheckCircle size={44} color="#22C55E" strokeWidth={2} />
            </View>

            <Text style={{ fontFamily: "SpaceGrotesk_700Bold", fontSize: 28, color: "#000", textAlign: "center", lineHeight: 36, letterSpacing: -0.5, marginBottom: 8 }}>
                Thanh toán{"\n"}thành công!
            </Text>

            <Text style={{ fontFamily: "SpaceGrotesk_500Medium", fontSize: 14, color: "#555", textAlign: "center", marginBottom: 6 }}>
                Gói <Text style={{ color: "#000", fontFamily: "SpaceGrotesk_700Bold" }}>{planName}</Text>
                {familyName ? ` cho gia đình\n${familyName}` : ""} đã được kích hoạt.
            </Text>

            {/* <Text style={{ fontFamily: "SpaceGrotesk_500Medium", fontSize: 12, color: "#AAA", textAlign: "center", marginBottom: 40 }}>
                Hóa đơn sẽ được gửi qua email sớm.
            </Text> */}

            <Pressable
                onPress={() => {
                    // Nhảy về Trang Chủ (không dùng dismissAll)
                    router.replace("/(manager)/(home)");
                }}
                style={{
                    backgroundColor: "#000", borderRadius: 20, paddingHorizontal: 48, paddingVertical: 16,
                    shadowColor: "#000", shadowOffset: { width: 3, height: 3 }, shadowOpacity: 1, shadowRadius: 0, elevation: 3
                }}
            >
                <Text style={{ fontFamily: "SpaceGrotesk_700Bold", fontSize: 16, color: "#fff", textTransform: "uppercase", letterSpacing: 1 }}>
                    Hoàn tất
                </Text>
            </Pressable>
        </SafeAreaView>
    );
}