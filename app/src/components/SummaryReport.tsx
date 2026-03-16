"use client";

import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Loader2 } from "lucide-react";

export function SummaryReport({ filePath }: { filePath: string }) {
  const [markdown, setMarkdown] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/file?path=${encodeURIComponent(filePath)}`)
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to load report");
        return res.text();
      })
      .then(setMarkdown)
      .catch((err) => setError(err.message));
  }, [filePath]);

  if (error) {
    return <p className="text-sm text-red-600">{error}</p>;
  }

  if (markdown === null) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-400">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading report...
      </div>
    );
  }

  return (
    <div className="prose max-w-none prose-headings:text-gray-900 prose-p:text-gray-600 prose-a:text-sky-600 prose-strong:text-gray-800 prose-code:text-gray-700 prose-th:text-gray-700 prose-td:text-gray-500">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
    </div>
  );
}
