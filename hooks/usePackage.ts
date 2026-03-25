import * as PackageApi from "@/apis/package.api";
import { useQuery } from "@tanstack/react-query";


export function useGetMembershipPackages() {
    return useQuery({
        queryKey: ["membership-packages"],
        queryFn: async () => {
            const res = await PackageApi.getMembershipPackages();
            if (!res.success) throw new Error(res.message);
            return res.data;
        },
    });
}