"use client";

import Link from "next/link";
import { useTrajectories } from "@/hooks/useTrajectories";
import {
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  ArrowRight,
  FileJson2,
} from "lucide-react";

const statusConfig = {
  pending: {
    icon: Clock,
    color: "text-yellow-600",
    bg: "bg-yellow-50",
    label: "Pending",
  },
  running: {
    icon: Loader2,
    color: "text-blue-600",
    bg: "bg-blue-50",
    label: "Running",
    spin: true,
  },
  completed: {
    icon: CheckCircle2,
    color: "text-green-600",
    bg: "bg-green-50",
    label: "Completed",
  },
  failed: {
    icon: XCircle,
    color: "text-red-600",
    bg: "bg-red-50",
    label: "Failed",
  },
} as const;

const MODEL_SHORT: Record<string, string> = {
  "gemini-3-pro-preview": "Gemini",
};

export function RunHistory() {
  const { data, isLoading, error } = useTrajectories();

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-400">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading runs...
      </div>
    );
  }

  if (error) {
    return (
      <p className="text-sm text-red-600">
        Failed to load runs: {error.message}
      </p>
    );
  }

  const trajectories = data?.trajectories ?? [];

  if (trajectories.length === 0) {
    return (
      <p className="text-sm text-gray-400">
        No runs yet. Upload a paper above to get started.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {trajectories.map((t) => {
        const cfg =
          statusConfig[t.status as keyof typeof statusConfig] ??
          statusConfig.pending;
        const Icon = cfg.icon;

        // Try to extract a display label from init_params
        const messages = t.init_params?.messages as
          | { role: string; content: string }[]
          | undefined;
        const userMsg = messages?.find((m) => m.role === "user")?.content;
        const label =
          userMsg?.slice(0, 100) ??
          (t.init_params?.vars?.dataset_name as string) ??
          t.trajectory_id.slice(0, 12);

        const modelId = t.init_params?.model as string | undefined;
        const modelLabel = modelId ? MODEL_SHORT[modelId] ?? modelId : null;

        return (
          <Link
            key={t.trajectory_id}
            href={`/run/${t.trajectory_id}`}
            className="group flex items-center gap-4 rounded-lg border border-gray-200 bg-white px-4 py-3 transition-colors hover:border-gray-300 hover:shadow-sm"
          >
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${cfg.bg} ${cfg.color}`}
            >
              <Icon
                className={`h-3.5 w-3.5 ${"spin" in cfg && cfg.spin ? "animate-spin" : ""}`}
              />
              {cfg.label}
            </span>

            <FileJson2 className="h-4 w-4 shrink-0 text-gray-400" />

            <span className="min-w-0 flex-1 truncate text-sm text-gray-700">
              {label.length > 80 ? label.slice(0, 80) + "..." : label}
            </span>

            {modelLabel && (
              <span className="hidden shrink-0 rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-500 sm:block">
                {modelLabel}
              </span>
            )}

            <span className="hidden shrink-0 text-xs text-gray-400 sm:block">
              {new Date(t.created).toLocaleString()}
            </span>

            <ArrowRight className="h-4 w-4 shrink-0 text-gray-300 transition-colors group-hover:text-sky-500" />
          </Link>
        );
      })}
    </div>
  );
}
