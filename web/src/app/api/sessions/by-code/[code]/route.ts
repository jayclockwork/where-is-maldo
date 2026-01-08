import { NextResponse, type NextRequest } from "next/server";

import { getSessionsRepository } from "@/data/sessions/repositorySingleton";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(_: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const repo = getSessionsRepository();
  const { code } = await params;
  const joinCode = code?.toUpperCase();
  const session = await repo.getSessionByJoinCode(joinCode);
  if (!session)
    return NextResponse.json(
      { error: "Session not found" },
      { status: 404, headers: { "Cache-Control": "no-store, no-cache, must-revalidate" } },
    );
  const participants = await repo.listParticipants(session.id);
  return NextResponse.json(
    { session, participants },
    { headers: { "Cache-Control": "no-store, no-cache, must-revalidate" } },
  );
}


