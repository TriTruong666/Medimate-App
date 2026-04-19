import { useDeletePrescription, useGetMemberPrescriptions } from "@/hooks/usePrescription";
import { AntDesign } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Edit3, Trash2 } from "lucide-react-native";
import React from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function MemberPrescriptionsScreen() {
    const router = useRouter();
    const { memberId, memberName } = useLocalSearchParams<{ memberId: string, memberName: string }>();

    const { data: prescriptions, isLoading: isLoadingPrescriptions } = useGetMemberPrescriptions(memberId);
    const { mutate: deletePrescription, isPending: isDeletingPrescription } = useDeletePrescription();

    const handleDeletePrescription = (prescriptionId: string, name: string) => {
        Alert.alert(
            "Xoá đơn thuốc",
            `Bạn có chắc muốn xoá đơn thuốc tại "${name}" không?`,
            [
                { text: "Huỷ", style: "cancel" },
                {
                    text: "Xoá", style: "destructive", onPress: () => {
                        deletePrescription(prescriptionId);
                    }
                }
            ]
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-[#F9F6FC]" edges={["top"]}>
            {/* Header */}
            <View className="flex-row items-center justify-between px-5 pt-3 pb-4">
                <Pressable
                    onPress={() => router.back()}
                    className="w-12 h-12 bg-white border-2 border-black rounded-2xl items-center justify-center shadow-sm active:opacity-80"
                >
                    <AntDesign name="arrow-left" size={24} color="black" />
                </Pressable>
                <Text className="text-xl text-black font-space-bold">
                    Đơn thuốc
                </Text>
                {/* Spacer */}
                <View className="w-12 h-12" />
            </View>

            <ScrollView className="flex-1 px-5" contentContainerStyle={{ paddingBottom: 120, paddingTop: 10 }} showsVerticalScrollIndicator={false}>
                <View className="mb-6">
                    <Text className="text-2xl text-black font-space-bold flex-wrap truncate">
                        {memberName || "Thành viên"}
                    </Text>
                    <Text className="text-sm text-gray-500 font-space-medium mt-1">
                        Danh sách các đơn thuốc đã lưu
                    </Text>
                </View>

                {isLoadingPrescriptions ? (
                    <View className="mb-6 items-center justify-center py-20">
                        <ActivityIndicator size="large" color="#000" />
                    </View>
                ) : !prescriptions || prescriptions.length === 0 ? (
                    <View className="bg-white border-2 border-black/10 rounded-[20px] p-8 mt-10 items-center justify-center border-dashed">
                        <Text className="text-gray-400 font-space-medium text-center text-lg">
                            Thành viên này chưa có đơn thuốc nào.
                        </Text>
                    </View>
                ) : (
                    <View className="gap-y-5 mb-6">
                        {prescriptions.map((pres) => (
                            <View key={pres.prescriptionId} className="bg-white border-2 border-black rounded-[24px] p-5 shadow-sm">
                                <View className="flex-row justify-between items-start mb-3">
                                    <View className="flex-1 mr-2">
                                        <Text className="text-[17px] font-space-bold text-black" numberOfLines={1}>
                                            {pres.hospitalName || "Đơn thuốc cá nhân"}
                                        </Text>
                                        <View className="flex-row items-center mt-1">
                                            <View className={`px-2 py-0.5 rounded-md border border-black/20 mr-2 ${pres.status === 'Active' ? 'bg-[#A3E6A1]' : pres.status === 'Completed' ? 'bg-gray-200' : 'bg-gray-100'}`}>
                                                <Text className="text-[10px] font-space-bold text-black uppercase">
                                                    {pres.status === 'Active' ? 'Đang dùng' : pres.status === 'Completed' ? 'Đã xong' : pres.status || 'Chờ'}
                                                </Text>
                                            </View>
                                            <Text className="text-xs font-space-medium text-gray-500">
                                                {pres.doctorName ? `BS. ${pres.doctorName}` : "Chưa có tên BS"} • {pres.prescriptionDate ? new Date(pres.prescriptionDate).toLocaleDateString('vi-VN') : "N/A"}
                                            </Text>
                                        </View>
                                    </View>
                                    <View className="flex-row gap-x-2">
                                        {/* Nút Sửa */}
                                        <Pressable
                                            onPress={() => router.push({
                                                pathname: "/(manager)/(prescription)/edit_prescription",
                                                params: { prescriptionId: pres.prescriptionId, memberId }
                                            } as any)}
                                            className="w-8 h-8 bg-blue-100 border-2 border-black rounded-lg items-center justify-center active:bg-blue-200"
                                        >
                                            <Edit3 size={14} color="#000" strokeWidth={2.5} />
                                        </Pressable>

                                        {/* Nút Xoá */}
                                        <Pressable
                                            onPress={() => handleDeletePrescription(pres.prescriptionId, pres.hospitalName || "Đơn thuốc cá nhân")}
                                            className="w-8 h-8 bg-red-100 border-2 border-black rounded-lg items-center justify-center active:bg-red-200"
                                            disabled={isDeletingPrescription}
                                        >
                                            {isDeletingPrescription ? <ActivityIndicator size="small" color="#000" /> : <Trash2 size={14} color="#000" strokeWidth={2.5} />}
                                        </Pressable>
                                    </View>
                                </View>

                                <View className="bg-gray-50 rounded-xl p-3 border border-gray-200">
                                    <Text className="text-sm font-space-bold text-black mb-1.5">Gồm {pres.medicines?.length || 0} loại thuốc:</Text>
                                    {pres.medicines?.slice(0, 3).map((med, idx) => (
                                        <Text key={idx} className="text-xs font-space-medium text-gray-600 mb-0.5" numberOfLines={1}>
                                            • {med.medicineName} ({med.quantity} {med.unit})
                                        </Text>
                                    ))}
                                    {(pres.medicines?.length ?? 0) > 3 && (
                                        <Text className="text-xs font-space-bold text-gray-400 mt-1 italic">
                                            + {pres.medicines!.length - 3} loại khác...
                                        </Text>
                                    )}
                                </View>
                            </View>
                        ))}
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}
