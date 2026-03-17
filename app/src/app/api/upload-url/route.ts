import { NextRequest, NextResponse } from "next/server";
import { requestPresignedUrl } from "@/lib/jetty";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  try {
    const { filename, content_type } = await req.json();

    if (!filename || !content_type) {
      return NextResponse.json(
        { error: "filename and content_type are required" },
        { status: 400 }
      );
    }

    const result = await requestPresignedUrl(filename, content_type);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("POST /api/upload-url error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
