import { describe, expect, it } from "vitest";

import { formatRelativeTimeShort } from "@/lib/text/relativeTime";

describe("formatRelativeTimeShort", () => {
  it("formats small deltas", () => {
    expect(formatRelativeTimeShort(0)).toBe("just now");
    expect(formatRelativeTimeShort(1000)).toBe("just now");
    expect(formatRelativeTimeShort(4999)).toBe("just now");
    expect(formatRelativeTimeShort(5000)).toBe("5s ago");
  });

  it("formats seconds/minutes/hours", () => {
    expect(formatRelativeTimeShort(59_000)).toBe("59s ago");
    expect(formatRelativeTimeShort(60_000)).toBe("1m ago");
    expect(formatRelativeTimeShort(3_600_000)).toBe("1h ago");
  });
});

