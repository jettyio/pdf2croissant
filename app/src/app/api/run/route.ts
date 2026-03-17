import { NextRequest, NextResponse } from "next/server";
import { del } from "@vercel/blob";
import { uploadFile, launchRun } from "@/lib/jetty";

// Allow up to 10 minutes for blob fetch + Jetty upload + launch
export const maxDuration = 600;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const blobUrl: string | undefined = body.blob_url;
    const pdfFilename: string | undefined = body.pdf_filename;

    if (!blobUrl || !pdfFilename) {
      return NextResponse.json(
        { error: "blob_url and pdf_filename are required" },
        { status: 400 }
      );
    }

    // Step 1: Fetch the PDF from Vercel Blob (no size limit server-side)
    const blobRes = await fetch(blobUrl);
    if (!blobRes.ok) {
      return NextResponse.json(
        { error: `Failed to fetch blob: ${blobRes.status}` },
        { status: 500 }
      );
    }
    const pdf = await blobRes.arrayBuffer();

    // Step 2: Upload the PDF to Jetty
    const filePaths = await uploadFile(pdf, pdfFilename);

    // Step 3: Clean up the blob (fire-and-forget)
    del(blobUrl).catch(() => {});

    // Step 4: Launch the workflow
    const run = await launchRun({
      filePaths,
      pdfFilename,
      datasetName: body.dataset_name || undefined,
      huggingfaceUrl: body.huggingface_url || undefined,
      model: body.model || undefined,
    });

    return NextResponse.json(run);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("POST /api/run error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
