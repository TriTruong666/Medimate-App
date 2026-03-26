import { PopupContainer } from "@/components/popup/PopupContainer";
import { usePopup } from "@/stores/popupStore";
import { useToast } from "@/stores/toastStore";
import { AntDesign } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import {
    Building2,
    Calendar,
    Check,
    FileText,
    Pill,
    Plus,
    User as UserIcon,
} from "lucide-react-native";
import React, { useState } from "react";
import { useCreatePrescription } from "@/hooks/usePrescription";
import { UpsertPrescriptionRequest } from "@/types/Prescription";
import {
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    View,
    ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export type MedicineData = {
    prescriptionMedicineId: string;
    medicineName: string;
    dosage: string;
    unit: string;
    quantity: number;
    instructions: string;
};

export default function AddManualPrescriptionScreen() {
    const toast = useToast();
    const popup = usePopup();

    const [prescriptionData, setPrescriptionData] = useState({
        prescriptionCode: "MED-" + Math.random().toString(36).substring(7).toUpperCase(),
        hospitalName: "",
        doctorName: "",
        prescriptionDate: new Date().toLocaleDateString("vi-VN"),
        notes: "",
        medicines: [] as MedicineData[],
    });

    const { mutate: createPrescription, isPending } = useCreatePrescription();

    const { memberId } = useLocalSearchParams<{ memberId: string }>();

    React.useEffect(() => {
        if (!memberId) {
            toast.error("Lỗi", "Không tìm thấy thông tin thành viên.");
            router.back();
        }
    }, [memberId]);

    const handleSavePrescription = () => {
        if (prescriptionData.medicines.length === 0) {
            toast.warning("Chưa có thuốc", "Vui lòng thêm ít nhất 1 loại thuốc.");
            return;
        }
        if (!memberId) return;

        const requestData: UpsertPrescriptionRequest = {
            prescriptionCode: prescriptionData.prescriptionCode,
            hospitalName: prescriptionData.hospitalName,
            doctorName: prescriptionData.doctorName,
            prescriptionDate: prescriptionData.prescriptionDate,
            notes: prescriptionData.notes,
            images: [],
            medicines: prescriptionData.medicines.map(m => ({
                medicineName: m.medicineName,
                dosage: m.dosage,
                unit: m.unit,
                quantity: m.quantity,
                instructions: m.instructions
            })),
        };

        createPrescription(
            { memberId, data: requestData },
            {
                onSuccess: (res) => {
                    if (res.success) {
                        router.back();
                    }
                }
            }
        );
    };

    const openAddMedicine = () => {
        popup.open({
            type: "medicine_detail",
            onSave: (newMed) => {
                setPrescriptionData((prev) => ({
                    ...prev,
                    medicines: [...prev.medicines, newMed],
                }));
                toast.success("Đã thêm", `Đã bổ sung ${newMed.medicineName}`);
            },
        });
    };

    const openEditMedicine = (med: any) => {
        popup.open({
            type: "medicine_detail",
            data: {
                ...med,
                onDelete: (id: string) => {
                    setPrescriptionData((prev) => ({
                        ...prev,
                        medicines: prev.medicines.filter(
                            (m) => m.prescriptionMedicineId !== id
                        ),
                    }));
                    popup.close();
                    toast.info("Đã xóa", "Đã xóa thuốc khỏi danh sách.");
                },
            },
            onSave: (updatedMed) => {
                setPrescriptionData((prev) => ({
                    ...prev,
                    medicines: prev.medicines.map((m) =>
                        m.prescriptionMedicineId === updatedMed.prescriptionMedicineId
                            ? updatedMed
                            : m
                    ),
                }));
                toast.success("Đã cập nhật", "Thông tin thuốc đã được thay đổi.");
            },
        });
    };

    return (
        <SafeAreaView className="flex-1 bg-[#F9F6FC]" edges={["top"]}>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                className="flex-1"
            >
                {/* Header - Minimalist Style */}
                <View className="px-6 py-4 flex-row items-center justify-between border-black/5">
                    <Pressable
                        onPress={() => router.back()}
                        className="w-12 h-12 bg-white border-2 border-black rounded-2xl items-center justify-center shadow-sm active:opacity-80"
                    >
                        <AntDesign name="arrow-left" size={24} color="black" />
                    </Pressable>
                    <View className="w-12 h-12" />
                </View>

                <ScrollView
                    className="flex-1"
                    contentContainerStyle={{ padding: 24, paddingBottom: 150 }}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Info Card */}
                    <View className="bg-white border-2 border-black rounded-[24px] p-6 shadow-md mb-8">
                        <Text className="text-lg font-space-bold mb-5 text-black border-b-2 border-black/5 pb-2">
                            Thông tin chung
                        </Text>
                        <View className="gap-y-5">
                            <View>
                                <Text className="text-[11px] font-space-bold mb-2 ml-1 uppercase text-gray-400 tracking-widest">
                                    Mã đơn (Tự động)
                                </Text>
                                <View className="flex-row items-center bg-[#F3F4F6] border-2 border-black rounded-2xl px-4 py-3 gap-x-3">
                                    <View>
                                        <FileText size={18} color="black" />
                                    </View>
                                    <Text className="text-base font-space-bold text-black flex-1">
                                        {prescriptionData.prescriptionCode}
                                    </Text>
                                </View>
                            </View>

                            <View>
                                <Text className="text-[11px] font-space-bold mb-2 ml-1 uppercase text-gray-400 tracking-widest">
                                    Cơ sở khám
                                </Text>
                                <View className="flex-row items-center bg-white border-2 border-black rounded-2xl px-4 py-1 h-14 shadow-sm gap-x-3">
                                    <View>
                                        <Building2 size={18} color="black" />
                                    </View>
                                    <TextInput
                                        value={prescriptionData.hospitalName}
                                        onChangeText={(val) =>
                                            setPrescriptionData((p) => ({ ...p, hospitalName: val }))
                                        }
                                        placeholder="VD: Bệnh viện / Phòng khám..."
                                        placeholderTextColor="#A0A0A0"
                                        className="flex-1 font-space-bold text-black text-base p-0"
                                    />
                                </View>
                            </View>

                            <View>
                                <Text className="text-[11px] font-space-bold mb-2 ml-1 uppercase text-gray-400 tracking-widest">
                                    Bác sĩ điều trị
                                </Text>
                                <View className="flex-row items-center bg-white border-2 border-black rounded-2xl px-4 py-1 h-14 shadow-sm gap-x-3">
                                    <View>
                                        <UserIcon size={18} color="black" />
                                    </View>
                                    <TextInput
                                        value={prescriptionData.doctorName}
                                        onChangeText={(val) =>
                                            setPrescriptionData((p) => ({ ...p, doctorName: val }))
                                        }
                                        placeholder="VD: BS. Nguyễn Văn A"
                                        placeholderTextColor="#A0A0A0"
                                        className="flex-1 font-space-bold text-black text-base p-0"
                                    />
                                </View>
                            </View>

                            <View>
                                <Text className="text-[11px] font-space-bold mb-2 ml-1 uppercase text-gray-400 tracking-widest">
                                    Ngày lập đơn
                                </Text>
                                <View className="flex-row items-center bg-white border-2 border-black rounded-2xl px-4 py-1 h-14 shadow-sm gap-x-3">
                                    <View>
                                        <Calendar size={18} color="black" />
                                    </View>
                                    <TextInput
                                        value={prescriptionData.prescriptionDate}
                                        onChangeText={(val) =>
                                            setPrescriptionData((p) => ({
                                                ...p,
                                                prescriptionDate: val,
                                            }))
                                        }
                                        placeholder="DD/MM/YYYY"
                                        placeholderTextColor="#A0A0A0"
                                        className="flex-1 font-space-bold text-black text-base p-0"
                                    />
                                </View>
                            </View>

                            <View>
                                <Text className="text-[11px] font-space-bold mb-2 ml-1 uppercase text-gray-400 tracking-widest">
                                    Lời dặn của bác sĩ
                                </Text>
                                <View className="bg-[#FFF9C4] border-2 border-black rounded-2xl px-4 py-3 min-h-[100px] shadow-sm">
                                    <TextInput
                                        value={prescriptionData.notes}
                                        onChangeText={(val) =>
                                            setPrescriptionData((p) => ({ ...p, notes: val }))
                                        }
                                        placeholder="Ghi chú thêm từ bác sĩ (Không bắt buộc)..."
                                        placeholderTextColor="#A0A0A0"
                                        multiline
                                        numberOfLines={3}
                                        textAlignVertical="top"
                                        className="flex-1 font-space-medium text-black text-[15px] p-0"
                                    />
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* Medicines List */}
                    <Text className="text-xl font-space-bold text-black mb-4 px-1">
                        Danh sách Thuốc ({prescriptionData.medicines.length})
                    </Text>

                    {prescriptionData.medicines.length === 0 ? (
                        <View className="bg-white border-2 border-dashed border-black/30 rounded-[24px] p-8 items-center justify-center mb-8">
                            <Pill size={40} color="#ccc" className="mb-4" />
                            <Text className="text-center font-space-medium text-gray-500 leading-relaxed">
                                Chưa có thuốc nào trong đơn. {"\n"}Hãy nhấn nút bên dưới để thêm thuốc.
                            </Text>
                        </View>
                    ) : (
                        <View className="gap-y-6 mb-8">
                            {prescriptionData.medicines.map((med) => (
                                <Pressable
                                    key={med.prescriptionMedicineId}
                                    onPress={() => openEditMedicine(med)}
                                    className="bg-white border-2 border-black rounded-[24px] overflow-hidden shadow-md active:bg-gray-50 active:scale-[0.98]"
                                >
                                    <View className="bg-[#D9AEF6] px-5 py-4 border-b-2 border-black flex-row justify-between items-center">
                                        <View className="flex-row items-center flex-1 pr-2 gap-x-3">
                                            <View className="w-10 h-10 bg-white rounded-full border-2 border-black items-center justify-center shadow-sm">
                                                <Pill size={20} color="black" />
                                            </View>
                                            <Text
                                                className="text-[17px] font-space-bold text-black flex-1"
                                                numberOfLines={1}
                                            >
                                                {med.medicineName}
                                            </Text>
                                        </View>
                                        <View className="bg-white border-2 border-black px-2 py-1 rounded-lg">
                                            <Text className="font-space-bold text-[13px] text-black">
                                                {med.quantity} {med.unit}
                                            </Text>
                                        </View>
                                    </View>
                                    <View className="p-5 gap-y-4">
                                        <View>
                                            <Text className="text-[11px] font-space-bold mb-1 ml-1 uppercase text-gray-400 tracking-widest">
                                                Liều dùng
                                            </Text>
                                            <View className="bg-[#F8F9FA] border-2 border-black rounded-xl p-3">
                                                <Text className="text-base font-space-bold text-black">
                                                    {med.dosage}
                                                </Text>
                                            </View>
                                        </View>
                                        <View>
                                            <Text className="text-[11px] font-space-bold mb-1 ml-1 uppercase text-gray-400 tracking-widest">
                                                Cách sử dụng
                                            </Text>
                                            <View className="bg-gray-50 border-2 border-dashed border-black/10 rounded-xl p-3">
                                                <Text className="text-[15px] font-space-medium text-gray-700 leading-relaxed">
                                                    {med.instructions}
                                                </Text>
                                            </View>
                                        </View>
                                    </View>
                                </Pressable>
                            ))}
                        </View>
                    )}

                    {/* Add Manual Button */}
                    <Pressable
                        onPress={openAddMedicine}
                        className="bg-white border-2 border-dashed border-black/50 rounded-[24px] py-6 flex-row items-center justify-center active:bg-gray-50 active:opacity-80"
                    >
                        <Plus size={20} color="#666" className="mr-2" strokeWidth={3} />
                        <Text className="font-space-bold text-gray-600 uppercase tracking-wider">
                            {prescriptionData.medicines.length === 0 ? "Thêm loại thuốc đầu tiên" : "Bổ sung thêm thuốc khác"}
                        </Text>
                    </Pressable>
                </ScrollView>
            </KeyboardAvoidingView>

            <View className="absolute bottom-0 left-0 right-0 bg-[#F9F6FC] px-6 pb-10 pt-4 border-t-2 border-black/5">
                <Pressable
                    disabled={isPending || prescriptionData.medicines.length === 0}
                    onPress={handleSavePrescription}
                    className={`w-full py-5 rounded-[24px] border-2 border-black flex-row items-center justify-center gap-x-2 shadow-md active:translate-y-0.5 ${prescriptionData.medicines.length > 0 ? "bg-[#A3E6A1]" : "bg-gray-200 border-gray-400"
                        } ${isPending ? "opacity-70" : ""}`}
                >
                    {isPending ? (
                        <ActivityIndicator color="black" />
                    ) : (
                        <Check size={24} color={prescriptionData.medicines.length > 0 ? "black" : "#666"} strokeWidth={3} />
                    )}
                    <Text className={`text-lg font-space-bold uppercase ${prescriptionData.medicines.length > 0 ? "text-black" : "text-gray-500"}`}>
                        {isPending ? "Đang lưu..." : "Lưu Đơn Thuốc"}
                    </Text>
                </Pressable>
            </View>
            <PopupContainer />
        </SafeAreaView>
    );
}
