import * as DoctorPrescriptionApi from "@/apis/doctorPrescription.api";
import { CreateDoctorPrescriptionRequest, UpdateDoctorPrescriptionRequest } from "@/types/DoctorPrescription";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useGetDoctorPrescriptionById(id: string | undefined) {
    return useQuery({
        queryKey: ["doctor-prescription", id],
        queryFn: async () => {
            if (!id) throw new Error("Missing Prescription ID");
            const res = await DoctorPrescriptionApi.getDoctorPrescriptionById(id);
            if (!res.success) throw new Error(res.message);
            return res.data;
        },
        enabled: !!id,
    });
}

export function useGetDoctorPrescriptionsByMemberId(memberId: string | undefined) {
    return useQuery({
        queryKey: ["doctor-prescriptions", "member", memberId],
        queryFn: async () => {
            if (!memberId) throw new Error("Missing Member ID");
            const res = await DoctorPrescriptionApi.getDoctorPrescriptionsByMemberId(memberId);
            if (!res.success) throw new Error(res.message);
            return res.data;
        },
        enabled: !!memberId,
    });
}

export function useCreateDoctorPrescription() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ doctorId, data }: { doctorId: string; data: CreateDoctorPrescriptionRequest }) =>
            DoctorPrescriptionApi.createDoctorPrescription(doctorId, data),
        onSuccess: (_, variables) => {
            // Tự động làm mới danh sách đơn thuốc của member sau khi tạo thành công
            queryClient.invalidateQueries({ queryKey: ["doctor-prescriptions", "member", variables.data.memberId] });
        }
    });
}

export function useUpdateDoctorPrescription() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateDoctorPrescriptionRequest }) =>
            DoctorPrescriptionApi.updateDoctorPrescription(id, data),
        onSuccess: (data) => {
            // Làm mới lại query của đơn thuốc này
            if (data.success && data.data) {
                queryClient.invalidateQueries({ queryKey: ["doctor-prescription", data.data.digitalPrescriptionId] });
            }
        }
    });
}