import { BaseResponse } from "@/types/APIResponse";
import {
  useQuery,
  useSuspenseQuery,
  type UseQueryOptions,
  type UseSuspenseQueryOptions,
} from "@tanstack/react-query";

export function useFetch<T>(
  queryKey: any[],
  queryFn: () => Promise<BaseResponse<T>>,
  options?: Omit<
    UseQueryOptions<BaseResponse<T>, Error>,
    "queryKey" | "queryFn"
  >
) {
  const {
    data: response,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery<BaseResponse<T>, Error>({
    queryKey,
    queryFn: async () => {
      const res = await queryFn();
      if (!res.success) {
        throw new Error(res.message || "Đã xảy ra lỗi khi lấy dữ liệu");
      }
      return res;
    },
    ...options,
  });

  return {
    data: response?.data,
    fullResponse: response,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  };
}

export function useSuspenseFetch<T>(
  queryKey: any[],
  queryFn: () => Promise<BaseResponse<T>>,
  options?: Omit<
    UseSuspenseQueryOptions<BaseResponse<T>, Error>,
    "queryKey" | "queryFn"
  >
) {
  const { data: response, refetch } = useSuspenseQuery<BaseResponse<T>, Error>({
    queryKey,
    queryFn: async () => {
      const res = await queryFn();
      if (!res.success) {
        throw new Error(res.message || "Đã xảy ra lỗi khi lấy dữ liệu");
      }
      return res;
    },
    ...options,
  });

  return {
    data: response.data,
    fullResponse: response,
    refetch,
  };
}
