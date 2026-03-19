import { useGetDemoData, usePostDemoData } from "@/hooks/data/useDemoHook";
import React, { useState } from "react";
import { ActivityIndicator, FlatList, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function DemoScreen() {
    const { data: users, isLoading, error, refetch } = useGetDemoData();
    const { mutate: postDemo, isPending } = usePostDemoData();

    const [fullName, setFullName] = useState("");
    const [phone, setPhone] = useState("");

    const handleCreateUser = () => {
        postDemo({
            phoneNumber: phone || "0123456789",
            fullName: fullName || "Nguyen Van A",
            email: "test@example.com",
            dateOfBirth: "2000-01-01",
            gender: "male",
            avatarUrl: null,
            isActive: true,
            role: "User",
        });
    };

    if (isLoading) {
        return (
            <View className="flex-1 items-center justify-center bg-white">
                <ActivityIndicator size="large" color="#3b82f6" />
            </View>
        );
    }

    if (error) {
        return (
            <View className="flex-1 items-center justify-center bg-white">
                <Text className="text-red-500">Error: {(error as Error).message}</Text>
                <TouchableOpacity onPress={() => refetch()} className="mt-4 p-3 bg-blue-500 rounded-lg">
                    <Text className="text-white font-bold">Thử lại</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-white p-4">
            <Text className="text-2xl font-bold text-center mb-6 mt-4">Demo API Test Screen</Text>

            <View className="mb-6 bg-gray-50 p-4 rounded-xl border border-gray-200 shadow-sm">
                <Text className="text-lg font-bold mb-3 text-gray-800">Tạo User Mới</Text>
                <TextInput
                    className="bg-white border border-gray-300 rounded-lg p-3 mb-3"
                    placeholder="Họ và tên..."
                    value={fullName}
                    onChangeText={setFullName}
                />
                <TextInput
                    className="bg-white border border-gray-300 rounded-lg p-3 mb-4"
                    placeholder="Số điện thoại..."
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                />
                <TouchableOpacity
                    className={`p-4 rounded-lg items-center ${isPending ? 'bg-blue-300' : 'bg-blue-600'}`}
                    onPress={handleCreateUser}
                    disabled={isPending}
                >
                    <Text className="text-white font-bold text-base">{isPending ? "Đang tạo..." : "Tạo User"}</Text>
                </TouchableOpacity>
            </View>

            <Text className="text-lg font-bold mb-3 text-gray-800">Danh sách Users:</Text>
            <FlatList
                data={users}
                keyExtractor={(item, index) => item?.userId?.toString() || index.toString()}
                renderItem={({ item }) => (
                    <View className="p-4 mb-2 bg-gray-50 border border-gray-100 rounded-lg shadow-sm flex-row justify-between items-center">
                        <View>
                            <Text className="font-bold text-base text-gray-900">{item.fullName}</Text>
                            <Text className="text-gray-600 mt-1">SĐT: {item.phoneNumber}</Text>
                        </View>
                        <View className="bg-blue-100 px-3 py-1 rounded-full">
                            <Text className="text-blue-700 font-semibold text-xs">{item.role}</Text>
                        </View>
                    </View>
                )}
                ListEmptyComponent={<Text className="text-center text-gray-500 mt-6">Không có dữ liệu user nào</Text>}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
}
