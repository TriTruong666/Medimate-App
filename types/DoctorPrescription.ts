// ========================
// DOCTOR PRESCRIPTION
// ========================
export type MedicineItem = {
    medicineName: string;
    dosage: string;
    quantity: number;
    unit: string;
    instructions: string;
};

export type DoctorPrescriptionResponse = {
    digitalPrescriptionId: string;
    consultanSessionId: string;
    doctorId: string;
    doctorName: string;
    memberId: string;
    memberName: string;
    diagnosis: string;
    advice: string;
    medicines: MedicineItem[];
    createdAt: string;
};

export type CreateDoctorPrescriptionRequest = {
    consultanSessionId: string;
    memberId: string;
    diagnosis: string;
    advice: string;
    medicines: MedicineItem[];
};

export type UpdateDoctorPrescriptionRequest = {
    diagnosis: string;
    advice: string;
    medicines: MedicineItem[];
};