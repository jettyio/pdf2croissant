"use client";

import {
  FileText,
  BookOpen,
  Globe,
  Braces,
  CheckCircle2,
  RefreshCw,
  ClipboardList,
  FileBarChart,
  ShieldCheck,
  ArrowDown,
  ArrowRight,
  CornerDownLeft,
} from "lucide-react";

interface Step {
  number: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  outputs?: string[];
  color: string;
  phase: "setup" | "extract" | "build" | "validate" | "report";
}

const steps: Step[] = [
  {
    number: 1,
    title: "Environment Setup",
    description: "Install mlcroissant, create output dirs, verify PDF exists",
    icon: <FileText className="h-5 w-5" />,
    color: "slate",
    phase: "setup",
  },
  {
    number: 2,
    title: "Read & Analyze Paper",
    description:
      "Extract dataset identity, creators, structure, characteristics, and RAI metadata",
    icon: <BookOpen className="h-5 w-5" />,
    phase: "extract",
    color: "sky",
  },
  {
    number: 3,
    title: "Cross-Reference HF",
    description:
      "If HuggingFace URL provided, confirm splits, formats, license (paper is primary source)",
    icon: <Globe className="h-5 w-5" />,
    phase: "extract",
    color: "sky",
  },
  {
    number: 4,
    title: "Build Croissant JSON-LD",
    description:
      "Construct @context, distribution, recordSets, RAI fields per Croissant 1.0 spec",
    icon: <Braces className="h-5 w-5" />,
    outputs: ["croissant.json"],
    phase: "build",
    color: "violet",
  },
  {
    number: 5,
    title: "Evaluate Outputs",
    description:
      "Validate JSON syntax, Croissant schema, and record set inspection",
    icon: <CheckCircle2 className="h-5 w-5" />,
    phase: "validate",
    color: "amber",
  },
  {
    number: 6,
    title: "Iterate on Errors",
    description:
      "Fix validation failures using common-fixes table, re-validate (max 3 rounds)",
    icon: <RefreshCw className="h-5 w-5" />,
    phase: "validate",
    color: "amber",
  },
  {
    number: 7,
    title: "Write Executive Summary",
    description:
      "Document extracted fields, inferences, gaps, validation results, and recommendations",
    icon: <ClipboardList className="h-5 w-5" />,
    outputs: ["summary.md"],
    phase: "report",
    color: "emerald",
  },
  {
    number: 8,
    title: "Write Validation Report",
    description:
      "Structured JSON with stages, pass/fail counts, and output file manifest",
    icon: <FileBarChart className="h-5 w-5" />,
    outputs: ["validation_report.json"],
    phase: "report",
    color: "emerald",
  },
  {
    number: 9,
    title: "Final Checklist",
    description:
      "Run verification script, confirm all 3 output files exist and are valid",
    icon: <ShieldCheck className="h-5 w-5" />,
    phase: "report",
    color: "emerald",
  },
];

const phaseLabels: Record<string, { label: string; color: string }> = {
  setup: { label: "Setup", color: "slate" },
  extract: { label: "Extraction", color: "sky" },
  build: { label: "Generation", color: "violet" },
  validate: { label: "Validation Loop", color: "amber" },
  report: { label: "Reporting", color: "emerald" },
};

const colorMap: Record<
  string,
  {
    bg: string;
    border: string;
    icon: string;
    text: string;
    badge: string;
    ring: string;
  }
> = {
  slate: {
    bg: "bg-slate-50",
    border: "border-slate-200",
    icon: "text-slate-600",
    text: "text-slate-700",
    badge: "bg-slate-100 text-slate-600",
    ring: "ring-slate-200",
  },
  sky: {
    bg: "bg-sky-50",
    border: "border-sky-200",
    icon: "text-sky-600",
    text: "text-sky-700",
    badge: "bg-sky-100 text-sky-600",
    ring: "ring-sky-200",
  },
  violet: {
    bg: "bg-violet-50",
    border: "border-violet-200",
    icon: "text-violet-600",
    text: "text-violet-700",
    badge: "bg-violet-100 text-violet-600",
    ring: "ring-violet-200",
  },
  amber: {
    bg: "bg-amber-50",
    border: "border-amber-200",
    icon: "text-amber-600",
    text: "text-amber-700",
    badge: "bg-amber-100 text-amber-600",
    ring: "ring-amber-200",
  },
  emerald: {
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    icon: "text-emerald-600",
    text: "text-emerald-700",
    badge: "bg-emerald-100 text-emerald-600",
    ring: "ring-emerald-200",
  },
};

