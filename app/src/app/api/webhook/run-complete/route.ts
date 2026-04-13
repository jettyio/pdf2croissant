import { NextRequest, NextResponse } from "next/server";

const APP_URL = "https://mlcroissant.jetty.bot";

export async function POST(req: NextRequest) {
  try {
    const secret = process.env.WEBHOOK_SECRET;
    if (!secret) {
      console.error("WEBHOOK_SECRET is not configured");
      return NextResponse.json(
        { error: "Server misconfigured" },
        { status: 500 }
      );
    }

    // Read raw body for signature verification
    const rawBody = await req.text();
    const timestamp = req.headers.get("x-mise-timestamp") ?? "";
    const signature = req.headers.get("x-mise-signature") ?? "";

    // Verify HMAC-SHA256 signature
    const valid = await verifySignature(secret, timestamp, rawBody, signature);
    if (!valid) {
      console.warn("Webhook signature verification failed");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const payload = JSON.parse(rawBody);
    const trajectoryId: string = payload.trajectory_id ?? "";
    const status: string = payload.status ?? "";

    if (!trajectoryId) {
      return NextResponse.json(
        { error: "Missing trajectory_id" },
        { status: 400 }
      );
    }

    // Extract email from init_params.vars (set during launch)
    const email: string | undefined =
      payload.init_params?.vars?.email ??
      // Fallback: check labels
      (payload.labels as { key: string; value: string }[] | undefined)?.find(
        (l: { key: string; value: string }) => l.key === "email"
      )?.value;

    if (!email) {
      console.warn(
        `Webhook for ${trajectoryId}: no email found, skipping notification`
      );
      return NextResponse.json({ ok: true, skipped: "no email" });
    }

    // Extract a display name for the run
    const pdfFilename: string =
      payload.init_params?.vars?.pdf_filename ?? "your paper";
    const displayName = pdfFilename.replace(/\.pdf$/i, "");

    const runUrl = `${APP_URL}/run/${trajectoryId}`;
    const succeeded = status === "completed";

    await sendEmail({
      to: email,
      subject: succeeded
        ? `Your Croissant file is ready: ${displayName}`
        : `Croissant generation failed: ${displayName}`,
      runUrl,
      displayName,
      succeeded,
    });

    console.log(
      `Webhook: sent ${succeeded ? "success" : "failure"} email to ${email} for ${trajectoryId}`
    );

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Webhook handler error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// HMAC-SHA256 verification using Web Crypto API (Edge-compatible)
// ---------------------------------------------------------------------------

async function verifySignature(
  secret: string,
  timestamp: string,
  payload: string,
  signature: string
): Promise<boolean> {
  if (!timestamp || !signature) return false;

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signingString = `${timestamp}.${payload}`;
  const mac = await crypto.subtle.sign("HMAC", key, encoder.encode(signingString));
  const expected = bufferToHex(mac);

  // Constant-time comparison
  if (expected.length !== signature.length) return false;
  let mismatch = 0;
  for (let i = 0; i < expected.length; i++) {
    mismatch |= expected.charCodeAt(i) ^ signature.charCodeAt(i);
  }
  return mismatch === 0;
}

function bufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// ---------------------------------------------------------------------------
// SendGrid email via v3 REST API (no SDK needed — Edge-compatible)
// ---------------------------------------------------------------------------

async function sendEmail(params: {
  to: string;
  subject: string;
  runUrl: string;
  displayName: string;
  succeeded: boolean;
}) {
  const apiKey = process.env.SENDGRID_API_KEY;
  if (!apiKey) throw new Error("SENDGRID_API_KEY is not configured");

  const fromEmail =
    process.env.SENDGRID_FROM_EMAIL ?? "notifications@jetty.bot";
  const fromName = process.env.SENDGRID_FROM_NAME ?? "Croissant Generator";

  const html = params.succeeded
    ? successEmailHtml(params.displayName, params.runUrl)
    : failureEmailHtml(params.displayName, params.runUrl);

  const plain = params.succeeded
    ? successEmailText(params.displayName, params.runUrl)
    : failureEmailText(params.displayName, params.runUrl);

  const res = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: params.to }] }],
      from: { email: fromEmail, name: fromName },
      subject: params.subject,
      content: [
        { type: "text/plain", value: plain },
        { type: "text/html", value: html },
      ],
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`SendGrid API error: ${res.status} ${text}`);
  }
}

