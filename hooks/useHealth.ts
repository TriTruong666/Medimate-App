// hooks/useHealth.ts
import * as HealthApi from "@/apis/health.api";
import { UpsertConditionRequest, UpsertHealthProfileRequest } from "@/types/Health";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Alert } from "react-native";

// ======================= QUERIES =======================

export function useGetHealthProfile(memberId: string | undefined) {
    return useQuery({
        queryKey: ["health-profile", memberId],
        queryFn: async () => {
            if (!memberId) throw new Error("Missing Member ID");
            const res = await HealthApi.getHealthProfile(memberId);
            if (!res.success) throw new Error(res.message);
            return res.data;
        },
        enabled: !!memberId,
    });
}

export function useGetFamilyHealthProfiles(familyId: string | undefined) {
    return useQuery({
        queryKey: ["family-health", familyId],
        queryFn: async () => {
            if (!familyId) throw new Error("Missing Family ID");
            const res = await HealthApi.getFamilyHealthProfiles(familyId);
            if (!res.success) throw new Error(res.message);
            return res.data;
        },
        enabled: !!familyId,
    });
}

export function useGetHealthCondition(conditionId: string | undefined) {
    return useQuery({
        queryKey: ["health-condition", conditionId],
        queryFn: async () => {
            if (!conditionId) throw new Error("Missing Condition ID");
            const res = await HealthApi.getHealthCondition(conditionId);
            if (!res.success) throw new Error(res.message);
            return res.data;
        },
        enabled: !!conditionId,
    });
}

// ======================= MUTATIONS =======================

export function useCreateHealthProfile() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ memberId, data }: { memberId: string; data: UpsertHealthProfileRequest }) =>
            HealthApi.createHealthProfile(memberId, data),
        onSuccess: (res) => {
            if (res.success) {
                queryClient.invalidateQueries({ queryKey: ["health-profile"] });
                queryClient.invalidateQueries({ queryKey: ["family-health"] });
                Alert.alert("Thành công", "Đã tạo hồ sơ sức khỏe!");
            } else {
                Alert.alert("Lỗi", res.message || "Không thể tạo hồ sơ.");
            }
        },
        onError: (error: any) => Alert.alert("Lỗi kết nối", error?.message),
    });
}

export function useUpdateHealthProfile() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ memberId, data }: { memberId: string; data: UpsertHealthProfileRequest }) =>
            HealthApi.updateHealthProfile(memberId, data),
        onSuccess: (res) => {
            if (res.success) {
                queryClient.invalidateQueries({ queryKey: ["health-profile"] });
                queryClient.invalidateQueries({ queryKey: ["family-health"] });
                Alert.alert("Thành công", "Đã cập nhật hồ sơ sức khỏe!");
            } else {
                Alert.alert("Lỗi", res.message || "Không thể cập nhật hồ sơ.");
            }
        },
        onError: (error: any) => Alert.alert("Lỗi kết nối", error?.message),
    });
}

export function useAddHealthCondition() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ memberId, data }: { memberId: string; data: UpsertConditionRequest }) =>
            HealthApi.addHealthCondition(memberId, data),
        onSuccess: (res) => {
            if (res.success) {
                queryClient.invalidateQueries({ queryKey: ["health-profile"] });
                queryClient.invalidateQueries({ queryKey: ["family-health"] });
                Alert.alert("Thành công", "Đã thêm bệnh lý mới!");
            } else {
                Alert.alert("Lỗi", res.message || "Không thể thêm bệnh lý.");
            }
        },
        onError: (error: any) => Alert.alert("Lỗi kết nối", error?.message),
    });
}

export function useUpdateHealthCondition() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ conditionId, data }: { conditionId: string; data: UpsertConditionRequest }) =>
            HealthApi.updateHealthCondition(conditionId, data),
        onSuccess: (res) => {
            if (res.success) {
                queryClient.invalidateQueries({ queryKey: ["health-condition"] });
                queryClient.invalidateQueries({ queryKey: ["health-profile"] });
                Alert.alert("Thành công", "Đã cập nhật thông tin bệnh lý!");
            } else {
                Alert.alert("Lỗi", res.message || "Không thể cập nhật.");
            }
        },
        onError: (error: any) => Alert.alert("Lỗi kết nối", error?.message),
    });
}

export function useDeleteHealthCondition() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (conditionId: string) => HealthApi.deleteHealthCondition(conditionId),
        onSuccess: (res) => {
            if (res.success) {
                queryClient.invalidateQueries({ queryKey: ["health-profile"] });
                queryClient.invalidateQueries({ queryKey: ["family-health"] });
                Alert.alert("Thành công", "Đã xóa bệnh lý thành công!");
            } else {
                Alert.alert("Lỗi", res.message || "Không thể xóa bệnh lý.");
            }
        },
        onError: (error: any) => Alert.alert("Lỗi kết nối", error?.message),
    });
}