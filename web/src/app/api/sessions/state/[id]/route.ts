import { NextResponse, type NextRequest } from "next/server";

import { getSessionsRepository } from "@/data/sessions/repositorySingleton";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const repo = getSessionsRepository();

  const session = await repo.getSessionById(id);
  if (!session)
    return NextResponse.json(
      { error: "Session not found" },
      { status: 404, headers: { "Cache-Control": "no-store, no-cache, must-revalidate" } },
    );

  const participants = await repo.listParticipants(id);
  const mappings = await repo.listMappings(id);
  return NextResponse.json(
    { session, participants, mappings },
    { headers: { "Cache-Control": "no-store, no-cache, must-revalidate" } },
  );
}


