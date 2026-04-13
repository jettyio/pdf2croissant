"use client";

import { useQuery } from "@tanstack/react-query";

/**
 * Fetch the paper/dataset title from the croissant.json output of a completed run.
 * Returns the `name` field from the JSON-LD, or null if unavailable.
 */
export function usePaperTitle(
  croissantFilePath: string | null | undefined
) {
  return useQuery<string | null>({
    queryKey: ["paper-title", croissantFilePath],
    queryFn: async () => {
      if (!croissantFilePath) return null;
      const res = await fetch(
        `/api/file?path=${encodeURIComponent(croissantFilePath)}`
      );
      if (!res.ok) return null;
      try {
        const json = await res.json();
        return (json.name as string) || null;
      } catch {
        return null;
      }
    },
    enabled: !!croissantFilePath,
    staleTime: Infinity, // completed runs don't change
    retry: false,
  });
}
