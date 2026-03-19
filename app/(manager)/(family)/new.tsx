import { useRouter } from "expo-router";
import { ArrowLeft, Camera, UserPlus } from "lucide-react-native";
import { useState } from "react";
import {
    Pressable,
    ScrollView,
    Text,
    TextInput,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const RELATIONSHIPS = [
    "Ông",
    "Bà",
    "Ba",
    "Mẹ",
    "Anh/Chị",
    "Con",
    "Khác",
];

export default function AddMemberScreen() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [age, setAge] = useState("");
    const [selectedRelation, setSelectedRelation] = useState("");
    const [phone, setPhone] = useState("");
    const [note, setNote] = useState("");

    return (
        <SafeAreaView className="flex-1 bg-[#F9F6FC]" edges={["top"]}>
            {/* Header */}
            <View className="flex-row items-center justify-between px-5 pt-3 pb-4">
                <Pressable
                    onPress={() => router.back()}
                    className="w-12 h-12 bg-white border-2 border-black rounded-2xl items-center justify-center active:opacity-80"
                >
                    <ArrowLeft size={22} color="#000" strokeWidth={2.5} />
                </Pressable>
                <Text className="text-xl text-black font-space-bold">
                    Thêm thành viên
                </Text>
                <View className="w-12 h-12" />
            </View>

            <ScrollView
                className="flex-1 px-5"
                contentContainerStyle={{ paddingBottom: 120 }}
                showsVerticalScrollIndicator={false}
            >
                {/* Avatar Placeholder */}
                <View className="items-center mb-6">
                    <Pressable className="w-24 h-24 bg-[#D9AEF6] border-2 border-black rounded-3xl items-center justify-center active:opacity-80">
                        <Camera size={32} color="#000" strokeWidth={2} />
                    </Pressable>
                    <Text className="text-sm text-gray-400 font-space-medium mt-2">
                        Chọn ảnh đại diện
                    </Text>
                </View>

                {/* Form Fields */}
                <View className="gap-4">
                    {/* Họ và tên */}
                    <View>
                        <Text className="text-[15px] text-black font-space-bold mb-2">
                            Họ và tên
                        </Text>
                        <View className="bg-white border-2 border-black rounded-[20px] overflow-hidden">
                            <TextInput
                                value={name}
                                onChangeText={setName}
                                placeholder="VD: Nguyễn Thị Lan"
                                placeholderTextColor="#B0B0B0"
                                className="px-5 py-4 text-base text-black font-space-medium"
                            />
                        </View>
                    </View>

                    {/* Tuổi */}
                    <View>
                        <Text className="text-[15px] text-black font-space-bold mb-2">
                            Tuổi
                        </Text>
                        <View className="bg-white border-2 border-black rounded-[20px] overflow-hidden">
                            <TextInput
                                value={age}
                                onChangeText={setAge}
                                placeholder="VD: 72"
                                placeholderTextColor="#B0B0B0"
                                keyboardType="number-pad"
                                className="px-5 py-4 text-base text-black font-space-medium"
                            />
                        </View>
                    </View>

                    {/* Số điện thoại */}
                    <View>
                        <Text className="text-[15px] text-black font-space-bold mb-2">
                            Số điện thoại
                        </Text>
                        <View className="bg-white border-2 border-black rounded-[20px] overflow-hidden">
                            <TextInput
                                value={phone}
                                onChangeText={setPhone}
                                placeholder="VD: 0912 345 678"
                                placeholderTextColor="#B0B0B0"
                                keyboardType="phone-pad"
                                className="px-5 py-4 text-base text-black font-space-medium"
                            />
                        </View>
                    </View>

                    {/* Quan hệ */}
                    <View>
                        <Text className="text-[15px] text-black font-space-bold mb-2">
                            Quan hệ
                        </Text>
                        <View className="flex-row flex-wrap gap-2">
                            {RELATIONSHIPS.map((rel) => (
                                <Pressable
                                    key={rel}
                                    onPress={() => setSelectedRelation(rel)}
                                    className={`px-4 py-3 rounded-full border-2 border-black active:opacity-80 ${selectedRelation === rel ? "bg-black" : "bg-white"
                                        }`}
                                >
                                    <Text
                                        className={`text-sm font-space-bold ${selectedRelation === rel ? "text-white" : "text-black"
                                            }`}
                                    >
                                        {rel}
                                    </Text>
                                </Pressable>
                            ))}
                        </View>
                    </View>

                    {/* Ghi chú */}
                    <View>
                        <Text className="text-[15px] text-black font-space-bold mb-2">
                            Ghi chú
                        </Text>
                        <View className="bg-white border-2 border-black rounded-[20px] overflow-hidden">
                            <TextInput
                                value={note}
                                onChangeText={setNote}
                                placeholder="VD: Dị ứng penicillin, tiểu đường type 2..."
                                placeholderTextColor="#B0B0B0"
                                multiline
                                numberOfLines={3}
                                textAlignVertical="top"
                                className="px-5 py-4 text-base text-black font-space-medium min-h-[100px]"
                            />
                        </View>
                    </View>
                </View>

                {/* Submit Button */}
                <Pressable className="bg-black border-2 border-black rounded-[24px] py-5 mt-6 shadow-lg flex-row items-center justify-center active:opacity-90">
                    <UserPlus size={22} color="#FFFFFF" strokeWidth={2.5} />
                    <Text className="text-lg text-white font-space-bold ml-3 uppercase tracking-wider">
                        Thêm thành viên
                    </Text>
                </Pressable>
            </ScrollView>
        </SafeAreaView>
    );
}
