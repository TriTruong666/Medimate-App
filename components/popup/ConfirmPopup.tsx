import { AlertCircle, Trash2 } from 'lucide-react-native';
import React from 'react';
import { Pressable, Text, View } from 'react-native';

interface ConfirmPopupProps {
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    type?: 'danger' | 'info';
    onConfirm: () => void;
    onClose: () => void;
}

export const ConfirmPopup: React.FC<ConfirmPopupProps> = ({
    title,
    message,
    confirmLabel = "Xác nhận",
    cancelLabel = "Hủy bỏ",
    type = 'danger',
    onConfirm,
    onClose
}) => {
    return (
        <View className="flex-1 justify-end">
            <Pressable className="absolute inset-0 bg-black/40" onPress={onClose} />
            <View className="bg-[#F9F6FC] border-t-4 border-black rounded-t-[32px] p-6 pb-10 shadow-2xl">
                <View className="items-center mb-8">
                    <View className="w-16 h-1.5 bg-black/10 rounded-full mb-8" />
                    <View className={`w-16 h-16 rounded-[24px] border-2 border-black items-center justify-center mb-6 shadow-sm ${type === 'danger' ? 'bg-[#FFA07A]' : 'bg-[#87CEFA]'}`}>
                        {type === 'danger' ? <Trash2 size={32} color="black" /> : <AlertCircle size={32} color="black" />}
                    </View>
                    <Text className="text-2xl font-space-bold text-black text-center px-4">{title}</Text>
                    <Text className="text-[17px] font-space-medium text-gray-500 text-center mt-3 px-6 leading-relaxed">
                        {message}
                    </Text>
                </View>

                <View className="flex-row gap-x-4">
                    <Pressable
                        onPress={onClose}
                        className="flex-1 h-14 bg-white border-2 border-black rounded-2xl items-center justify-center active:bg-gray-100 shadow-sm"
                    >
                        <Text className="font-space-bold uppercase text-black text-lg">{cancelLabel}</Text>
                    </Pressable>
                    <Pressable
                        onPress={() => {
                            onConfirm();
                            onClose();
                        }}
                        className={`flex-1 h-14 border-2 border-black rounded-2xl items-center justify-center shadow-md active:translate-y-0.5 ${type === 'danger' ? 'bg-[#FFA07A]' : 'bg-[#A3E6A1]'}`}
                    >
                        <Text className="font-space-bold uppercase text-black text-lg">{confirmLabel}</Text>
                    </Pressable>
                </View>
            </View>
        </View>
    );
};
