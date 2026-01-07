import { NextResponse, type NextRequest } from "next/server";

import { getSessionsRepository } from "@/data/sessions/repositorySingleton";

export async function GET(_: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const repo = getSessionsRepository();
  const { code } = await params;
  const joinCode = code?.toUpperCase();
  const session = await repo.getSessionByJoinCode(joinCode);
  if (!session) return NextResponse.json({ error: "Session not found" }, { status: 404 });
  const participants = await repo.listParticipants(session.id);
  return NextResponse.json({ session, participants });
}


