"use client";

import { useEffect, useState } from "react";
import { Loader2, Copy, Check, Download } from "lucide-react";

export function CroissantViewer({ filePath }: { filePath: string }) {
  const [json, setJson] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    fetch(`/api/file?path=${encodeURIComponent(filePath)}`)
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to load file");
        const text = await res.text();
        // Pretty-print if it's valid JSON
        try {
          return JSON.stringify(JSON.parse(text), null, 2);
        } catch {
          return text;
        }
      })
      .then(setJson)
      .catch((err) => setError(err.message));
  }, [filePath]);

  if (error) {
    return <p className="text-sm text-red-600">{error}</p>;
  }

  if (json === null) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-400">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading Croissant JSON-LD...
      </div>
    );
  }

  const lines = json.split("\n");
  const previewLines = 30;
  const isLong = lines.length > previewLines;
  const display = expanded ? json : lines.slice(0, previewLines).join("\n");

  async function copyToClipboard() {
    if (!json) return;
    await navigator.clipboard.writeText(json);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <button
          onClick={copyToClipboard}
          className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50"
        >
          {copied ? (
            <Check className="h-3.5 w-3.5 text-green-500" />
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )}
          {copied ? "Copied" : "Copy"}
        </button>
        <a
          href={`/api/file?path=${encodeURIComponent(filePath)}`}
          download="croissant.json"
          className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50"
        >
          <Download className="h-3.5 w-3.5" />
          Download
        </a>
      </div>

      <div className="relative overflow-hidden rounded-lg border border-gray-200 bg-gray-900">
        <pre className="overflow-x-auto p-4 text-xs leading-relaxed text-gray-300">
          <code>{display}</code>
        </pre>
        {isLong && !expanded && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-gray-900 to-transparent pt-12 pb-3 text-center">
            <button
              onClick={() => setExpanded(true)}
              className="rounded-full bg-gray-700 px-3 py-1 text-xs text-gray-300 hover:bg-gray-600"
            >
              Show all {lines.length} lines
            </button>
          </div>
        )}
        {isLong && expanded && (
          <div className="border-t border-gray-700 py-2 text-center">
            <button
              onClick={() => setExpanded(false)}
              className="text-xs text-gray-400 hover:text-gray-300"
            >
              Collapse
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
