// app/scan-qr.tsx
import { useLoginDependent } from "@/hooks/useAuth";
import { Feather, Ionicons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from "react-native";

export default function ScanQrScreen() {
    // Xin quyền Camera
    const [permission, requestPermission] = useCameraPermissions();
    const [scanned, setScanned] = useState(false);
    const { mutate: loginDependent, isPending } = useLoginDependent();

    // Yêu cầu quyền khi vào màn hình
    useEffect(() => {
        if (!permission?.granted) {
            requestPermission();
        }
    }, [permission]);

    // Xử lý khi quét được mã bằng Camera
    const handleBarcodeScanned = ({ data }: { data: string }) => {
        if (scanned) return; // Tránh quét liên tục
        setScanned(true);

        processQrData(data);
    };

    // Xử lý khi chọn ảnh từ thư viện
    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: false,
            quality: 1,
        });

        if (!result.canceled) {
            Alert.alert("Thông báo", "Expo Camera hiện tại chưa hỗ trợ quét trực tiếp từ file ảnh ở bản miễn phí. Vui lòng đưa camera quét trực tiếp mã QR.");
            // Ghi chú: Để quét từ ảnh trong thư viện, bạn có thể cần cài thêm thư viện phụ như 'expo-barcode-scanner' cũ hoặc các gói xử lý ảnh nâng cao.
        }
    };

    // Logic xử lý dữ liệu QR
    const processQrData = (data: string) => {
        // Theo code C# backend của bạn, mã QR có format: "LOGIN-1234567890abcdef..."
        if (data.startsWith("LOGIN-")) {
            const syncToken = data.replace("LOGIN-", "");
            loginDependent(
                { syncToken },
                {
                    onError: () => {
                        // Nếu lỗi, 2 giây sau cho phép quét lại
                        setTimeout(() => setScanned(false), 2000);
                    }
                }
            );
        } else {
            Alert.alert("Lỗi", "Mã QR không đúng định dạng của MediMate.", [
                { text: "Quét lại", onPress: () => setScanned(false) }
            ]);
        }
    };

    if (!permission) {
        return <View className="flex-1 bg-[#F8FAFA] justify-center items-center"><ActivityIndicator color="#059669" /></View>;
    }

    if (!permission.granted) {
        return (
            <View className="flex-1 bg-[#F8FAFA] justify-center items-center px-6">
                <Text className="text-center mb-4 font-medium text-gray-600">Chúng tôi cần quyền truy cập Camera để quét mã QR.</Text>
                <Pressable onPress={requestPermission} className="bg-[#86EFAC] px-6 py-3 rounded-full">
                    <Text className="text-[#065F46] font-bold">Cấp quyền Camera</Text>
                </Pressable>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-[#F8FAFA]">

            {/* Header */}
            <View className="flex-row items-center justify-between px-6 pt-12 pb-4 z-10">
                <Pressable
                    onPress={() => router.back()}
                    className="w-10 h-10 bg-white rounded-full items-center justify-center shadow-sm border border-gray-100"
                >
                    <Feather name="arrow-left" size={20} color="black" />
                </Pressable>
                <Text className="text-[#1F2937] font-extrabold text-lg">
                    Quét QR
                </Text>
                <View className="w-10 h-10 bg-[#FEF3C7] rounded-full items-center justify-center">
                    <Ionicons name="flash" size={18} color="#D97706" />
                </View>
            </View>

            {/* Camera Section */}
            <View className="flex-1 justify-center items-center px-8">
                <View className="w-full aspect-square rounded-[40px] overflow-hidden border-[6px] border-white shadow-lg bg-gray-200 relative">

                    <CameraView
                        style={StyleSheet.absoluteFillObject}
                        facing="back"
                        onBarcodeScanned={scanned || isPending ? undefined : handleBarcodeScanned}
                        barcodeScannerSettings={{
                            barcodeTypes: ["qr"],
                        }}
                    />

                    {/* Lớp phủ mờ (tùy chọn) và Thanh quét màu cam */}
                    {!scanned && !isPending && (
                        <View className="absolute top-1/2 left-8 right-8 h-0.5 bg-[#F97316] shadow-md shadow-orange-500" />
                    )}

                    {/* Loading Indicator khi đang gọi API */}
                    {isPending && (
                        <View className="absolute inset-0 bg-black/40 justify-center items-center">
                            <ActivityIndicator size="large" color="#86EFAC" />
                            <Text className="text-white font-bold mt-2">Đang xác thực...</Text>
                        </View>
                    )}

                </View>
                <Text className="text-gray-400 font-medium mt-6">Giữ camera cố định</Text>
            </View>

            {/* Bottom Sheet Card */}
            <View className="bg-white rounded-t-[40px] px-6 py-8 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
                <View className="flex-row items-center mb-6">
                    <View className="w-12 h-12 bg-[#FCE7F3] rounded-full items-center justify-center mr-4">
                        <MaterialCommunityIcons name="qrcode-scan" size={20} color="#E11D48" />
                    </View>
                    <View className="flex-1">
                        <Text className="text-[#1F2937] font-bold text-lg mb-1">Đăng nhập nhanh</Text>
                        <Text className="text-gray-400 text-xs">Di chuyển camera đến mã QR để đăng nhập.</Text>
                    </View>
                </View>

                <Pressable
                    onPress={pickImage}
                    className="bg-[#FFF7ED] rounded-full py-4 flex-row items-center justify-center border border-[#FFEDD5] active:opacity-70"
                >
                    <Feather name="image" size={18} color="#D97706" />
                    <Text className="text-[#D97706] font-bold text-base ml-2">Tải ảnh từ thư viện</Text>
                </Pressable>
            </View>

        </View>
    );
}

// Bổ sung import thiếu ở trên để tránh lỗi
import { MaterialCommunityIcons } from "@expo/vector-icons";
