"use client";

import { useState } from "react";
import { Copy, Check, Download, Eye, Code } from "lucide-react";
import { RUNBOOK_CONTENT } from "@/lib/runbook-content.generated";
import { RunbookFlowchart } from "@/components/RunbookFlowchart";

export function RunbookContent() {
  const [copied, setCopied] = useState(false);
  const [view, setView] = useState<"flowchart" | "markdown">("flowchart");

  async function copyToClipboard() {
    await navigator.clipboard.writeText(RUNBOOK_CONTENT);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function downloadFile() {
    const blob = new Blob([RUNBOOK_CONTENT], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "RUNBOOK.md";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <div className="flex items-center gap-2">
        <button
          onClick={copyToClipboard}
          className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
        >
          {copied ? (
            <Check className="h-4 w-4 text-green-500" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
          {copied ? "Copied!" : "Copy to clipboard"}
        </button>
        <button
          onClick={downloadFile}
          className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
        >
          <Download className="h-4 w-4" />
          Download .md
        </button>
        <div className="ml-auto flex items-center rounded-lg border border-gray-200 bg-white">
          <button
            onClick={() => setView("flowchart")}
            className={`inline-flex items-center gap-1.5 rounded-l-lg px-3 py-2 text-sm font-medium transition-colors ${
              view === "flowchart"
                ? "bg-gray-100 text-gray-900"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Eye className="h-3.5 w-3.5" />
            Preview
          </button>
          <button
            onClick={() => setView("markdown")}
            className={`inline-flex items-center gap-1.5 rounded-r-lg px-3 py-2 text-sm font-medium transition-colors ${
              view === "markdown"
                ? "bg-gray-100 text-gray-900"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Code className="h-3.5 w-3.5" />
            Markdown
          </button>
        </div>
      </div>

      {/* Content */}
      {view === "flowchart" ? (
        <div className="rounded-xl border border-gray-200 bg-white p-6 sm:p-8">
          <RunbookFlowchart />
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-gray-900">
          <pre className="whitespace-pre-wrap break-words p-6 text-sm leading-relaxed text-gray-300">
            <code>{RUNBOOK_CONTENT}</code>
          </pre>
        </div>
      )}
    </div>
  );
}
