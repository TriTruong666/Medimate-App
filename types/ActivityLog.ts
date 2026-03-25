export type ActivityLogResponse = {
    logId: string;
    memberId: string;
    memberName: string;
    actionType: string;
    entityName: string;
    description: string;
    oldDataJson?: string | null;
    newDataJson?: string | null;
    createdAt: string;
};