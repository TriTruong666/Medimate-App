import { Check, User as UserIcon, Users, X } from 'lucide-react-native';
import React, { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

const MOCK_MEMBERS = [
    { id: '1', name: 'Ông nội', relationship: 'Ông', color: '#D9AEF6' },
    { id: '2', name: 'Bà ngoại', relationship: 'Bà', color: '#87CEFA' },
    { id: '3', name: 'Trí Thịnh', relationship: 'Tôi', color: '#FFD700' },
    { id: '4', name: 'Trí Thịnh', relationship: 'Tôi', color: '#FFD700' },

    { id: '5', name: 'Trí Thịnh', relationship: 'Tôi', color: '#FFD700' },

    { id: '6', name: 'Trí Thịnh', relationship: 'Tôi', color: '#FFD700' },

    { id: '7', name: 'Trí Thịnh', relationship: 'Tôi', color: '#FFD700' },
    { id: '8', name: 'Trí Thịnh', relationship: 'Tôi', color: '#FFD700' },

];

interface AssignMemberPopupProps {
    onSave: (member: any) => void;
    onClose: () => void;
}

export const AssignMemberPopup: React.FC<AssignMemberPopupProps> = ({
    onSave,
    onClose
}) => {
    const [selectedId, setSelectedId] = useState<string | null>(null);

    const handleConfirm = () => {
        if (!selectedId) return;
        const member = MOCK_MEMBERS.find(m => m.id === selectedId);
        onSave(member);
    };

    return (
        <View className="flex-1 justify-end">
            <Pressable className="absolute inset-0 bg-black/40" onPress={onClose} />
            <View className="bg-[#F9F6FC] border-t-4 border-black rounded-t-[32px] p-6 pb-10 shadow-2xl h-[85%]">
                <View className="items-center mb-6">
                    <View className="w-16 h-1.5 bg-black/10 rounded-full mb-8" />
                    <View className="flex-row items-center justify-between w-full mb-6">
                        <View className="flex-row items-center gap-x-3">
                            <View className="w-12 h-12 bg-[#D9AEF6] border-2 border-black rounded-xl items-center justify-center shadow-sm">
                                <Users size={24} color="black" />
                            </View>
                            <View>
                                <Text className="text-xl font-space-bold text-black uppercase">Chỉ định cho</Text>
                                <Text className="text-[12px] font-space-medium text-gray-500">Ai là người dùng đơn thuốc này?</Text>
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
                        {MOCK_MEMBERS.map((member) => {
                            const isSelected = selectedId === member.id;
                            return (
                                <Pressable
                                    key={member.id}
                                    onPress={() => setSelectedId(member.id)}
                                    className={`flex-row items-center p-4 rounded-2xl border-2 shadow-sm active:translate-y-0.5 ${isSelected
                                        ? 'bg-black border-black'
                                        : 'bg-white border-black/20'
                                        } gap-x-4`}
                                >
                                    <View
                                        className="w-12 h-12 rounded-full border-2 border-black items-center justify-center shadow-sm"
                                        style={{ backgroundColor: member.color }}
                                    >
                                        <UserIcon size={24} color="black" />
                                    </View>
                                    <View className="flex-1">
                                        <Text className={`text-[17px] font-space-bold ${isSelected ? 'text-white' : 'text-black'}`}>
                                            {member.name}
                                        </Text>
                                        <Text className={`text-[13px] font-space-medium ${isSelected ? 'text-gray-300' : 'text-gray-500'}`}>
                                            Bộ hồ sơ: {member.relationship}
                                        </Text>
                                    </View>
                                    <View
                                        className={`w-8 h-8 rounded-full border-2 items-center justify-center ${isSelected ? 'bg-[#A3E6A1] border-black' : 'bg-[#F3F4F6] border-black/20'
                                            }`}
                                    >
                                        {isSelected && <Check size={16} color="black" strokeWidth={3} />}
                                    </View>
                                </Pressable>
                            );
                        })}
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
                        disabled={!selectedId}
                        className={`flex-1 h-14 border-2 border-black rounded-2xl items-center justify-center shadow-md active:translate-y-0.5 ${selectedId ? 'bg-[#A3E6A1]' : 'bg-gray-200 border-gray-400'
                            }`}
                    >
                        <Text className={`font-space-bold uppercase text-lg ${selectedId ? 'text-black' : 'text-gray-400'}`}>
                            Xác nhận
                        </Text>
                    </Pressable>
                </View>
            </View>
        </View>
    );
};
