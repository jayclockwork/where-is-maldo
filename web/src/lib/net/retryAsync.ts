export type RetryAsyncOptions = {
  retries: number; // number of retries after the first attempt
  delayMs: (attemptIndex: number) => number; // attemptIndex starts at 0 for the first retry
  shouldRetry: (e: unknown) => boolean;
};

export async function retryAsync<T>(attempt: () => Promise<T>, opts: RetryAsyncOptions): Promise<T> {
  let lastError: unknown = null;
  const totalAttempts = 1 + Math.max(0, opts.retries);

  for (let i = 0; i < totalAttempts; i++) {
    try {
      return await attempt();
    } catch (e) {
      lastError = e;
      const isLast = i === totalAttempts - 1;
      if (isLast || !opts.shouldRetry(e)) break;
      const delay = opts.delayMs(i);
      await new Promise<void>((resolve) => globalThis.setTimeout(resolve, delay));
    }
  }

  throw lastError instanceof Error ? lastError : new Error("retryAsync failed");
}

