import { useLocalSearchParams, useRouter } from "expo-router";
import {
    ArrowLeft,
    Clock,
    Pill,
    Share2,
    Trash2,
    TrendingUp,
} from "lucide-react-native";
import { Image, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const MEMBER_DATA: Record<
    string,
    {
        name: string;
        role: string;
        age: number;
        avatar: string;
        color: string;
        compliance: number;
        meds: {
            name: string;
            dosage: string;
            time: string;
            color: string;
        }[];
    }
> = {
    "1": {
        name: "Bà Nguyễn Thị Lan",
        role: "Bà ngoại",
        age: 72,
        avatar: "https://i.pravatar.cc/100?img=49",
        color: "#D9AEF6",
        compliance: 92,
        meds: [
            { name: "Amlodipine", dosage: "5mg • 1 viên", time: "08:00 Sáng", color: "#A3E6A1" },
            { name: "Metformin", dosage: "500mg • 2 viên", time: "12:00 Trưa", color: "#FFD700" },
            { name: "Losartan", dosage: "50mg • 1 viên", time: "20:00 Tối", color: "#D9AEF6" },
        ],
    },
    "2": {
        name: "Ông Trương Văn Hải",
        role: "Ông ngoại",
        age: 75,
        avatar: "https://i.pravatar.cc/100?img=12",
        color: "#87CEFA",
        compliance: 88,
        meds: [
            { name: "Lisinopril", dosage: "10mg • 1 viên", time: "07:00 Sáng", color: "#87CEFA" },
            { name: "Aspirin", dosage: "81mg • 1 viên", time: "07:00 Sáng", color: "#FFA07A" },
        ],
    },
    "3": {
        name: "Mẹ Trương Thị Mai",
        role: "Mẹ",
        age: 48,
        avatar: "https://i.pravatar.cc/100?img=32",
        color: "#A3E6A1",
        compliance: 97,
        meds: [
            { name: "Vitamin D3", dosage: "1000IU • 1 viên", time: "08:00 Sáng", color: "#FFD700" },
        ],
    },
    "4": {
        name: "Ba Trương Minh Đức",
        role: "Ba",
        age: 50,
        avatar: "https://i.pravatar.cc/100?img=11",
        color: "#FFA07A",
        compliance: 85,
        meds: [
            { name: "Atorvastatin", dosage: "20mg • 1 viên", time: "21:00 Tối", color: "#D9AEF6" },
            { name: "Omeprazole", dosage: "20mg • 1 viên", time: "07:00 Sáng", color: "#A3E6A1" },
        ],
    },
};

export default function MemberDetailScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id: string }>();
    const member = MEMBER_DATA[id || "1"];

    if (!member) return null;

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
                    Thành viên
                </Text>
                <Pressable className="w-12 h-12 bg-white border-2 border-black rounded-2xl items-center justify-center active:opacity-80">
                    <Share2 size={20} color="#000" strokeWidth={2.5} />
                </Pressable>
            </View>

            <ScrollView
                className="flex-1 px-5"
                contentContainerStyle={{ paddingBottom: 120 }}
                showsVerticalScrollIndicator={false}
            >
                {/* Profile Info */}
                <View className="items-center mb-5">
                    <View
                        className="w-20 h-20 rounded-2xl border-2 border-black overflow-hidden mb-3"
                        style={{ backgroundColor: member.color }}
                    >
                        <Image
                            source={{ uri: member.avatar }}
                            className="w-20 h-20"
                            resizeMode="cover"
                        />
                    </View>
                    <Text className="text-2xl text-black font-space-bold text-center">
                        {member.name}
                    </Text>
                    <Text className="text-sm text-gray-400 font-space-medium mt-0.5">
                        {member.role} • {member.age} tuổi
                    </Text>
                </View>

                {/* QR Code Card - Centered */}
                <View className="bg-white border-2 border-black rounded-[32px] p-6 mb-6 shadow-sm items-center">
                    <View className="bg-white/40 self-center px-3 py-1 rounded-full border-2 border-black mb-4">
                        <Text className="text-xs font-space-bold uppercase tracking-wider">
                            Mã QR đăng nhập
                        </Text>
                    </View>

                    {/* QR Code Placeholder */}
                    <View className="w-52 h-52 bg-white border-2 border-black rounded-2xl items-center justify-center mb-4 p-4">
                        {/* Simulated QR Pattern */}
                        <View className="w-full h-full">
                            {Array.from({ length: 11 }).map((_, row) => (
                                <View key={row} className="flex-row flex-1">
                                    {Array.from({ length: 11 }).map((_, col) => {
                                        const isCorner =
                                            (row < 3 && col < 3) ||
                                            (row < 3 && col > 7) ||
                                            (row > 7 && col < 3);
                                        const isRandom = Math.random() > 0.5;
                                        const isFilled = isCorner || isRandom;
                                        return (
                                            <View
                                                key={col}
                                                className={`flex-1 m-[1px] rounded-[2px] ${isFilled ? "bg-black" : "bg-transparent"}`}
                                            />
                                        );
                                    })}
                                </View>
                            ))}
                        </View>
                    </View>

                    <Text className="text-sm text-gray-400 font-space-medium text-center">
                        Quét mã để đăng nhập cho{"\n"}
                        <Text className="text-black font-space-bold">{member.name}</Text>
                    </Text>
                </View>

                {/* Compliance stat */}
                <View className="flex-row gap-3 mb-5">
                    <View
                        className="flex-1 border-2 border-black rounded-[24px] p-4 shadow-sm"
                        style={{ backgroundColor: member.compliance >= 90 ? "#A3E6A1" : "#FFA07A" }}
                    >
                        <View className="w-10 h-10 bg-white rounded-2xl border-2 border-black items-center justify-center mb-2">
                            <TrendingUp size={20} color="#000" strokeWidth={2.5} />
                        </View>
                        <Text className="text-sm text-black/60 font-space-bold">Tuân thủ</Text>
                        <Text className="text-3xl text-black font-space-bold">{member.compliance}%</Text>
                    </View>

                    <View className="flex-1 bg-white border-2 border-black rounded-[24px] p-4 shadow-sm">
                        <View className="w-10 h-10 bg-[#D9AEF6] rounded-2xl border-2 border-black items-center justify-center mb-2">
                            <Pill size={20} color="#000" strokeWidth={2.5} />
                        </View>
                        <Text className="text-sm text-gray-400 font-space-bold">Đang dùng</Text>
                        <Text className="text-3xl text-black font-space-bold">{member.meds.length}</Text>
                        <Text className="text-xs text-gray-400 font-space-medium">loại thuốc</Text>
                    </View>
                </View>

                {/* Medication List */}
                <Text className="text-xl text-black font-space-bold mb-3">
                    Danh sách thuốc
                </Text>

                <View className="gap-3 mb-5">
                    {member.meds.map((med, index) => (
                        <View
                            key={index}
                            className="bg-white border-2 border-black rounded-[20px] p-4 shadow-sm flex-row items-center"
                        >
                            <View
                                className="w-12 h-12 rounded-2xl border-2 border-black items-center justify-center mr-4"
                                style={{ backgroundColor: med.color }}
                            >
                                <Pill size={22} color="#000" strokeWidth={2} />
                            </View>
                            <View className="flex-1">
                                <Text className="text-[16px] text-black font-space-bold">
                                    {med.name}
                                </Text>
                                <Text className="text-sm text-gray-400 font-space-medium">
                                    {med.dosage}
                                </Text>
                            </View>
                            <View className="flex-row items-center bg-black/5 px-3 py-1.5 rounded-full border border-black/10">
                                <Clock size={14} color="#666" strokeWidth={2} />
                                <Text className="text-[13px] text-gray-500 font-space-bold ml-1.5">
                                    {med.time}
                                </Text>
                            </View>
                        </View>
                    ))}
                </View>

                {/* Delete Member */}
                <Pressable className="bg-white border-2 border-red-400 rounded-[24px] py-4 flex-row items-center justify-center active:bg-red-50">
                    <Trash2 size={20} color="#EF4444" strokeWidth={2.5} />
                    <Text className="text-base text-red-500 font-space-bold ml-2">
                        Xoá thành viên
                    </Text>
                </Pressable>
            </ScrollView>
        </SafeAreaView>
    );
}
