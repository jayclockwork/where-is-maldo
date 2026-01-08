import { getSessionsRepository } from "@/data/sessions/repositorySingleton";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as { sessionId?: string; adminToken?: string } | null;
  const sessionId = body?.sessionId?.trim();
  const adminToken = body?.adminToken?.trim();
  if (!sessionId) return Response.json({ error: "Missing sessionId" }, { status: 400 });
  if (!adminToken) return Response.json({ error: "Missing adminToken" }, { status: 400 });

  const repo = getSessionsRepository();
  try {
    await repo.clearResults({ sessionId, adminToken });
    return Response.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Clear failed";
    const status = msg.toLowerCase().includes("unauthorized") ? 401 : msg.toLowerCase().includes("not found") ? 404 : 400;
    return Response.json({ error: msg }, { status });
  }
}

