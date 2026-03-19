import { Link } from "expo-router";
import { Text, View } from "react-native";
import "../global.css";

export default function App() {
  return (
    <View className="flex-1 items-center justify-center bg-white space-y-4">
      <Text className="text-xl font-bold text-blue-500 mb-4">Trang chủ App</Text>

      <Link href="/demo" asChild>
        <Text className="text-white bg-green-500 px-6 py-3 rounded-lg font-bold text-lg overflow-hidden">
          Chuyển sang Demo API Screen
        </Text>
      </Link>
    </View>
  );
}
