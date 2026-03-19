// hooks/useMember.ts
import * as MemberApi from "@/apis/member.api";
import { CreateDependentRequest } from "@/types/Member";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { Alert } from "react-native";

export function useCreateDependentMember() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateDependentRequest) => MemberApi.createDependentMember(data),
        onSuccess: (res) => {
            if (res.success) {
                // Refresh lại danh sách thành viên
                queryClient.invalidateQueries({ queryKey: ["family-members"] });
                Alert.alert("Thành công", "Đã thêm thành viên mới vào gia đình!", [
                    { text: "OK", onPress: () => router.back() }
                ]);
            } else {
                Alert.alert("Lỗi", res.message || "Không thể thêm thành viên.");
            }
        },
        onError: (error: any) => {
            Alert.alert("Lỗi kết nối", error?.message || "Không thể kết nối đến máy chủ.");
        }
    });
}

export function useGenerateDependentLoginCode() {
    return useMutation({
        mutationFn: (memberId: string) => MemberApi.generateDependentLoginCode(memberId),
        // onSuccess xử lý hiển thị QR Code nên bạn có thể handle trực tiếp ở UI component
        onError: (error: any) => {
            Alert.alert("Lỗi kết nối", error?.message || "Không thể tạo mã đăng nhập.");
        }
    });
}

export function useGetMemberById(memberId: string | undefined) {
    return useQuery({
        queryKey: ["member", memberId],
        queryFn: async () => {
            if (!memberId) throw new Error("Missing Member ID");
            const res = await MemberApi.getMemberById(memberId);
            if (!res.success) throw new Error(res.message);
            return res.data;
        },
        enabled: !!memberId,
    });
}

export function useUpdateMember() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, formData }: { id: string; formData: FormData }) => MemberApi.updateMember(id, formData),
        onSuccess: (res) => {
            if (res.success) {
                queryClient.invalidateQueries({ queryKey: ["member"] });
                queryClient.invalidateQueries({ queryKey: ["family-members"] });
                Alert.alert("Thành công", "Đã cập nhật thông tin thành viên!");
            } else {
                Alert.alert("Lỗi", res.message || "Không thể cập nhật thông tin.");
            }
        },
        onError: (error: any) => {
            Alert.alert("Lỗi kết nối", error?.message || "Không thể kết nối đến máy chủ.");
        }
    });
}

export function useRemoveMember() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => MemberApi.removeMember(id),
        onSuccess: (res) => {
            if (res.success) {
                queryClient.invalidateQueries({ queryKey: ["family-members"] });
                Alert.alert("Thành công", "Đã rời khỏi/xóa thành viên khỏi gia đình.");
            } else {
                Alert.alert("Lỗi", res.message || "Không thể thực hiện yêu cầu.");
            }
        },
        onError: (error: any) => {
            Alert.alert("Lỗi kết nối", error?.message || "Không thể kết nối đến máy chủ.");
        }
    });
}

export function useDeleteMember() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => MemberApi.deleteMember(id),
        onSuccess: (res) => {
            if (res.success) {
                queryClient.invalidateQueries({ queryKey: ["family-members"] });
                Alert.alert("Thành công", "Đã xóa vĩnh viễn thành viên.");
            } else {
                Alert.alert("Lỗi", res.message || "Không thể xóa thành viên.");
            }
        },
        onError: (error: any) => {
            Alert.alert("Lỗi kết nối", error?.message || "Không thể kết nối đến máy chủ.");
        }
    });
}