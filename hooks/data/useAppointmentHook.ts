import * as AppointmentAPI from "@/apis/appointment.api";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { useFetch } from "../useFetch";
import { CreateAppointmentRequest } from "@/types/Appointment";

// Hook lấy danh sách khung giờ trống
export function useGetDoctorAvailableSlots(doctorId: string, date: string) {
    return useFetch(["availableSlots", doctorId, date], async () =>
        AppointmentAPI.getDoctorAvailableSlots(doctorId, date)
    );
}

// Hook tạo lịch hẹn mới
export function useCreateAppointment() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: CreateAppointmentRequest) =>
            AppointmentAPI.createAppointment(data),
        onSuccess: () => {
            // Có thể invalidate queries nếu cần thiết
            queryClient.invalidateQueries({ queryKey: ["appointments"] });
            queryClient.invalidateQueries({ queryKey: ["availableSlots"] });
        },
    });
}

// Hook lấy chi tiết lịch hẹn
export function useGetAppointmentDetail(appointmentId: string) {
    return useFetch(["appointmentDetail", appointmentId], async () =>
        AppointmentAPI.getAppointmentDetail(appointmentId)
    );
}

// Hook hủy slot chưa thanh toán
export function useDeleteUnpaidAppointment() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (appointmentId: string) =>
            AppointmentAPI.deleteUnpaidAppointment(appointmentId),
        onSuccess: () => {
            // Cập nhật lại khung giờ trống để người khác có thể đặt
            queryClient.invalidateQueries({ queryKey: ["availableSlots"] });
            queryClient.invalidateQueries({ queryKey: ["appointments"] });
        },
    });
}
