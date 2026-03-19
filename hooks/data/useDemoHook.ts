import * as DemoService from "@/apis/demo.api";
import { PostDemo } from "@/types/Demo";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useFetch, useSuspenseFetch } from "../useFetch";

export function useGetDemoData() {
  return useFetch(["demo-users"], async () => DemoService.demo());
}

export function useGetDemoDataSuspense() {
  return useSuspenseFetch(["demo-users"], async () => DemoService.demo());
}

export function usePostDemoData() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: PostDemo) => DemoService.postDemo(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["demo-users"] });
      console.log("Tạo tk thành công");
    },
    onError: (error) => {
      console.log("Tạo thất bại", error);
    },
  })
}