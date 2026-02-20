import Redis from "ioredis";
import { logger } from "@/lib/logger";

let redisClient: Redis | null = null;

export function getRedisClient() {
  if (redisClient) return redisClient;

  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) {
    logger.warn("REDIS_URL not configured; Redis cache disabled.");
    return null;
  }

  redisClient = new Redis(redisUrl, {
    enableReadyCheck: true,
    lazyConnect: true,
    maxRetriesPerRequest: 2,
  });

  redisClient.on("error", (err) => {
    logger.warn({ err }, "redis.error");
  });

  return redisClient;
}
