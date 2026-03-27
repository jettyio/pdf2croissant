export const metadata = {
  title: "Visual Runbook — PDF to Croissant",
  description:
    "Visual diagram of the 8-step agent pipeline for generating MLCommons Croissant metadata from academic papers",
};

export default function VisualRunbookPage() {
  return (
    <div className="-mx-6 -my-8">
      <iframe
        src="/runbook-visual.html"
        className="h-[calc(100vh-73px)] w-full border-0"
        title="Visual Runbook Diagram"
      />
    </div>
  );
}
