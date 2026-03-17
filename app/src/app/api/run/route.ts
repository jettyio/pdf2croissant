import { NextRequest, NextResponse } from "next/server";
import { uploadFile, launchRun } from "@/lib/jetty";

// Use Edge Runtime to support large file uploads (up to ~100 MB)
export const runtime = "edge";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "A PDF file is required" },
        { status: 400 }
      );
    }

    const pdf = await file.arrayBuffer();
    const pdfFilename = file.name;

    // Upload the PDF to Jetty
    const filePaths = await uploadFile(pdf, pdfFilename);

    // Launch the workflow
    const run = await launchRun({
      filePaths,
      pdfFilename,
      datasetName: (formData.get("dataset_name") as string) || undefined,
      huggingfaceUrl: (formData.get("huggingface_url") as string) || undefined,
      model: (formData.get("model") as string) || undefined,
    });

    return NextResponse.json(run);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("POST /api/run error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
