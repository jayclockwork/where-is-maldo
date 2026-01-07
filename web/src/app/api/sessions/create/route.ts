import { NextResponse } from "next/server";

import { getSessionsRepository } from "@/data/sessions/repositorySingleton";

export async function POST(req: Request) {
  const repo = getSessionsRepository();
  const body = (await req.json().catch(() => ({}))) as { title?: string; joinCode?: string };
  const { session, adminToken } = await repo.createSession({
    title: body.title,
    joinCode: body.joinCode?.toUpperCase(),
  });
  return NextResponse.json({ session, adminToken });
}


