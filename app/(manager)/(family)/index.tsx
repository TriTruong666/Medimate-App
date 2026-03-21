import { PopupContainer } from "@/components/popup/PopupContainer";
import { useDeleteFamily, useGetFamilies } from "@/hooks/useFamily";
import { usePopup } from "@/stores/popupStore";
import { useRouter } from "expo-router";
import {
  AlertCircle,
  ChevronRight,
  Edit3,
  Plus,
  RefreshCcw,
  Trash2,
  User,
  Users,
} from "lucide-react-native";
import React from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ManagerHeader from "../../../components/ManagerHeader";

export default function FamilyListScreen() {
  const router = useRouter();
  const popup = usePopup();

  // 1. APIs
  const { data: families, isLoading, isError, refetch } = useGetFamilies();
  const { mutate: deleteFamily } = useDeleteFamily();

  const filteredFamilies = families?.filter((f) => f.type !== "Personal") || [];

  // 4. Logic Xóa Gia đình (Sử dụng ConfirmPopup mới)
  const handleDelete = (id: string, name: string) => {
    popup.confirm(
      {
        title: "Xóa gia đình?",
        message: `Bạn có chắc chắn muốn xóa nhóm "${name}"? Thao tác này sẽ xóa toàn bộ dữ liệu liên quan và không thể khôi phục.`,
        confirmLabel: "Xóa vĩnh viễn",
        cancelLabel: "Hủy bỏ",
        type: "danger",
      },
      () => {
        deleteFamily(id);
      }
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <ManagerHeader subtitle="Cài đặt gia đình" />

      <ScrollView
        className="flex-1 px-6 pt-6"
        contentContainerStyle={{ paddingBottom: 150 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="mb-8">
          <Text className="text-4xl text-black font-space-bold tracking-tighter">
            Gia đình
          </Text>
          <Text className="text-[17px] text-gray-500 mt-2 font-space-medium leading-relaxed">
            Nơi kết nối các thành viên và cùng nhau theo dõi lộ trình dùng
            thuốc.
          </Text>
        </View>

        {/* 2️⃣ DANH SÁCH GIA ĐÌNH - Clean Neo-brutalism */}
        <View className="mb-4 flex-row items-center justify-between">
          <Text className="text-xl font-space-bold text-black uppercase tracking-widest pl-1">
            Danh sách nhóm
          </Text>
          {!isLoading && families && (
            <View className="bg-black px-3 py-1 rounded-lg border border-black">
              <Text className="text-white font-space-bold text-xs">
                {filteredFamilies.length}
              </Text>
            </View>
          )}
        </View>

        {isLoading ? (
          <View className="py-20 items-center justify-center">
            <ActivityIndicator size="large" color="#000" />
            <Text className="mt-4 font-space-medium text-gray-500">
              Đang tải dữ liệu...
            </Text>
          </View>
        ) : isError ? (
          <View className="py-16 items-center justify-center bg-gray-50 border-2 border-black border-dashed rounded-[32px]">
            <View className="w-16 h-16 bg-[#FFA07A] border-2 border-black rounded-2xl items-center justify-center mb-4 shadow-sm">
              <AlertCircle size={32} color="#000" />
            </View>
            <Text className="text-xl font-space-bold text-black mb-2 text-center">
              Đã xảy ra lỗi!
            </Text>
            <Text className="text-sm font-space-medium text-gray-500 text-center px-8 mb-6 leading-relaxed">
              Không thể tải danh sách gia đình lúc này. Vui lòng kết nối mạng và
              thử lại.
            </Text>
            <Pressable
              onPress={() => refetch()}
              className="bg-white border-2 border-black px-6 py-3 rounded-xl flex-row items-center gap-x-2 shadow-sm active:bg-gray-100"
            >
              <RefreshCcw size={18} color="#000" />
              <Text className="text-black font-space-bold uppercase">
                Thử lại
              </Text>
            </Pressable>
          </View>
        ) : filteredFamilies.length === 0 ? (
          <View className="py-16 items-center justify-center bg-[#F9F6FC] border-2 border-black border-dashed rounded-[32px]">
            <View className="w-16 h-16 bg-white border-2 border-black rounded-2xl items-center justify-center mb-4 shadow-sm opacity-80">
              <Users size={32} color="#000" opacity={0.6} />
            </View>
            <Text className="text-xl font-space-bold text-black mb-2 text-center px-4">
              Chưa có nhóm nào
            </Text>
            <Text className="text-sm font-space-medium text-gray-500 text-center px-8 mb-2 leading-relaxed">
              Bạn chưa tham gia hoặc tạo nhóm gia đình nào. Hãy bắt đầu kết nối
              với người thân!
            </Text>
          </View>
        ) : (
          <View className="gap-y-5">
            {filteredFamilies.map((family) => (
              <Pressable
                key={family.familyId}
                onPress={() =>
                  router.push({
                    pathname: "/(manager)/(family)/family-members",
                    params: { familyId: family.familyId },
                  } as any)
                }
                className="bg-white border-2 border-black rounded-[32px] p-6 shadow-md active:bg-gray-50 active:translate-y-0.5 active:shadow-sm"
              >
                <View className="flex-row items-center justify-between mb-5">
                  <View className="flex-row items-center flex-1 gap-x-4">
                    <View
                      className="w-16 h-16 rounded-[24px] border-2 border-black items-center justify-center shadow-sm"
                      style={{
                        backgroundColor:
                          family.type === "Personal" ? "#87CEFA" : "#D9AEF6",
                      }}
                    >
                      {family.type === "Personal" ? (
                        <User size={32} color="#000" strokeWidth={2.5} />
                      ) : (
                        <Users size={32} color="#000" strokeWidth={2.5} />
                      )}
                    </View>
                    <View className="flex-1 pr-4">
                      <Text
                        className="text-xl text-black font-space-bold"
                        numberOfLines={1}
                      >
                        {family.familyName}
                      </Text>
                      <View className="flex-row items-center mt-1.5 gap-x-1.5">
                        <Users size={14} color="#6B7280" />
                        <Text className="text-base text-gray-500 font-space-medium">
                          {family.memberCount} thành viên
                        </Text>
                      </View>
                    </View>
                    <ChevronRight size={24} color="#000" strokeWidth={3} />
                  </View>
                </View>

                {/* Action Bar */}
                {family.type === "Shared" && (
                  <View className="flex-row items-center justify-end pt-5 border-t-2 border-black/5">
                    <View className="flex-row gap-x-3">
                      <Pressable
                        onPress={(e) => {
                          e.stopPropagation();
                          popup.open({
                            type: "edit_family",
                            data: family,
                          });
                        }}
                        className="w-12 h-12 bg-gray-50 border-2 border-black rounded-xl items-center justify-center active:bg-gray-200"
                      >
                        <Edit3 size={20} color="#000" />
                      </Pressable>

                      <Pressable
                        onPress={(e) => {
                          e.stopPropagation();
                          handleDelete(family.familyId, family.familyName);
                        }}
                        className="w-12 h-12 bg-[#FFA07A] border-2 border-black rounded-xl items-center justify-center active:opacity-80"
                      >
                        <Trash2 size={20} color="#000" />
                      </Pressable>
                    </View>
                  </View>
                )}
              </Pressable>
            ))}
          </View>
        )}

        {/* 3️⃣ TẠO GIA ĐÌNH MỚI (MỞ POPUP) */}
        <Pressable
          onPress={() => popup.open({ type: "create_family" })}
          className="bg-[#FFD700] border-2 border-black rounded-[28px] p-6 flex-row items-center justify-center gap-x-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none mt-10"
        >
          <Plus size={28} color="#000" strokeWidth={3} />
          <Text className="text-xl text-black font-space-bold uppercase tracking-wider">
            Tạo nhóm gia đình
          </Text>
        </Pressable>
      </ScrollView>

      <PopupContainer />
    </SafeAreaView>
  );
}
