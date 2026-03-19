"use client";

import { SWRConfig } from "swr";
import { api } from "@/lib/api/api";

export function SWRProvider({ children }: { children: React.ReactNode }) {
  return (
    <SWRConfig
      value={{
        fetcher: async (key: string) => {
          const res = await api.get(key);
          return res.data;
        },
        shouldRetryOnError: false,
        revalidateOnFocus: false
      }}
    >
      {children}
    </SWRConfig>
  );
}

