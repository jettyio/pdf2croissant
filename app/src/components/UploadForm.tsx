"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Upload, FileText, Loader2, X } from "lucide-react";

export function UploadForm() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [datasetName, setDatasetName] = useState("");
  const [huggingfaceUrl, setHuggingfaceUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      const form = new FormData();
      form.append("pdf", file);
      if (datasetName.trim()) form.append("dataset_name", datasetName.trim());
      if (huggingfaceUrl.trim())
        form.append("huggingface_url", huggingfaceUrl.trim());

      const res = await fetch("/api/run", { method: "POST", body: form });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? `Request failed: ${res.status}`);
      }

      const data = await res.json();
      router.push(`/run/${data.trajectory_id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setLoading(false);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped?.type === "application/pdf") {
      setFile(dropped);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Drop zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`flex cursor-pointer flex-col items-center gap-3 rounded-xl border-2 border-dashed p-8 transition-colors ${
          dragOver
            ? "border-sky-400 bg-sky-50"
            : file
              ? "border-green-300 bg-green-50"
              : "border-gray-300 bg-white hover:border-gray-400"
        }`}
      >
        {file ? (
          <>
            <FileText className="h-8 w-8 text-green-500" />
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">
                {file.name}
              </span>
              <span className="text-xs text-gray-400">
                ({(file.size / 1024 / 1024).toFixed(1)} MB)
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setFile(null);
                }}
                className="rounded-full p-0.5 text-gray-400 hover:bg-gray-200 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </>
        ) : (
          <>
            <Upload className="h-8 w-8 text-gray-400" />
            <div className="text-center">
              <p className="text-sm font-medium text-gray-700">
                Drop a PDF here or click to browse
              </p>
              <p className="text-xs text-gray-400">
                Academic paper describing an ML dataset
              </p>
            </div>
          </>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) setFile(f);
          }}
        />
      </div>

      {/* Optional fields */}
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500">
            Dataset name (optional)
          </label>
          <input
            type="text"
            placeholder="e.g., GSM8K"
            value={datasetName}
            onChange={(e) => setDatasetName(e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 placeholder:text-gray-400 focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-400"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500">
            HuggingFace URL (optional)
          </label>
          <input
            type="url"
            placeholder="https://huggingface.co/datasets/..."
            value={huggingfaceUrl}
            onChange={(e) => setHuggingfaceUrl(e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 placeholder:text-gray-400 focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-400"
          />
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={!file || loading}
        className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-sky-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Launching...
          </>
        ) : (
          <>
            <Upload className="h-4 w-4" />
            Generate Croissant
          </>
        )}
      </button>
    </form>
  );
}
