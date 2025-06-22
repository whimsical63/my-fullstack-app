import {
  useQuery,
  UseQueryOptions,
  useMutation,
  UseMutationOptions,
} from "@tanstack/react-query";
import api from "@/lib/api";
/**
 * Custom hook to perform a GET request using React Query.
 *
 * @param queryKey - The unique key for the query.
 * @param endpoint - The API endpoint to fetch data from.
 * @param options - Optional query options.
 * @returns The result of the query.
 */
export function useGetApiQuery<T = unknown>(
  queryKey: unknown[],
  endpoint: string,
  options?: Omit<UseQueryOptions<T>, "queryKey" | "queryFn">
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

/**
 * Custom hook to perform a POST request using React Query.
 *
 * @param endpoint - The API endpoint to post data to.
 * @param options - Optional mutation options.
 * @returns The result of the mutation.
 */

export function usePostApiMutation<TData = unknown, TVariables = unknown>(
  endpoint: string,
  options?: UseMutationOptions<TData, Error, TVariables>
) {
  return useMutation<TData, Error, TVariables>({
    mutationFn: async (variables: TVariables) => {
      const response = await api.post(endpoint, variables);
      return response.data;
    },
    ...options,
  });
}
