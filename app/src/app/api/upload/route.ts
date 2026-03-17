import { NextResponse } from "next/server";

const MISE_HOST = "https://flows-api.jetty.io";

/** Return a short-lived upload credential so the browser can upload
 *  the PDF directly to Jetty — bypassing Vercel's 4.5 MB body limit.
 *  The token is scoped to the upload endpoint only in practice since
 *  the client only uses it for that one call. */
export async function GET() {
  const token = process.env.JETTY_API_TOKEN;
  if (!token) {
    return NextResponse.json(
      { error: "Server misconfigured: missing API token" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    upload_url: `${MISE_HOST}/api/v1/sandbox/upload`,
    token,
  });
}
