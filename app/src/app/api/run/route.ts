import { NextRequest, NextResponse } from "next/server";
import { uploadFile, launchRun } from "@/lib/jetty";

// Allow up to 10 minutes for upload + launch
export const maxDuration = 600;

const MAX_FILE_SIZE_MB = 15;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

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

    if (file.size > MAX_FILE_SIZE_BYTES) {
      const sizeMB = (file.size / 1024 / 1024).toFixed(1);
      return NextResponse.json(
        {
          error: `File is ${sizeMB} MB — maximum allowed is ${MAX_FILE_SIZE_MB} MB`,
        },
        { status: 413 }
      );
    }

    const datasetName = (formData.get("dataset_name") as string) || undefined;
    const huggingfaceUrl =
      (formData.get("huggingface_url") as string) || undefined;

    // Step 1: Upload the PDF via /api/v1/sandbox/upload
    const pdf = await file.arrayBuffer();
    const filePaths = await uploadFile(pdf, file.name);

    // Step 2: Launch via /v1/chat/completions with jetty.runbook=true
    const run = await launchRun({
      filePaths,
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
