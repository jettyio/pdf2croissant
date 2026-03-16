import { RunbookContent } from "@/components/RunbookContent";

export default function RunbookPage() {
  return (
    <div className="space-y-8">
      <section>
        <h1 className="mb-2 text-2xl font-bold text-gray-900">Runbook</h1>
        <p className="mb-6 max-w-2xl text-sm leading-relaxed text-gray-500">
          This is the full set of instructions the AI agent follows when
          generating a Croissant file. You can copy it and use it directly with
          your own agent (Claude Code, Codex, Gemini CLI, etc.) and your own
          PDF — no web app needed.
        </p>

        <div className="mb-6 rounded-xl border border-sky-100 bg-sky-50 px-5 py-4">
          <h3 className="mb-2 text-sm font-semibold text-sky-800">
            Use it locally
          </h3>
          <div className="space-y-2 text-sm text-sky-700">
            <p>
              1. Copy the runbook below (or download it)
            </p>
            <p>
              2. Save it as <code className="rounded bg-sky-100 px-1.5 py-0.5 text-xs font-mono">RUNBOOK.md</code>
            </p>
            <p>
              3. Place your PDF in the same directory
            </p>
            <p>
              4. Run your agent with the runbook as the system prompt:
            </p>
            <pre className="mt-1 overflow-x-auto rounded-lg bg-sky-900 px-4 py-3 text-xs text-sky-100">
{`claude --system-prompt RUNBOOK.md \\
  "Generate a Croissant file for the dataset in paper.pdf"`}
            </pre>
            <p className="text-xs text-sky-600">
              Replace <code className="rounded bg-sky-100 px-1 py-0.5 font-mono">{"{{pdf_filename}}"}</code> with
              your actual filename and fill in the optional template variables.
            </p>
          </div>
        </div>

        <RunbookContent />
      </section>
    </div>
  );
}
