"use client";

import { Clock, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import type { Trajectory } from "@/lib/types";

const config = {
  pending: {
    icon: Clock,
    label: "Pending",
    bg: "bg-yellow-50 border-yellow-200",
    text: "text-yellow-700",
  },
  running: {
    icon: Loader2,
    label: "Running",
    bg: "bg-blue-50 border-blue-200",
    text: "text-blue-700",
    spin: true,
  },
  completed: {
    icon: CheckCircle2,
    label: "Completed",
    bg: "bg-green-50 border-green-200",
    text: "text-green-700",
  },
  failed: {
    icon: XCircle,
    label: "Failed",
    bg: "bg-red-50 border-red-200",
    text: "text-red-700",
  },
} as const;

export function RunStatusBanner({
  trajectory,
}: {
  trajectory: Trajectory;
}) {
  const cfg =
    config[trajectory.status as keyof typeof config] ?? config.pending;
  const Icon = cfg.icon;

  const completedSteps = Object.values(trajectory.steps ?? {}).filter(
    (s) => s.status === "completed" || s.ended != null
  ).length;
  const totalSteps = Object.keys(trajectory.steps ?? {}).length;

  return (
    <div className={`rounded-lg border px-4 py-3 ${cfg.bg}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon
            className={`h-5 w-5 ${cfg.text} ${"spin" in cfg && cfg.spin ? "animate-spin" : ""}`}
          />
          <span className={`font-medium ${cfg.text}`}>{cfg.label}</span>
          {totalSteps > 0 && (
            <span className="text-sm text-gray-500">
              ({completedSteps}/{totalSteps} steps)
            </span>
          )}
        </div>
        <span className="font-mono text-xs text-gray-400">
          {trajectory.trajectory_id}
        </span>
      </div>
      {(trajectory.status === "pending" || trajectory.status === "running") && (
        <p className="mt-1.5 text-sm text-gray-500">
          This typically takes 2–3 minutes. Results will appear automatically.
        </p>
      )}
      {trajectory.error && (
        <p className="mt-1.5 text-sm text-red-600">{trajectory.error}</p>
      )}
    </div>
  );
}
