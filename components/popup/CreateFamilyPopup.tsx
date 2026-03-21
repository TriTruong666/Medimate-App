import { useCreateSharedFamily } from "@/hooks/useFamily";
import { Check, Users, X } from "lucide-react-native";
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

export const CreateFamilyPopup = ({ onClose }: { onClose: () => void }) => {
    const [newFamilyName, setNewFamilyName] = useState("");
    const { mutate: createShared, isPending: isCreatingShared } =
        useCreateSharedFamily();

    const handleCreateFamily = () => {
        if (!newFamilyName.trim()) return;

        createShared(newFamilyName.trim(), {
            onSuccess: () => {
                setNewFamilyName("");
                onClose();
            },
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
                            <View className="w-12 h-12 bg-[#FFD700] border-2 border-black rounded-2xl items-center justify-center shadow-sm">
                                <Users size={24} color="#000" />
                            </View>
                            <View>
                                <Text className="text-xl text-black font-space-bold">
                                    Gia đình mới
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
                            Tên nhóm gia đình
                        </Text>
                        <View className="flex-row items-center bg-white border-2 border-black rounded-2xl px-4 py-1 h-14 shadow-sm">
                            <TextInput
                                value={newFamilyName}
                                onChangeText={setNewFamilyName}
                                placeholder="VD: Gia đình của Bé Cam..."
                                placeholderTextColor="#A0A0A0"
                                className="flex-1 font-space-bold text-black text-lg p-0"
                                autoFocus={true}
                            />
                        </View>
                    </View>

                    <Pressable
                        onPress={handleCreateFamily}
                        disabled={isCreatingShared || !newFamilyName.trim()}
                        className={`w-full h-14 rounded-2xl border-2 border-black flex-row items-center justify-center shadow-md ${isCreatingShared || !newFamilyName.trim()
                            ? "bg-gray-200 border-gray-400"
                            : "bg-black active:translate-y-0.5 active:shadow-sm"
                            }`}
                    >
                        {isCreatingShared ? (
                            <ActivityIndicator color="#FFF" />
                        ) : (
                            <>
                                <View className="flex-row items-center gap-x-2">
                                    <Check
                                        size={20}
                                        color={!newFamilyName.trim() ? "#666" : "#FFF"}
                                        strokeWidth={3}
                                    />
                                    <Text className={`text-lg font-space-bold uppercase tracking-widest ${!newFamilyName.trim() ? "text-gray-400" : "text-white"}`}>
                                        Xác nhận tạo
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
