import * as ScheduleApi from "@/apis/schedule.api";
import {
    CreateBulkScheduleRequest,
    UpdatePreferredTimesRequest,
    UpdateReminderActionRequest,
    UpdateScheduleDetailRequest,
    UpdateScheduleRequest
} from "@/types/Schedule";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Alert } from "react-native";

// ======================= QUERIES (GET) =======================

export function useGetMemberSchedules(memberId: string | undefined) {
    return useQuery({
        queryKey: ["member-schedules", memberId],
        queryFn: async () => {
            if (!memberId) throw new Error("Missing Member ID");
            const res = await ScheduleApi.getMemberSchedules(memberId);
            if (!res.success) throw new Error(res.message);
            return res.data;
        },
        enabled: !!memberId,
    });
}

export function useGetFamilySchedules(familyId: string | undefined) {
    return useQuery({
        queryKey: ["family-schedules", familyId],
        queryFn: async () => {
            if (!familyId) throw new Error("Missing Family ID");
            const res = await ScheduleApi.getFamilySchedules(familyId);
            if (!res.success) throw new Error(res.message);
            return res.data;
        },
        enabled: !!familyId,
    });
}

export function useGetScheduleDetail(scheduleId: string | undefined) {
    return useQuery({
        queryKey: ["schedule-detail", scheduleId],
        queryFn: async () => {
            if (!scheduleId) throw new Error("Missing Schedule ID");
            const res = await ScheduleApi.getScheduleDetail(scheduleId);
            if (!res.success) throw new Error(res.message);
            return res.data;
        },
        enabled: !!scheduleId,
    });
}

export function useGetMemberDailyReminders(memberId: string | undefined, date: string | undefined) {
    return useQuery({
        queryKey: ["member-reminders", memberId, date],
        queryFn: async () => {
            if (!memberId || !date) throw new Error("Missing Parameters");
            const res = await ScheduleApi.getMemberDailyReminders(memberId, date);
            if (!res.success) throw new Error(res.message);
            return res.data;
        },
        enabled: !!memberId && !!date,
        staleTime: 30_000,         // Cache 30 giây — SignalR sẽ invalidate khi có thay đổi thực
        // Không dùng refetchInterval/refetchOnWindowFocus — SignalR ReceiveMedicationLogUpdate xử lý
    });
}

export function useGetFamilyDailyReminders(familyId: string | undefined, date: string | undefined) {
    return useQuery({
        queryKey: ["family-reminders", familyId, date],
        queryFn: async () => {
            if (!familyId || !date) throw new Error("Missing Parameters");
            const res = await ScheduleApi.getFamilyDailyReminders(familyId, date);
            if (!res.success) throw new Error(res.message);
            return res.data;
        },
        enabled: !!familyId && !!date,
    });
}

// ======================= MUTATIONS =======================

export function useCreateBulkSchedules() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ memberId, data }: { memberId: string; data: CreateBulkScheduleRequest }) =>
            ScheduleApi.createBulkSchedules(memberId, data),
        onSuccess: (res) => {
            if (res.success) {
                queryClient.invalidateQueries({ queryKey: ["member-schedules"] });
                queryClient.invalidateQueries({ queryKey: ["family-schedules"] });
                queryClient.invalidateQueries({ queryKey: ["member-reminders"] });
                queryClient.invalidateQueries({ queryKey: ["family-reminders"] });
                Alert.alert("Đã tạo lịch", "Đã tạo lịch uống thuốc thành công!");
            } else {
                Alert.alert("Lỗi", res.message || "Không thể tạo lịch.");
            }
        },
        onError: (error: any) => Alert.alert("Lỗi kết nối", error?.message),
    });
}

export function useUpdateSchedule() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateScheduleRequest }) =>
            ScheduleApi.updateSchedule(id, data),
        onSuccess: (res, variables) => {
            if (res.success) {
                queryClient.invalidateQueries({ queryKey: ["member-schedules"] });
                queryClient.invalidateQueries({ queryKey: ["family-schedules"] });
                queryClient.invalidateQueries({ queryKey: ["member-reminders"] });
                queryClient.invalidateQueries({ queryKey: ["family-reminders"] });
                queryClient.invalidateQueries({ queryKey: ["schedule-detail", variables.id] });
            } else {
                Alert.alert("Lỗi", res.message || "Không thể cập nhật lịch.");
            }
        },
        onError: (error: any) => Alert.alert("Lỗi kết nối", error?.message),
    });
}

