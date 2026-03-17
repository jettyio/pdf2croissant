"use client";

import { useState, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Upload, FileText, Loader2, X, AlertCircle, CheckCircle2 } from "lucide-react";
import Link from "next/link";

const MAX_FILE_SIZE_MB = 15;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export function UploadForm() {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [datasetName, setDatasetName] = useState("");
  const [huggingfaceUrl, setHuggingfaceUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [success, setSuccess] = useState<{ id: string; name: string } | null>(
    null
  );

  function validateFile(f: File): string | null {
    if (f.size > MAX_FILE_SIZE_BYTES) {
      const sizeMB = (f.size / 1024 / 1024).toFixed(1);
      return `File is ${sizeMB} MB — maximum allowed is ${MAX_FILE_SIZE_MB} MB`;
    }
    if (f.type !== "application/pdf" && !f.name.toLowerCase().endsWith(".pdf")) {
      return "Only PDF files are supported";
    }
    return null;
  }

  function selectFile(f: File) {
    const validationError = validateFile(f);
    if (validationError) {
      setError(validationError);
      setFile(null);
      return;
    }
    setError(null);
    setSuccess(null);
    setFile(f);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;

    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const form = new FormData();
      form.append("pdf", file);
      if (datasetName.trim()) form.append("dataset_name", datasetName.trim());
      if (huggingfaceUrl.trim())
        form.append("huggingface_url", huggingfaceUrl.trim());

      const res = await fetch("/api/run", { method: "POST", body: form });
      if (!res.ok) {
        if (res.status === 413) {
          throw new Error(
            `File too large for upload — maximum is ${MAX_FILE_SIZE_MB} MB`
          );
        }
        let message = `Request failed: ${res.status}`;
        try {
          const data = await res.json();
          if (data.error) message = data.error;
        } catch {
          // Response wasn't JSON — use the status-based message
        }
        throw new Error(message);
      }

      const data = await res.json();

      // Reset form and show success inline
      const fileName = file.name;
      setFile(null);
      setDatasetName("");
      setHuggingfaceUrl("");
      setSuccess({ id: data.trajectory_id, name: fileName });
      if (fileInputRef.current) fileInputRef.current.value = "";

      // Refresh the run history table
      queryClient.invalidateQueries({ queryKey: ["trajectories"] });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) selectFile(dropped);
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
                  setError(null);
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
                Academic paper describing an ML dataset (max {MAX_FILE_SIZE_MB}{" "}
                MB)
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
            if (f) selectFile(f);
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

      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {success && (
        <div className="flex items-start gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
          <p className="text-sm text-green-700">
            <strong>{success.name}</strong> submitted.{" "}
            <Link
              href={`/run/${success.id}`}
              className="font-medium text-green-800 underline underline-offset-2 hover:text-green-900"
            >
              View run
            </Link>
          </p>
        </div>
      )}

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
