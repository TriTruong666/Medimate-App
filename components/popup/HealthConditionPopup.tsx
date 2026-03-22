import { validateHealthCondition } from "@/common/validation";
import { useAddHealthCondition, useUpdateHealthCondition } from "@/hooks/useHealth";
import { useToast } from "@/stores/toastStore";
import { Check, HeartPulse, X } from "lucide-react-native";
import React, { useState } from "react";
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    Text,
    TextInput,
    View,
} from "react-native";

interface HealthConditionPopupProps {
    memberId: string;
    condition: any | null; // Can type better later
    onClose: () => void;
}

export const HealthConditionPopup = ({ memberId, condition, onClose }: HealthConditionPopupProps) => {
    const toast = useToast();
    const [hcForm, setHcForm] = useState({
        name: condition?.conditionName || "",
        note: condition?.description || ""
    });

    const { mutate: addHC, isPending: isAdding } = useAddHealthCondition();
    const { mutate: updateHC, isPending: isUpdating } = useUpdateHealthCondition();
    const isPending = isAdding || isUpdating;

    const handleSave = () => {
        const { isValid, message } = validateHealthCondition(hcForm.name);
        if (!isValid) {
            toast.error("Lỗi", message);
            return;
        }

        const data = {
            conditionName: hcForm.name,
            description: hcForm.note,
            diagnosedDate: new Date().toISOString(),
            status: "Active"
        };

        if (condition) {
            updateHC({ conditionId: condition.conditionId, data }, {
                onSuccess: () => {
                    toast.success("Thành công", "Đã cập nhật bệnh lý");
                    onClose();
                },
                onError: () => toast.error("Lỗi", "Không thể cập nhật bệnh lý")
            });
        } else {
            addHC({ memberId, data }, {
                onSuccess: () => {
                    toast.success("Thành công", "Đã thêm bệnh lý mới");
                    onClose();
                },
                onError: () => toast.error("Lỗi", "Không thể thêm bệnh lý mới")
            });
        }
    };

    return (
        <View className="flex-1 justify-end">
            <Pressable className="absolute inset-0 bg-black/40" onPress={onClose} />
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                className="w-full"
            >
                <Pressable
                    className="bg-[#F9F6FC] border-t-4 border-black rounded-t-[32px] p-6 pb-10 shadow-2xl"
                    onPress={(e) => e.stopPropagation()}
                >
                    <View className="w-16 h-1.5 bg-black/10 rounded-full self-center mb-8" />

                    <View className="flex-row items-center justify-between mb-8">
                        <View className="flex-row items-center gap-x-3">
                            <View className="w-12 h-12 bg-[#FFE4E1] border-2 border-black rounded-2xl items-center justify-center shadow-sm">
                                <HeartPulse size={24} color="#000" />
                            </View>
                            <View>
                                <Text className="text-xl text-black font-space-bold">
                                    {condition ? "Sửa bệnh lý" : "Thêm bệnh lý"}
                                </Text>
                            </View>
                        </View>
                        <Pressable
                            onPress={onClose}
                            className="w-10 h-10 bg-white border-2 border-black rounded-full items-center justify-center active:bg-gray-100"
                        >
                            <X size={20} color="#000" />
                        </Pressable>
                    </View>

                    <View className="mb-4">
                        <Text className="text-xs font-space-bold text-gray-500 mb-2 ml-1 uppercase tracking-wider">
                            Tên bệnh / Tình trạng
                        </Text>
                        <View className="flex-row items-center bg-white border-2 border-black rounded-2xl px-4 py-1 h-14 shadow-sm">
                            <TextInput
                                value={hcForm.name}
                                onChangeText={(t) => setHcForm({ ...hcForm, name: t })}
                                placeholder="VD: Cao huyết áp"
                                placeholderTextColor="#A0A0A0"
                                className="flex-1 font-space-bold text-black text-lg p-0"
                            />
                        </View>
                    </View>

                    <View className="mb-8">
                        <Text className="text-xs font-space-bold text-gray-500 mb-2 ml-1 uppercase tracking-wider">
                            Ghi chú / Mô tả
                        </Text>
                        <View className="bg-white border-2 border-black rounded-2xl p-4 shadow-sm min-h-[100px]">
                            <TextInput
                                value={hcForm.note}
                                onChangeText={(t) => setHcForm({ ...hcForm, note: t })}
                                multiline
                                placeholder="VD: Cần theo dõi hàng ngày"
                                placeholderTextColor="#A0A0A0"
                                className="flex-1 font-space-bold text-black text-lg p-0"
                                style={{ textAlignVertical: 'top' }}
                            />
                        </View>
                    </View>

                    <Pressable
                        onPress={handleSave}
                        disabled={isPending}
                        className={`w-full h-14 rounded-[24px] border-2 border-black flex-row items-center justify-center shadow-md ${isPending
                            ? "bg-gray-200 border-gray-400"
                            : "bg-[#A3E6A1] active:opacity-80 active:translate-y-0.5"
                            }`}
                    >
                        {isPending ? (
                            <ActivityIndicator color="#000" />
                        ) : (
                            <View className="flex-row items-center gap-x-2">
                                <Check size={20} color="#000" strokeWidth={3} />
                                <Text className="text-lg font-space-bold uppercase text-black tracking-widest">
                                    Xác nhận
                                </Text>
                            </View>
                        )}
                    </Pressable>
                </Pressable>
            </KeyboardAvoidingView>
        </View>
    );
};
