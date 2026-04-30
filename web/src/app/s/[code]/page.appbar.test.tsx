import { describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";

import { renderWithTheme } from "@/test/renderWithTheme";
import JoinSessionPage from "@/app/s/[code]/page";

vi.mock("next/navigation", () => ({
  useParams: () => ({ code: "CWTEST" }),
  useRouter: () => ({ push: vi.fn() }),
}));

describe("/s/[code] join flow app bar", () => {
  it('does not show the app bar "Join a Session" button', () => {
    // Minimal EventSource + fetch stubs (component uses both)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (globalThis as any).EventSource = class {
      addEventListener() {}
      close() {}
    };
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string) => {
        if (url.startsWith("/api/sessions/by-code/")) {
          return new Response(
            JSON.stringify({
              session: { id: "sess_x", joinCode: "CWTEST", status: "open", createdAt: new Date().toISOString() },
              participants: [],
            }),
            { status: 200 },
          );
        }
        return new Response(JSON.stringify({ error: "Unhandled" }), { status: 500 });
      }),
    );

    renderWithTheme(<JoinSessionPage />);
    expect(screen.queryByRole("link", { name: /join a session/i })).toBeNull();
    expect(screen.queryByRole("button", { name: /join a session/i })).toBeNull();
  });
});

