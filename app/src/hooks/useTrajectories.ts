"use client";

import { useQuery } from "@tanstack/react-query";
import type { TrajectoryListResponse } from "@/lib/types";

export function useTrajectories(limit = 50) {
  return useQuery<TrajectoryListResponse>({
    queryKey: ["trajectories", limit],
    queryFn: async () => {
      const res = await fetch(`/api/trajectories?limit=${limit}`);
      if (!res.ok) throw new Error("Failed to fetch trajectories");
      return res.json();
    },
    refetchInterval: 10_000,
  });
}
