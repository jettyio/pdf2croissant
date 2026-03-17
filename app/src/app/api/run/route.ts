import { NextRequest, NextResponse } from "next/server";
import { uploadFile, launchRun } from "@/lib/jetty";

// Use Edge Runtime to support large file uploads (up to ~100 MB)
export const runtime = "edge";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    // Prefer presigned storage_path (new flow) over file upload (legacy flow)
    const storagePath = formData.get("storage_path") as string | null;
    const file = formData.get("file") as File | null;

    let filePaths: string[];
    let pdfFilename: string;

    if (storagePath) {
      // New flow: file was already uploaded via presigned URL
      filePaths = [storagePath];
      pdfFilename =
        (formData.get("pdf_filename") as string) || storagePath.split("/").pop() || "document.pdf";
    } else if (file) {
      // Legacy flow: upload file through the server
      const pdf = await file.arrayBuffer();
      pdfFilename = file.name;
      filePaths = await uploadFile(pdf, pdfFilename);
    } else {
      return NextResponse.json(
        { error: "Either storage_path or a PDF file is required" },
        { status: 400 }
      );
    }

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
