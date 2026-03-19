import { Bell, MoreHorizontal } from "lucide-react-native";
import { Image, Pressable, Text, View } from "react-native";

interface ManagerHeaderProps {
    name?: string;
    subtitle?: string;
}

export default function ManagerHeader({
    name = "Người dùng",
    subtitle = "Quản lý thuốc",
}: ManagerHeaderProps) {
    return (
        <View className="flex-row items-center justify-between px-6 pt-3 pb-4">
            {/* Left: Avatar + Name */}
            <View className="flex-row items-center">
                <View className="w-14 h-14 rounded-2xl bg-gray-200 items-center justify-center overflow-hidden border border-gray-300">
                    <Image
                        source={{ uri: "https://i.pravatar.cc/100" }}
                        className="w-14 h-14"
                        resizeMode="cover"
                    />
                </View>
                <View className="ml-4">
                    <Text className="text-lg text-black font-space-bold">
                        {name}
                    </Text>
                    <Text className="text-sm text-gray-500 font-space-regular mt-0.5">
                        {subtitle}
                    </Text>
                </View>
            </View>

            {/* Right: Action Buttons */}
            <View className="flex-row items-center gap-3">
                <Pressable className="w-12 h-12 rounded-2xl bg-gray-100 items-center justify-center active:opacity-70">
                    <Bell size={22} color="#000" strokeWidth={1.5} />
                </Pressable>
                <Pressable className="w-12 h-12 rounded-2xl bg-gray-100 items-center justify-center active:opacity-70">
                    <MoreHorizontal size={22} color="#000" strokeWidth={1.5} />
                </Pressable>
            </View>
        </View>
    );
}