function StepCard({ step }: { step: Step }) {
  const c = colorMap[step.color];
  return (
    <div
      className={`relative rounded-xl border ${c.border} ${c.bg} p-4 transition-shadow hover:shadow-md`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${c.badge}`}
        >
          {step.icon}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-bold uppercase tracking-wide ${c.icon}`}
            >
              Step {step.number}
            </span>
          </div>
          <h3 className={`mt-0.5 text-sm font-semibold ${c.text}`}>
            {step.title}
          </h3>
          <p className="mt-1 text-xs leading-relaxed text-gray-500">
            {step.description}
          </p>
          {step.outputs && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {step.outputs.map((o) => (
                <span
                  key={o}
                  className="inline-flex items-center rounded-md bg-white px-2 py-0.5 text-[11px] font-mono font-medium text-gray-600 ring-1 ring-inset ring-gray-200"
                >
                  {o}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Connector({ loop }: { loop?: boolean }) {
  if (loop) {
    return (
      <div className="flex items-center justify-center gap-1 py-1 text-amber-400">
        <CornerDownLeft className="h-4 w-4" />
        <span className="text-[10px] font-medium uppercase tracking-wider text-amber-500">
          retry up to 3x
        </span>
      </div>
    );
  }
  return (
    <div className="flex justify-center py-1">
      <ArrowDown className="h-4 w-4 text-gray-300" />
    </div>
  );
}

export function RunbookFlowchart() {
  // Group steps by phase
  const phases = Object.entries(phaseLabels);

  return (
    <div className="space-y-6">
      {/* Legend */}
      <div className="flex flex-wrap items-center gap-3">
        {phases.map(([key, { label, color }]) => {
          const c = colorMap[color];
          return (
            <span
              key={key}
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${c.badge}`}
            >
              <span
                className={`h-2 w-2 rounded-full bg-current ${c.icon}`}
              />
              {label}
            </span>
          );
        })}
      </div>

      {/* Parameters */}
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-400">
          Inputs
        </h3>
        <div className="flex flex-wrap gap-2">
          {[
            { name: "pdf_filename", required: true },
            { name: "results_dir", required: false },
            { name: "huggingface_url", required: false },
            { name: "dataset_name", required: false },
          ].map((p) => (
            <span
              key={p.name}
              className={`inline-flex items-center rounded-lg px-2.5 py-1 font-mono text-xs ${
                p.required
                  ? "bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-200"
                  : "bg-gray-50 text-gray-500 ring-1 ring-inset ring-gray-200"
              }`}
            >
              {`{{${p.name}}}`}
              {p.required && (
                <span className="ml-1 text-[10px] font-sans font-medium text-rose-400">
                  required
                </span>
              )}
            </span>
          ))}
        </div>
      </div>

      <ArrowDown className="mx-auto h-4 w-4 text-gray-300" />

      {/* Flow */}
      <div className="space-y-0">
        {steps.map((step, i) => (
          <div key={step.number}>
            <StepCard step={step} />
            {i < steps.length - 1 && (
              <Connector loop={step.number === 6} />
            )}
          </div>
        ))}
      </div>

      <ArrowDown className="mx-auto h-4 w-4 text-gray-300" />

      {/* Outputs */}
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
        <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-emerald-500">
          Required Outputs
        </h3>
        <div className="flex flex-wrap gap-2">
          {["croissant.json", "summary.md", "validation_report.json"].map(
            (f) => (
              <span
                key={f}
                className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 font-mono text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-200"
              >
                <FileText className="h-3.5 w-3.5" />
                {f}
              </span>
            )
          )}
        </div>
      </div>

      {/* Validation loop callout */}
      <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
        <div className="flex items-start gap-2">
          <RefreshCw className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
          <div>
            <p className="text-xs font-semibold text-amber-800">
              Validation Loop
            </p>
            <p className="mt-0.5 text-xs text-amber-600">
              Steps 4{"\u2013"}6 form an iteration loop. If schema validation fails,
              the agent applies fixes from the common-fixes table and
              re-validates — up to 3 rounds before keeping the best result.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
