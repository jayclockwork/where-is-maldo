import { describe, expect, it, vi } from "vitest";
import { fireEvent, screen } from "@testing-library/react";

import { renderWithTheme } from "@/test/renderWithTheme";
import JoinCodePage from "@/app/join/page";

const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

describe("/join page", () => {
  it("forces the session code input to uppercase as you type", () => {
    renderWithTheme(<JoinCodePage />);
    const input = screen.getByLabelText("Session code");
    fireEvent.change(input, { target: { value: "cwtest" } });
    expect((input as HTMLInputElement).value).toBe("CWTEST");
  });

  it("strips non-alphanumeric characters from the session code input", () => {
    renderWithTheme(<JoinCodePage />);
    const input = screen.getByLabelText("Session code");
    fireEvent.change(input, { target: { value: " cw-test! " } });
    expect((input as HTMLInputElement).value).toBe("CWTEST");
  });

  it('does not show the app bar "Join Session" button', () => {
    renderWithTheme(<JoinCodePage />);
    expect(screen.queryByRole("link", { name: /join session/i })).toBeNull();
    expect(screen.queryByRole("button", { name: /join session/i })).toBeNull();
  });

  it("navigates using an uppercased code on submit", () => {
    push.mockClear();
    renderWithTheme(<JoinCodePage />);
    const input = screen.getByLabelText("Session code");
    fireEvent.change(input, { target: { value: "cwtest" } });
    fireEvent.click(screen.getByRole("button", { name: /continue/i }));
    expect(push).toHaveBeenCalledWith("/s/CWTEST");
  });
});

