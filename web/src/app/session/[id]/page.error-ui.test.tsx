import { describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";

import { renderWithTheme } from "@/test/renderWithTheme";

import SessionPage from "@/app/session/[id]/page";

vi.mock("next/navigation", () => ({
  useParams: () => ({ id: "sess_test" }),
  useSearchParams: () => new URLSearchParams(""), // no ?code=
}));

describe("/session/[id] error UI", () => {
  it("does not show DEMO20 as a fallback join code", async () => {
    // Minimal EventSource stub for jsdom.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (globalThis as any).EventSource = class {
      onopen: null | (() => void) = null;
      onerror: null | (() => void) = null;
      addEventListener() {
        // no-op
      }
      close() {
        // no-op
      }
    };

    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string) => {
        if (url === "/api/journey") {
          return new Response(JSON.stringify({ phases: [] }), { status: 200 });
        }
        if (url === "/api/sessions/state/sess_test") {
          return new Response(JSON.stringify({ error: "Session not found" }), { status: 404 });
        }
        return new Response(JSON.stringify({ error: "Unhandled" }), { status: 500 });
      }),
    );

    renderWithTheme(<SessionPage />);

    expect(await screen.findByText(/session not found/i)).toBeVisible();
    expect(screen.queryByText(/demo20/i)).toBeNull();
    expect(screen.getByRole("link", { name: /back to join/i })).toHaveAttribute("href", "/join");
  });
});

