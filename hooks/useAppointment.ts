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
        // Refetch mỗi 15 giây để bắt kịp thông tin status mới
        refetchInterval: 15000,
        refetchIntervalInBackground: false,
    });
}

// Hook lấy chi tiết 1 appointment (có doctorName, appointmentTime, ...)
export function useGetAppointmentDetail(appointmentId: string | undefined, options?: { pollingInterval?: number }) {
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
        refetchInterval: options?.pollingInterval,
    });
}

export function useCreateAppointment() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateAppointmentRequest) => AppointmentApi.createAppointment(data),
        onSuccess: (res) => {
            if (res.success) {
                // Làm mới danh sách khung giờ để ẩn khung giờ vừa bị đặt
                queryClient.invalidateQueries({ queryKey: ["available-slots"] });
                Alert.alert("Thành công", "Đã đặt lịch hẹn thành công!");
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