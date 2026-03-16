import { UploadForm } from "@/components/UploadForm";
import { RunHistory } from "@/components/RunHistory";
import {
  FileJson2,
  ShieldCheck,
  FileText,
  Zap,
} from "lucide-react";

export default function Home() {
  return (
    <div className="space-y-12">
      {/* Hero */}
      <section>
        <h1 className="mb-2 text-3xl font-bold text-gray-900">
          Turn any paper into a Croissant file
        </h1>
        <p className="mb-8 max-w-2xl text-base leading-relaxed text-gray-500">
          Upload an academic paper that introduces an ML dataset. An AI agent
          reads the PDF, extracts every piece of dataset metadata it can find,
          and produces a validated{" "}
          <a
            href="https://mlcommons.org/croissant/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sky-600 underline decoration-sky-200 underline-offset-2 hover:decoration-sky-400"
          >
            MLCommons Croissant
          </a>{" "}
          JSON-LD file — the emerging standard for machine-readable dataset
          metadata.
        </p>

        {/* How it works */}
        <div className="mb-8 grid gap-4 sm:grid-cols-4">
          <StepCard
            icon={<FileText className="h-5 w-5 text-sky-500" />}
            title="Upload PDF"
            description="Drop an academic paper describing a dataset"
          />
          <StepCard
            icon={<Zap className="h-5 w-5 text-amber-500" />}
            title="AI reads it"
            description="Agent extracts names, splits, fields, license, and more"
          />
          <StepCard
            icon={<ShieldCheck className="h-5 w-5 text-emerald-500" />}
            title="Validates"
            description="Checks against the Croissant schema with mlcroissant"
          />
          <StepCard
            icon={<FileJson2 className="h-5 w-5 text-violet-500" />}
            title="Download JSON-LD"
            description="Get a ready-to-use Croissant metadata file"
          />
        </div>

        <UploadForm />
      </section>

      {/* Recent runs */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          Recent runs
        </h2>
        <RunHistory />
      </section>
    </div>
  );
}

function StepCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white px-4 py-3">
      <div className="mb-1.5 flex items-center gap-2">
        {icon}
        <span className="text-sm font-semibold text-gray-800">{title}</span>
      </div>
      <p className="text-xs leading-relaxed text-gray-500">{description}</p>
    </div>
  );
}
