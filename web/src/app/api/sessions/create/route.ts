import { NextResponse } from "next/server";

import { getSessionsRepository } from "@/data/sessions/repositorySingleton";

export async function POST(req: Request) {
  const repo = getSessionsRepository();
  const body = (await req.json().catch(() => ({}))) as { title?: string; joinCode?: string };
  const joinCode = typeof body.joinCode === "string" ? body.joinCode.trim().toUpperCase() : "";
  if (!joinCode) {
    return NextResponse.json({ error: "Join code is required." }, { status: 400 });
  }
  const { session, adminToken } = await repo.createSession({
    title: body.title,
    joinCode,
  });
  return NextResponse.json({ session, adminToken });
}


