import { useGetFamilyById, useGetFamilyMembers } from "@/hooks/useFamily";
import { useGenerateDependentLoginCode } from "@/hooks/useMember";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSetAtom } from "jotai";
import {
  ArrowLeft,
  BellRing,
  Edit3,
  Eye,
  History,
  MoreHorizontal,
  QrCode,
  RefreshCw,
  Shield,
  UserPlus
} from "lucide-react-native";
import { AnimatePresence, MotiView } from "moti";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import FamilyDropdown from "@/components/dropdown/FamilyDropdown";
import { showDropdownAtom } from "@/stores/dropdownStore";
import { usePopup } from "@/stores/popupStore";

const MemberListItem = ({ member, handleOpenMenu, isExpanded }: any) => {
  const { mutate: generateQrCode, isPending: isGeneratingQr } = useGenerateDependentLoginCode();
  const [qrImageUrl, setQrImageUrl] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);

  const handleGenerateQR = () => {
    generateQrCode(member.memberId, {
      onSuccess: (res) => {
        if (res.success && res.data?.qrCodeUrl) {
          setQrImageUrl(res.data.qrCodeUrl);
          setTimeLeft(300); // 5 phút
        }
      }
    });
  };

  useEffect(() => {
    if (isExpanded && !member.userId && !qrImageUrl && !isGeneratingQr) {
      handleGenerateQR();
    }
  }, [isExpanded, member]);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <View className="bg-white border-2 border-black rounded-[24px] overflow-hidden shadow-sm">
      <View className="p-4 flex-row items-center gap-x-4">
        <View className="w-14 h-14 rounded-2xl border-2 border-black overflow-hidden items-center justify-center bg-[#D9AEF6]">
          {member.avatarUrl ? (
            <Image source={{ uri: member.avatarUrl }} className="w-full h-full" resizeMode="cover" />
          ) : (
            <Text className="text-xl font-space-bold uppercase">{member.fullName.charAt(0)}</Text>
          )}
        </View>

        <View className="flex-1">
          <View className="flex-row items-center gap-x-1.5">
            <Text className="text-[16px] text-black font-space-bold" numberOfLines={1}>{member.fullName}</Text>
            {member.role === "Owner" && <Shield size={14} color="#FFD700" fill="#FFD700" />}
          </View>
          <Text className="text-sm text-gray-400 font-space-medium mt-0.5">
            {member.role === "Owner" ? "Quản lý" : "Thành viên"}
          </Text>
        </View>

        <Pressable
          onPress={(e) => handleOpenMenu(e, member.memberId, Boolean(member.userId))}
          className="w-10 h-10 bg-gray-100 border-2 border-black rounded-xl items-center justify-center active:bg-gray-200"
        >
          <MoreHorizontal size={20} color="#000" strokeWidth={2.5} />
        </Pressable>
      </View>

      <AnimatePresence>
        {isExpanded && (
          <MotiView
            from={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{
              height: { type: "timing", duration: 400 },
              opacity: { type: "timing", duration: 300 },
            }}
            style={{ overflow: "hidden" }}
            className="border-t-2 border-black/5 items-center bg-[#F9F6FC]"
          >
            <MotiView
              from={{ scale: 0.9, translateY: -20, opacity: 0 }}
              animate={{ scale: 1, translateY: 0, opacity: 1 }}
              exit={{ scale: 0.9, translateY: -20, opacity: 0 }}
              transition={{ type: "timing", duration: 400, delay: 100 }}
              className="items-center py-6 px-4 w-full relative overflow-hidden"
            >
              <View className="absolute top-0 right-0 w-20 h-20 bg-[#A3E6A1] rounded-bl-[40px] opacity-20" />
              <View className="bg-white px-4 py-1.5 rounded-full border-2 border-black mb-4 flex-row items-center gap-x-2">
                <Text className="text-xs font-space-bold uppercase tracking-wider text-black">Mã đăng nhập thiết bị</Text>
                <Pressable onPress={handleGenerateQR} className="p-1 active:opacity-60"><RefreshCw size={14} color="#000" strokeWidth={2.5} /></Pressable>
              </View>
              <View className="w-48 h-48 bg-white border-4 border-black rounded-[24px] items-center justify-center mb-2 p-2 shadow-sm">
                {isGeneratingQr ? <ActivityIndicator color="#000" size="large" /> : (timeLeft > 0 && qrImageUrl) ? <Image source={{ uri: qrImageUrl }} className="w-full h-full" resizeMode="contain" /> : <View className="items-center px-4"><Text className="text-center font-space-bold text-red-500 mb-2">Mã đã hết hạn</Text><Pressable onPress={handleGenerateQR} className="bg-black px-4 py-2 rounded-xl"><Text className="text-white text-[11px] font-space-bold uppercase uppercase tracking-wider">Lấy mã mới</Text></Pressable></View>}
              </View>
              {timeLeft > 0 && <Text className="text-[10px] text-gray-500 font-space-bold mt-2">Hết hạn sau: <Text className="text-red-500">{formatTime(timeLeft)}</Text></Text>}
            </MotiView>
          </MotiView>
        )}
      </AnimatePresence>
    </View>
  );
};

