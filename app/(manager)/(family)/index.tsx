import { useRouter } from "expo-router";
import {
    ArrowLeft,
    Heart,
    MoreHorizontal,
    UserPlus
} from "lucide-react-native";
import { Image, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const FAMILY_MEMBERS = [
    {
        id: "1",
        name: "Bà Nguyễn Thị Lan",
        role: "Bà ngoại",
        age: 72,
        avatar: "https://i.pravatar.cc/100?img=49",
        color: "#D9AEF6",
        meds: 4,
        compliance: 92,
    },
    {
        id: "2",
        name: "Ông Trương Văn Hải",
        role: "Ông ngoại",
        age: 75,
        avatar: "https://i.pravatar.cc/100?img=12",
        color: "#87CEFA",
        meds: 6,
        compliance: 88,
    },
    {
        id: "3",
        name: "Mẹ Trương Thị Mai",
        role: "Mẹ",
        age: 48,
        avatar: "https://i.pravatar.cc/100?img=32",
        color: "#A3E6A1",
        meds: 2,
        compliance: 97,
    },
    {
        id: "4",
        name: "Ba Trương Minh Đức",
        role: "Ba",
        age: 50,
        avatar: "https://i.pravatar.cc/100?img=11",
        color: "#FFA07A",
        meds: 3,
        compliance: 85,
    },
];

export default function FamilyListScreen() {
    const router = useRouter();

    return (
        <SafeAreaView className="flex-1 bg-[#F9F6FC]" edges={["top"]}>
            {/* Custom Header */}
            <View className="flex-row items-center justify-between px-5 pt-3 pb-4">
                <Pressable
                    onPress={() => router.back()}
                    className="w-12 h-12 bg-white border-2 border-black rounded-2xl items-center justify-center active:opacity-80"
                >
                    <ArrowLeft size={22} color="#000" strokeWidth={2.5} />
                </Pressable>
                <View className="items-center">
                    <Text className="text-xl text-black font-space-bold">
                        Gia đình
                    </Text>
                    <Text className="text-sm text-gray-400 font-space-medium">
                        {FAMILY_MEMBERS.length} thành viên
                    </Text>
                </View>
                <Pressable className="w-12 h-12 bg-white border-2 border-black rounded-2xl items-center justify-center active:opacity-80">
                    <MoreHorizontal size={22} color="#000" strokeWidth={2.5} />
                </Pressable>
            </View>

            <ScrollView
                className="flex-1 px-5"
                contentContainerStyle={{ paddingBottom: 120 }}
                showsVerticalScrollIndicator={false}
            >
                {/* Summary Card */}
                <View className="bg-[#A3E6A1] border-2 border-black rounded-[28px] p-5 mb-5 shadow-sm">
                    <View className="flex-row items-center justify-between">
                        <View>
                            <Text className="text-sm text-black/60 font-space-bold uppercase tracking-wider">
                                Tổng quan tuần
                            </Text>
                            <View className="flex-row items-baseline mt-1">
                                <Text className="text-4xl text-black font-space-bold">
                                    91%
                                </Text>
                                <Text className="text-sm text-black/50 font-space-medium ml-2">
                                    đúng giờ
                                </Text>
                            </View>
                        </View>
                        <View className="w-14 h-14 bg-white border-2 border-black rounded-2xl items-center justify-center">
                            <Heart size={28} color="#000" fill="#EF4444" strokeWidth={2} />
                        </View>
                    </View>
                </View>

                {/* Member List */}
                <Text className="text-2xl text-black font-space-bold mb-3">
                    Thành viên
                </Text>

                <View className="gap-3">
                    {FAMILY_MEMBERS.map((member) => (
                        <Pressable
                            key={member.id}
                            className="bg-white border-2 border-black rounded-[24px] p-4 shadow-sm active:opacity-90 flex-row items-center"
                        >
                            {/* Avatar */}
                            <View
                                className="w-14 h-14 rounded-2xl border-2 border-black overflow-hidden items-center justify-center"
                                style={{ backgroundColor: member.color }}
                            >
                                <Image
                                    source={{ uri: member.avatar }}
                                    className="w-14 h-14"
                                    resizeMode="cover"
                                />
                            </View>

                            {/* Info */}
                            <View className="flex-1 ml-4">
                                <Text className="text-[16px] text-black font-space-bold">
                                    {member.name}
                                </Text>
                                <Text className="text-sm text-gray-400 font-space-medium">
                                    {member.role} • {member.age} tuổi • {member.meds} loại thuốc
                                </Text>
                            </View>

                            {/* Compliance Badge */}
                            <View
                                className="px-3 py-1.5 rounded-full border-2 border-black"
                                style={{
                                    backgroundColor:
                                        member.compliance >= 90 ? "#A3E6A1" : "#FFA07A",
                                }}
                            >
                                <Text className="text-[13px] font-space-bold text-black">
                                    {member.compliance}%
                                </Text>
                            </View>
                        </Pressable>
                    ))}
                </View>

                {/* Add Member Button */}
                <Pressable
                    onPress={() => router.push("/(manager)/(family)/new")}
                    className="bg-black border-2 border-black rounded-[24px] py-5 mt-5 shadow-lg flex-row items-center justify-center active:opacity-90"
                >
                    <UserPlus size={22} color="#FFFFFF" strokeWidth={2.5} />
                    <Text className="text-lg text-white font-space-bold ml-3">
                        Thêm thành viên
                    </Text>
                </Pressable>
            </ScrollView>
        </SafeAreaView>
    );
}
