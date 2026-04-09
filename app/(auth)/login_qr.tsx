import { useLoginDependent } from "@/hooks/useAuth";
import { usePushToken } from "@/hooks/usePushToken";
import { useToast } from "@/stores/toastStore";
import { AntDesign, Feather } from "@expo/vector-icons";
import { useIsFocused } from "@react-navigation/native";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Animated,
    Pressable,
    Text,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

function ScanLine() {
    const translateY = useRef(new Animated.Value(0)).current;
    useEffect(() => {
        const animation = Animated.loop(
            Animated.sequence([
                Animated.timing(translateY, { toValue: 220, duration: 2000, useNativeDriver: true }),
                Animated.timing(translateY, { toValue: 0, duration: 2000, useNativeDriver: true }),
            ])
        );
        animation.start();
        return () => animation.stop();
    }, [translateY]);
    return <Animated.View className="absolute left-4 right-4 h-[2px] bg-[#A3E6A1] rounded-full" style={{ transform: [{ translateY }], opacity: 0.8 }} />;
}

export default function LoginQRScreen() {
    const isFocused = useIsFocused();
    const [permission, requestPermission] = useCameraPermissions();
    const fcmToken = usePushToken();
    const toast = useToast();

    const [hasScanned, setHasScanned] = useState(false);
    const [isDecoding, setIsDecoding] = useState(false);
    const { mutate: loginDependent, isPending } = useLoginDependent();

    const handlePickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: false,
            quality: 1,
        });

        if (!result.canceled && result.assets[0]) {
            // Tạm thời chỉ thông báo vì thư viện giải mã đang bị lỗi build trên máy bạn
            toast.info("Tính năng đang nâng cấp", "Vui lòng quét QR trực tiếp bằng Camera để đăng nhập nhanh nhé!");
        }
    };

    const handleBarcodeScanned = (scanResult: { data: string; type: string }) => {
        if (hasScanned || isPending) return;
        setHasScanned(true);
        console.log("QR Data:", scanResult.data);

        loginDependent({
            qrData: scanResult.data,
            fcmToken: fcmToken || "no_token_available",
        }, {
            onError: () => setTimeout(() => setHasScanned(false), 2000),
        });
    };

    if (!permission) return <View className="flex-1 bg-white items-center justify-center"><ActivityIndicator color="#000" /></View>;

    if (!permission.granted) {
        return (
            <SafeAreaView className="flex-1 bg-white items-center justify-center px-8">
                <View className="w-20 h-20 bg-orange-100 rounded-3xl items-center justify-center mb-6 border-2 border-black">
                    <Feather name="camera-off" size={32} color="black" />
                </View>
                <Text className="text-2xl font-space-bold mb-4 text-center">Yêu cầu Camera</Text>
                <Text className="text-gray-500 text-center mb-10">Vui lòng cấp quyền camera để quét mã đăng nhập.</Text>
                <Pressable className="w-full bg-[#A3E6A1] py-4 rounded-2xl border-2 border-black shadow-sm" onPress={requestPermission}>
                    <Text className="text-center font-space-bold uppercase">Cho phép ngay</Text>
                </Pressable>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-white">
            <View className="flex-1 px-6 pt-6 pb-4">
                <View className="flex-row items-center mb-6">
                    <Pressable onPress={() => router.back()} className="w-12 h-12 bg-white border-2 border-black rounded-2xl items-center justify-center shadow-sm">
                        <AntDesign name="arrow-left" size={24} color="black" />
                    </Pressable>
                    <Text className="ml-4 text-xl font-space-bold uppercase text-black">Đăng nhập bằng QR</Text>
                </View>

                <View className="flex-1 rounded-[32px] overflow-hidden bg-black border-2 border-black relative">
                    {isFocused && (
                        <CameraView
                            style={{ flex: 1, opacity: isPending ? 0.4 : 1 }}
                            facing="back"
                            barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
                            onBarcodeScanned={handleBarcodeScanned}
                        />
                    )}

                    <View className="absolute inset-0 items-center justify-center">
                        <View className="w-[220px] h-[220px] relative">
                            <View className="absolute top-0 left-0 w-10 h-10 border-t-4 border-l-4 border-[#A3E6A1] rounded-tl-xl" />
                            <View className="absolute top-0 right-0 w-10 h-10 border-t-4 border-r-4 border-[#A3E6A1] rounded-tr-xl" />
                            <View className="absolute bottom-0 left-0 w-10 h-10 border-b-4 border-l-4 border-[#A3E6A1] rounded-bl-xl" />
                            <View className="absolute bottom-0 right-0 w-10 h-10 border-b-4 border-r-4 border-[#A3E6A1] rounded-br-xl" />
                            {!isPending && <ScanLine />}
                        </View>
                    </View>

                    {isPending && (
                        <View className="absolute inset-0 bg-black/60 items-center justify-center">
                            <ActivityIndicator size="large" color="#A3E6A1" />
                            <Text className="text-[#A3E6A1] font-space-bold mt-4 uppercase">Đang đăng nhập...</Text>
                        </View>
                    )}
                </View>

                {/* <Pressable
                    className="mt-6 rounded-[24px] p-5 bg-[#FFD700] border-2 border-black flex-row items-center shadow-md active:translate-y-1"
                    onPress={handlePickImage}
                    disabled={isPending}
                >
                    <View className="w-12 h-12 bg-white border-2 border-black rounded-xl items-center justify-center mr-4">
                        <Feather name="image" size={24} color="black" />
                    </View>
                    <View className="flex-1">
                        <Text className="text-lg font-space-bold">Tải ảnh từ thư viện</Text>
                        <Text className="text-[12px] font-space-medium opacity-60">Dùng khi bạn có ảnh QR sẵn</Text>
                    </View>
                    <AntDesign name="arrow-right" size={20} color="black" />
                </Pressable> */}
            </View>
        </SafeAreaView>
    );
}