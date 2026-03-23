import React from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";

export default function MemberHistoryScreen() {
    return (
        <SafeAreaView className="flex-1 bg-background justify-center items-center">
            <Text className="text-xl font-space-bold">Lịch sử (Sắp ra mắt)</Text>
        </SafeAreaView>
    );
}
