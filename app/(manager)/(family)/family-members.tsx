import { useGetFamilyById, useGetFamilyMembers } from "@/hooks/useFamily";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSetAtom } from "jotai";
import {
    ArrowLeft,
    Edit3,
    Eye,
    MoreHorizontal,
    Shield,
    UserPlus
} from "lucide-react-native";
import React from "react";
import { ActivityIndicator, Image, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Import Dropdown dùng chung
import FamilyDropdown from "../../../components/dropdown/FamilyDropdown";
import { showDropdownAtom } from "../../../stores/dropdownStore";

export default function FamilyMembersScreen() {
    const router = useRouter();
    const { familyId } = useLocalSearchParams<{ familyId: string }>();
    const showDropdown = useSetAtom(showDropdownAtom);

    // Fetch dữ liệu
    const { data: family, isLoading: isLoadingFamily } = useGetFamilyById(familyId);
    const { data: members, isLoading: isLoadingMembers } = useGetFamilyMembers(familyId);

    // Hàm mở Menu Dropdown cho từng thành viên
    const handleOpenMenu = (event: any, memberId: string) => {
        // Dùng measure để lấy chính xác tọa độ X, Y của cái nút 3 chấm trên màn hình
        event.currentTarget.measure((x: number, y: number, width: number, height: number, pageX: number, pageY: number) => {

            showDropdown({
                // Tính toán vị trí: top = tọa độ Y của nút + chiều cao của nút + 5px khoảng cách
                anchorPosition: { top: pageY + height + 5, right: 25 },
                items: [
                    {
                        label: "Xem chi tiết & Mã QR",
                        icon: Eye as any, // Ép kiểu nếu LucideIcon báo lỗi type
                        color: "#A3E6A1",
                        onPress: () => router.push({ pathname: "/(manager)/(family)/member", params: { id: memberId } } as any),
                    },
                    {
                        label: "Chỉnh sửa / Xóa",
                        icon: Edit3 as any,
                        color: "#FFD700",
                        onPress: () => router.push({ pathname: "/(manager)/(family)/edit-member", params: { memberId } } as any),
                    },
                ],
            });

        });
    };

    if (isLoadingFamily || isLoadingMembers) {
        return (
            <SafeAreaView className="flex-1 bg-background justify-center items-center">
                <ActivityIndicator size="large" color="#000" />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-[#F9F6FC]" edges={["top"]}>
            {/* Header */}
            <View className="flex-row items-center justify-between px-5 pt-3 pb-4">
                <Pressable
                    onPress={() => router.back()}
                    className="w-12 h-12 bg-white border-2 border-black rounded-2xl items-center justify-center active:opacity-80 shadow-sm"
                >
                    <ArrowLeft size={22} color="#000" strokeWidth={2.5} />
                </Pressable>
                <View className="items-center">
                    <Text className="text-xl text-black font-space-bold">
                        {family?.familyName || "Gia đình"}
                    </Text>
                    <Text className="text-sm text-gray-400 font-space-medium">
                        {members?.length || 0} thành viên
                    </Text>
                </View>
                {/* Nút tàng hình để cân bằng layout Header */}
                <View className="w-12 h-12" />
            </View>

            <ScrollView
                className="flex-1 px-5 pt-2"
                contentContainerStyle={{ paddingBottom: 120 }}
                showsVerticalScrollIndicator={false}
            >
                <View className="gap-4">
                    {members?.map((member) => (
                        <View
                            key={member.memberId}
                            className="bg-white border-2 border-black rounded-[24px] p-4 shadow-sm flex-row items-center"
                        >
                            {/* Avatar */}
                            <View className="w-14 h-14 rounded-2xl border-2 border-black overflow-hidden items-center justify-center bg-[#D9AEF6]">
                                {member.avatarUrl ? (
                                    <Image
                                        source={{ uri: member.avatarUrl }}
                                        className="w-full h-full"
                                        resizeMode="cover"
                                    />
                                ) : (
                                    <Text className="text-xl font-space-bold uppercase">{member.fullName.charAt(0)}</Text>
                                )}
                            </View>

                            {/* Info */}
                            <View className="flex-1 ml-4">
                                <View className="flex-row items-center">
                                    <Text className="text-[16px] text-black font-space-bold" numberOfLines={1}>
                                        {member.fullName}
                                    </Text>
                                    {member.role === "Owner" && (
                                        <Shield size={14} color="#FFD700" fill="#FFD700" className="ml-1.5" />
                                    )}
                                </View>
                                <Text className="text-sm text-gray-400 font-space-medium mt-0.5">
                                    {member.role === "Owner" ? "Chủ gia đình" : "Thành viên"}
                                    {!member.userId && " • Phụ thuộc"}
                                </Text>
                            </View>

                            {/* Nút 3 chấm mở Dropdown */}
                            <Pressable
                                onPress={(e) => handleOpenMenu(e, member.memberId)}
                                className="w-10 h-10 bg-gray-100 border-2 border-black rounded-xl items-center justify-center active:bg-gray-200"
                            >
                                <MoreHorizontal size={20} color="#000" strokeWidth={2.5} />
                            </Pressable>
                        </View>
                    ))}
                </View>

                {/* Nút Thêm thành viên (Chỉ dành cho Shared Family) */}
                {family?.type === "Shared" && (
                    <Pressable
                        // SỬA DÒNG NÀY: Truyền familyId sang trang add-member
                        onPress={() => router.push({ pathname: "/(manager)/(family)/add-member", params: { familyId } } as any)}
                        className="bg-black border-2 border-black rounded-[24px] py-5 mt-6 shadow-lg flex-row items-center justify-center active:opacity-90"
                    >
                        <UserPlus size={22} color="#FFFFFF" strokeWidth={2.5} />
                        <Text className="text-lg text-white font-space-bold ml-3 uppercase tracking-wider">
                            Thêm thành viên
                        </Text>
                    </Pressable>
                )}
            </ScrollView>

            {/* Nhúng Modal Dropdown vào cuối màn hình */}
            <FamilyDropdown />
        </SafeAreaView>
    );
}