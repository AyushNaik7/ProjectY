import type { Logger } from "pino";

export async function timedQuery<T>(
  log: Logger,
  label: string,
  fn: () => PromiseLike<T>,
  meta: Record<string, unknown> = {}
): Promise<T> {
  const startTimeMs = Date.now();
  try {
    const result = await fn();
    const durationMs = Date.now() - startTimeMs;
    log.info({ durationMs, label, ...meta }, "db.query");
    return result;
  } catch (err) {
    const durationMs = Date.now() - startTimeMs;
    log.error({ durationMs, label, err }, "db.query_failed");
    throw err;
  }
}
