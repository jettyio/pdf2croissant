"use client";

import {
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  FileText,
} from "lucide-react";
import type { Trajectory } from "@/lib/types";

function formatDuration(ms: number) {
  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}m ${secs}s`;
}

export function StepTimeline({ trajectory }: { trajectory: Trajectory }) {
  const steps = trajectory.steps;
  if (!steps || Object.keys(steps).length === 0) return null;

  const entries = Object.entries(steps).sort((a, b) => {
    const aTime = a[1].created ? new Date(a[1].created).getTime() : 0;
    const bTime = b[1].created ? new Date(b[1].created).getTime() : 0;
    return aTime - bTime;
  });

  return (
    <div className="space-y-1">
      {entries.map(([name, step]) => {
        const duration =
          step.created && step.ended
            ? new Date(step.ended).getTime() -
              new Date(step.created).getTime()
            : null;

        const statusIcon =
          step.status === "completed" ? (
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          ) : step.status === "failed" ? (
            <XCircle className="h-4 w-4 text-red-500" />
          ) : step.status === "running" ? (
            <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
          ) : (
            <Clock className="h-4 w-4 text-gray-400" />
          );

        const fileCount = Array.isArray(
          (step.outputs as Record<string, unknown> | undefined)?.files
        )
          ? (
              (step.outputs as Record<string, unknown>).files as unknown[]
            ).length
          : 0;

        return (
          <div
            key={name}
            className="flex items-center gap-3 rounded-lg border border-gray-100 bg-white px-3 py-2"
          >
            {statusIcon}
            <span className="min-w-0 flex-1 text-sm font-medium text-gray-700">
              {name.replace(/_/g, " ")}
            </span>
            {step.activity && (
              <span className="hidden text-xs text-gray-400 sm:block">
                {step.activity}
              </span>
            )}
            {fileCount > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
                <FileText className="h-3 w-3" />
                {fileCount}
              </span>
            )}
            {duration !== null && (
              <span className="text-xs text-gray-400">
                {formatDuration(duration)}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
