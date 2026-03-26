// types/Prescription.ts

export type PrescriptionMedicine = {
    prescriptionMedicineId?: string | null;
    medicineName: string;
    dosage?: string | null;
    unit?: string | null;
    quantity: number;
    instructions?: string | null;
};

export type PrescriptionImage = {
    imageUrl: string;
    thumbnailUrl: string;
    ocrRawData?: string | null;
};

// Kiểu dữ liệu Đơn thuốc hoàn chỉnh (Dùng khi GET chi tiết hoặc danh sách)
export type Prescription = {
    prescriptionId: string;
    memberId: string;
    prescriptionCode?: string | null;
    doctorName?: string | null;
    hospitalName?: string | null;
    prescriptionDate?: string | null;
    status: string;
    notes?: string | null;
    images: PrescriptionImage[];
    medicines: PrescriptionMedicine[];
};

// Request body khi Tạo mới / Cập nhật
export type UpsertPrescriptionRequest = {
    prescriptionCode?: string | null;
    doctorName?: string | null;
    hospitalName?: string | null;
    prescriptionDate?: string | null;
    notes?: string | null;
    status?: string; // Dùng khi PUT cập nhật (VD: "Active", "Completed")
    images: PrescriptionImage[];
    medicines: PrescriptionMedicine[];
};

// Response trả về từ API Quét ảnh OCR
export type ScanPrescriptionResponse = {
    imageUrl: string;
    thumbnailUrl: string;
    rawText: string;
    extractedData: {
        doctorName?: string | null;
        hospitalName?: string | null;
        prescriptionCode?: string | null;
        prescriptionDate?: string | null;
        notes?: string | null;
        medicines: PrescriptionMedicine[];
    };
};

// types/Prescription.ts

export type AddMedicineRequest = {
    medicineName: string;
    dosage?: string;
    unit?: string;
    quantity: number;
    instructions?: string;
};

// Update cho phép null/undefined các trường không thay đổi (Partial Update)
export type UpdateMedicineRequest = {
    medicineName?: string;
    dosage?: string;
    unit?: string;
    quantity?: number;
    instructions?: string;
};