import * as DoctorApi from "@/apis/doctor.api";
import { DoctorFilterRequest } from "@/types/Doctor";
import { useQuery } from "@tanstack/react-query";

export function useGetDoctors(filter?: DoctorFilterRequest) {
    return useQuery({
        queryKey: ["doctors", filter],
        queryFn: async () => {
            const res = await DoctorApi.getDoctors(filter);
            if (!res.success) throw new Error(res.message);
            // Handle possibility of paginated result vs direct array
            return Array.isArray(res.data) ? res.data : (res.data?.items || []);
        },
    });
}

export function useGetDoctorDetail(doctorId: string | undefined) {
    return useQuery({
        queryKey: ["doctor", doctorId],
        queryFn: async () => {
            if (!doctorId) throw new Error("Missing Doctor ID");
            const res = await DoctorApi.getDoctorDetail(doctorId);
            if (!res.success) throw new Error(res.message);
            return res.data;
        },
        enabled: !!doctorId,
    });
}

export function useGetDoctorReviews(doctorId: string | undefined) {
    return useQuery({
        queryKey: ["doctor-reviews", doctorId],
        queryFn: async () => {
            if (!doctorId) throw new Error("Missing Doctor ID");
            const res = await DoctorApi.getDoctorReviews(doctorId);
            if (!res.success) throw new Error(res.message);
            return res.data;
        },
        enabled: !!doctorId,
    });
}

export function useGetDoctorAvailabilities(doctorId: string | undefined) {
    return useQuery({
        queryKey: ["doctor-availabilities", doctorId],
        queryFn: async () => {
            if (!doctorId) throw new Error("Missing Doctor ID");
            const res = await DoctorApi.getDoctorAvailabilities(doctorId);
            if (!res.success) throw new Error(res.message);
            return res.data;
        },
        enabled: !!doctorId,
    });
}
