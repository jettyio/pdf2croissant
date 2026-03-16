import { NextRequest, NextResponse } from "next/server";
import { downloadFile } from "@/lib/jetty";

export async function GET(req: NextRequest) {
  const path = req.nextUrl.searchParams.get("path");
  if (!path) {
    return NextResponse.json({ error: "path is required" }, { status: 400 });
  }

  try {
    const upstream = await downloadFile(path);
    const contentType =
      upstream.headers.get("content-type") ?? "application/octet-stream";
    const body = upstream.body;

    const responseHeaders: Record<string, string> = {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=3600, immutable",
    };

    const fileName = path.split("/").pop() ?? "file";
    if (/\.(json|zip)$/i.test(fileName)) {
      responseHeaders["Content-Disposition"] =
        `attachment; filename="${fileName}"`;
    }

    return new NextResponse(body, { headers: responseHeaders });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
