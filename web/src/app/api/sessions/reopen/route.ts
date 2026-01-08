import { NextResponse } from "next/server";

import { getSessionsRepository } from "@/data/sessions/repositorySingleton";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const repo = getSessionsRepository();
  const body = (await req.json().catch(() => ({}))) as { sessionId?: string; adminToken?: string };
  const sessionId = body.sessionId?.trim();
  const adminToken = body.adminToken?.trim();
  if (!sessionId || !adminToken) return NextResponse.json({ error: "Missing sessionId or adminToken" }, { status: 400 });

  try {
    const session = await repo.reopenSession({ sessionId, adminToken });
    return NextResponse.json({ session });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Reopen failed";
    const status = msg.toLowerCase().includes("unauthorized") ? 401 : msg.toLowerCase().includes("not found") ? 404 : 400;
    return NextResponse.json({ error: msg }, { status });
  }
}

