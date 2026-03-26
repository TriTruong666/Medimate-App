import { useGetFamilies } from '@/hooks/useFamily';
import { useGetFamilyMembers } from '@/hooks/useFamily';
import { AntDesign } from '@expo/vector-icons';
import { Check, ChevronRight, User as UserIcon, Users, X } from 'lucide-react-native';
import React, { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View, Image } from 'react-native';

interface SelectFamilyMemberPopupProps {
    onSave: (member: any) => void;
    onClose: () => void;
}

export const SelectFamilyMemberPopup: React.FC<SelectFamilyMemberPopupProps> = ({
    onSave,
    onClose
}) => {
    const [selectedFamilyId, setSelectedFamilyId] = useState<string | null>(null);
    const [selectedMember, setSelectedMember] = useState<any | null>(null);

    const { data: families, isLoading: isLoadingFamilies } = useGetFamilies();
    const { data: members, isLoading: isLoadingMembers } = useGetFamilyMembers(selectedFamilyId || undefined);

    const handleConfirm = () => {
        if (!selectedMember) return;
        onSave(selectedMember);
    };

    return (
        <View className="flex-1 justify-end">
            <Pressable className="absolute inset-0 bg-black/40" onPress={onClose} />
            <View className="bg-[#F9F6FC] border-t-4 border-black rounded-t-[32px] p-6 pb-10 shadow-2xl h-[85%]">
                <View className="items-center mb-6">
                    <View className="w-16 h-1.5 bg-black/10 rounded-full mb-8" />
                    <View className="flex-row items-center justify-between w-full mb-6">
                        <View className="flex-row items-center gap-x-3">
                            {selectedFamilyId ? (
                                <Pressable 
                                    onPress={() => {
                                        setSelectedFamilyId(null);
                                        setSelectedMember(null);
                                    }}
                                    className="w-12 h-12 bg-white border-2 border-black rounded-xl items-center justify-center active:bg-gray-100 shadow-sm mr-2"
                                >
                                    <AntDesign name="arrow-left" size={24} color="black" />
                                </Pressable>
                            ) : (
                                <View className="w-12 h-12 bg-[#D9AEF6] border-2 border-black rounded-xl items-center justify-center shadow-sm">
                                    <Users size={24} color="black" />
                                </View>
                            )}
                            
                            <View>
                                <Text className="text-xl font-space-bold text-black uppercase">
                                    {selectedFamilyId ? "Chọn thành viên" : "Chọn gia đình"}
                                </Text>
                                <Text className="text-[12px] font-space-medium text-gray-500">
                                    {selectedFamilyId ? "Ai là người dùng đơn thuốc này?" : "Đơn thuốc này thuộc về nhóm nào?"}
                                </Text>
                            </View>
                        </View>
                        <Pressable
                            onPress={onClose}
                            className="w-10 h-10 bg-white border-2 border-black rounded-xl items-center justify-center active:bg-gray-100 shadow-sm"
                        >
                            <X size={20} color="black" />
                        </Pressable>
                    </View>
                </View>

                <ScrollView showsVerticalScrollIndicator={false} className="flex-1 mb-6">
                    <View className="gap-y-4">
                        {!selectedFamilyId ? (
                            // Render Families
                            isLoadingFamilies ? (
                                <ActivityIndicator color="black" className="mt-10" />
                            ) : (
                                families?.map((family: any) => (
                                    <Pressable
                                        key={family.familyId}
                                        onPress={() => setSelectedFamilyId(family.familyId)}
                                        className="flex-row items-center p-4 rounded-2xl bg-white border-2 border-black shadow-sm active:translate-y-0.5"
                                    >
                                        <View className="w-12 h-12 rounded-full border-2 border-black items-center justify-center bg-[#D9AEF6] overflow-hidden">
                                            {family.familyAvatarUrl ? (
                                                <Image source={{ uri: family.familyAvatarUrl }} className="w-full h-full" resizeMode="cover" />
                                            ) : (
                                                <Users size={24} color="black" />
                                            )}
                                        </View>
                                        <View className="flex-1 ml-4">
                                            <Text className="text-[17px] font-space-bold text-black">
                                                {family.familyName}
                                            </Text>
                                        </View>
                                        <ChevronRight size={24} color="black" />
                                    </Pressable>
                                ))
                            )
                        ) : (
                            // Render Members
                            isLoadingMembers ? (
                                <ActivityIndicator color="black" className="mt-10" />
                            ) : (
                                members?.map((member: any) => {
                                    const isSelected = selectedMember?.memberId === member.memberId;
                                    return (
                                        <Pressable
                                            key={member.memberId}
                                            onPress={() => setSelectedMember(member)}
                                            className={`flex-row items-center p-4 rounded-2xl border-2 shadow-sm active:translate-y-0.5 ${isSelected ? 'bg-black border-black' : 'bg-white border-black/20'} gap-x-4`}
                                        >
                                            <View className="w-12 h-12 rounded-full border-2 border-black items-center justify-center shadow-sm bg-[#87CEFA]">
                                                <UserIcon size={24} color="black" />
                                            </View>
                                            <View className="flex-1">
                                                <Text className={`text-[17px] font-space-bold ${isSelected ? 'text-white' : 'text-black'}`}>
                                                    {member.fullName}
                                                </Text>
                                                <Text className={`text-[13px] font-space-medium ${isSelected ? 'text-gray-300' : 'text-gray-500'}`}>
                                                    Vai trò: {member.role || 'Thành viên'}
                                                </Text>
                                            </View>
                                            <View className={`w-8 h-8 rounded-full border-2 items-center justify-center ${isSelected ? 'bg-[#A3E6A1] border-black' : 'bg-[#F3F4F6] border-black/20'}`}>
                                                {isSelected && <Check size={16} color="black" strokeWidth={3} />}
                                            </View>
                                        </Pressable>
                                    );
                                })
                            )
                        )}
                    </View>
                </ScrollView>

                <View className="flex-row gap-x-4">
                    <Pressable
                        onPress={onClose}
                        className="flex-1 h-14 bg-white border-2 border-black rounded-2xl items-center justify-center active:bg-gray-100 shadow-sm"
                    >
                        <Text className="font-space-bold uppercase text-black text-lg">Hủy</Text>
                    </Pressable>
                    <Pressable
                        onPress={handleConfirm}
                        disabled={!selectedMember}
                        className={`flex-1 h-14 border-2 border-black rounded-2xl items-center justify-center shadow-md active:translate-y-0.5 ${selectedMember ? 'bg-[#A3E6A1]' : 'bg-gray-200 border-gray-400'}`}
                    >
                        <Text className={`font-space-bold uppercase text-lg ${selectedMember ? 'text-black' : 'text-gray-400'}`}>
                            Xác nhận
                        </Text>
                    </Pressable>
                </View>
            </View>
        </View>
    );
};
