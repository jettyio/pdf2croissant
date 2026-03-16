"use client";

import { useEffect, useState } from "react";
import { Loader2, CheckCircle2, XCircle, ChevronDown, ChevronRight } from "lucide-react";
import type { ValidationReport } from "@/lib/types";

export function ValidationResults({ filePath }: { filePath: string }) {
  const [report, setReport] = useState<ValidationReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expandedStage, setExpandedStage] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/file?path=${encodeURIComponent(filePath)}`)
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to load validation report");
        return res.json();
      })
      .then(setReport)
      .catch((err) => setError(err.message));
  }, [filePath]);

  if (error) {
    return <p className="text-sm text-red-600">{error}</p>;
  }

  if (!report) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-400">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading validation results...
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Overall status */}
      <div
        className={`rounded-lg border px-4 py-3 ${
          report.overall_passed
            ? "border-green-200 bg-green-50"
            : "border-red-200 bg-red-50"
        }`}
      >
        <div className="flex items-center gap-2">
          {report.overall_passed ? (
            <CheckCircle2 className="h-5 w-5 text-green-600" />
          ) : (
            <XCircle className="h-5 w-5 text-red-600" />
          )}
          <span
            className={`font-medium ${report.overall_passed ? "text-green-700" : "text-red-700"}`}
          >
            {report.overall_passed
              ? "All validations passed"
              : "Validation failed"}
          </span>
          {report.iterations > 1 && (
            <span className="text-sm text-gray-500">
              ({report.iterations} iterations)
            </span>
          )}
        </div>
      </div>

      {/* Per-stage cards */}
      {report.stages.map((stage) => {
        const isExpanded = expandedStage === stage.name;
        const hasDetails = !!stage.details;

        return (
          <div
            key={stage.name}
            className="rounded-lg border border-gray-200 bg-white"
          >
            <button
              onClick={() =>
                hasDetails &&
                setExpandedStage(isExpanded ? null : stage.name)
              }
              className={`flex w-full items-center gap-3 px-4 py-3 text-left ${hasDetails ? "cursor-pointer hover:bg-gray-50" : ""}`}
            >
              {stage.passed ? (
                <CheckCircle2 className="h-4 w-4 shrink-0 text-green-500" />
              ) : (
                <XCircle className="h-4 w-4 shrink-0 text-red-500" />
              )}
              <span className="flex-1 text-sm font-medium text-gray-700">
                {stage.name.replace(/_/g, " ")}
              </span>
              <span className="text-xs text-gray-400">{stage.message}</span>
              {hasDetails &&
                (isExpanded ? (
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                ))}
            </button>
            {isExpanded && stage.details && (
              <div className="border-t border-gray-100 px-4 py-3">
                <pre className="overflow-x-auto whitespace-pre-wrap text-xs text-red-600">
                  {stage.details}
                </pre>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
