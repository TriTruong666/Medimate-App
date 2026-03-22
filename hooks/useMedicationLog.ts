// hooks/useMedicationLog.ts
import * as MedicationLogApi from "@/apis/medicationLog.api";
import { MedicationLogActionRequest } from "@/types/MedicationLog";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Alert } from "react-native";

// ======================= QUERIES (GET) =======================

export function useGetMemberMedicationLogs(memberId: string | undefined, startDate?: string, endDate?: string) {
    return useQuery({
        // Đưa startDate và endDate vào queryKey để tự động fetch lại khi đổi filter
        queryKey: ["member-med-logs", memberId, startDate, endDate],
        queryFn: async () => {
            if (!memberId) throw new Error("Missing Member ID");
            const res = await MedicationLogApi.getMemberMedicationLogs(memberId, startDate, endDate);
            if (!res.success) throw new Error(res.message);
            return res.data;
        },
        enabled: !!memberId,
    });
}

export function useGetFamilyMedicationLogs(familyId: string | undefined, startDate?: string, endDate?: string) {
    return useQuery({
        queryKey: ["family-med-logs", familyId, startDate, endDate],
        queryFn: async () => {
            if (!familyId) throw new Error("Missing Family ID");
            const res = await MedicationLogApi.getFamilyMedicationLogs(familyId, startDate, endDate);
            if (!res.success) throw new Error(res.message);
            return res.data;
        },
        enabled: !!familyId,
    });
}

export function useGetScheduleStats(scheduleId: string | undefined) {
    return useQuery({
        queryKey: ["schedule-stats", scheduleId],
        queryFn: async () => {
            if (!scheduleId) throw new Error("Missing Schedule ID");
            const res = await MedicationLogApi.getScheduleStats(scheduleId);
            if (!res.success) throw new Error(res.message);
            return res.data;
        },
        enabled: !!scheduleId,
    });
}

// ======================= MUTATIONS (POST) =======================

export function useLogMedicationAction() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: MedicationLogActionRequest) => MedicationLogApi.logMedicationAction(data),
        onSuccess: (res) => {
            if (res.success) {
                // RẤT QUAN TRỌNG: Làm mới lại toàn bộ dữ liệu liên quan sau khi uống thuốc
                queryClient.invalidateQueries({ queryKey: ["member-med-logs"] });
                queryClient.invalidateQueries({ queryKey: ["family-med-logs"] });
                queryClient.invalidateQueries({ queryKey: ["schedule-stats"] });

                // Cũng nên làm mới luôn danh sách Reminders vì trạng thái của nó đã thay đổi
                queryClient.invalidateQueries({ queryKey: ["member-reminders"] });
                queryClient.invalidateQueries({ queryKey: ["family-reminders"] });

            } else {
                Alert.alert("Lỗi", res.message || "Không thể lưu lịch sử uống thuốc.");
            }
        },
        onError: (error: any) => Alert.alert("Lỗi kết nối", error?.message),
    });
}