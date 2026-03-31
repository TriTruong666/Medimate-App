import { BaseResponse } from "@/types/APIResponse";
import { CreateDoctorPrescriptionRequest, DoctorPrescriptionResponse, UpdateDoctorPrescriptionRequest } from "@/types/DoctorPrescription";
import { axiosClient } from "./client";

export async function createDoctorPrescription(doctorId: string, data: CreateDoctorPrescriptionRequest): Promise<BaseResponse<DoctorPrescriptionResponse>> {
    try {
        const res = await axiosClient.post(`/api/v1/doctor-prescriptions/doctors/${doctorId}`, data);
        return res.data;
    } catch (error: any) {
        if (error.response?.data) return error.response.data;
        throw error;
    }
}

export async function getDoctorPrescriptionById(id: string): Promise<BaseResponse<DoctorPrescriptionResponse>> {
    try {
        const res = await axiosClient.get(`/api/v1/doctor-prescriptions/${id}`);
        return res.data;
    } catch (error: any) {
        if (error.response?.data) return error.response.data;
        throw error;
    }
}

export async function updateDoctorPrescription(id: string, data: UpdateDoctorPrescriptionRequest): Promise<BaseResponse<DoctorPrescriptionResponse>> {
    try {
        const res = await axiosClient.put(`/api/v1/doctor-prescriptions/${id}`, data);
        return res.data;
    } catch (error: any) {
        if (error.response?.data) return error.response.data;
        throw error;
    }
}

export async function getDoctorPrescriptionsByMemberId(memberId: string): Promise<BaseResponse<DoctorPrescriptionResponse[]>> {
    try {
        const res = await axiosClient.get(`/api/v1/doctor-prescriptions/members/${memberId}`);
        return res.data;
    } catch (error: any) {
        if (error.response?.data) return error.response.data;
        throw error;
    }
}