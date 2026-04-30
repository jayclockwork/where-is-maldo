import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";

import { renderWithTheme } from "@/test/renderWithTheme";
import Home from "@/app/page";

describe("Home page", () => {
  it("renders the main hero heading", () => {
    renderWithTheme(<Home />);
    expect(screen.getByRole("heading", { level: 1, name: /where’s maldo/i })).toBeInTheDocument();
  });
});
