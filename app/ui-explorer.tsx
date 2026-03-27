import { Link, router } from "expo-router";
import { ArrowLeft, ChevronRight } from "lucide-react-native";
import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const routes = [
    { name: "Welcome", path: "/welcome" },
    { name: "Login", path: "/(auth)/login" },
    { name: "Login QR (Camera)", path: "/(auth)/login_qr" },
    { name: "Register", path: "/(auth)/register" },
    { name: "Verify OTP", path: "/(auth)/verify-otp" },
    { name: "Manager - Home", path: "/(manager)/(home)" },
    { name: "Manager - Calendar", path: "/(manager)/(calendar)" },
    { name: "Manager - Doctor", path: "/(manager)/(doctor)" },
    { name: "Manager - Profile", path: "/(manager)/(settings)/profile" },
    { name: "Manager - Settings", path: "/(manager)/(settings)" },
    { name: "Family - Index", path: "/(manager)/(family)" },
    { name: "Family - Add Member", path: "/(manager)/(family)/add-member" },
    { name: "Family - Edit Member", path: "/(manager)/(family)/edit-member" },
    { name: "Family - Edit Family", path: "/(manager)/(family)/edit-family" },
    { name: "Family - List Members", path: "/(manager)/(family)/family-members" },
    { name: "Family - Member Detail", path: "/(manager)/(family)/member" },
    { name: "Prescription - Index", path: "/(manager)/(prescription)" },
    { name: "Prescription - Scan", path: "/(manager)/(prescription)/scan_prescription" },
    { name: "Prescription - Add Manual", path: "/(manager)/(prescription)/add_manual_prescription" },
    { name: "Prescription - Upload", path: "/(manager)/(prescription)/upload_prescription" },
    { name: "🧪 Calendar Test (Debug)", path: "/(manager)/(calendar)/calendar_test" },
];

export default function UIExplorerScreen() {
    return (
        <SafeAreaView className="flex-1 bg-background">
            <View className="px-6 py-4 flex-row items-center border-b-2 border-black">
                <Pressable
                    onPress={() => router.replace("/")}
                    className="w-10 h-10 bg-white border-2 border-black rounded-xl items-center justify-center mr-4"
                >
                    <ArrowLeft color="black" size={20} />
                </Pressable>
                <Text className="text-2xl font-space-bold text-black uppercase">UI Explorer</Text>
            </View>

            <ScrollView className="flex-1" contentContainerStyle={{ padding: 24 }}>
                <Text className="text-xs font-space-bold mb-6 uppercase text-gray-500">All Routes List</Text>

                <View className="gap-y-4">
                    {routes.map((route) => (
                        <Link key={route.path} href={route.path as any} asChild>
                            <Pressable className="flex-row items-center justify-between bg-white border-2 border-black rounded-2xl px-6 py-5 shadow-sm active:opacity-80">
                                <View className="flex-1">
                                    <Text className="text-lg font-space-bold text-black">{route.name}</Text>
                                    <Text className="text-xs font-space-medium text-gray-500 mt-1">{route.path}</Text>
                                </View>
                                <View className="w-8 h-8 rounded-full bg-[#A3E6A1] border-2 border-black items-center justify-center">
                                    <ChevronRight color="black" size={16} />
                                </View>
                            </Pressable>
                        </Link>
                    ))}
                </View>

                <View className="h-20" />
            </ScrollView>
        </SafeAreaView>
    );
}