// ---------------------------------------------------------------------------
// Email templates
// ---------------------------------------------------------------------------

function successEmailHtml(displayName: string, runUrl: string): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1a1a1a; max-width: 560px; margin: 0 auto; padding: 40px 20px;">
  <h2 style="margin: 0 0 8px; font-size: 20px;">Your Croissant file is ready</h2>
  <p style="color: #6b7280; margin: 0 0 24px; font-size: 15px; line-height: 1.5;">
    The AI agent has finished processing <strong>${escapeHtml(displayName)}</strong> and produced a validated MLCommons Croissant JSON-LD file.
  </p>
  <a href="${escapeHtml(runUrl)}" style="display: inline-block; background: #0284c7; color: #fff; padding: 10px 24px; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: 500;">
    View results
  </a>
  <p style="margin: 24px 0 0; font-size: 13px; color: #9ca3af;">
    From the run page you can download the Croissant file, view the executive summary, and inspect validation results.
  </p>
  <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0 16px;" />
  <p style="font-size: 12px; color: #9ca3af;">
    <a href="https://mlcroissant.jetty.bot" style="color: #6b7280; text-decoration: none;">Croissant Generator</a> &mdash; powered by <a href="https://jetty.io" style="color: #6b7280; text-decoration: none;">Jetty</a>
  </p>
</body>
</html>`.trim();
}

function failureEmailHtml(displayName: string, runUrl: string): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1a1a1a; max-width: 560px; margin: 0 auto; padding: 40px 20px;">
  <h2 style="margin: 0 0 8px; font-size: 20px;">Croissant generation failed</h2>
  <p style="color: #6b7280; margin: 0 0 24px; font-size: 15px; line-height: 1.5;">
    The AI agent was unable to produce a valid Croissant file for <strong>${escapeHtml(displayName)}</strong>. This can happen if the paper doesn't describe a dataset in enough detail, or if the agent ran into an unexpected error.
  </p>
  <a href="${escapeHtml(runUrl)}" style="display: inline-block; background: #dc2626; color: #fff; padding: 10px 24px; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: 500;">
    View run details
  </a>
  <p style="margin: 24px 0 0; font-size: 13px; color: #9ca3af;">
    Check the pipeline steps on the run page for more details. You can always re-upload the paper to try again.
  </p>
  <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0 16px;" />
  <p style="font-size: 12px; color: #9ca3af;">
    <a href="https://mlcroissant.jetty.bot" style="color: #6b7280; text-decoration: none;">Croissant Generator</a> &mdash; powered by <a href="https://jetty.io" style="color: #6b7280; text-decoration: none;">Jetty</a>
  </p>
</body>
</html>`.trim();
}

function successEmailText(displayName: string, runUrl: string): string {
  return [
    `Your Croissant file is ready`,
    ``,
    `The AI agent has finished processing "${displayName}" and produced a validated MLCommons Croissant JSON-LD file.`,
    ``,
    `View results: ${runUrl}`,
    ``,
    `From the run page you can download the Croissant file, view the executive summary, and inspect validation results.`,
    ``,
    `---`,
    `Croissant Generator — powered by Jetty`,
    `https://mlcroissant.jetty.bot`,
  ].join("\n");
}

function failureEmailText(displayName: string, runUrl: string): string {
  return [
    `Croissant generation failed`,
    ``,
    `The AI agent was unable to produce a valid Croissant file for "${displayName}".`,
    `This can happen if the paper doesn't describe a dataset in enough detail, or if the agent ran into an unexpected error.`,
    ``,
    `View run details: ${runUrl}`,
    ``,
    `Check the pipeline steps on the run page for more details. You can always re-upload the paper to try again.`,
    ``,
    `---`,
    `Croissant Generator — powered by Jetty`,
    `https://mlcroissant.jetty.bot`,
  ].join("\n");
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
