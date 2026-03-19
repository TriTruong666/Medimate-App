// app/login-qr.tsx
import { useLoginDependent } from "@/hooks/useAuth";
import { usePushToken } from "@/hooks/usePushToken";
import { AntDesign, Feather } from "@expo/vector-icons";
import { useIsFocused } from "@react-navigation/native";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { Link } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Animated, Platform, Pressable, Text, View } from "react-native";
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
            className="absolute left-4 right-4 h-[2px] bg-card-green rounded-full"
            style={{ transform: [{ translateY }], opacity: 0.8 }}
        />
    );
}

export default function LoginQRScreen() {
    const isFocused = useIsFocused();
    const [permission, requestPermission] = useCameraPermissions();
    const fcmToken = usePushToken();

    // Cờ khóa quét để không gọi API liên tục
    const [hasScanned, setHasScanned] = useState(false);
    const { mutate: loginDependent, isPending } = useLoginDependent();

    const handlePickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["images"],
            quality: 1,
        });

        if (!result.canceled) {
            // Lưu ý: ImagePicker của Expo không tự giải mã QR từ ảnh. 
            // Nếu bạn muốn hỗ trợ tải ảnh từ thư viện, bạn sẽ cần thêm thư viện như 'expo-barcode-scanner' (scanFromURLAsync) 
            // hoặc xử lý trên backend.
            console.log("Image picked:", result.assets[0].uri);
        }
    };

    const handleBarcodeScanned = (scanResult: { data: string; type: string }) => {
        if (hasScanned || isPending) return; // Nếu đang xử lý thì bỏ qua các lần quét tiếp theo

        setHasScanned(true);
        console.log("QR Scanned Data:", scanResult.data);

        // Gọi API Đăng nhập
        loginDependent(
            {
                qrData: scanResult.data,
                fcmToken: fcmToken || "no_token_available", // Truyền token thật lên API
            },
            {
                onError: () => {
                    // Nếu lỗi (mã sai/hết hạn), mở khóa để người dùng quét lại
                    setTimeout(() => setHasScanned(false), 2000);
                }
            }
        );
    };
    // ... (Giữ nguyên các khối lệnh kiểm tra quyền Camera của bạn ở đây)
    if (!permission) {
        return (
            <SafeAreaView className="flex-1 bg-background items-center justify-center">
                <Text className="text-lg text-gray-400 font-space-regular">Đang kiểm tra quyền camera...</Text>
            </SafeAreaView>
        );
    }

    if (!permission.granted) {
        // ... (Giữ nguyên UI yêu cầu cấp quyền camera)
        return (
            <SafeAreaView className="flex-1 bg-background px-8">
                <View className="pt-6">
                    <Link href="/" asChild>
                        <Pressable className="w-12 h-12 rounded-full items-center justify-center shadow-sm bg-white mb-6">
                            <AntDesign name="arrow-left" size={24} color="black" />
                        </Pressable>
                    </Link>
                </View>
                <View className="flex-1 items-center justify-center px-4">
                    <Feather name="camera-off" size={48} color="#888" />
                    <Text className="text-2xl text-black mt-6 text-center font-space-bold">
                        Cần quyền truy cập Camera
                    </Text>
                    <Text className="text-base text-gray-500 mt-3 text-center leading-6 font-space-regular">
                        Để quét mã QR, ứng dụng cần được phép sử dụng camera của bạn.
                    </Text>
                    <Pressable
                        className="mt-8 bg-black py-4 px-10 rounded-full active:opacity-80"
                        onPress={requestPermission}
                    >
                        <Text className="text-white text-lg font-space-bold">
                            Cấp quyền Camera
                        </Text>
                    </Pressable>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-background">
            <View className="flex-1 px-8 pt-6 pb-8">
                {/* Header */}
                <View className="flex-row items-center justify-between mb-6">
                    <View className="flex-row items-center">
                        <Link href="/" asChild>
                            <Pressable className="w-12 h-12 rounded-full items-center justify-center shadow-sm bg-white border-2 border-black">
                                <AntDesign name="arrow-left" size={24} color="black" />
                            </Pressable>
                        </Link>
                        <Text className="text-2xl text-black ml-5 font-space-bold">
                            Quét mã QR
                        </Text>
                    </View>

                    {/* Hiển thị Loading nhỏ khi đang gọi API */}
                    {isPending && <ActivityIndicator color="black" />}
                </View>

                {/* Mô tả */}
                <Text className="text-base text-gray-400 mb-6 leading-6 font-space-regular">
                    Hướng camera vào mã QR được chia sẻ bởi người quản lý của bạn.
                </Text>

                {/* Camera Scanner */}
                <View className="flex-1 rounded-[32px] overflow-hidden bg-black relative border-2 border-black">
                    {isFocused && (
                        <CameraView
                            style={{ flex: 1, opacity: isPending ? 0.5 : 1 }}
                            facing="back"
                            barcodeScannerSettings={{
                                barcodeTypes: ["qr"],
                            }}
                            onBarcodeScanned={handleBarcodeScanned}
                        />
                    )}

                    {/* Fallback for Simulator/Web where camera might stay black */}
                    {Platform.OS !== "ios" && Platform.OS !== "android" && (
                        <View className="absolute inset-0 items-center justify-center bg-gray-900">
                            <Feather name="camera" size={40} color="#333" />
                            <Text className="text-gray-500 mt-2 font-space-regular text-xs">
                                Camera không khả dụng trên trình duyệt
                            </Text>
                        </View>
                    )}

                    {/* Scan Overlay */}
                    <View className="absolute inset-0 items-center justify-center">
                        <View className="w-[250px] h-[250px] relative">
                            <View className="absolute top-0 left-0 w-10 h-10 border-t-4 border-l-4 border-card-green rounded-tl-2xl" />
                            <View className="absolute top-0 right-0 w-10 h-10 border-t-4 border-r-4 border-card-green rounded-tr-2xl" />
                            <View className="absolute bottom-0 left-0 w-10 h-10 border-b-4 border-l-4 border-card-green rounded-bl-2xl" />
                            <View className="absolute bottom-0 right-0 w-10 h-10 border-b-4 border-r-4 border-card-green rounded-br-2xl" />
                            {!isPending && <ScanLine />}
                        </View>
                    </View>
                </View>

                {/* Card tải ảnh từ thư viện */}
                <Pressable
                    className="mt-5 rounded-[32px] p-6 bg-white border-2 border-black flex-row items-center justify-between active:opacity-80"
                    onPress={handlePickImage}
                    disabled={isPending}
                >
                    <View className="flex-row items-center flex-1">
                        <View className="w-12 h-12 rounded-full bg-background items-center justify-center mr-4 border border-gray-100">
                            <Feather name="image" size={22} color="black" />
                        </View>
                        <View className="flex-1">
                            <Text className="text-base text-black font-space-bold">
                                Tải ảnh từ thư viện
                            </Text>
                            <Text className="text-sm text-gray-400 mt-1 font-space-regular">
                                Chọn ảnh chứa mã QR có sẵn
                            </Text>
                        </View>
                    </View>
                    <AntDesign name="arrow-right" size={20} color="black" />
                </Pressable>
            </View>
        </SafeAreaView>
    );
}