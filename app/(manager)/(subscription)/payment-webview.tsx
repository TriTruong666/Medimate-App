import { getPaymentInfo } from "@/apis/payment.api";
import { useUpdatePaymentStatus } from "@/hooks/usePayment";
import { useUpdateTransactionStatus } from "@/hooks/useTransaction";
import * as FileSystem from "expo-file-system/legacy";
import * as MediaLibrary from "expo-media-library";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
    ArrowLeft,
    Copy,
    Download,
    Globe,
    QrCode,
    XCircle
} from "lucide-react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    BackHandler,
    Clipboard,
    DeviceEventEmitter,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View
} from "react-native";
import QRCode from "react-native-qrcode-svg";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView, WebViewNavigation } from "react-native-webview";
import { useDeleteUnpaidAppointment } from "../../../hooks/useAppointment";

const HANDLED_SCHEMES = ["medimate://", "intent://", "kakao://"];

type Tab = "qr" | "web";

export default function PaymentWebViewScreen() {
    const router = useRouter();
    const { url, qrCode, planName, familyName, price, orderCode, appointmentId } =
        useLocalSearchParams<{
            url: string;
            qrCode: string;
            planName: string;
            familyName: string;
            price: string;
            orderCode: string;
            appointmentId?: string;
        }>();

    const [tab, setTab] = useState<Tab>("qr");
    const [webLoading, setWebLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [updatingStatus, setUpdatingStatus] = useState(false);

    const qrRef = useRef<any>(null);
    const isSyncing = useRef(false);

    const { mutateAsync: updatePaymentStatus } = useUpdatePaymentStatus();
    const { mutateAsync: updateTransactionStatus } = useUpdateTransactionStatus();
    const { mutateAsync: cancelUnpaidAppointment } = useDeleteUnpaidAppointment();

    // ─── Điều hướng ───
    const navigateToSuccess = useCallback(() => {
        router.replace({ pathname: "/payment-success", params: { planName, familyName } });
    }, [router, planName, familyName]);

    const navigateToCancel = useCallback(() => {
        router.replace({ pathname: "/payment-cancelled", params: { orderCode } });
    }, [router, orderCode]);

    // ─── Đồng bộ trạng thái (Được kích hoạt bởi WebView chạy ngầm) ───
    const forceSyncPaymentStatus = useCallback(async (result: "success" | "cancelled") => {
        if (isSyncing.current) return;
        isSyncing.current = true;

        const orderCodeNum = Number(orderCode);
        if (!orderCodeNum) return;

        const apiStatus = result === "success" ? "SUCCESS" : "CANCELLED";
        setUpdatingStatus(true);

        try {
            if (result === "cancelled" && appointmentId) {
                // Hủy trực tiếp slot lịch hẹn để nhả slot trống
                await cancelUnpaidAppointment(appointmentId);
            } else {
                await updatePaymentStatus({ orderCode: orderCodeNum, data: { status: apiStatus } });
                const infoRes = await getPaymentInfo(orderCodeNum);
                if (infoRes.success && infoRes.data?.transactionId) {
                    await updateTransactionStatus({
                        transactionId: infoRes.data.transactionId,
                        data: { status: apiStatus },
                    });
                }
            }
        } catch (err) {
            console.warn('[payment] force sync error:', err);
        } finally {
            setUpdatingStatus(false);
            if (result === "success") {
                navigateToSuccess();
            } else {
                navigateToCancel();
            }
        }
    }, [orderCode, appointmentId, updatePaymentStatus, updateTransactionStatus, cancelUnpaidAppointment, navigateToSuccess, navigateToCancel]);


    // ─── WebView Intercept (Cỗ máy chạy ngầm) ───
    const handleShouldStartLoad = (request: { url: string }) => {
        const u = request.url;
        if (u.includes("/payment/success") || u.includes("status=PAID") || u.includes("success=true")) {
            forceSyncPaymentStatus("success");
            return false;
        }
        if (u.includes("/payment/cancel") || u.includes("status=CANCELLED") || u.includes("cancel=true")) {
            forceSyncPaymentStatus("cancelled");
            return false;
        }
        return u.startsWith("http");
    };

    const handleWebNavChange = (nav: WebViewNavigation) => {
        const navUrl = nav.url ?? "";
        if (navUrl.includes("/payment/success") || navUrl.includes("status=PAID")) {
            forceSyncPaymentStatus("success");
        } else if (navUrl.includes("/payment/cancel") || navUrl.includes("status=CANCELLED")) {
            forceSyncPaymentStatus("cancelled");
        }
    };


    // ─── Lưu ảnh QR & Copy Link ───
    const saveQR = async () => {
        if (!qrRef.current) return;
        setSaving(true);
        try {
            const { status } = await MediaLibrary.requestPermissionsAsync();
            if (status !== "granted") return Alert.alert("Lỗi", "Vui lòng cấp quyền lưu ảnh.");
            qrRef.current.toDataURL(async (data: string) => {
                const path = FileSystem.cacheDirectory + `qr_${orderCode}.png`;
                await FileSystem.writeAsStringAsync(path, data, { encoding: FileSystem.EncodingType.Base64 });
                const asset = await MediaLibrary.createAssetAsync(path);
                await MediaLibrary.createAlbumAsync("Medimate", asset, false);
                Alert.alert("Thành công", "Đã lưu mã QR vào máy.");
                setSaving(false);
            });
        } catch (e) { setSaving(false); }
    };

    const copyUrl = () => {
        Clipboard.setString(url ?? "");
        Alert.alert("✓ Đã sao chép", "Link thanh toán đã được sao chép.");
    };

    const handleAttemptClose = useCallback(() => {
        Alert.alert(
            "Cảnh báo!",
            "Bạn chưa hoàn tất thanh toán. Nếu bạn rời khỏi trang này, giao dịch (và lịch hẹn) sẽ bị hủy.\nBạn có chắc chắn muốn hủy thanh toán không?",
            [
                { text: "Tiếp tục thanh toán", style: "cancel" },
                { text: "Đồng ý hủy", style: "destructive", onPress: () => forceSyncPaymentStatus("cancelled") }
            ]
        );
    }, [forceSyncPaymentStatus]);

    useEffect(() => {
        const subscription = DeviceEventEmitter.addListener("AttemptLeavePayment", () => {
            handleAttemptClose();
        });

        const backHandler = BackHandler.addEventListener("hardwareBackPress", () => {
            handleAttemptClose();
            return true; // Chặn hành vi back mặc định
        });

        return () => {
            subscription.remove();
            backHandler.remove();
        };
    }, [handleAttemptClose]);


    // ─── UPDATING STATUS OVERLAY ───
    if (updatingStatus) {
        return (
            <SafeAreaView style={s.centerContainer}>
                <ActivityIndicator size="large" color="#000" />
                <Text style={s.statusText}>Đang xử lý giao dịch...{"\n"}</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#F9F6FC" }} edges={["top"]}>
            {/* 1. Header (Luôn hiện) */}
            <View style={s.header}>
                <Pressable onPress={handleAttemptClose} style={s.backBtn}><ArrowLeft size={22} color="#000" /></Pressable>
                <View style={{ flex: 1 }}>
                    <Text style={s.headerTitle}>Thanh toán · {planName}</Text>
                    <Text style={s.headerSub}>Đơn #{orderCode} · {price}</Text>
                </View>
            </View>

            {/* 2. Tab Bar (Luôn hiện) */}
            <View style={s.tabBar}>
                <Pressable onPress={() => setTab("qr")} style={[s.tabItem, tab === "qr" && s.tabActive]}>
                    <QrCode size={18} color={tab === "qr" ? "#fff" : "#888"} />
                    <Text style={[s.tabText, tab === "qr" && { color: "#fff" }]}>Mã QR</Text>
                </Pressable>
                <Pressable onPress={() => setTab("web")} style={[s.tabItem, tab === "web" && s.tabActive]}>
                    <Globe size={18} color={tab === "web" ? "#fff" : "#888"} />
                    <Text style={[s.tabText, tab === "web" && { color: "#fff" }]}>Cổng Web</Text>
                </Pressable>
            </View>

            {/* 3. VÙNG NỘI DUNG CHÍNH */}
            <View style={{ flex: 1 }}>

                {/* ─── LỚP WEBVIEW CHẠY NGẦM (BÍ QUYẾT FIX IPHONE) ─── */}
                <View
                    style={[
                        StyleSheet.absoluteFill,
                        {
                            // Nếu đang ở tab QR: Cho tàng hình và không cho bấm trúng (nhưng vẫn load)
                            // Nếu đang ở tab Web: Cho hiện lên bình thường
                            opacity: tab === "web" ? 1 : 0,
                            zIndex: tab === "web" ? 10 : -1,
                            pointerEvents: tab === "web" ? "auto" : "none"
                        }
                    ]}
                >
                    <WebView
                        source={{ uri: url ?? "" }}
                        style={{ flex: 1 }}
                        originWhitelist={['*']}
                        onShouldStartLoadWithRequest={handleShouldStartLoad}
                        onNavigationStateChange={handleWebNavChange}
                        onLoadStart={() => setWebLoading(true)}
                        onLoadEnd={() => setWebLoading(false)}
                        // Ép load ngay cả khi không nhìn thấy
                        startInLoadingState={true}
                    />
                    {webLoading && tab === "web" && (
                        <ActivityIndicator style={StyleSheet.absoluteFill} size="large" color="#000" />
                    )}

                    {tab === "web" && (
                        <View style={s.webFooter}>
                            <Pressable onPress={handleAttemptClose} style={s.btnDangerSmall}>
                                <XCircle size={18} color="#EF4444" />
                                <Text style={s.btnTextDanger}>Hủy đơn #{orderCode}</Text>
                            </Pressable>
                        </View>
                    )}
                </View>

                {/* ─── LỚP TAB QR (HIỂN THỊ ĐÈ LÊN TRÊN) ─── */}
                {tab === "qr" && (
                    <ScrollView contentContainerStyle={{ padding: 16 }} style={{ flex: 1 }}>
                        <View style={s.card}>
                            <View style={s.infoRow}><Text style={s.infoLabel}>GÓI DỊCH VỤ</Text><Text style={s.infoValue}>{planName}</Text></View>
                            <View style={s.infoRow}><Text style={s.infoLabel}>GIA ĐÌNH</Text><Text style={s.infoValue}>{familyName}</Text></View>
                            <View style={s.amountBox}>
                                <Text style={s.infoLabel}>TỔNG THANH TOÁN</Text>
                                <Text style={s.amountText}>{price}</Text>
                            </View>
                        </View>

                        <View style={s.qrCard}>
                            <Text style={s.qrHint}>QUÉT MÃ ĐỂ THANH TOÁN</Text>
                            <View style={s.qrBorder}>
                                <QRCode value={qrCode} size={200} getRef={(r) => (qrRef.current = r)} />
                            </View>
                            <Text style={s.qrSubHint}>Hệ thống sẽ tự động chuyển trang khi nhận được tiền</Text>
                        </View>

                        <View style={{ gap: 12, marginTop: 8 }}>
                            <Pressable onPress={saveQR} disabled={saving} style={[s.btnSecondary, saving && { opacity: 0.7 }]}>
                                {saving ? <ActivityIndicator color="#000" /> : <Download size={20} color="#000" />}
                                <Text style={s.btnTextDark}>Lưu ảnh QR</Text>
                            </Pressable>

                            <Pressable onPress={copyUrl} style={s.btnSecondary}>
                                <Copy size={20} color="#000" />
                                <Text style={s.btnTextDark}>Sao chép link PayOS</Text>
                            </Pressable>

                            <Pressable onPress={handleAttemptClose} style={s.btnDanger}>
                                <XCircle size={20} color="#EF4444" />
                                <Text style={s.btnTextDanger}>Hủy đơn hàng</Text>
                            </Pressable>
                        </View>
                    </ScrollView>
                )}
            </View>
        </SafeAreaView>
    );
}

const s = StyleSheet.create({
    header: { padding: 16, flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: "#fff", borderBottomWidth: 2 },
    backBtn: { width: 40, height: 40, borderRadius: 12, borderWidth: 2, alignItems: "center", justifyContent: "center" },
    headerTitle: { fontFamily: "SpaceGrotesk_700Bold", fontSize: 16 },
    headerSub: { fontFamily: "SpaceGrotesk_500Medium", fontSize: 11, color: "#888" },
    tabBar: { flexDirection: "row", padding: 16, gap: 10 },
    tabItem: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 12, borderRadius: 14, borderWidth: 2, borderColor: "#E0E0E0", backgroundColor: "#fff" },
    tabActive: { backgroundColor: "#000", borderColor: "#000" },
    tabText: { fontFamily: "SpaceGrotesk_700Bold", fontSize: 13, color: "#888" },
    card: { borderWidth: 2, borderRadius: 24, padding: 20, backgroundColor: "#fff", marginBottom: 16 },
    infoRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 10 },
    infoLabel: { fontFamily: "SpaceGrotesk_700Bold", fontSize: 10, color: "#AAA" },
    infoValue: { fontFamily: "SpaceGrotesk_700Bold", fontSize: 14 },
    amountBox: { marginTop: 12, backgroundColor: "#F0FDF4", borderRadius: 16, padding: 16, borderWidth: 2, alignItems: "center" },
    amountText: { fontFamily: "SpaceGrotesk_700Bold", fontSize: 28, marginTop: 4 },
    qrCard: { borderWidth: 2, borderRadius: 24, padding: 24, backgroundColor: "#fff", alignItems: "center", marginBottom: 16 },
    qrHint: { fontFamily: "SpaceGrotesk_700Bold", fontSize: 12, color: "#888", marginBottom: 16 },
    qrBorder: { padding: 12, borderWidth: 2, borderRadius: 16, backgroundColor: "#fff" },
    qrSubHint: { fontFamily: "SpaceGrotesk_500Medium", fontSize: 11, color: "#AAA", marginTop: 16, textAlign: "center" },
    btnPrimary: { height: 56, borderRadius: 18, backgroundColor: "#000", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, borderWidth: 2 },
    btnSecondary: { height: 56, borderRadius: 18, backgroundColor: "#fff", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, borderWidth: 2 },
    btnDanger: { height: 56, borderRadius: 18, backgroundColor: "#FFF8F8", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, borderWidth: 2, borderColor: "#EF4444" },
    btnTextLight: { color: "#fff", fontFamily: "SpaceGrotesk_700Bold" },
    btnTextDark: { color: "#000", fontFamily: "SpaceGrotesk_700Bold" },
    btnTextDanger: { color: "#EF4444", fontFamily: "SpaceGrotesk_700Bold" },
    webFooter: { padding: 12, backgroundColor: "#fff", borderTopWidth: 2 },
    btnDangerSmall: { height: 48, borderRadius: 14, backgroundColor: "#FFF8F8", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderWidth: 2, borderColor: "#EF4444" },
    centerContainer: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32 },
    statusText: { fontFamily: "SpaceGrotesk_700Bold", marginTop: 20 }
});