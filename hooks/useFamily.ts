// hooks/useFamily.ts
import * as FamilyApi from "@/apis/family.api";
import { FamilyData, UpdateFamilyRequest } from "@/types/Family";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Alert } from "react-native";
import { useFetch } from "./useFetch";

export function useCreatePersonalFamily() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: FamilyApi.createPersonalFamily,
        onSuccess: (res) => {
            if (res.success) {
                // Refresh lại danh sách families để Trang chủ cập nhật
                queryClient.invalidateQueries({ queryKey: ["families"] });

                Alert.alert("Thành công", "Hồ sơ cá nhân của bạn đã được khởi tạo!", [
                    // { text: "Tuyệt vời", onPress: () => router.replace("/home") }
                ]);
            } else {
                Alert.alert("Lỗi", res.message || "Không thể tạo hồ sơ.");
            }
        },
        onError: (error: any) => {
            Alert.alert("Lỗi kết nối", error?.message || "Không thể kết nối đến máy chủ.");
        }
    });
}

export function useCreateSharedFamily() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (familyName: string) => FamilyApi.createSharedFamily(familyName),
        onSuccess: (res) => {
            if (res.success) {
                queryClient.invalidateQueries({ queryKey: ["families"] });

                Alert.alert("Thành công", "Nhóm gia đình đã được tạo! Bạn có thể mời thành viên khác tham gia.", [
                    // { text: "Tuyệt vời", onPress: () => router.replace("/home") }
                ]);
            } else {
                Alert.alert("Lỗi", res.message || "Không thể tạo nhóm gia đình.");
            }
        },
        onError: (error: any) => {
            Alert.alert("Lỗi kết nối", error?.message || "Không thể kết nối đến máy chủ.");
        }
    });
}

export function useGetFamilyMembers(familyId: string | undefined) {
    return useQuery({
        queryKey: ["family-members", familyId],
        queryFn: async () => {
            if (!familyId) throw new Error("Missing Family ID");
            const res = await FamilyApi.getMembersByFamilyId(familyId);

            // Ép lỗi cho useQuery nếu success = false
            if (!res.success) throw new Error(res.message);

            return res.data;
        },
        enabled: !!familyId,
    });
}

export function useGetFamilies() {
    return useFetch<FamilyData[]>(["families"], async () => FamilyApi.getFamilies());
}

export function useGetSubscription(familyId: string | undefined) {
    return useQuery({
        queryKey: ["subscription", familyId],
        queryFn: async () => {
            if (!familyId) throw new Error("Missing Family ID");
            const res = await FamilyApi.getSubscription(familyId);

            if (!res.success) throw new Error(res.message);

            return res.data;
        },
        enabled: !!familyId,
    });
}

export function useGetFamilyById(familyId: string | undefined) {
    return useQuery({
        queryKey: ["family", familyId],
        queryFn: async () => {
            if (!familyId) throw new Error("Missing Family ID");
            const res = await FamilyApi.getFamilyById(familyId);
            if (!res.success) throw new Error(res.message);
            return res.data;
        },
        enabled: !!familyId,
    });
}

export function useUpdateFamily() {
    const queryClient = useQueryClient();

    return useMutation({
        // Nhận vào 1 object chứa cả id và data để truyền cho axios
        mutationFn: ({ id, data }: { id: string; data: UpdateFamilyRequest }) => FamilyApi.updateFamily(id, data),
        onSuccess: (res) => {
            if (res.success) {
                // Làm mới lại dữ liệu gia đình
                queryClient.invalidateQueries({ queryKey: ["families"] });
                queryClient.invalidateQueries({ queryKey: ["family"] });
                Alert.alert("Thành công", "Cập nhật thông tin gia đình thành công!");
            } else {
                Alert.alert("Lỗi", res.message || "Không thể cập nhật.");
            }
        },
        onError: (error: any) => {
            Alert.alert("Lỗi kết nối", error?.message || "Không thể kết nối đến máy chủ.");
        }
    });
}

export function useDeleteFamily() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => FamilyApi.deleteFamily(id),
        onSuccess: (res) => {
            if (res.success) {
                queryClient.invalidateQueries({ queryKey: ["families"] });
                Alert.alert("Thành công", "Đã xóa gia đình thành công!", [
                    // { text: "OK", onPress: () => router.replace("/home") }
                ]);
            } else {
                Alert.alert("Lỗi", res.message || "Không thể xóa gia đình.");
            }
        },
        onError: (error: any) => {
            Alert.alert("Lỗi kết nối", error?.message || "Không thể kết nối đến máy chủ.");
        }
    });
}