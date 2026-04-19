import { usePopup } from "@/stores/popupStore";
import { AntDesign } from "@expo/vector-icons";
import { router } from "expo-router";
import { FileEdit, FileText, Image as ImageIcon, ScanLine, Sparkles } from "lucide-react-native";
import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function PrescriptionIndexScreen() {
    const popup = usePopup();

    const handleSelectMethod = (method: 'scan' | 'upload' | 'manual' | 'empty') => {
        popup.open({
            type: "select_family_member",
            onSave: (member) => {
                const routeMap = {
                    scan: "/(manager)/(prescription)/scan_prescription",
                    upload: "/(manager)/(prescription)/upload_prescription",
                    manual: "/(manager)/(prescription)/add_manual_prescription",
                    empty: "/(manager)/(prescription)/add_empty_prescription",
                } as const;
                router.push({
                    pathname: routeMap[method],
                    params: { memberId: member.memberId }
                });
            }
        });
    };

    return (
        <SafeAreaView className="flex-1 bg-[#F9F6FC]" edges={["top"]}>
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
                    <Pressable onPress={() => handleSelectMethod('scan')} className="bg-[#A3E6A1] border-2 border-black rounded-[32px] p-6 shadow-md relative overflow-hidden active:opacity-80">
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

                    {/* 2. Chế độ Upload Ảnh */}
                    <Pressable onPress={() => handleSelectMethod('upload')} className="bg-[#D9AEF6] border-2 border-black rounded-[32px] p-6 shadow-md relative overflow-hidden active:opacity-80 mt-1">
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
                            Tải lên ảnh chụp hóa đơn thuốc từ bệnh viện rõ nét từ thư viện máy để phân tích thành đơn nhắc nhở tự động.
                        </Text>
                    </Pressable>

                    {/* THỦ CÔNG SECTION */}
                    <View className="mt-4 mb-1">
                        <Text className="text-xs font-space-bold ml-1 uppercase text-gray-500 tracking-wider">Hoặc nhập dữ liệu cơ bản (Đơn từ bệnh viện)</Text>
                    </View>

                    {/* 3. Nhập thủ công */}
                    <Pressable onPress={() => handleSelectMethod('manual')} className="bg-[#e5eecf] border-[3px] border-dashed border-gray-500 rounded-[28px] p-5 active:opacity-80">
                        <View className="flex-row items-center gap-x-4">
                            <View className="w-12 h-12 bg-gray-100 border-2 border-gray-200 rounded-2xl items-center justify-center">
                                <FileEdit size={24} color="#2f3520" strokeWidth={2.5} />
                            </View>
                            <View className="flex-1">
                                <Text className="text-[17px] font-space-bold text-gray-700 leading-tight mb-1">
                                    Nhập đơn thuốc thủ công từ bệnh viện
                                </Text>
                                <Text className="text-[13px] font-space-medium text-gray-500 leading-snug">
                                    Nhập tay thông tin, từng loại thuốc và canh chỉnh thời gian tùy ý.
                                </Text>
                            </View>
                        </View>
                    </Pressable>
                    <View className="mt-4 mb-1">
                        <Text className="text-xs font-space-bold ml-1 uppercase text-gray-500 tracking-wider">Hoặc tạo đơn trống (Đơn ngooài)</Text>
                    </View>
                    {/* 4. Đơn ngoài bệnh viện */}
                    <Pressable onPress={() => handleSelectMethod('empty')} className="bg-[#bec2cc] border-dashed border-gray-300 rounded-[28px] p-5 shadow-sm active:opacity-80">
                        <View className="flex-row items-center gap-x-4">
                            <View className="w-12 h-12 bg-[#FDE68A] border-2 border-black rounded-2xl items-center justify-center">
                                <FileText size={24} color="#000" strokeWidth={2.5} />
                            </View>
                            <View className="flex-1">
                                <View className="flex-row items-center gap-x-2 mb-1">
                                    <Text className="text-[17px] font-space-bold text-black leading-tight">
                                        Đơn ngoài bệnh viện
                                    </Text>

                                </View>
                                <Text className="text-[13px] font-space-medium text-gray-600 leading-snug">
                                    Tạo đơn trống từ nhà thuốc / phòng khám, thêm thuốc sau.
                                </Text>
                            </View>
                        </View>
                    </Pressable>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
