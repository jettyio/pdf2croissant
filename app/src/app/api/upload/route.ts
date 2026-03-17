import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextRequest, NextResponse } from "next/server";

/** Vercel Blob client-upload token exchange.
 *  The browser uploads the PDF directly to Vercel Blob (no 4.5 MB limit),
 *  then /api/run reads the blob to forward to Jetty. */
export async function POST(req: NextRequest) {
  const body = (await req.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request: req,
      onBeforeGenerateToken: async () => ({
        allowedContentTypes: ["application/pdf"],
        maximumSizeInBytes: 15 * 1024 * 1024, // 15 MB
      }),
      onUploadCompleted: async () => {
        // Nothing to do — /api/run will process the blob
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
