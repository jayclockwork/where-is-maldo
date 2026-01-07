import { NextResponse } from "next/server";

import { getSessionsRepository } from "@/data/sessions/repositorySingleton";

export async function POST(req: Request) {
  const repo = getSessionsRepository();
  const body = (await req.json().catch(() => ({}))) as {
    joinCode?: string;
    displayName?: string;
    avatarColor?: string;
  };

  if (!body.joinCode || !body.displayName) {
    return NextResponse.json({ error: "joinCode and displayName are required" }, { status: 400 });
  }

  try {
    const result = await repo.joinSession({
      joinCode: body.joinCode.toUpperCase(),
      displayName: body.displayName,
      avatarColor: body.avatarColor,
    });
    return NextResponse.json(result);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Join failed";
    const status =
      msg.toLowerCase().includes("unavailable") ? 409 : msg.toLowerCase().includes("not found") ? 404 : 400;
    return NextResponse.json({ error: msg }, { status });
  }
}


