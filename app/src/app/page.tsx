import { UploadForm } from "@/components/UploadForm";
import { RunHistory } from "@/components/RunHistory";

export default function Home() {
  return (
    <div className="space-y-10">
      <section>
        <h1 className="mb-1 text-2xl font-bold text-gray-900">
          PDF to Croissant
        </h1>
        <p className="mb-6 text-sm text-gray-500">
          Upload an academic paper that describes an ML dataset. An AI agent
          will read it and produce a valid MLCommons Croissant JSON-LD metadata
          file.
        </p>
        <UploadForm />
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          Recent runs
        </h2>
        <RunHistory />
      </section>
    </div>
  );
}
