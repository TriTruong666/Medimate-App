import { AlertTriangle, CheckCircle2, Info, X, XCircle } from "lucide-react-native";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
    FadeInUp,
    FadeOutUp,
    Layout,
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming
} from "react-native-reanimated";
import { ToastItem as ToastItemType } from "../../stores/toastStore";

interface Props {
    item: ToastItemType;
    onRemove: (id: string) => void;
}

const TYPE_CONFIG = {
    success: {
        icon: <CheckCircle2 size={20} color="#059669" />,
        bgColor: "bg-emerald-50",
        borderColor: "border-emerald-500",
        textColor: "text-emerald-900",
    },
    error: {
        icon: <XCircle size={20} color="#dc2626" />,
        bgColor: "bg-red-50",
        borderColor: "border-red-500",
        textColor: "text-red-900",
    },
    info: {
        icon: <Info size={20} color="#2563eb" />,
        bgColor: "bg-blue-50",
        borderColor: "border-blue-500",
        textColor: "text-blue-900",
    },
    warning: {
        icon: <AlertTriangle size={20} color="#d97706" />,
        bgColor: "bg-amber-50",
        borderColor: "border-amber-500",
        textColor: "text-amber-900",
    },
};

export const ToastItem: React.FC<Props> = ({ item, onRemove }) => {
    const config = TYPE_CONFIG[item.type];
    const translateX = useSharedValue(0);
    const opacity = useSharedValue(1);

    const gesture = Gesture.Pan()
        .onUpdate((event) => {
            translateX.value = event.translationX;
        })
        .onEnd((event) => {
            if (Math.abs(event.velocityX) > 500 || Math.abs(event.translationX) > 100) {
                translateX.value = withTiming(event.translationX > 0 ? 500 : -500, { duration: 200 });
                opacity.value = withTiming(0, { duration: 200 }, () => {
                    runOnJS(onRemove)(item.id);
                });
            } else {
                translateX.value = withSpring(0);
            }
        });

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: translateX.value }],
        opacity: opacity.value,
    }));

    return (
        <GestureDetector gesture={gesture}>
            <Animated.View
                entering={FadeInUp.springify().damping(15).stiffness(120)}
                exiting={FadeOutUp.springify()}
                layout={Layout.springify().damping(15)}
                style={[animatedStyle]}
                className="mb-3 px-4"
            >
                <View
                    className={`flex-row items-center p-4 rounded-2xl border-2 ${config.bgColor} ${config.borderColor} shadow-sm`}
                    style={{
                        // Neo-brutalism shadow
                        shadowColor: '#000',
                        shadowOffset: { width: 4, height: 4 },
                        shadowOpacity: 0.1,
                        shadowRadius: 0,
                        elevation: 4,
                    }}
                >
                    <View className="mr-3">
                        {config.icon}
                    </View>

                    <View className="flex-1">
                        <Text className={`font-space-bold text-[15px] ${config.textColor}`}>
                            {item.title}
                        </Text>
                        {item.message && (
                            <Text className={`font-space-regular text-xs mt-0.5 opacity-80 ${config.textColor}`}>
                                {item.message}
                            </Text>
                        )}
                    </View>

                    {item.actionLabel && (
                        <TouchableOpacity
                            onPress={item.onAction}
                            className="px-3 py-1 bg-white/50 rounded-lg mr-2"
                        >
                            <Text className={`font-space-bold text-xs ${config.textColor}`}>
                                {item.actionLabel}
                            </Text>
                        </TouchableOpacity>
                    )}

                    <TouchableOpacity
                        onPress={() => onRemove(item.id)}
                        className="p-1"
                    >
                        <X size={16} color="currentColor" className={config.textColor} />
                    </TouchableOpacity>
                </View>
            </Animated.View>
        </GestureDetector>
    );
};
