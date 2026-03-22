import React from "react";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { SkeletonPulsar } from "./SkeletonPulsar";

export const MemberDetailSkeleton = () => {
    return (
        <SafeAreaView className="flex-1 bg-[#F9F6FC]" edges={["top"]}>
            {/* Header Skeleton */}
            <View className="flex-row items-center justify-between px-5 pt-3 pb-4">
                <View className="w-12 h-12 bg-white border-2 border-black/10 rounded-2xl items-center justify-center shadow-sm" />
                <SkeletonPulsar className="w-40 h-7 bg-gray-200 rounded-lg" />
                <View className="w-12 h-12 bg-white border-2 border-black/10 rounded-2xl shadow-sm" />
            </View>

            <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
                {/* Avatar Skeleton */}
                <View className="items-center mb-10 mt-6">
                    <View className="w-28 h-28 rounded-[40px] border-4 border-black/5 mb-6 bg-gray-100 items-center justify-center shadow-sm">
                        <SkeletonPulsar className="w-full h-full rounded-[36px] bg-gray-200" />
                    </View>
                    <SkeletonPulsar className="w-56 h-9 bg-gray-200 rounded-xl mb-3" />
                    <SkeletonPulsar className="w-32 h-5 bg-gray-100 rounded-lg" />
                </View>

                {/* Info Card Skeleton */}
                <View className="bg-white border-2 border-black/5 rounded-[32px] p-6 mb-6 shadow-sm">
                    <SkeletonPulsar className="w-40 h-6 bg-gray-200 rounded-lg mb-8" />
                    <View className="gap-y-6">
                        {[1, 2, 3].map((i) => (
                            <View key={i} className="flex-row justify-between items-center">
                                <SkeletonPulsar className="w-24 h-4 bg-gray-100 rounded" />
                                <SkeletonPulsar className="w-36 h-4 bg-gray-200 rounded" />
                            </View>
                        ))}
                    </View>
                </View>

                {/* QR Skeleton */}
                <View className="bg-white border-2 border-black/5 rounded-[32px] p-8 mb-6 items-center shadow-sm">
                    <SkeletonPulsar className="w-48 h-48 bg-gray-200 rounded-[32px]" />
                    <SkeletonPulsar className="w-32 h-3 bg-gray-100 rounded mt-6" />
                </View>

                {/* Bottom Cards Skeleton */}
                <View className="bg-white border-2 border-black/5 rounded-[32px] p-6 mb-6 shadow-sm">
                    <View className="flex-row items-center justify-between mb-6">
                        <SkeletonPulsar className="w-48 h-7 bg-gray-200 rounded-lg" />
                        <View className="w-10 h-10 bg-gray-100 rounded-full" />
                    </View>
                    <SkeletonPulsar className="w-full h-24 bg-gray-50 rounded-[24px]" />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};
