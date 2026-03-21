import { AntDesign } from "@expo/vector-icons";
import { Link, router } from "expo-router";
import { FileEdit, Image as ImageIcon, ScanLine, Sparkles } from "lucide-react-native";
import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function PrescriptionIndexScreen() {
    return (
        <SafeAreaView className="flex-1 bg-[#F9F6FC]" edges={["top"]}>
            {/* Header Neo-Brutalism */}
            <View className="px-6 py-4 flex-row items-center bg-[#F9F6FC]">
                <Pressable
                    onPress={() => router.back()}
                    className="w-12 h-12 bg-white border-2 border-black rounded-2xl items-center justify-center mr-4 shadow-sm active:opacity-80"
                >
                    <AntDesign name="arrow-left" size={24} color="black" />
                </Pressable>
            </View>

            <ScrollView
                className="flex-1"
                contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 60 }}
                showsVerticalScrollIndicator={false}
            >
                <View className="mb-6 mt-2">
                    <Text className="text-[32px] font-space-bold text-black mb-3 leading-tight tracking-tight">
                        Thêm đơn thuốc
                    </Text>
                    <Text className="text-[15px] font-space-medium text-gray-500 leading-normal">
                        Chưa có lịch uống thuốc nào. Sử dụng trí tuệ nhân tạo (AI) để tạo lịch siêu tốc hoặc nhập thủ công tự do.
                    </Text>
                </View>

                <View className="gap-y-4">
                    {/* KHUYÊN DÙNG SECTION */}
                    <Text className="text-xs font-space-bold ml-1 uppercase text-gray-500 tracking-wider">Tự động bằng AI (Khuyên dùng)</Text>

                    {/* 1. Chế độ Scan */}
                    <Link href="/(manager)/(prescription)/scan_prescription" asChild>
                        <Pressable className="bg-[#A3E6A1] border-2 border-black rounded-[32px] p-6 shadow-md relative overflow-hidden active:opacity-80">
                            {/* Decorative Decor */}
                            <View className="absolute -top-10 -right-10 w-32 h-32 bg-white/30 rounded-full" />

                            <View className="flex-row items-center justify-between mb-4 relative z-10">
                                <View className="w-14 h-14 bg-white border-2 border-black rounded-2xl items-center justify-center">
                                    <ScanLine size={28} color="#000" strokeWidth={2.5} />
                                </View>
                                <View className="bg-black px-3 py-1.5 rounded-full flex-row items-center gap-x-1.5">
                                    <Sparkles size={14} color="#FFD700" fill="#FFD700" />
                                    <Text className="text-white text-xs font-space-bold uppercase tracking-wide">AI Nhận diện</Text>
                                </View>
                            </View>

                            <Text className="text-[22px] font-space-bold text-black mb-2 leading-tight relative z-10">
                                Quét bằng Camera
                            </Text>
                            <Text className="text-[14px] font-space-medium text-black/80 leading-snug relative z-10">
                                Đưa camera vào toa thuốc mua từ viện, hệ thống AI sẽ tự động đọc, trích xuất liều lượng và tạo lịch nhắc tức thì.
                            </Text>
                        </Pressable>
                    </Link>

                    {/* 2. Chế độ Upload Ảnh */}
                    <Link href="/(manager)/(prescription)/upload_prescription" asChild>
                        <Pressable className="bg-[#D9AEF6] border-2 border-black rounded-[32px] p-6 shadow-md relative overflow-hidden active:opacity-80 mt-1">
                            {/* Decorative Decor */}
                            <View className="absolute -bottom-10 -right-10 w-32 h-32 bg-white/20 rounded-full" />

                            <View className="flex-row items-center justify-between mb-4 relative z-10">
                                <View className="w-14 h-14 bg-white border-2 border-black rounded-2xl items-center justify-center">
                                    <ImageIcon size={28} color="#000" strokeWidth={2.5} />
                                </View>
                                <View className="bg-black px-3 py-1.5 rounded-full flex-row items-center gap-x-1.5">
                                    <Sparkles size={14} color="#FFD700" fill="#FFD700" />
                                    <Text className="text-white text-xs font-space-bold uppercase tracking-wide">AI Nhận diện</Text>
                                </View>
                            </View>

                            <Text className="text-[22px] font-space-bold text-black mb-2 leading-tight relative z-10">
                                Tải ảnh có sẵn lên
                            </Text>
                            <Text className="text-[14px] font-space-medium text-black/80 leading-snug relative z-10">
                                Tải lên ảnh chụp hóa đơn thuốc rõ nét từ thư viện máy để phân tích thành đơn nhắc nhở tự động.
                            </Text>
                        </Pressable>
                    </Link>

                    {/* THỦ CÔNG SECTION */}
                    <View className="mt-4 mb-1">
                        <Text className="text-xs font-space-bold ml-1 uppercase text-gray-500 tracking-wider">Hoặc nhập dữ liệu cơ bản</Text>
                    </View>

                    {/* 3. Chế độ Nhập Thủ Công (Hạ cấp UI) */}
                    <Link href="/(manager)/(prescription)/add_manual_prescription" asChild>
                        <Pressable className="bg-white border-[3px] border-dashed border-gray-300 rounded-[28px] p-5 active:opacity-80">
                            <View className="flex-row items-center gap-x-4">
                                <View className="w-12 h-12 bg-gray-100 border-2 border-gray-200 rounded-2xl items-center justify-center">
                                    <FileEdit size={24} color="#6B7280" strokeWidth={2.5} />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-[17px] font-space-bold text-gray-700 leading-tight mb-1">
                                        Nhập đơn thuốc thủ công
                                    </Text>
                                    <Text className="text-[13px] font-space-medium text-gray-500 leading-snug">
                                        Nhập tay thông tin, từng loại thuốc và canh chỉnh thời gian tùy ý.
                                    </Text>
                                </View>
                            </View>
                        </Pressable>
                    </Link>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
