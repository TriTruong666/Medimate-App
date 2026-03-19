// hooks/useHome.ts
import * as HomeApi from "@/apis/home.api";
import { FamilyData } from "@/types/Home";
import { useQuery } from "@tanstack/react-query";
import { useFetch } from "./useFetch";

// Hook lấy danh sách gia đình
export function useGetFamilies() {
    return useFetch<FamilyData[]>(["families"], async () => HomeApi.getFamilies());
}

// Hook lấy thông tin gói dịch vụ (chỉ chạy khi có familyId)
export function useGetSubscription(familyId: string | undefined) {
    // Dùng useQuery trực tiếp thay vì useFetch vì ta cần điều kiện enabled
    return useQuery({
        queryKey: ["subscription", familyId],
        queryFn: async () => {
            if (!familyId) throw new Error("Missing Family ID");
            const res = await HomeApi.getSubscription(familyId);
            if (!res.success) throw new Error(res.message);
            return res.data;
        },
        enabled: !!familyId, // Chỉ gọi API khi familyId có giá trị
    });
}