import * as SessionApi from "@/apis/session.api";
import { AttachPrescriptionRequest, JoinSessionRequest } from "@/types/Session";
import { useMutation, useQuery } from "@tanstack/react-query";

export function useGetSessionByAppointmentId(appointmentId: string | undefined) {
    return useQuery({
        queryKey: ["session", "appointment", appointmentId],
        queryFn: async () => {
            if (!appointmentId) throw new Error("Missing Appointment ID");
            const res = await SessionApi.getSessionByAppointmentId(appointmentId);
            if (!res.success) throw new Error(res.message);
            return res.data;
        },
        enabled: !!appointmentId,
    });
}

export function useJoinSession() {
    return useMutation({
        mutationFn: ({ sessionId, data }: { sessionId: string; data: JoinSessionRequest }) =>
            SessionApi.joinSession(sessionId, data),
    });
}

export function useCancelNoShowSession() {
    return useMutation({
        mutationFn: (sessionId: string) => SessionApi.cancelNoShowSession(sessionId),
    });
}

export function useEndSession() {
    return useMutation({
        mutationFn: (sessionId: string) => SessionApi.endSession(sessionId),
    });
}

export function useAttachPrescriptionToSession() {
    return useMutation({
        mutationFn: ({ sessionId, data }: { sessionId: string; data: AttachPrescriptionRequest }) =>
            SessionApi.attachPrescriptionToSession(sessionId, data),
    });
}