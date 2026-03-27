import React, { useEffect, useCallback } from 'react';
import { Dimensions, Pressable, StyleSheet, View, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
    runOnJS,
    interpolate,
    Extrapolation,
} from 'react-native-reanimated';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const THRESHOLD = 100;

interface BottomSheetBaseProps {
    children: React.ReactNode;
    onClose: () => void;
    /** If true, content is centered on screen. Default: false */
    centered?: boolean;
}

export const BottomSheetBase: React.FC<BottomSheetBaseProps> = ({
    children,
    onClose,
    centered = false,
}) => {
    // Shared values for high-performance animations
    const translateY = useSharedValue(centered ? 0 : SCREEN_HEIGHT);
    const context = useSharedValue({ y: 0 });
    const backdropOpacity = useSharedValue(0);
    const scale = useSharedValue(centered ? 0.8 : 1);

    const closeHandler = useCallback(() => {
        'worklet';
        translateY.value = withTiming(SCREEN_HEIGHT, { duration: 300 }, () => {
            runOnJS(onClose)();
        });
        backdropOpacity.value = withTiming(0, { duration: 250 });
    }, [onClose]);

    useEffect(() => {
        if (centered) {
            scale.value = withSpring(1, { 
                damping: 25, 
                stiffness: 250,
                overshootClamping: true 
            });
            backdropOpacity.value = withTiming(1, { duration: 250 });
        } else {
            // "Decisive" spring - quick, firm, no bounce
            translateY.value = withSpring(0, { 
                damping: 30, 
                stiffness: 300,
                overshootClamping: true // Force stop exactly at 0
            });
            backdropOpacity.value = withTiming(1, { duration: 250 });
        }
    }, [centered]);

    // Swipe Gesture Handler
    const gesture = Gesture.Pan()
        .enabled(!centered) // Disable swipe for centered version
        .onStart(() => {
            context.value = { y: translateY.value };
        })
        .onUpdate((event) => {
            // Allow swiping up with resistance (divide by 3 for rubber-band effect)
            if (event.translationY < 0) {
                translateY.value = event.translationY / 3;
            } else {
                translateY.value = event.translationY + context.value.y;
            }
            
            // Sync backdrop opacity with drag progress
            backdropOpacity.value = interpolate(
                translateY.value,
                [0, SCREEN_HEIGHT / 2],
                [1, 0],
                Extrapolation.CLAMP
            );
        })
        .onEnd((event) => {
            if (translateY.value > THRESHOLD || event.velocityY > 1000) {
                closeHandler();
            } else {
                translateY.value = withSpring(0, { damping: 15, stiffness: 150 });
                backdropOpacity.value = withTiming(1);
            }
        });

    const rBackdropStyle = useAnimatedStyle(() => ({
        opacity: backdropOpacity.value,
    }));

    const rSheetStyle = useAnimatedStyle(() => {
        if (centered) {
            return {
                transform: [{ scale: scale.value }],
                opacity: backdropOpacity.value,
            };
        }
        return {
            transform: [{ translateY: translateY.value }],
        };
    });

    const handlePressBackdrop = () => {
        if (centered) {
            scale.value = withTiming(0.8);
            backdropOpacity.value = withTiming(0, {}, () => {
                runOnJS(onClose)();
            });
        } else {
            closeHandler();
        }
    };

    return (
        <GestureHandlerRootView style={[styles.container, { justifyContent: centered ? 'center' : 'flex-end' }]}>
            {/* Animated Backdrop */}
            <Animated.View style={[styles.backdrop, rBackdropStyle]}>
                <Pressable style={StyleSheet.absoluteFill} onPress={handlePressBackdrop} />
            </Animated.View>

            {/* Keyboard Avoiding Wrapper */}
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={{ width: '100%', alignItems: centered ? 'center' : 'stretch' }}
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View style={centered ? { alignItems: 'center', justifyContent: 'center' } : undefined}>
                        {/* Content Container */}
                        <GestureDetector gesture={gesture}>
                            <Animated.View
                                style={[
                                    centered ? styles.centeredSheet : styles.bottomSheet,
                                    rSheetStyle
                                ]}
                            >
                                {!centered && (
                                    /* Dedicated Drag Handle Area */
                                    <View style={styles.dragHandleContainer}>
                                        <View style={styles.dragHandle} />
                                    </View>
                                )}
                                {children}
                            </Animated.View>
                        </GestureDetector>
                    </View>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
        </GestureHandlerRootView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.45)',
    },
    bottomSheet: {
        width: '100%',
        backgroundColor: '#F9F6FC',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        borderTopWidth: 4,
        borderColor: '#000',
        paddingBottom: 40,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -10 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 10,
    },
    centeredSheet: {
        width: '95%',
        // No auto margins needed anymore
    },
    dragHandleContainer: {
        width: '100%',
        height: 30,
        alignItems: 'center',
        justifyContent: 'center',
    },
    dragHandle: {
        width: 60,
        height: 6,
        backgroundColor: '#000000',
        opacity: 0.15,
        borderRadius: 3,
    },
});
