"use client";

import { useParams } from "next/navigation";
import { useTrajectory } from "@/hooks/useTrajectory";
import { RunStatusBanner } from "@/components/RunStatusBanner";
import { CroissantViewer } from "@/components/CroissantViewer";
import { ValidationResults } from "@/components/ValidationResults";
import { SummaryReport } from "@/components/SummaryReport";
import { StepTimeline } from "@/components/StepTimeline";
import {
  Loader2,
  ArrowLeft,
  FileJson2,
  FileText,
  ShieldCheck,
  Clock,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import type { Trajectory } from "@/lib/types";
import { useState } from "react";

/** Search all step outputs for a file ending with the given name. */
function findFilePath(
  trajectory: Trajectory,
  filename: string
): string | undefined {
  for (const step of Object.values(trajectory.steps ?? {})) {
    const files = (step.outputs as Record<string, unknown> | undefined)
      ?.files as { path: string }[] | undefined;
    if (Array.isArray(files)) {
      const match = files.find((f) => f.path?.endsWith(filename));
      if (match) return match.path;
    }
  }
  return undefined;
}

/** Extract all output files across all steps. */
function extractAllFiles(trajectory: Trajectory) {
  const allFiles: { step: string; path: string }[] = [];
  for (const [stepName, step] of Object.entries(trajectory.steps ?? {})) {
    const files = (step.outputs as Record<string, unknown> | undefined)
      ?.files as { path: string }[] | undefined;
    if (Array.isArray(files)) {
      for (const f of files) {
        if (f.path) allFiles.push({ step: stepName, ...f });
      }
    }
  }
  return allFiles;
}

function formatDuration(ms: number) {
  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}m ${secs}s`;
}

function formatTimestamp(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function MetricCard({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white px-3 py-2">
      <p className="mb-1 text-xs text-gray-400">{label}</p>
      {children}
    </div>
  );
}

function RunMetadata({ trajectory }: { trajectory: Trajectory }) {
  const created = trajectory.created;
  const updated = trajectory.updated;

  const lastStep = Object.values(trajectory.steps ?? {}).reduce<{
    ended?: string;
  } | null>((latest, s) => {
    if (!s.ended) return latest;
    if (!latest?.ended) return s;
    return new Date(s.ended) > new Date(latest.ended) ? s : latest;
  }, null);

  const endTime = lastStep?.ended ?? updated;
  const durationMs =
    created && endTime
      ? new Date(endTime).getTime() - new Date(created).getTime()
      : null;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      <MetricCard label="Created">
        <span className="text-sm text-gray-700">
          {formatTimestamp(created)}
        </span>
      </MetricCard>
      {durationMs !== null && durationMs > 0 && (
        <MetricCard label="Duration">
          <span className="text-sm text-gray-700">
            {formatDuration(durationMs)}
          </span>
        </MetricCard>
      )}
      <MetricCard label="Status">
        <span
          className={`text-sm font-medium ${
            trajectory.status === "completed"
              ? "text-green-600"
              : trajectory.status === "failed"
                ? "text-red-600"
                : trajectory.status === "running"
                  ? "text-blue-600"
                  : "text-yellow-600"
          }`}
        >
          {trajectory.status}
        </span>
      </MetricCard>
    </div>
  );
}

function AllFiles({ trajectory }: { trajectory: Trajectory }) {
  const [expanded, setExpanded] = useState(false);
  const allFiles = extractAllFiles(trajectory);
  if (allFiles.length === 0) return null;

  return (
    <section>
      <button
        onClick={() => setExpanded(!expanded)}
        className="mb-2 flex items-center gap-1.5 text-lg font-medium text-gray-900 hover:text-gray-700"
      >
        {expanded ? (
          <ChevronDown className="h-4 w-4" />
        ) : (
          <ChevronRight className="h-4 w-4" />
        )}
        All output files ({allFiles.length})
      </button>
      {expanded && (
        <div className="space-y-1">
          {allFiles.map((f, i) => {
            const fileName = f.path.split("/").pop() ?? f.path;
            return (
              <a
                key={i}
                href={`/api/file?path=${encodeURIComponent(f.path)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-lg border border-gray-100 bg-white px-3 py-2 text-sm transition-colors hover:border-gray-300 hover:shadow-sm"
              >
                <FileText className="h-4 w-4 shrink-0 text-gray-400" />
                <span className="min-w-0 flex-1 truncate text-gray-600">
                  {fileName}
                </span>
                <span className="shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-400">
                  {f.step.replace(/_/g, " ")}
                </span>
              </a>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default function RunPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const { data: trajectory, isLoading, error } = useTrajectory(id ?? null);

  if (!id) {
    return (
      <div className="space-y-8">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-gray-500 transition-colors hover:text-gray-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
        <p className="text-sm text-red-600">No run ID provided.</p>
      </div>
    );
  }

  const croissantPath = trajectory
    ? findFilePath(trajectory, "croissant.json")
    : undefined;
  const summaryPath = trajectory
    ? findFilePath(trajectory, "summary.md")
    : undefined;
  const validationPath = trajectory
    ? findFilePath(trajectory, "validation_report.json")
    : undefined;

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-gray-500 transition-colors hover:text-gray-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
        <h2 className="text-xl font-semibold text-gray-900">Run details</h2>
      </div>

      {isLoading && (
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading trajectory...
        </div>
      )}

      {error && (
        <p className="text-sm text-red-600">
          Failed to load: {error.message}
        </p>
      )}

      {trajectory && (
        <div className="space-y-6">
          <RunStatusBanner trajectory={trajectory} />

          <RunMetadata trajectory={trajectory} />

          {/* Croissant JSON-LD */}
          {croissantPath && (
            <section>
              <h3 className="mb-3 flex items-center gap-2 text-lg font-medium text-gray-900">
                <FileJson2 className="h-5 w-5 text-sky-500" />
                Croissant JSON-LD
              </h3>
              <CroissantViewer filePath={croissantPath} />
            </section>
          )}

          {/* Validation */}
          {validationPath && (
            <section>
              <h3 className="mb-3 flex items-center gap-2 text-lg font-medium text-gray-900">
                <ShieldCheck className="h-5 w-5 text-sky-500" />
                Validation
              </h3>
              <ValidationResults filePath={validationPath} />
            </section>
          )}

          {/* Summary Report */}
          {summaryPath && (
            <section>
              <h3 className="mb-3 flex items-center gap-2 text-lg font-medium text-gray-900">
                <FileText className="h-5 w-5 text-sky-500" />
                Executive Summary
              </h3>
              <div className="rounded-lg border border-gray-200 bg-white p-6">
                <SummaryReport filePath={summaryPath} />
              </div>
            </section>
          )}

          {/* Step Timeline */}
          <section>
            <h3 className="mb-3 text-lg font-medium text-gray-900">
              Pipeline steps
            </h3>
            <StepTimeline trajectory={trajectory} />
          </section>

          {/* All files */}
          <AllFiles trajectory={trajectory} />
        </div>
      )}
    </div>
  );
}
