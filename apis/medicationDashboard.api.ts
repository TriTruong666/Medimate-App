import type { BaseResponse } from '@/types/APIResponse';
import type { FamilyMedicationDashboard, MedicationDashboardParams } from '@/types/MedicationDashboard';
import { axiosClient } from './client';

export async function getFamilyMedicationDashboard(
    familyId: string,
    params?: MedicationDashboardParams,
): Promise<BaseResponse<FamilyMedicationDashboard>> {
    const res = await axiosClient.get(
        `/api/v1/medicationlogs/family/${familyId}/dashboard`,
        { params },
    );
    return res.data;
}
