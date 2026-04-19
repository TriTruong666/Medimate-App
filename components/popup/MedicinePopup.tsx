import { Check, Pill, Trash2, X } from "lucide-react-native";
import React, { useState } from "react";
import {
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    View,
} from "react-native";

export type MedicineData = {
    prescriptionMedicineId: string;
    medicineName: string;
    dosage: string;
    unit: string;
    quantity: number;
    instructions: string;
};

interface MedicinePopupProps {
    initialData?: Partial<MedicineData>;
    onSave: (data: MedicineData) => void;
    onDelete?: (id: string) => void;
    onClose: () => void;
}

const COMMON_UNITS = ["Viên", "Gói", "Chai", "Tuýp", "Ống", "Giọt", "Khác"];

export const MedicinePopup: React.FC<MedicinePopupProps> = ({
    initialData,
    onSave,
    onDelete,
    onClose,
}) => {
    const [formData, setFormData] = useState<MedicineData>({
        prescriptionMedicineId:
            initialData?.prescriptionMedicineId ||
            `new-${Math.random().toString(36).substring(7)}`,
        medicineName: initialData?.medicineName || "",
        dosage: initialData?.dosage || "",
        unit: initialData?.unit || "Viên",
        quantity: initialData?.quantity || 1,
        instructions: initialData?.instructions || "",
    });

    const [isCustomUnit, setIsCustomUnit] = useState(!COMMON_UNITS.includes(initialData?.unit || "Viên") || initialData?.unit === "Khác");

    const handleSave = () => {
        if (!formData.medicineName.trim()) return;
        onSave(formData);
    };

    const handleUnitSelect = (unit: string) => {
        if (unit === "Khác") {
            setIsCustomUnit(true);
            setFormData(p => ({ ...p, unit: "" }));
        } else {
            setIsCustomUnit(false);
            setFormData(p => ({ ...p, unit }));
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            className="flex-1 justify-end"
        >
            <Pressable className="absolute inset-0 bg-black/40" onPress={onClose} />

            <View
                className="bg-[#F9F6FC] border-t-4 border-black rounded-t-[32px] p-6 pb-10 shadow-2xl"
                style={{ minHeight: '65%' }}
            >
                {/* Header */}
                <View className="flex-row items-center justify-between mb-8">
                    <View className="flex-row items-center gap-x-2">
                        <View className="w-12 h-12 bg-[#D9AEF6] rounded-2xl border-2 border-black items-center justify-center shadow-sm">
                            <Pill size={24} color="black" />
                        </View>
                        <Text className="text-xl font-space-bold text-black">
                            {initialData?.medicineName ? "Sửa thuốc" : "Thêm thuốc mới"}
                        </Text>
                    </View>
                    <Pressable
                        onPress={onClose}
                        className="w-10 h-10 bg-white border-2 border-black rounded-full items-center justify-center active:bg-gray-100"
                    >
                        <X size={20} color="black" />
                    </Pressable>
                </View>

                <ScrollView showsVerticalScrollIndicator={false} className="flex-grow">
                    <View className="gap-y-6">
                        {/* Tên thuốc */}
                        <View>
                            <Text className="text-xs font-space-bold mb-2 ml-1 uppercase text-gray-500 tracking-wider">
                                Tên thuốc / Biệt dược
                            </Text>
                            <View className="flex-row items-center bg-white border-2 border-black rounded-2xl px-4 py-1 h-14 shadow-sm">
                                <TextInput
                                    value={formData.medicineName}
                                    onChangeText={(val) => setFormData((p) => ({ ...p, medicineName: val }))}
                                    placeholder="Nhập tên thuốc..."
                                    placeholderTextColor="#A0A0A0"
                                    className="flex-1 font-space-bold text-black text-lg p-0"
                                />
                            </View>
                        </View>

                        {/* Liều dùng */}
                        <View>
                            <Text className="text-xs font-space-bold mb-2 ml-1 uppercase text-gray-500 tracking-wider">
                                Liều dùng trích xuất
                            </Text>
                            <View className="flex-row items-center bg-white border-2 border-black rounded-2xl px-4 py-1 h-14 shadow-sm">
                                <TextInput
                                    value={formData.dosage}
                                    onChangeText={(val) => setFormData((p) => ({ ...p, dosage: val }))}
                                    placeholder="VD: 1 viên mỗi lần"
                                    placeholderTextColor="#A0A0A0"
                                    className="flex-1 font-space-bold text-black text-lg p-0"
                                />
                            </View>
                        </View>

                        {/* Chọn Đơn vị (Select Area) */}
                        <View>
                            <Text className="text-xs font-space-bold mb-3 ml-1 uppercase text-gray-500 tracking-wider">
                                Đơn vị tính
                            </Text>
                            <View className="flex-row flex-wrap gap-2 mb-3">
                                {COMMON_UNITS.map((u) => {
                                    const isSelected = isCustomUnit ? u === "Khác" : formData.unit === u;
                                    return (
                                        <Pressable
                                            key={u}
                                            onPress={() => handleUnitSelect(u)}
                                            className={`px-4 py-2 rounded-xl border-2 border-black shadow-sm ${isSelected ? 'bg-[#FFD700]' : 'bg-white'}`}
                                        >
                                            <Text className={`font-space-bold text-sm ${isSelected ? 'text-black' : 'text-gray-600'}`}>
                                                {u}
                                            </Text>
                                        </Pressable>
                                    );
                                })}
                            </View>

                            {isCustomUnit && (
                                <View className="flex-row items-center bg-white border-2 border-black rounded-2xl px-4 py-1 h-12 shadow-sm mt-1 animate-in fade-in duration-300">
                                    <TextInput
                                        value={formData.unit}
                                        onChangeText={(val) => setFormData((p) => ({ ...p, unit: val }))}
                                        placeholder="Nhập đơn vị khác..."
                                        placeholderTextColor="#A0A0A0"
                                        className="flex-1 font-space-bold text-black text-base p-0"
                                        autoFocus
                                    />
                                </View>
                            )}
                        </View>

                        {/* Số lượng */}
                        <View>
                            <Text className="text-xs font-space-bold mb-2 ml-1 uppercase text-gray-500 tracking-wider">
                                Số lượng tổng ({formData.unit || "đơn vị"})
                            </Text>
                            <View className="flex-row items-center bg-white border-2 border-black rounded-2xl px-4 py-1 h-14 shadow-sm">
                                <TextInput
                                    value={formData.quantity.toString()}
                                    onChangeText={(val) => setFormData((p) => ({ ...p, quantity: parseInt(val) || 0 }))}
                                    keyboardType="numeric"
                                    placeholderTextColor="#A0A0A0"
                                    className="flex-1 font-space-bold text-black text-lg p-0"
                                />
                            </View>
                        </View>

                        {/* Cách sử dụng */}
                        <View>
                            <Text className="text-xs font-space-bold mb-2 ml-1 uppercase text-gray-500 tracking-wider">
                                Cách sử dụng / Ghi chú
                            </Text>
                            <View className="bg-white border-2 border-black rounded-2xl px-4 py-3 min-h-[100px] shadow-sm">
                                <TextInput
                                    value={formData.instructions}
                                    onChangeText={(val) => setFormData((p) => ({ ...p, instructions: val }))}
                                    placeholder="Nhập hướng dẫn sử dụng chi tiết..."
                                    placeholderTextColor="#A0A0A0"
                                    multiline
                                    numberOfLines={4}
                                    textAlignVertical="top"
                                    className="flex-1 font-space-medium text-black text-base p-0"
                                />
                            </View>
                        </View>
                    </View>
                </ScrollView>

                {/* Footer Actions */}
                <View className="pt-6 flex-row gap-x-4">
                    {initialData?.medicineName && onDelete && (
                        <Pressable
                            onPress={() => onDelete(formData.prescriptionMedicineId)}
                            className="w-14 h-14 bg-white border-2 border-black rounded-2xl items-center justify-center active:bg-gray-100 shadow-sm"
                        >
                            <Trash2 size={24} color="#EF4444" />
                        </Pressable>
                    )}
                    <Pressable
                        onPress={handleSave}
                        disabled={!formData.medicineName.trim()}
                        className={`flex-1 h-14 rounded-2xl border-2 border-black flex-row items-center justify-center shadow-md active:translate-y-0.5 ${formData.medicineName.trim() ? "bg-[#A3E6A1]" : "bg-gray-200 border-gray-400"
                            }`}
                    >
                        <View className="flex-row items-center gap-x-2">
                            <Check size={20} color={formData.medicineName.trim() ? "black" : "#999"} strokeWidth={3} />
                            <Text className={`font-space-bold uppercase text-lg ${formData.medicineName.trim() ? "text-black" : "text-gray-400"
                                }`}>
                                Lưu thay đổi
                            </Text>
                        </View>
                    </Pressable>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
};
