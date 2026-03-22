import { useUpdateFamily } from "@/hooks/useFamily";
import { FamilyData } from "@/types/Family";
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

interface EditFamilyPopupProps {
    family: FamilyData;
    onClose: () => void;
}

export const EditFamilyPopup = ({ family, onClose }: EditFamilyPopupProps) => {
    const [familyName, setFamilyName] = useState(family.familyName);
    const { mutate: updateFamily, isPending } = useUpdateFamily();

    const handleUpdate = () => {
        if (!familyName.trim() || familyName === family.familyName) {
            onClose();
            return;
        }

        updateFamily(
            { id: family.familyId, data: { familyName: familyName.trim(), isOpenJoin: family.isOpenJoin } },
            {
                onSuccess: () => {
                    onClose();
                },
            }
        );
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
                            <View className="w-12 h-12 bg-[#D9AEF6] border-2 border-black rounded-2xl items-center justify-center shadow-sm">
                                <Edit3 size={24} color="#000" />
                            </View>
                            <View>
                                <Text className="text-xl text-black font-space-bold">
                                    Sửa tên gia đình
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

                    <View className="mb-10">
                        <Text className="text-xs font-space-bold text-gray-500 mb-2 ml-1 uppercase tracking-wider">
                            Tên gia đình mới
                        </Text>
                        <View className="flex-row items-center bg-white border-2 border-black rounded-2xl px-4 py-1 h-14 shadow-sm">
                            <TextInput
                                value={familyName}
                                onChangeText={setFamilyName}
                                placeholder="Nhập tên gia đình..."
                                placeholderTextColor="#A0A0A0"
                                className="flex-1 font-space-bold text-black text-lg p-0"
                                autoFocus={true}
                            />
                        </View>
                    </View>

                    <Pressable
                        onPress={handleUpdate}
                        disabled={isPending || !familyName.trim()}
                        className={`w-full h-14 rounded-2xl border-2 border-black flex-row items-center justify-center shadow-md ${isPending || !familyName.trim()
                            ? "bg-gray-200 border-gray-400"
                            : "bg-black active:translate-y-0.5 active:shadow-sm"
                            }`}
                    >
                        {isPending ? (
                            <ActivityIndicator color="#FFF" />
                        ) : (
                            <>
                                <View className="flex-row items-center gap-x-2">
                                    <Check
                                        size={20}
                                        color={!familyName.trim() ? "#666" : "#FFF"}
                                        strokeWidth={3}
                                    />
                                    <Text className={`text-lg font-space-bold uppercase tracking-widest ${!familyName.trim() ? "text-gray-400" : "text-white"}`}>
                                        Lưu thay đổi
                                    </Text>
                                </View>
                            </>
                        )}
                    </Pressable>
                </Pressable>
            </KeyboardAvoidingView>
        </View>
    );
};
