import { NextResponse } from "next/server";

import { getSessionsRepository } from "@/data/sessions/repositorySingleton";

export async function POST(req: Request) {
  const repo = getSessionsRepository();
  const body = (await req.json().catch(() => ({}))) as {
    sessionId?: string;
    participantId?: string;
    participantSecret?: string;
    itemId?: string;
    isDoing?: boolean;
  };

  if (!body.sessionId || !body.participantId || !body.participantSecret || !body.itemId || typeof body.isDoing !== "boolean") {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  try {
    const mapping = await repo.toggleDoing({
      sessionId: body.sessionId,
      participantId: body.participantId,
      participantSecret: body.participantSecret,
      itemId: body.itemId,
      isDoing: body.isDoing,
    });
    return NextResponse.json({ mapping });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Toggle failed";
    const status = msg.toLowerCase().includes("unauthorized") ? 401 : msg.toLowerCase().includes("not found") ? 404 : 400;
    return NextResponse.json({ error: msg }, { status });
  }
}


