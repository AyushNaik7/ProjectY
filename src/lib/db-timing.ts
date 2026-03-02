import { logger } from "@/lib/logger";

export async function timedQuery<T>(
  log: typeof logger,
  label: string,
  fn: () => PromiseLike<T>,
  meta: Record<string, unknown> = {}
): Promise<T> {
  const startTimeMs = Date.now();
  try {
    const result = await fn();
    const durationMs = Date.now() - startTimeMs;
    log.info(`DB query ${label} completed in ${durationMs}ms`, meta);
    return result;
  } catch (err) {
    const durationMs = Date.now() - startTimeMs;
    log.error(`DB query ${label} failed after ${durationMs}ms`, err);
    throw err;
  }
}
