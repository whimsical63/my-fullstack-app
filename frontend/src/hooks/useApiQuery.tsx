import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import api from "@/lib/api";

export function useGetApiQuery<T = any>(
  queryKey: any[],
  endpoint: string,
  options?: UseQueryOptions<T>
) {
  return useQuery<T>({
    queryKey,
    queryFn: async () => {
      const response = await api.get(endpoint);
      return response.data;
    },
    ...options,
  });
}


