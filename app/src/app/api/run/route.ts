import { NextRequest, NextResponse } from "next/server";
import { uploadFile, launchRun } from "@/lib/jetty";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const file = formData.get("pdf") as File | null;
    if (!file) {
      return NextResponse.json(
        { error: "A PDF file is required" },
        { status: 400 }
      );
    }

    const datasetName = (formData.get("dataset_name") as string) || undefined;
    const huggingfaceUrl =
      (formData.get("huggingface_url") as string) || undefined;

    // Step 1: Upload the PDF
    const pdf = await file.arrayBuffer();
    const fileId = await uploadFile(pdf, file.name);

    // Step 2: Launch the run (JSON endpoint, reference file by ID)
    const run = await launchRun({
      fileId,
      pdfFilename: file.name,
      datasetName,
      huggingfaceUrl,
    });

    return NextResponse.json(run);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("POST /api/run error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
