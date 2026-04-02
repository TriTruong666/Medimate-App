import * as FileSystem from "expo-file-system/legacy";
import * as MediaLibrary from "expo-media-library";
import { getPaymentInfo } from "@/apis/payment.api";
import { useUpdatePaymentStatus } from "@/hooks/usePayment";
import { useUpdateTransactionStatus } from "@/hooks/useTransaction";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
    ArrowLeft,
    CheckCircle,
    Copy,
    Download,
    Globe,
    QrCode,
    XCircle,
} from "lucide-react-native";
import React, { useRef, useState, useCallback, useEffect } from "react";
import {
    ActivityIndicator,
    Alert,
    Clipboard,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import QRCode from "react-native-qrcode-svg";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView, WebViewNavigation } from "react-native-webview";

// ─── Intercept các scheme custom để tránh lỗi "Can't open url" ───
const HANDLED_SCHEMES = ["medimate://", "intent://", "kakao://"];

type Tab = "qr" | "web";
type PayResult = "success" | "cancelled" | null;

export default function PaymentWebViewScreen() {
    const router = useRouter();
    const { url, qrCode, planName, familyName, price, orderCode } =
        useLocalSearchParams<{
            url: string;
            qrCode: string;
            planName: string;
            familyName: string;
            price: string;
            orderCode: string;
        }>();

    const [tab, setTab] = useState<Tab>("qr");
    const [webLoading, setWebLoading] = useState(true);
    const [payResult, setPayResult] = useState<PayResult>(null);
    const [saving, setSaving] = useState(false);
    const [updatingStatus, setUpdatingStatus] = useState(false);

    const qrRef = useRef<any>(null);
    const { mutateAsync: updatePaymentStatus } = useUpdatePaymentStatus();
    const { mutateAsync: updateTransactionStatus } = useUpdateTransactionStatus();

    // ─── Gọi API cập nhật trạng thái Payment + Transaction ─────
    const syncPaymentStatus = useCallback(async (result: "success" | "cancelled") => {
        const orderCodeNum = Number(orderCode);
        if (!orderCodeNum) return;

        const apiStatus = result === "success" ? "SUCCESS" : "CANCELLED";
        setUpdatingStatus(true);

        try {
            // 1. Cập nhật trạng thái Payment
            await updatePaymentStatus({ orderCode: orderCodeNum, data: { status: apiStatus } });

            // 2. Lấy thông tin Payment để lấy transactionId
            const infoRes = await getPaymentInfo(orderCodeNum);
            if (infoRes.success && infoRes.data?.transactionId) {
                // 3. Cập nhật trạng thái Transaction
                await updateTransactionStatus({
                    transactionId: infoRes.data.transactionId,
                    data: { status: apiStatus },
                });
            }
        } catch (err) {
            // Không block UI nếu API lỗi — vẫn hiển thị kết quả cho user
            console.warn('[payment-webview] syncPaymentStatus error:', err);
        } finally {
            setUpdatingStatus(false);
            setPayResult(result);
        }
    }, [orderCode, updatePaymentStatus, updateTransactionStatus]);

    // ─── Tự động kiểm tra trạng thái thanh toán liên tục (Polling) ───
    useEffect(() => {
        if (payResult || updatingStatus) return;
        const orderCodeNum = Number(orderCode);
        if (!orderCodeNum) return;

        const interval = setInterval(async () => {
            try {
                const infoRes = await getPaymentInfo(orderCodeNum);
                if (infoRes.success && infoRes.data) {
                    const st = infoRes.data.status;
                    if (st === "PAID" || st === "SUCCESS") {
                        setPayResult("success");
                    } else if (st === "CANCELLED") {
                        setPayResult("cancelled");
                    }
                }
            } catch (error) {
                // Ignore polling errors
            }
        }, 5000);

        return () => clearInterval(interval);
    }, [orderCode, payResult, updatingStatus]);

    // ─── WebView: intercept custom scheme redirection ──────────
    // cancelUrl = 'medimate://payment/cancel'
    // returnUrl = 'medimate://payment/success'
    const isCancelUrl = (u: string) =>
        u.includes("/payment/cancel") ||
        u.includes("cancel=true") ||
        u.includes("status=CANCELLED");

    const isSuccessUrl = (u: string) =>
        u.includes("/payment/success") ||
        u.includes("status=PAID") ||
        u.includes("success=true") ||
        u.includes("payment_status=PAID");

    const handleShouldStartLoad = (request: { url: string }) => {
        const reqUrl = request.url;
        for (const scheme of HANDLED_SCHEMES) {
            if (reqUrl.startsWith(scheme)) {
                if (isCancelUrl(reqUrl)) {
                    syncPaymentStatus("cancelled");
                } else if (isSuccessUrl(reqUrl)) {
                    syncPaymentStatus("success");
                }
                return false; // Chặn WebView load URL này
            }
        }
        return true;
    };

    const handleWebNavChange = (nav: WebViewNavigation) => {
        const navUrl = nav.url ?? "";
        // Kiểm tra cả hai hướng success và cancel
        if (isSuccessUrl(navUrl)) {
            syncPaymentStatus("success");
        } else if (isCancelUrl(navUrl)) {
            syncPaymentStatus("cancelled");
        }
    };

    // ─── Lưu QR vào thư viện ảnh ──────────────────────────────
    const saveQR = async () => {
        if (!qrRef.current) return;
        setSaving(true);
        try {
            const { status } = await MediaLibrary.requestPermissionsAsync();
            if (status !== "granted") {
                Alert.alert("Thiếu quyền", "Vui lòng cấp quyền truy cập thư viện ảnh.");
                setSaving(false);
                return;
            }

            // Chụp SVG thành base64 PNG
            qrRef.current.toDataURL(async (data: string) => {
                try {
                    const path = FileSystem.cacheDirectory + `qr_${orderCode}.png`;
                    await FileSystem.writeAsStringAsync(path, data, {
                        encoding: FileSystem.EncodingType.Base64,
                    });
                    const asset = await MediaLibrary.createAssetAsync(path);
                    await MediaLibrary.createAlbumAsync("Medimate", asset, false);
                    Alert.alert("✅ Đã lưu", "Ảnh QR đã được lưu vào thư viện ảnh.");
                } catch (e) {
                    Alert.alert("Lỗi", "Không thể lưu ảnh QR.");
                } finally {
                    setSaving(false);
                }
            });
        } catch (e) {
            setSaving(false);
            Alert.alert("Lỗi", "Không thể lưu ảnh QR.");
        }
    };

    const copyUrl = () => {
        Clipboard.setString(url ?? "");
        Alert.alert("✓ Đã sao chép", "Link thanh toán đã được sao chép.");
    };

    // ─── UPDATING STATUS OVERLAY ───────────────────────────────
    if (updatingStatus) {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: "#F9F6FC", alignItems: "center", justifyContent: "center", padding: 32 }}>
                <ActivityIndicator size="large" color="#000" />
                <Text style={{ fontFamily: "SpaceGrotesk_700Bold", fontSize: 16, color: "#000", marginTop: 20, textAlign: "center" }}>
                    Đang cập nhật trạng thái...{"\n"}
                </Text>
                <Text style={{ fontFamily: "SpaceGrotesk_500Medium", fontSize: 12, color: "#888", textAlign: "center", marginTop: 4 }}>
                    Vui lòng không tắt ứng dụng
                </Text>
            </SafeAreaView>
        );
    }

    // ─── SUCCESS SCREEN ────────────────────────────────────────
    if (payResult === "success") {
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
                <Text style={{ fontFamily: "SpaceGrotesk_500Medium", fontSize: 12, color: "#AAA", textAlign: "center", marginBottom: 40 }}>
                    Hóa đơn sẽ được gửi qua email sớm.
                </Text>
                <Pressable
                    onPress={() => {
                        router.dismissAll();
                        router.push("/(manager)/(home)");
                    }}
                    style={{ backgroundColor: "#000", borderRadius: 20, paddingHorizontal: 48, paddingVertical: 16, shadowColor: "#000", shadowOffset: { width: 3, height: 3 }, shadowOpacity: 1, shadowRadius: 0, elevation: 3 }}
                >
                    <Text style={{ fontFamily: "SpaceGrotesk_700Bold", fontSize: 16, color: "#fff", textTransform: "uppercase", letterSpacing: 1 }}>Hoàn tất</Text>
                </Pressable>
            </SafeAreaView>
        );
    }

    // ─── CANCELLED SCREEN ──────────────────────────────────────
    if (payResult === "cancelled") {
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
                        router.dismissAll();
                        router.push("/(manager)/(home)");
                    }}
                    style={{ borderWidth: 2, borderColor: "#000", borderRadius: 20, paddingHorizontal: 48, paddingVertical: 16, backgroundColor: "#fff", shadowColor: "#000", shadowOffset: { width: 3, height: 3 }, shadowOpacity: 1, shadowRadius: 0, elevation: 3 }}
                >
                    <Text style={{ fontFamily: "SpaceGrotesk_700Bold", fontSize: 16, color: "#000", textTransform: "uppercase", letterSpacing: 1 }}>Quay lại Trang Chủ</Text>
                </Pressable>
            </SafeAreaView>
        );
    }

    // ─── MAIN PAYMENT SCREEN ───────────────────────────────────
    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#F9F6FC" }} edges={["top"]}>
            {/* ── Header ── */}
            <View style={{ paddingHorizontal: 16, paddingVertical: 12, backgroundColor: "#fff", borderBottomWidth: 2, borderBottomColor: "#000", flexDirection: "row", alignItems: "center", gap: 12 }}>
                <Pressable
                    onPress={() => router.back()}
                    style={{ width: 44, height: 44, borderRadius: 14, borderWidth: 2, borderColor: "#000", backgroundColor: "#FFF", alignItems: "center", justifyContent: "center" }}
                >
                    <ArrowLeft size={22} color="#000" strokeWidth={2.5} />
                </Pressable>
                <View style={{ flex: 1 }}>
                    <Text style={{ fontFamily: "SpaceGrotesk_700Bold", fontSize: 16, color: "#000" }}>
                        Thanh toán · {planName}
                    </Text>
                    <Text style={{ fontFamily: "SpaceGrotesk_500Medium", fontSize: 11, color: "#888", marginTop: 1 }}>
                        Đơn #{orderCode}  ·  {price}
                    </Text>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                    <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: "#22C55E" }} />
                    <Text style={{ fontFamily: "SpaceGrotesk_700Bold", fontSize: 10, color: "#22C55E" }}>SECURE</Text>
                </View>
            </View>

            {/* ── Tab bar ── */}
            <View style={{ flexDirection: "row", paddingHorizontal: 16, paddingVertical: 12, gap: 10 }}>
                {([
                    { key: "qr", label: "Mã QR", icon: QrCode },
                    { key: "web", label: "Cổng Web", icon: Globe },
                ] as { key: Tab; label: string; icon: any }[]).map(({ key, label, icon: Icon }) => (
                    <Pressable
                        key={key}
                        onPress={() => setTab(key)}
                        style={{
                            flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center",
                            gap: 6, paddingVertical: 10, borderRadius: 14, borderWidth: 2,
                            borderColor: tab === key ? "#000" : "#E0E0E0",
                            backgroundColor: tab === key ? "#000" : "#fff",
                            shadowColor: "#000",
                            shadowOffset: tab === key ? { width: 3, height: 3 } : { width: 0, height: 0 },
                            shadowOpacity: tab === key ? 1 : 0, shadowRadius: 0,
                            elevation: tab === key ? 3 : 0,
                        }}
                    >
                        <Icon size={16} color={tab === key ? "#fff" : "#888"} strokeWidth={2.5} />
                        <Text style={{ fontFamily: "SpaceGrotesk_700Bold", fontSize: 13, color: tab === key ? "#fff" : "#888" }}>
                            {label}
                        </Text>
                    </Pressable>
                ))}
            </View>

            {/* ── QR Tab ── */}
            {tab === "qr" && (
                <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
                    {/* Info card */}
                    <View style={{ borderWidth: 2, borderColor: "#000", borderRadius: 24, padding: 20, backgroundColor: "#fff", marginBottom: 16, shadowColor: "#000", shadowOffset: { width: 3, height: 3 }, shadowOpacity: 1, shadowRadius: 0, elevation: 3 }}>
                        {[
                            { label: "Gói dịch vụ", value: planName },
                            { label: "Gia đình",    value: familyName },
                            { label: "Mã đơn",      value: `#${orderCode}` },
                            { label: "Số tiền",     value: price },
                        ].map((item, i, arr) => (
                            <View key={i} style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 12, borderBottomWidth: i < arr.length - 1 ? 1 : 0, borderBottomColor: "rgba(0,0,0,0.06)" }}>
                                <Text style={{ fontFamily: "SpaceGrotesk_700Bold", fontSize: 11, color: "#AAA", textTransform: "uppercase", letterSpacing: 1 }}>{item.label}</Text>
                                <Text style={{ fontFamily: "SpaceGrotesk_700Bold", fontSize: 14, color: "#000" }}>{item.value}</Text>
                            </View>
                        ))}
                        {/* Amount highlight */}
                        <View style={{ marginTop: 12, backgroundColor: "#F0FDF4", borderRadius: 14, padding: 14, borderWidth: 2, borderColor: "#000", alignItems: "center" }}>
                            <Text style={{ fontFamily: "SpaceGrotesk_500Medium", fontSize: 11, color: "#888", textTransform: "uppercase", letterSpacing: 1 }}>Tổng thanh toán</Text>
                            <Text style={{ fontFamily: "SpaceGrotesk_700Bold", fontSize: 28, color: "#000", marginTop: 4 }}>{price}</Text>
                        </View>
                    </View>

                    {/* QR Code card */}
                    <View style={{ borderWidth: 2, borderColor: "#000", borderRadius: 24, padding: 24, backgroundColor: "#fff", alignItems: "center", marginBottom: 16, shadowColor: "#000", shadowOffset: { width: 3, height: 3 }, shadowOpacity: 1, shadowRadius: 0, elevation: 3 }}>
                        <Text style={{ fontFamily: "SpaceGrotesk_700Bold", fontSize: 12, color: "#888", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 16 }}>
                            Quét mã để thanh toán
                        </Text>

                        {/* Logo above QR */}
                        <View style={{ marginBottom: 12 }}>
                            <Text style={{ fontFamily: "SpaceGrotesk_700Bold", fontSize: 11, color: "#000", letterSpacing: 2, textTransform: "uppercase", textAlign: "center" }}>
                                MEDIMATE  ·  PAYOS
                            </Text>
                        </View>

                        {qrCode ? (
                            <View style={{ padding: 12, backgroundColor: "#fff", borderRadius: 16, borderWidth: 2, borderColor: "#000" }}>
                                <QRCode
                                    value={qrCode}
                                    size={220}
                                    color="#000"
                                    backgroundColor="#fff"
                                    getRef={(ref) => { qrRef.current = ref; }}
                                />
                            </View>
                        ) : (
                            <View style={{ width: 220, height: 220, backgroundColor: "#F3F4F6", borderRadius: 16, alignItems: "center", justifyContent: "center" }}>
                                <Text style={{ fontFamily: "SpaceGrotesk_500Medium", color: "#AAA", fontSize: 13 }}>Không có mã QR</Text>
                            </View>
                        )}

                        <Text style={{ fontFamily: "SpaceGrotesk_500Medium", fontSize: 11, color: "#AAA", marginTop: 16, textAlign: "center" }}>
                            Sử dụng app ngân hàng hoặc ví điện tử để quét
                        </Text>
                    </View>

                    {/* Action buttons */}
                    <View style={{ gap: 12 }}>
                        {/* Lưu QR */}
                        <Pressable
                            onPress={saveQR}
                            disabled={saving || !qrCode}
                            style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, height: 56, borderRadius: 18, borderWidth: 2, borderColor: "#000", backgroundColor: saving ? "#DDD" : "#000", shadowColor: "#000", shadowOffset: { width: 3, height: 3 }, shadowOpacity: 1, shadowRadius: 0, elevation: 3 }}
                        >
                            {saving ? <ActivityIndicator size="small" color="#fff" /> : <Download size={20} color="#fff" strokeWidth={2.5} />}
                            <Text style={{ fontFamily: "SpaceGrotesk_700Bold", fontSize: 15, color: "#fff", textTransform: "uppercase", letterSpacing: 0.5 }}>
                                {saving ? "Đang lưu..." : "Lưu ảnh QR"}
                            </Text>
                        </Pressable>

                        {/* Sao chép link */}
                        <Pressable
                            onPress={copyUrl}
                            style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, height: 56, borderRadius: 18, borderWidth: 2, borderColor: "#000", backgroundColor: "#fff" }}
                        >
                            <Copy size={20} color="#000" strokeWidth={2.5} />
                            <Text style={{ fontFamily: "SpaceGrotesk_700Bold", fontSize: 15, color: "#000", textTransform: "uppercase", letterSpacing: 0.5 }}>
                                Sao chép link PayOS
                            </Text>
                        </Pressable>

                        {/* Hủy đơn */}
                        <Pressable
                            onPress={() => {
                                Alert.alert(
                                    "Hủy đơn hàng",
                                    `Bạn có chắc muốn hủy đơn #${orderCode}?`,
                                    [
                                        { text: "Không", style: "cancel" },
                                        { text: "Hủy đơn", style: "destructive", onPress: () => syncPaymentStatus("cancelled") },
                                    ]
                                );
                            }}
                            style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, height: 56, borderRadius: 18, borderWidth: 2, borderColor: "#EF4444", backgroundColor: "#FFF8F8" }}
                        >
                            <XCircle size={20} color="#EF4444" strokeWidth={2.5} />
                            <Text style={{ fontFamily: "SpaceGrotesk_700Bold", fontSize: 15, color: "#EF4444", textTransform: "uppercase", letterSpacing: 0.5 }}>
                                Hủy đơn hàng
                            </Text>
                        </Pressable>
                    </View>
                </ScrollView>
            )}

            {/* ── Web Tab ── */}
            {tab === "web" && (
                <View style={{ flex: 1 }}>
                    {url ? (
                        <>
                            <WebView
                                source={{ uri: url }}
                                style={{ flex: 1 }}
                                onShouldStartLoadWithRequest={handleShouldStartLoad}
                                onNavigationStateChange={handleWebNavChange}
                                onLoadStart={() => setWebLoading(true)}
                                onLoadEnd={() => setWebLoading(false)}
                                javaScriptEnabled
                                domStorageEnabled
                                startInLoadingState
                                renderLoading={() => (
                                    <View style={[StyleSheet.absoluteFill, { alignItems: "center", justifyContent: "center", backgroundColor: "#F9F6FC" }]}>
                                        <ActivityIndicator size="large" color="#000" />
                                        <Text style={{ marginTop: 12, fontFamily: "SpaceGrotesk_500Medium", color: "#888", fontSize: 13 }}>
                                            Đang tải cổng thanh toán...
                                        </Text>
                                    </View>
                                )}
                            />
                            {/* Nút hủy đơn nổi phía dưới Web tab */}
                            <View style={{ paddingHorizontal: 16, paddingVertical: 12, backgroundColor: "#fff", borderTopWidth: 2, borderTopColor: "#000" }}>
                                <Pressable
                                    onPress={() => {
                                        Alert.alert(
                                            "Hủy đơn hàng",
                                            `Bạn có chắc muốn hủy đơn #${orderCode}?`,
                                            [
                                                { text: "Không", style: "cancel" },
                                                { text: "Hủy đơn", style: "destructive", onPress: () => syncPaymentStatus("cancelled") },
                                            ]
                                        );
                                    }}
                                    style={{
                                        flexDirection: "row",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        gap: 10,
                                        height: 52,
                                        borderRadius: 16,
                                        borderWidth: 2,
                                        borderColor: "#EF4444",
                                        backgroundColor: "#FFF8F8",
                                    }}
                                >
                                    <XCircle size={18} color="#EF4444" strokeWidth={2.5} />
                                    <Text style={{ fontFamily: "SpaceGrotesk_700Bold", fontSize: 14, color: "#EF4444", textTransform: "uppercase", letterSpacing: 0.5 }}>
                                        Hủy đơn hàng #{orderCode}
                                    </Text>
                                </Pressable>
                            </View>
                        </>
                    ) : (
                        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                            <Text style={{ fontFamily: "SpaceGrotesk_700Bold", color: "#EF4444", fontSize: 14 }}>
                                Không tìm thấy link thanh toán.
                            </Text>
                        </View>
                    )}
                </View>
            )}
        </SafeAreaView>
    );
}
