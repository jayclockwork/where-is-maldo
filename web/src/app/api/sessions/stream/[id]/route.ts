import type { SessionEvent } from "@/domain/sessions/repository";
import { getSessionsRepository } from "@/data/sessions/repositorySingleton";

export const runtime = "nodejs";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: sessionId } = await params;
  const repo = getSessionsRepository();

  const encoder = new TextEncoder();
  let unsubscribe: (() => void) | null = null;
  let keepAlive: ReturnType<typeof setInterval> | null = null;

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const send = (event: SessionEvent) => {
        // SSE format: event + data lines, separated by blank line
        controller.enqueue(encoder.encode(`event: ${event.type}\n`));
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
      };

      // Initial heartbeat so proxies keep it open.
      controller.enqueue(encoder.encode(`event: ping\ndata: {}\n\n`));

      unsubscribe = repo.subscribe(sessionId, send);

      keepAlive = setInterval(() => {
        controller.enqueue(encoder.encode(`event: ping\ndata: {}\n\n`));
      }, 15000);
    },
    cancel() {
      if (keepAlive) clearInterval(keepAlive);
      unsubscribe?.();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}


