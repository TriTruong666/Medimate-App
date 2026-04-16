export interface MemberAdherenceStat {
    memberId: string;
    memberName: string;
    avatarUrl: string | null;
    taken: number;
    missed: number;
    skipped: number;
    adherenceRate: number; // 0–100
}

export interface FamilyMedicationDashboard {
    familyId: string;
    totalScheduled: number;
    totalTaken: number;
    totalSkipped: number;
    totalMissed: number;
    overallAdherenceRate: number; // 0–100
    memberStats: MemberAdherenceStat[];
}

export interface MedicationDashboardParams {
    startDate?: string; // ISO date string
    endDate?: string;   // ISO date string
}
