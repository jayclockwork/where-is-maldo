import { getSessionsRepository } from "@/data/sessions/repositorySingleton";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as { sessionId?: string } | null;
  const sessionId = body?.sessionId?.trim();
  if (!sessionId) return Response.json({ error: "Missing sessionId" }, { status: 400 });

  const repo = getSessionsRepository();
  await repo.clearResults(sessionId);
  return Response.json({ ok: true });
}

