import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";

import { renderWithTheme } from "@/test/renderWithTheme";
import Home from "@/app/page";

describe("Home page", () => {
  it('hides "View Wallboard" when there is no prior join', () => {
    window.localStorage.removeItem("lastJoinCode");
    renderWithTheme(<Home />);
    expect(screen.queryByRole("link", { name: /view wallboard/i })).toBeNull();
  });

  it('shows "View Wallboard" when there is a prior join', async () => {
    window.localStorage.setItem("lastJoinCode", "CWTEST");
    renderWithTheme(<Home />);
    const link = await screen.findByRole("link", { name: /view wallboard/i });
    expect(link).toHaveAttribute("href", "/w/CWTEST");
  });
});

