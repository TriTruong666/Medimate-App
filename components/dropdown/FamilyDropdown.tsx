import { useAtomValue, useSetAtom } from "jotai";
import React from "react";
import { Modal, Pressable, Text, View } from "react-native";
import { dropdownAtom, hideDropdownAtom } from "../../stores/dropdownStore";

export default function FamilyDropdown() {
    const { visible, items, anchorPosition } = useAtomValue(dropdownAtom);
    const hide = useSetAtom(hideDropdownAtom);

    if (!visible) return null;

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={hide}
        >
            <Pressable className="flex-1 bg-black/5" onPress={hide}>
                <View
                    className="absolute bg-white border-2 border-black rounded-2xl overflow-hidden shadow-lg min-w-[200px]"
                    style={anchorPosition}
                >
                    {items.map((item, index) => {
                        const Icon = item.icon;
                        return (
                            <Pressable
                                key={index}
                                onPress={() => {
                                    hide();
                                    item.onPress();
                                }}
                                className={`flex-row items-center px-4 py-4 gap-x-3 active:bg-gray-100 ${index < items.length - 1 ? "border-b-2 border-black/5" : ""
                                    }`}
                            >
                                {Icon && (
                                    <View
                                        className="w-8 h-8 rounded-lg items-center justify-center border border-black/10"
                                        style={{ backgroundColor: item.color || "#F0F0F0" }}
                                    >
                                        <Icon size={18} color="#000" strokeWidth={2} />
                                    </View>
                                )}
                                <Text
                                    className={`text-[15px] font-space-bold ${item.isDestructive ? "text-red-500" : "text-black"
                                        }`}
                                >
                                    {item.label}
                                </Text>
                            </Pressable>
                        );
                    })}
                </View>
            </Pressable>
        </Modal>
    );
}
