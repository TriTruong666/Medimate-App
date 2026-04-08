// app/login_qr.tsx
import { useLoginDependent } from "@/hooks/useAuth";
import { usePushToken } from "@/hooks/usePushToken";
import { useToast } from "@/stores/toastStore";
import { AntDesign, Feather } from "@expo/vector-icons";
import { useIsFocused } from "@react-navigation/native";
import * as BarcodeScanner from 'expo-barcode-scanner';
import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Animated,
    Platform,
    Pressable,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

function ScanLine() {
    const translateY = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const animation = Animated.loop(
            Animated.sequence([
                Animated.timing(translateY, {
                    toValue: 220,
                    duration: 2000,
                    useNativeDriver: true,
                }),
                Animated.timing(translateY, {
                    toValue: 0,
                    duration: 2000,
                    useNativeDriver: true,
                }),
            ])
        );
        animation.start();
        return () => animation.stop();
    }, [translateY]);

    return (
        <Animated.View
            className="absolute left-4 right-4 h-[2px] bg-[#A3E6A1] rounded-full"
            style={{ transform: [{ translateY }], opacity: 0.8 }}
        />
    );
}

export default function LoginQRScreen() {
    const isFocused = useIsFocused();
    const [permission, requestPermission] = useCameraPermissions();
    const fcmToken = usePushToken();
    const toast = useToast();

    const [hasScanned, setHasScanned] = useState(false);
    const { mutate: loginDependent, isPending } = useLoginDependent();

    const handlePickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["images"],
            quality: 1,
            allowsEditing: false,
        });

        if (!result.canceled && result.assets[0].uri) {
            const imageUri = result.assets[0].uri;
            console.log("Image picked:", imageUri);

            try {
                const scannedResults = await BarcodeScanner.scanFromURLAsync(imageUri, [
                    BarcodeScanner.Constants.BarCodeType.qr,
                ]);

                if (scannedResults.length > 0) {
                    const qrData = scannedResults[0].data;
                    console.log("QR decoded from image:", qrData);
                    handleBarcodeScanned({ data: qrData, type: 'qr' });
                } else {
                    toast.error("Không tìm thấy mã QR", "Vui lòng chọn ảnh chứa mã QR rõ ràng hơn.");
                }
            } catch (error) {
                console.error("Error scanning image:", error);
                toast.error("Lỗi hệ thống", "Không thể phân tích hình ảnh này.");
            }
        }
    };

    const handleBarcodeScanned = (scanResult: { data: string; type: string }) => {
        if (hasScanned || isPending) return;

        setHasScanned(true);
        console.log("QR Scanned Data:", scanResult.data);

        loginDependent(
            {
                qrData: scanResult.data,
                fcmToken: fcmToken || "no_token_available",
            },
            {
                onError: () => {
                    setTimeout(() => setHasScanned(false), 2000);
                },
            }
        );
    };

    if (!permission) {
        return (
            <SafeAreaView className="flex-1 bg-white items-center justify-center">
                <ActivityIndicator size="large" color="#000" />
                <Text className="text-lg text-black mt-4 font-space-medium">
                    Đang kiểm tra quyền camera...
                </Text>
            </SafeAreaView>
        );
    }

    if (!permission.granted) {
        return (
            <SafeAreaView className="flex-1 bg-white px-8">
                <View className="pt-6">
                    <Pressable
                        onPress={() => router.back()}
                        className="w-12 h-12 bg-white border-2 border-black rounded-2xl items-center justify-center shadow-sm">
                        <AntDesign name="arrow-left" size={24} color="black" />
                    </Pressable>
                </View>
                <View className="flex-1 items-center justify-center">
                    <View className="w-24 h-24 bg-[#FFA07A] border-2 border-black rounded-[24px] items-center justify-center mb-8 shadow-md">
                        <Feather name="camera-off" size={48} color="black" />
                    </View>
                    <Text className="text-3xl text-black text-center font-space-bold mb-4">
                        Cấp quyền Camera
                    </Text>
                    <Text className="text-base text-gray-500 text-center leading-6 font-space-medium mb-10 px-4">
                        Để quét mã QR đăng nhập, Medimate cần được bạn cho phép sử dụng
                        camera.
                    </Text>
                    <Pressable
                        className="w-full bg-[#A3E6A1] py-4 rounded-[24px] border-2 border-black flex-row items-center justify-center shadow-md active:opacity-80"
                        onPress={requestPermission}
                    >
                        <Text className="text-black text-lg font-space-bold uppercase">
                            Cho phép ngay
                        </Text>
                    </Pressable>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-white">
            <View className="flex-1 px-6 pt-6 pb-4">
                {/* Header */}
                <View className="flex-row items-center justify-between mb-8">
                    <View className="flex-row items-center flex-1">
                        <Pressable
                            onPress={() => router.back()}
                            className="w-12 h-12 bg-white border-2 border-black rounded-2xl items-center justify-center shadow-sm">
                            <AntDesign name="arrow-left" size={24} color="black" />
                        </Pressable>
                    </View>
                    {isPending && <ActivityIndicator color="black" />}
                </View>

                {/* Mô tả */}
                <View className="bg-[#D9AEF6] border-2 border-black rounded-2xl p-4 mb-8 shadow-sm">
                    <Text className="text-black text-[15px] leading-5 font-space-medium">
                        Hướng camera vào mã QR được chia sẻ bởi người quản lý của bạn để
                        đăng nhập nhanh.
                    </Text>
                </View>

                {/* Camera Scanner */}
                <View className="flex-1 rounded-[24px] overflow-hidden bg-black relative border-2 border-black shadow-md">
                    {isFocused && (
                        <CameraView
                            style={{ flex: 1, opacity: isPending ? 0.3 : 1 }}
                            facing="back"
                            barcodeScannerSettings={{
                                barcodeTypes: ["qr"],
                            }}
                            onBarcodeScanned={handleBarcodeScanned}
                        />
                    )}

                    {Platform.OS !== "ios" && Platform.OS !== "android" && (
                        <View className="absolute inset-0 items-center justify-center bg-gray-900">
                            <Feather name="camera" size={40} color="white" />
                            <Text className="text-white mt-4 font-space-medium text-sm">
                                Camera không khả dụng ở đây
                            </Text>
                        </View>
                    )}

                    {/* Scan Overlay */}
                    <View className="absolute inset-0 items-center justify-center">
                        <View className="w-[220px] h-[220px] relative">
                            <View className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-[#A3E6A1] rounded-tl-2xl" />
                            <View className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-[#A3E6A1] rounded-tr-2xl" />
                            <View className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-[#A3E6A1] rounded-bl-2xl" />
                            <View className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-[#A3E6A1] rounded-br-2xl" />
                            {!isPending && <ScanLine />}
                        </View>

                        {isPending && (
                            <View className="absolute inset-0 items-center justify-center bg-black/40">
                                <ActivityIndicator size="large" color="#A3E6A1" />
                                <Text className="text-[#A3E6A1] mt-4 font-space-bold uppercase">
                                    Đang đăng nhập...
                                </Text>
                            </View>
                        )}
                    </View>
                </View>

                {/* Card tải ảnh từ thư viện */}
                <Pressable
                    className="mt-8 rounded-[24px] p-5 bg-[#FFD700] border-2 border-black flex-row items-center shadow-md active:opacity-80"
                    onPress={handlePickImage}
                    disabled={isPending}
                >
                    <View className="w-12 h-12 rounded-2xl bg-white border-2 border-black items-center justify-center mr-4">
                        <Feather name="image" size={24} color="black" />
                    </View>
                    <View className="flex-1">
                        <Text className="text-lg text-black font-space-bold">
                            Tải ảnh từ thư viện
                        </Text>
                        <Text className="text-sm text-black opacity-70 font-space-medium">
                            Chọn ảnh QR có sẵn trong máy
                        </Text>
                    </View>
                    <AntDesign name="arrow-right" size={22} color="black" />
                </Pressable>
            </View>
        </SafeAreaView>
    );
}