export function useUpdateScheduleDetail() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ detailId, data }: { detailId: string; data: UpdateScheduleDetailRequest }) =>
            ScheduleApi.updateScheduleDetail(detailId, data),
        onSuccess: (res, variables) => {
            if (res.success) {
                queryClient.invalidateQueries({ queryKey: ["member-schedules"] });
                queryClient.invalidateQueries({ queryKey: ["family-schedules"] });
                queryClient.invalidateQueries({ queryKey: ["member-reminders"] });
                queryClient.invalidateQueries({ queryKey: ["family-reminders"] });
                queryClient.invalidateQueries({ queryKey: ["schedule-detail"] });
            } else {
                Alert.alert("Lỗi", res.message || "Không thể cập nhật thuốc.");
            }
        },
        onError: (error: any) => Alert.alert("Lỗi kết nối", error?.message),
    });
}

export function useDeleteSchedule() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => ScheduleApi.deleteSchedule(id),
        onSuccess: (res) => {
            if (res.success) {
                queryClient.invalidateQueries({ queryKey: ["member-schedules"] });
                queryClient.invalidateQueries({ queryKey: ["family-schedules"] });
                queryClient.invalidateQueries({ queryKey: ["member-reminders"] });
                queryClient.invalidateQueries({ queryKey: ["family-reminders"] });
                queryClient.invalidateQueries({ queryKey: ["schedule-detail"] });
                Alert.alert("Đã xóa", "Đã xóa lịch uống thuốc!");
            } else {
                Alert.alert("Lỗi", res.message || "Không thể xóa lịch.");
            }
        },
        onError: (error: any) => Alert.alert("Lỗi kết nối", error?.message),
    });
}

export function useUpdateReminderAction() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateReminderActionRequest }) =>
            ScheduleApi.updateReminderAction(id, data),
        onSuccess: (res) => {
            if (res.success) {
                queryClient.invalidateQueries({ queryKey: ["member-reminders"] });
                queryClient.invalidateQueries({ queryKey: ["family-reminders"] });
                queryClient.invalidateQueries({ queryKey: ["member-med-logs"] });
                queryClient.invalidateQueries({ queryKey: ["family-med-logs"] });
                queryClient.invalidateQueries({ queryKey: ["schedule-stats"] });
                queryClient.invalidateQueries({ queryKey: ["medication-dashboard"] });
            } else {
                Alert.alert("Lỗi", res.message || "Không thể cập nhật trạng thái.");
            }
        },
        onError: (error: any) => Alert.alert("Lỗi kết nối", error?.message),
    });
}

export function useSnoozeReminder() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, delayMinutes }: { id: string; delayMinutes: number }) =>
            ScheduleApi.snoozeReminder(id, delayMinutes),
        onSuccess: (res) => {
            if (res.success) {
                queryClient.invalidateQueries({ queryKey: ["member-reminders"] });
                queryClient.invalidateQueries({ queryKey: ["family-reminders"] });
                Alert.alert("Thành công", "Đã hoãn báo thức!");
            } else {
                Alert.alert("Lỗi", res.message || "Không thể hoãn báo thức.");
            }
        },
        onError: (error: any) => Alert.alert("Lỗi kết nối", error?.message),
    });
}

export function useUpdatePreferredTimes() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ memberId, data }: { memberId: string; data: UpdatePreferredTimesRequest }) =>
            ScheduleApi.updatePreferredTimes(memberId, data), // Sửa ScheduleApi thành tên import API tương ứng của bạn
        onSuccess: (res, variables) => {
            if (res.success) {
                // Cập nhật lại cache của các lịch trình hoặc thông tin member liên quan
                queryClient.invalidateQueries({ queryKey: ["member-schedules", variables.memberId] });
                queryClient.invalidateQueries({ queryKey: ["member-detail", variables.memberId] });

                Alert.alert("Thành công", "Đã cập nhật giờ ưu tiên uống thuốc!");
            } else {
                Alert.alert("Lỗi", res.message || "Không thể cập nhật giờ ưu tiên.");
            }
        },
        onError: (error: any) => Alert.alert("Lỗi kết nối", error?.message),
    });
}