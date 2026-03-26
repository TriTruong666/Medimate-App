import * as FamilyApi from "@/apis/family.api";
import { useToast } from "@/stores/toastStore";
import { FamilyData, UpdateFamilyRequest } from "@/types/Family";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useFetch } from "./useFetch";

export function useCreatePersonalFamily() {
    const queryClient = useQueryClient();
    const toast = useToast();

    return useMutation({
        mutationFn: FamilyApi.createPersonalFamily,
        onSuccess: (res) => {
            if (res.success) {
                queryClient.invalidateQueries({ queryKey: ["families"] });
                toast.success("Thành công", "Hồ sơ cá nhân của bạn đã được khởi tạo!");
            } else {
                toast.error("Lỗi", res.message || "Không thể tạo hồ sơ.");
            }
        },
        onError: (error: any) => {
            toast.error("Lỗi kết nối", error?.message || "Không thể kết nối đến máy chủ.");
        }
    });
}

export function useCreateSharedFamily() {
    const queryClient = useQueryClient();
    const toast = useToast();

    return useMutation({
        mutationFn: (familyName: string) => FamilyApi.createSharedFamily(familyName),
        onSuccess: (res) => {
            if (res.success) {
                queryClient.invalidateQueries({ queryKey: ["families"] });
                toast.success("Thành công", "Nhóm gia đình đã được tạo thành công!");
            } else {
                toast.error("Lỗi", res.message || "Không thể tạo nhóm gia đình.");
            }
        },
        onError: (error: any) => {
            toast.error("Lỗi kết nối", error?.message || "Không thể kết nối đến máy chủ.");
        }
    });
}

export function useGetFamilyMembers(familyId: string | undefined) {
    return useQuery({
        queryKey: ["family-members", familyId],
        queryFn: async () => {
            if (!familyId) throw new Error("Missing Family ID");
            const res = await FamilyApi.getMembersByFamilyId(familyId);
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
    const toast = useToast();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateFamilyRequest }) => {
            // [QUAN TRỌNG] Chuyển đổi dữ liệu sang FormData vì API nhận multipart/form-data
            const formData = new FormData();
            if (data.familyName) formData.append('FamilyName', data.familyName);
            if (data.isOpenJoin !== undefined) formData.append('IsOpenJoin', data.isOpenJoin.toString());

            // Nếu có avatar (file ảnh từ điện thoại), append nó vào
            if (data.familyAvatar) {
                formData.append('FamilyAvatar', data.familyAvatar as any); // Type ép kiểu theo cấu trúc File/Blob của React Native
            }

            return FamilyApi.updateFamily(id, formData); // Gọi hàm với FormData thay vì JSON
        },
        onSuccess: (res) => {
            if (res.success) {
                queryClient.invalidateQueries({ queryKey: ["families"] });
                queryClient.invalidateQueries({ queryKey: ["family"] });
                toast.success("Thành công", "Cập nhật thông tin gia đình thành công!");
            } else {
                toast.error("Lỗi", res.message || "Không thể cập nhật.");
            }
        },
        onError: (error: any) => {
            toast.error("Lỗi kết nối", error?.message || "Không thể kết nối đến máy chủ.");
        }
    });
}

export function useDeleteFamily() {
    const queryClient = useQueryClient();
    const toast = useToast();

    return useMutation({
        mutationFn: (id: string) => FamilyApi.deleteFamily(id),
        onSuccess: (res) => {
            if (res.success) {
                queryClient.invalidateQueries({ queryKey: ["families"] });
                toast.success("Thành công", "Đã xóa gia đình thành công!");
            } else {
                toast.error("Lỗi", res.message || "Không thể xóa gia đình.");
            }
        },
        onError: (error: any) => {
            toast.error("Lỗi kết nối", error?.message || "Không thể kết nối đến máy chủ.");
        }
    });
}