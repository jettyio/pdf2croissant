import { NextRequest, NextResponse } from "next/server";
import { launchRun } from "@/lib/jetty";

export const runtime = "edge";

/** Accept a small JSON body with file_paths (from the client-side upload)
 *  and launch the Jetty workflow. The PDF itself is uploaded directly from
 *  the browser to Jetty, bypassing Vercel's 4.5 MB body size limit. */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const filePaths: string[] = body.file_paths;
    const pdfFilename: string = body.pdf_filename;
    if (!filePaths?.length || !pdfFilename) {
      return NextResponse.json(
        { error: "file_paths and pdf_filename are required" },
        { status: 400 }
      );
    }

    const run = await launchRun({
      filePaths,
      pdfFilename,
      datasetName: body.dataset_name || undefined,
      huggingfaceUrl: body.huggingface_url || undefined,
    });

    return NextResponse.json(run);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("POST /api/run error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
