import { describe, expect, it } from "vitest";

import { ghostDurationSeconds } from "@/lib/wallboard/ghostMotion";

describe("ghostDurationSeconds", () => {
  it("decreases (or stays) as ghost count increases and clamps to bounds", () => {
    expect(ghostDurationSeconds(-5)).toBe(14);
    expect(ghostDurationSeconds(0)).toBe(14);
    expect(ghostDurationSeconds(10)).toBeLessThan(ghostDurationSeconds(1));
    expect(ghostDurationSeconds(1000)).toBe(4.5);
  });
});

