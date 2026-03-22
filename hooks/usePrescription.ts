// hooks/usePrescription.ts
import * as PrescriptionApi from "@/apis/prescription.api";
import { UpsertPrescriptionRequest } from "@/types/Prescription";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Alert } from "react-native";

// --- QUERIES ---

export function useGetMemberPrescriptions(memberId: string | undefined) {
    return useQuery({
        queryKey: ["prescriptions", memberId],
        queryFn: async () => {
            if (!memberId) throw new Error("Missing Member ID");
            const res = await PrescriptionApi.getMemberPrescriptions(memberId);
            if (!res.success) throw new Error(res.message);
            return res.data;
        },
        enabled: !!memberId,
    });
}

export function useGetPrescriptionDetail(prescriptionId: string | undefined) {
    return useQuery({
        queryKey: ["prescription-detail", prescriptionId],
        queryFn: async () => {
            if (!prescriptionId) throw new Error("Missing Prescription ID");
            const res = await PrescriptionApi.getPrescriptionDetail(prescriptionId);
            if (!res.success) throw new Error(res.message);
            return res.data;
        },
        enabled: !!prescriptionId,
    });
}

// --- MUTATIONS ---

export function useScanPrescription() {
    return useMutation({
        mutationFn: ({ memberId, file }: { memberId: string; file: any }) =>
            PrescriptionApi.scanPrescription(memberId, file),
        // Không gọi Alert ở đây để tùy biến UI ở màn hình Quét (VD: Chuyển sang màn Edit ngay lập tức)
    });
}

export function useCreatePrescription() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ memberId, data }: { memberId: string; data: UpsertPrescriptionRequest }) =>
            PrescriptionApi.createPrescription(memberId, data),
        onSuccess: (res) => {
            if (res.success) {
                // Tự động làm mới lại danh sách đơn thuốc sau khi tạo
                queryClient.invalidateQueries({ queryKey: ["prescriptions"] });
                Alert.alert("Thành công", "Đã lưu đơn thuốc thành công!");
            } else {
                Alert.alert("Lỗi", res.message || "Không thể lưu đơn thuốc.");
            }
        },
        onError: (error: any) => Alert.alert("Lỗi kết nối", error?.message),
    });
}

export function useUpdatePrescription() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpsertPrescriptionRequest }) =>
            PrescriptionApi.updatePrescription(id, data),
        onSuccess: (res) => {
            if (res.success) {
                queryClient.invalidateQueries({ queryKey: ["prescriptions"] });
                queryClient.invalidateQueries({ queryKey: ["prescription-detail"] });
                Alert.alert("Thành công", "Đã cập nhật đơn thuốc!");
            } else {
                Alert.alert("Lỗi", res.message || "Không thể cập nhật.");
            }
        },
        onError: (error: any) => Alert.alert("Lỗi kết nối", error?.message),
    });
}

export function useDeletePrescription() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => PrescriptionApi.deletePrescription(id),
        onSuccess: (res) => {
            if (res.success) {
                queryClient.invalidateQueries({ queryKey: ["prescriptions"] });
                Alert.alert("Thành công", "Đã xóa đơn thuốc!");
            } else {
                Alert.alert("Lỗi", res.message || "Không thể xóa đơn thuốc.");
            }
        },
        onError: (error: any) => Alert.alert("Lỗi kết nối", error?.message),
    });
}