export default function FamilyMembersScreen() {
  const router = useRouter();
  const { familyId } = useLocalSearchParams<{ familyId: string }>();
  const showDropdown = useSetAtom(showDropdownAtom);
  const popup = usePopup();

  const [expandedMemberId, setExpandedMemberId] = useState<string | null>(null);

  // Fetch dữ liệu
  const { data: family, isLoading: isLoadingFamily } =
    useGetFamilyById(familyId);
  const { data: members, isLoading: isLoadingMembers } =
    useGetFamilyMembers(familyId);

  const handleOpenMenu = (event: any, memberId: string, hasUserId: boolean) => {
    event.currentTarget.measure(
      (
        x: number,
        y: number,
        width: number,
        height: number,
        pageX: number,
        pageY: number
      ) => {
        showDropdown({
          anchorPosition: { top: pageY + height + 5, right: 25 },
          items: [
            {
              label: "Hồ sơ sức khoẻ",
              icon: Eye as any,
              color: "#D9AEF6",
              onPress: () =>
                router.push({
                  pathname: "/(manager)/(family)/member",
                  params: { id: memberId },
                } as any),
            },
            ...(!hasUserId ? [{
              label: "Mã QR đăng nhập",
              icon: QrCode as any,
              color: "#A3E6A1",
              onPress: () => setExpandedMemberId((prev) => (prev === memberId ? null : memberId)),
            }] : []),
            {
              label: "Chỉnh sửa",
              icon: Edit3 as any,
              color: "#FFD700",
              onPress: () =>
                router.push({
                  pathname: "/(manager)/(family)/edit-member",
                  params: { memberId },
                } as any),
            },
            // {
            //   label: "Xóa khỏi nhóm",
            //   icon: Trash2 as any,
            //   color: "#FFA07A",
            //   isDestructive: true,
            //   onPress: () => {
            //     console.log("Xóa member:", memberId);
            //   },
            // },
          ],
        });
      }
    );
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
      <View className="flex-row items-center justify-between px-5 pt-3 pb-4">
        <Pressable
          onPress={() => router.back()}
          className="w-12 h-12 bg-white border-2 border-black rounded-2xl items-center justify-center active:opacity-80 shadow-sm"
        >
          <ArrowLeft size={22} color="#000" strokeWidth={2.5} />
        </Pressable>

        <View className="items-center flex-1 mx-2">
          <Text
            className="text-xl text-black font-space-bold text-center"
            numberOfLines={1}
          >
            {family?.familyName || "Gia đình"}
          </Text>
          <Text className="text-[12px] text-gray-400 font-space-medium uppercase tracking-wider">
            {members?.length || 0} thành viên
          </Text>
        </View>

        <View className="flex-row items-center gap-x-2">
          <Pressable
            onPress={() => router.push({ pathname: '/(manager)/(family)/notification-settings', params: { familyId } } as any)}
            className="w-12 h-12 border-2 border-black rounded-2xl items-center justify-center shadow-sm active:opacity-80 bg-white"
          >
            <BellRing size={20} color="#000" strokeWidth={2.5} />
          </Pressable>

          <Pressable
            onPress={() => router.push({ pathname: '/(manager)/(family)/activity-logs', params: { familyId } } as any)}
            className="w-12 h-12 bg-[#FFD700] border-2 border-black rounded-2xl items-center justify-center active:opacity-80 shadow-sm"
          >
            <History size={20} color="#000" strokeWidth={2.5} />
          </Pressable>
        </View>
      </View>

      <ScrollView
        className="flex-1 px-5 pt-4"
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="gap-4">
          {members?.map((member) => (
            <MemberListItem
              key={member.memberId}
              member={member}
              handleOpenMenu={handleOpenMenu}
              isExpanded={expandedMemberId === member.memberId}
            />
          ))}
        </View>

        {/* Nút Thêm thành viên (Chỉ dành cho Shared Family) */}
        {family?.type === "Shared" && (
          <Pressable
            // SỬA DÒNG NÀY: Truyền familyId sang trang add-member
            onPress={() =>
              router.push({
                pathname: "/(manager)/(family)/add-member",
                params: { familyId },
              } as any)
            }
            className="bg-[#A3E6A1] border-2 border-black rounded-[24px] py-5 mt-6 shadow-md flex-row items-center justify-center gap-x-3 active:translate-y-0.5"
          >
            <UserPlus size={22} color="#000" strokeWidth={2.5} />
            <Text className="text-lg text-black font-space-bold uppercase tracking-wider">
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
