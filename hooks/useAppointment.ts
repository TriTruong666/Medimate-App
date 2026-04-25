import * as AppointmentApi from "@/apis/appointment.api";
import { CancelAppointmentRequest, CreateAppointmentRequest } from "@/types/Appointment";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Alert } from "react-native";

export function useGetDoctorAvailableSlots(doctorId: string | undefined, date: string | undefined) {
    return useQuery({
        queryKey: ["available-slots", doctorId, date],
        queryFn: async () => {
            if (!doctorId || !date) throw new Error("Missing Parameters");
            const res = await AppointmentApi.getDoctorAvailableSlots(doctorId, date);
            if (!res.success) throw new Error(res.message);
            return res.data;
        },
        enabled: !!doctorId && !!date,
    });
}

export function useGetMyAppointments(filter?: any) {
    return useQuery({
        queryKey: ["my-appointments", filter],
        queryFn: async () => {
            const res = await AppointmentApi.getMyAppointments(filter);
            if (!res.success) throw new Error(res.message);
            // API trả BaseResponse<AppointmentResponse[]> — data là array trực tiếp
            return Array.isArray(res.data) ? res.data : [];
        },
    });
}

export function useGetMemberAppointments(memberId: string) {
    return useQuery({
        queryKey: ["member-appointments", memberId],
        queryFn: async () => {
            const res = await AppointmentApi.getMyMemberAppointments();
            if (!res.success) throw new Error(res.message);
            const allAppointments = Array.isArray(res.data) ? res.data : [];
            return allAppointments.filter(a => a.memberId === memberId);
        },
        enabled: !!memberId,
    });
}

// Hook lấy chi tiết 1 appointment (có doctorName, appointmentTime, ...)
export function useGetAppointmentDetail(appointmentId: string | undefined) {
    return useQuery({
        // Dùng queryKey riêng biệt chứa ID để cache riêng từng lịch hẹn
        queryKey: ["appointment-detail", appointmentId],
        queryFn: async () => {
            if (!appointmentId) throw new Error("Missing Appointment ID");
            const res = await AppointmentApi.getAppointmentDetail(appointmentId);
            if (!res.success) throw new Error(res.message);
            return res.data;
        },
        enabled: !!appointmentId, // Chỉ gọi API khi ID đã có sẵn (không bị undefined)
        // Không dùng refetchInterval — SignalR sẽ invalidate khi có AppointmentStatusUpdated
    });
}

export function useCreateAppointment() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateAppointmentRequest) => AppointmentApi.createAppointment(data),
        onSuccess: (res) => {
            if (res.success) {
                queryClient.invalidateQueries({ queryKey: ["available-slots"] });
                queryClient.invalidateQueries({ queryKey: ["my-appointments"] });
            } else {
                Alert.alert("Lỗi", res.message || "Không thể đặt lịch hẹn.");
            }
        },
        onError: (error: any) => Alert.alert("Lỗi kết nối", error?.message),
    });
}

export function useCancelAppointment() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: CancelAppointmentRequest }) =>
            AppointmentApi.cancelAppointment(id, data),
        onSuccess: (res) => {
            if (res.success) {
                // Nhả khung giờ trống ra lại
                queryClient.invalidateQueries({ queryKey: ["available-slots"] });
                Alert.alert("Thành công", "Đã hủy lịch hẹn.");
            } else {
                Alert.alert("Lỗi", res.message || "Không thể hủy lịch hẹn.");
            }
        },
        onError: (error: any) => Alert.alert("Lỗi kết nối", error?.message),
    });
}

// Hook hủy slot chưa thanh toán
export function useDeleteUnpaidAppointment() {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: async (appointmentId: string) =>
            AppointmentApi.deleteUnpaidAppointment(appointmentId),
        onSuccess: () => {
            // Cập nhật lại khung giờ trống để người khác có thể đặt
            queryClient.invalidateQueries({ queryKey: ["available-slots"] });
            queryClient.invalidateQueries({ queryKey: ["my-appointments"] });
        },
    });
}
