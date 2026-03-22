import { validateHealthProfile } from "@/common/validation";
import { useCreateHealthProfile, useUpdateHealthProfile } from "@/hooks/useHealth";
import { useToast } from "@/stores/toastStore";
import { Check, Edit3, X } from "lucide-react-native";
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

interface HealthProfilePopupProps {
    memberId: string;
    profile: any | null; // Currently any, can type better later
    onClose: () => void;
}

export const HealthProfilePopup = ({ memberId, profile, onClose }: HealthProfilePopupProps) => {
    const toast = useToast();
    const [hpForm, setHpForm] = useState({
        bloodType: profile?.bloodType || "O",
        height: profile?.height?.toString() || "",
        weight: profile?.weight?.toString() || "",
        insurance: profile?.insuranceNumber || ""
    });

    const { mutate: createHP, isPending: isCreating } = useCreateHealthProfile();
    const { mutate: updateHP, isPending: isUpdating } = useUpdateHealthProfile();
    const isPending = isCreating || isUpdating;

    const handleSave = () => {
        const { isValid, message } = validateHealthProfile(hpForm.height, hpForm.weight);
        if (!isValid) {
            toast.error("Lỗi", message);
            return;
        }

        const data = {
            bloodType: hpForm.bloodType,
            height: Number(hpForm.height),
            weight: Number(hpForm.weight),
            insuranceNumber: hpForm.insurance
        };

        const action = profile ? updateHP : createHP;
        action({ memberId, data }, {
            onSuccess: () => {
                toast.success("Thành công", "Đã lưu hồ sơ sức khỏe");
                onClose();
            },
            onError: () => {
                toast.error("Lỗi", "Không thể lưu hồ sơ sức khỏe");
            }
        });
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
                            <View className="w-12 h-12 bg-[#FFF3E0] border-2 border-black rounded-2xl items-center justify-center shadow-sm">
                                <Edit3 size={24} color="#000" />
                            </View>
                            <View>
                                <Text className="text-xl text-black font-space-bold">
                                    Chỉ số sức khỏe
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

                    <View className="flex-row gap-x-4 mb-4">
                        <View className="flex-1">
                            <Text className="text-xs font-space-bold text-gray-500 mb-2 ml-1 uppercase tracking-wider">
                                Chiều cao (cm)
                            </Text>
                            <View className="flex-row items-center bg-white border-2 border-black rounded-2xl px-4 py-1 h-14 shadow-sm">
                                <TextInput
                                    value={hpForm.height}
                                    onChangeText={(t) => setHpForm({ ...hpForm, height: t })}
                                    keyboardType="numeric"
                                    placeholder="170"
                                    placeholderTextColor="#A0A0A0"
                                    className="flex-1 font-space-bold text-black text-lg p-0"
                                />
                            </View>
                        </View>
                        <View className="flex-1">
                            <Text className="text-xs font-space-bold text-gray-500 mb-2 ml-1 uppercase tracking-wider">
                                Cân nặng (kg)
                            </Text>
                            <View className="flex-row items-center bg-white border-2 border-black rounded-2xl px-4 py-1 h-14 shadow-sm">
                                <TextInput
                                    value={hpForm.weight}
                                    onChangeText={(t) => setHpForm({ ...hpForm, weight: t })}
                                    keyboardType="numeric"
                                    placeholder="65"
                                    placeholderTextColor="#A0A0A0"
                                    className="flex-1 font-space-bold text-black text-lg p-0"
                                />
                            </View>
                        </View>
                    </View>

                    <View className="mb-8">
                        <Text className="text-xs font-space-bold text-gray-500 mb-2 ml-1 uppercase tracking-wider">
                            Nhóm máu
                        </Text>
                        <View className="flex-row justify-between">
                            {["A", "B", "AB", "O"].map(t => (
                                <Pressable
                                    key={t}
                                    onPress={() => setHpForm({ ...hpForm, bloodType: t })}
                                    className={`w-[22%] py-3 rounded-[16px] border-2 border-black items-center shadow-sm ${hpForm.bloodType === t ? 'bg-[#FFD700] translate-y-0.5' : 'bg-white'}`}
                                >
                                    <Text className="font-space-bold text-black text-lg">{t}</Text>
                                </Pressable>
                            ))}
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
                                    Lưu hồ sơ
                                </Text>
                            </View>
                        )}
                    </Pressable>
                </Pressable>
            </KeyboardAvoidingView>
        </View>
    );
};
