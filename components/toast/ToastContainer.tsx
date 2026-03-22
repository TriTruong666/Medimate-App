import { useAtom } from "jotai";
import React from "react";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { toastsAtom, useToast } from "../../stores/toastStore";
import { ToastItem } from "./ToastItem";

export const ToastContainer: React.FC = () => {
    const [toasts] = useAtom(toastsAtom);
    const { remove } = useToast();
    const insets = useSafeAreaInsets();

    if (toasts.length === 0) return null;

    return (
        <View
            pointerEvents="box-none"
            style={[styles.container, { paddingTop: insets.top + 10 }]}
        >
            {toasts.map((toast) => (
                <ToastItem
                    key={toast.id}
                    item={toast}
                    onRemove={remove}
                />
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
    },
});
