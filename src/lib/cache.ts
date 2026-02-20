import { getRedisClient } from "@/lib/redis";
import { logger } from "@/lib/logger";

const CACHE_PREFIX = "creatordeal";
const DEFAULT_TTL_SECONDS = 300;

export const cacheKeys = {
  creatorMatches: (creatorId: string) =>
    `${CACHE_PREFIX}:match:creator:${creatorId}:v1`,
  campaignMatches: (campaignId: string) =>
    `${CACHE_PREFIX}:match:campaign:${campaignId}:v1`,
  campaignById: (campaignId: string) =>
    `${CACHE_PREFIX}:campaign:${campaignId}:v1`,
  activeCampaigns: () => `${CACHE_PREFIX}:campaigns:active:v1`,
};

export async function getJson<T>(key: string): Promise<T | null> {
  const redis = getRedisClient();
  if (!redis) return null;

  const raw = await redis.get(key);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as T;
  } catch (err) {
    logger.warn({ err, key }, "cache.parse_failed");
    await redis.del(key);
    return null;
  }
}

export async function setJson(
  key: string,
  value: unknown,
  ttlSeconds: number = DEFAULT_TTL_SECONDS
) {
  const redis = getRedisClient();
  if (!redis) return;

  await redis.set(key, JSON.stringify(value), "EX", ttlSeconds);
}

export async function getOrSetJson<T>(
  key: string,
  ttlSeconds: number,
  fetcher: () => Promise<T>
): Promise<T> {
  const redis = getRedisClient();
  if (!redis) return fetcher();

  const cached = await getJson<T>(key);
  if (cached) {
    logger.debug({ key }, "cache.hit");
    return cached;
  }

  logger.debug({ key }, "cache.miss");
  const value = await fetcher();
  await setJson(key, value, ttlSeconds);
  return value;
}

export async function deleteKeys(keys: string[]) {
  const redis = getRedisClient();
  if (!redis || keys.length === 0) return;
  await redis.del(keys);
}

export async function deleteByPattern(pattern: string) {
  const redis = getRedisClient();
  if (!redis) return;

  let cursor = "0";
  do {
    const [nextCursor, keys] = await redis.scan(
      cursor,
      "MATCH",
      pattern,
      "COUNT",
      200
    );
    cursor = nextCursor;
    if (keys.length > 0) {
      await redis.del(keys);
    }
  } while (cursor !== "0");
}

export async function invalidateCreatorMatchCache(creatorId: string) {
  await deleteKeys([cacheKeys.creatorMatches(creatorId)]);
}

export async function invalidateCampaignMatchCache(campaignId: string) {
  await deleteKeys([cacheKeys.campaignMatches(campaignId)]);
}

export async function invalidateActiveCampaigns() {
  await deleteKeys([cacheKeys.activeCampaigns()]);
}

export async function invalidateCampaignById(campaignId: string) {
  await deleteKeys([cacheKeys.campaignById(campaignId)]);
}

export async function invalidateAllCreatorMatches() {
  await deleteByPattern(`${CACHE_PREFIX}:match:creator:*`);
}

export async function invalidateAllCampaignMatches() {
  await deleteByPattern(`${CACHE_PREFIX}:match:campaign:*`);
}
