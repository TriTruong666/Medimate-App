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
                <View className="w-11 h-11 rounded-full bg-gray-200 items-center justify-center overflow-hidden border border-gray-300">
                    <Image
                        source={{ uri: "https://i.pravatar.cc/100" }}
                        className="w-11 h-11"
                        resizeMode="cover"
                    />
                </View>
                <View className="ml-3">
                    <Text className="text-sm text-black font-space-bold leading-4">
                        {name}
                    </Text>
                    <Text className="text-[11px] text-gray-400 font-space-regular mt-0.5">
                        {subtitle}
                    </Text>
                </View>
            </View>

            {/* Right: Action Buttons */}
            <View className="flex-row items-center gap-2">
                <Pressable className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center active:opacity-70">
                    <Bell size={18} color="#000" strokeWidth={1.5} />
                </Pressable>
                <Pressable className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center active:opacity-70">
                    <MoreHorizontal size={18} color="#000" strokeWidth={1.5} />
                </Pressable>
            </View>
        </View>
    );
}
