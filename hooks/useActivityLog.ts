import * as ActivityLogApi from "@/apis/activityLog.api";
import { useQuery } from "@tanstack/react-query";

export function useGetFamilyActivityLogs(familyId: string | undefined, page: number = 1, pageSize: number = 20) {
    return useQuery({
        // Thêm page và pageSize vào queryKey để tự động fetch khi lật trang
        queryKey: ["activity-logs", familyId, page, pageSize],
        queryFn: async () => {
            if (!familyId) throw new Error("Missing Family ID");
            const res = await ActivityLogApi.getFamilyActivityLogs(familyId, page, pageSize);
            if (!res.success) throw new Error(res.message);
            return res.data;
        },
        enabled: !!familyId,
    });
}