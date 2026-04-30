import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";

import { SiteFooter } from "@/components/SiteFooter";
import { renderWithTheme } from "@/test/renderWithTheme";

describe("<SiteFooter />", () => {
  it("renders attribution copy and Clockwork link", () => {
    renderWithTheme(<SiteFooter />);

    expect(screen.getByText(/runs like/i)).toBeInTheDocument();

    const link = screen.getByRole("link", { name: /clockwork/i });
    expect(link).toHaveAttribute("href", "https://www.clockwork.com/");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });
});
