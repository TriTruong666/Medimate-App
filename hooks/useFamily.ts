// hooks/useFamily.ts
import * as FamilyApi from "@/apis/family.api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { Alert } from "react-native";

export function useCreatePersonalFamily() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: FamilyApi.createPersonalFamily,
        onSuccess: (res) => {
            if (res.success) {
                // Refresh lại danh sách families để Trang chủ cập nhật giao diện ngay lập tức
                queryClient.invalidateQueries({ queryKey: ["families"] });

                Alert.alert("Thành công", "Hồ sơ cá nhân của bạn đã được khởi tạo!", [
                    { text: "Về trang chủ", onPress: () => router.replace("/home") }
                ]);
            } else {
                Alert.alert("Lỗi", res.message || "Không thể tạo hồ sơ.");
            }
        },
        onError: (error: any) => {
            Alert.alert("Lỗi kết nối", error.message);
        }
    });
}
export function useCreateSharedFamily() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (familyName: string) => FamilyApi.createSharedFamily(familyName),
        onSuccess: (res) => {
            if (res.success) {
                // Làm mới dữ liệu trang chủ
                queryClient.invalidateQueries({ queryKey: ["families"] });

                Alert.alert("Thành công", "Nhóm gia đình đã được tạo! Bạn có thể mời thành viên khác tham gia.", [
                    { text: "Tuyệt vời", onPress: () => router.replace("/home") }
                ]);
            } else {
                Alert.alert("Lỗi", res.message || "Không thể tạo nhóm gia đình.");
            }
        },
        onError: (error: any) => {
            Alert.alert("Lỗi kết nối", error.message);
        }
    });
}
export function useGetFamilyMembers(familyId: string | undefined) {
    return useQuery({
        queryKey: ["family-members", familyId],
        queryFn: () => FamilyApi.getMembersByFamilyId(familyId!),
        enabled: !!familyId, // Chỉ gọi khi đã có familyId
    });
}