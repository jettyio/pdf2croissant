"use client";

import { useQuery } from "@tanstack/react-query";
import type { Trajectory } from "@/lib/types";

export function useTrajectory(id: string | null) {
  return useQuery<Trajectory>({
    queryKey: ["trajectory", id],
    queryFn: async () => {
      const res = await fetch(`/api/trajectory/${id}`);
      if (!res.ok) throw new Error("Failed to fetch trajectory");
      return res.json();
    },
    enabled: !!id,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (status === "completed" || status === "failed") return false;
      return 5_000;
    },
  });
}
