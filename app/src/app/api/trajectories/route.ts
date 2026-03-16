import { NextRequest, NextResponse } from "next/server";
import { listTrajectories } from "@/lib/jetty";

export async function GET(req: NextRequest) {
  try {
    const limit = Number(req.nextUrl.searchParams.get("limit") ?? "50");
    const data = await listTrajectories(limit);
    return NextResponse.json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
