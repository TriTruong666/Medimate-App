// apis/prescription.api.ts
import { BaseResponse } from "@/types/APIResponse";
import {
    Prescription,
    ScanPrescriptionResponse,
    UpsertPrescriptionRequest
} from "@/types/Prescription";
import { axiosClient } from "./client";

// Lấy danh sách đơn thuốc của 1 thành viên
export async function getMemberPrescriptions(memberId: string): Promise<BaseResponse<Prescription[]>> {
    try {
        const res = await axiosClient.get(`/api/v1/prescriptions/member/${memberId}`);
        return res.data;
    } catch (error: any) {
        if (error.response?.data) return error.response.data;
        throw error;
    }
}

// Lấy chi tiết 1 đơn thuốc
export async function getPrescriptionDetail(prescriptionId: string): Promise<BaseResponse<Prescription>> {
    try {
        const res = await axiosClient.get(`/api/v1/prescriptions/${prescriptionId}`);
        return res.data;
    } catch (error: any) {
        if (error.response?.data) return error.response.data;
        throw error;
    }
}

// Gửi ảnh lên để AI/OCR quét và bóc tách dữ liệu
export async function scanPrescription(memberId: string, imageFile: any): Promise<BaseResponse<ScanPrescriptionResponse>> {
    try {
        const formData = new FormData();
        formData.append("file", {
            uri: imageFile.uri,
            name: imageFile.fileName || "prescription.jpg",
            type: imageFile.mimeType || "image/jpeg",
        } as any);

        const res = await axiosClient.post(`/api/v1/upload/prescription-scan?memberId=${memberId}`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        return res.data;
    } catch (error: any) {
        if (error.response?.data) return error.response.data;
        throw error;
    }
}

// Tạo mới đơn thuốc (Từ dữ liệu quét OCR hoặc nhập tay)
export async function createPrescription(memberId: string, data: UpsertPrescriptionRequest): Promise<BaseResponse<any>> {
    try {
        const res = await axiosClient.post(`/api/v1/prescriptions/member/${memberId}`, data);
        return res.data;
    } catch (error: any) {
        if (error.response?.data) return error.response.data;
        throw error;
    }
}

// Cập nhật đơn thuốc
export async function updatePrescription(prescriptionId: string, data: UpsertPrescriptionRequest): Promise<BaseResponse<any>> {
    try {
        const res = await axiosClient.put(`/api/v1/prescriptions/${prescriptionId}`, data);
        return res.data;
    } catch (error: any) {
        if (error.response?.data) return error.response.data;
        throw error;
    }
}

// Xóa đơn thuốc
export async function deletePrescription(prescriptionId: string): Promise<BaseResponse<any>> {
    try {
        const res = await axiosClient.delete(`/api/v1/prescriptions/${prescriptionId}`);
        return res.data;
    } catch (error: any) {
        if (error.response?.data) return error.response.data;
        throw error;
    }
}