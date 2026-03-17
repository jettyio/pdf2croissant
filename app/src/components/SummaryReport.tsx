"use client";

import { useEffect, useState } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { Loader2 } from "lucide-react";
import type { ReactNode } from "react";

const markdownComponents: Components = {
  h1: ({ children }: { children?: ReactNode }) => (
    <h1 className="mb-4 border-b border-gray-200 pb-2 text-xl font-bold text-gray-900">
      {children}
    </h1>
  ),
  h2: ({ children }: { children?: ReactNode }) => (
    <h2 className="mb-3 mt-8 flex items-center gap-2 text-base font-semibold text-gray-800 first:mt-0">
      <span className="inline-block h-4 w-1 rounded-full bg-sky-500" />
      {children}
    </h2>
  ),
  h3: ({ children }: { children?: ReactNode }) => (
    <h3 className="mb-2 mt-5 text-sm font-semibold uppercase tracking-wide text-gray-500">
      {children}
    </h3>
  ),
  table: ({ children }: { children?: ReactNode }) => (
    <div className="my-4 overflow-hidden rounded-lg border border-gray-200">
      <table className="w-full text-sm">{children}</table>
    </div>
  ),
  thead: ({ children }: { children?: ReactNode }) => (
    <thead className="bg-gray-50 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
      {children}
    </thead>
  ),
  th: ({ children }: { children?: ReactNode }) => (
    <th className="px-4 py-2.5 font-medium">{children}</th>
  ),
  td: ({ children }: { children?: ReactNode }) => (
    <td className="border-t border-gray-100 px-4 py-2.5 text-gray-600">
      {children}
    </td>
  ),
  tr: ({ children }: { children?: ReactNode }) => (
    <tr className="transition-colors hover:bg-gray-50/50">{children}</tr>
  ),
  ul: ({ children }: { children?: ReactNode }) => (
    <ul className="my-3 space-y-1.5 text-sm text-gray-600">{children}</ul>
  ),
  ol: ({ children }: { children?: ReactNode }) => (
    <ol className="my-3 space-y-1.5 text-sm text-gray-600 list-decimal pl-5">
      {children}
    </ol>
  ),
  li: ({ children }: { children?: ReactNode }) => (
    <li className="flex gap-2 leading-relaxed">
      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-sky-400" />
      <span>{children}</span>
    </li>
  ),
  p: ({ children }: { children?: ReactNode }) => (
    <p className="my-2 text-sm leading-relaxed text-gray-600">{children}</p>
  ),
  strong: ({ children }: { children?: ReactNode }) => (
    <strong className="font-semibold text-gray-800">{children}</strong>
  ),
  code: ({ children }: { children?: ReactNode }) => (
    <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs font-medium text-gray-700">
      {children}
    </code>
  ),
  blockquote: ({ children }: { children?: ReactNode }) => (
    <blockquote className="my-4 border-l-3 border-sky-300 bg-sky-50/50 py-2 pl-4 text-sm text-gray-600 italic">
      {children}
    </blockquote>
  ),
  hr: () => <hr className="my-6 border-gray-200" />,
};

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
    <div className="max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={markdownComponents}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  );
}
