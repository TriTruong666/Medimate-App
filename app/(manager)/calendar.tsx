import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ManagerHeader from "../../components/ManagerHeader";

export default function CalendarScreen() {
    return (
        <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
            <ManagerHeader />
            <View className="flex-1 px-8 items-center justify-center">
                <Text className="text-2xl text-black font-space-bold">Lịch</Text>
                <Text className="text-base text-gray-400 mt-2 font-space-regular text-center">
                    Lịch uống thuốc sẽ được hiển thị ở đây.
                </Text>
            </View>
        </SafeAreaView>
    );
}
