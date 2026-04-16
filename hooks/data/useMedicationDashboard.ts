import * as MedicationDashboardService from '@/apis/medicationDashboard.api';
import type { MedicationDashboardParams } from '@/types/MedicationDashboard';
import { useFetch } from '../useFetch';

export function useGetFamilyMedicationDashboard(
    familyId: string | undefined,
    params?: MedicationDashboardParams,
) {
    return useFetch(
        ['family-medication-dashboard', familyId, params?.startDate, params?.endDate],
        () => MedicationDashboardService.getFamilyMedicationDashboard(familyId!, params),
        { enabled: !!familyId },
    );
}
