import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

const MISE_HOST = "https://flows-api.jetty.io";

/** Proxy the multipart upload directly to Jetty without buffering.
 *  Edge functions stream the request body, bypassing Vercel's 4.5 MB
 *  serverless body size limit. The API token stays server-side. */
export async function POST(req: NextRequest) {
  const token = process.env.JETTY_API_TOKEN;
  if (!token) {
    return NextResponse.json(
      { error: "Server misconfigured: missing API token" },
      { status: 500 }
    );
  }

  const contentType = req.headers.get("content-type") ?? "";

  const upstream = await fetch(`${MISE_HOST}/api/v1/sandbox/upload`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": contentType,
    },
    body: req.body,
    // @ts-expect-error -- duplex required for streaming request bodies
    duplex: "half",
  });

  if (!upstream.ok) {
    const text = await upstream.text();
    return NextResponse.json(
      { error: `Upload failed: ${upstream.status} ${text}` },
      { status: upstream.status }
    );
  }

  const data = await upstream.json();
  return NextResponse.json(data);
}
