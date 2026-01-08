import { describe, expect, it, vi } from "vitest";

import { retryAsync } from "@/lib/net/retryAsync";

describe("retryAsync", () => {
  it("retries when shouldRetry returns true and eventually succeeds", async () => {
    const attempt = vi.fn<[], Promise<string>>()
      .mockRejectedValueOnce(new Error("nope"))
      .mockRejectedValueOnce(new Error("nope"))
      .mockResolvedValueOnce("ok");

    const sleep = vi.spyOn(globalThis, "setTimeout");

    const out = await retryAsync(attempt, {
      retries: 3,
      delayMs: () => 1,
      shouldRetry: () => true,
    });

    expect(out).toBe("ok");
    expect(attempt).toHaveBeenCalledTimes(3);
    expect(sleep).toHaveBeenCalled();
  });

  it("does not retry when shouldRetry returns false", async () => {
    const attempt = vi.fn<[], Promise<string>>().mockRejectedValueOnce(new Error("nope"));
    await expect(
      retryAsync(attempt, { retries: 5, delayMs: () => 1, shouldRetry: () => false }),
    ).rejects.toThrow(/nope/i);
    expect(attempt).toHaveBeenCalledTimes(1);
  });
});

