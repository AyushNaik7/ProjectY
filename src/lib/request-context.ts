import type { Logger } from "pino";
import { NextRequest, NextResponse } from "next/server";
import { getRequestLogger } from "@/lib/logger";

export function createRequestContext(req: NextRequest) {
  const requestId = req.headers.get("x-request-id") ?? crypto.randomUUID();
  const startTimeMs = Date.now();
  const log = getRequestLogger({
    requestId,
    path: req.nextUrl.pathname,
    method: req.method,
  });

  return { requestId, startTimeMs, log };
}

export function attachRequestId(res: NextResponse, requestId: string) {
  res.headers.set("x-request-id", requestId);
  return res;
}

export function logRequestCompleted(
  log: Logger,
  startTimeMs: number,
  status: number
) {
  const durationMs = Date.now() - startTimeMs;
  log.info({ durationMs, status }, "request.completed");
}
