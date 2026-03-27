import { useUpdateFamily } from "@/hooks/useFamily";
import { FamilyData } from "@/types/Family";
import { Check, Edit3, X } from "lucide-react-native";
import { Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    Text,
    TextInput,
    View,
    Image,
} from "react-native";

interface EditFamilyPopupProps {
    family: FamilyData;
    onClose: () => void;
}

export const EditFamilyPopup = ({ family, onClose }: EditFamilyPopupProps) => {
    const [familyName, setFamilyName] = useState(family.familyName);
    const [avatarUri, setAvatarUri] = useState<string | null>(family.familyAvatarUrl || null);
    const [avatarFile, setAvatarFile] = useState<any>(null);

    const { mutate: updateFamily, isPending } = useUpdateFamily();

    const handlePickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["images"],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled) {
            setAvatarUri(result.assets[0].uri);
            setAvatarFile({
                uri: result.assets[0].uri,
                name: "avatar.jpg",
                type: "image/jpeg",
            });
        }
    };

    const handleUpdate = () => {
        if (!familyName.trim()) return;

        if (familyName === family.familyName && !avatarFile) {
            onClose();
            return;
        }

        updateFamily(
            { id: family.familyId, data: { familyName: familyName.trim(), isOpenJoin: family.isOpenJoin, familyAvatar: avatarFile } },
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

                    {/* Avatar Picking Section */}
                    <View className="items-center mb-6">
                        <Pressable onPress={handlePickImage} className="relative active:opacity-80">
                            <View className="w-24 h-24 rounded-full border-4 border-black bg-[#D9AEF6] items-center justify-center overflow-hidden shadow-sm">
                                {Boolean(avatarUri) ? (
                                    <Image
                                        source={{ uri: avatarUri as string }}
                                        className="w-full h-full"
                                        resizeMode="cover"
                                    />
                                ) : (
                                    <Feather name="users" size={32} color="#000" />
                                )}
                            </View>
                            <View className="absolute bottom-0 right-0 w-8 h-8 bg-[#FFD700] border-2 border-black rounded-full items-center justify-center shadow-sm">
                                <Feather name="image" size={14} color="#000" />
                            </View>
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
