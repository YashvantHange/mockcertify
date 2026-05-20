"use client";

import useSWR, { SWRConfiguration } from "swr";
import { api } from "@/lib/api";

export function useApi<T>(path: string | null, config?: SWRConfiguration) {
  return useSWR<T>(
    path,
    path ? () => api<T>(path) : null,
    {
      revalidateOnFocus: false,
      dedupingInterval: 30_000,
      keepPreviousData: true,
      ...config,
    }
  );
}
