import pino from "pino";

const isProd = process.env.NODE_ENV === "production";

export const logger = pino({
  level: process.env.LOG_LEVEL || (isProd ? "info" : "debug"),
  base: {
    service: "creatordeal-api",
  },
  redact: {
    paths: [
      "req.headers.authorization",
      "req.headers.cookie",
      "authorization",
      "*.password",
      "*.token",
      "*.access_token",
      "*.refresh_token",
    ],
    remove: true,
  },
  timestamp: pino.stdTimeFunctions.isoTime,
});

export function getRequestLogger(meta: {
  requestId: string;
  path: string;
  method: string;
  userId?: string;
}) {
  return logger.child(meta);
}
