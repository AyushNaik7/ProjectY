import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/logger";

export function createRequestContext(req: NextRequest) {
  const requestId = req.headers.get("x-request-id") ?? crypto.randomUUID();
  const startTimeMs = Date.now();
  const log = logger;

  return { requestId, startTimeMs, log };
}

export function attachRequestId(res: NextResponse, requestId: string) {
  res.headers.set("x-request-id", requestId);
  return res;
}

export function logRequestCompleted(
  log: typeof logger,
  startTimeMs: number,
  status: number
) {
  const durationMs = Date.now() - startTimeMs;
  log.info(`Request completed in ${durationMs}ms with status ${status}`);
}
