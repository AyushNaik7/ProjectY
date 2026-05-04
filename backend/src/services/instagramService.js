const axios = require("axios");
const AppError = require("../utils/AppError");

const graphApiVersion = process.env.GRAPH_API_VERSION || "v20.0";
const requestTimeoutMs = Number(process.env.META_API_TIMEOUT_MS || 10000);

const graphApiClient = axios.create({
  baseURL: `https://graph.facebook.com/${graphApiVersion}`,
  timeout: requestTimeoutMs,
});

function getRequiredEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new AppError(
      `Missing required environment variable: ${name}`,
      500,
      "CONFIG_ERROR"
    );
  }
  return value;
}

function mapGraphApiError(error) {
  if (!error.response) {
    return new AppError(
      "Meta Graph API is unavailable or timed out.",
      502,
      "UPSTREAM_UNAVAILABLE"
    );
  }

  const { status, data } = error.response;
  const apiError = data?.error || {};
  const code = apiError.code;
  const subcode = apiError.error_subcode;
  const message = apiError.message || "Meta Graph API request failed.";

  if (code === 190) {
    return new AppError(
      "Instagram access token is expired or invalid. Generate a new long-lived token.",
      401,
      "TOKEN_EXPIRED",
      { code, subcode, message }
    );
  }

  if (
    code === 10 ||
    code === 200 ||
    subcode === 33 ||
    /permission|permissions/i.test(message)
  ) {
    return new AppError(
      "Insufficient permissions for this Instagram endpoint. Verify app review and token scopes.",
      403,
      "INSUFFICIENT_PERMISSIONS",
      { code, subcode, message }
    );
  }

  return new AppError(message, status || 500, "GRAPH_API_ERROR", {
    code,
    subcode,
  });
}

async function graphGet(path, params = {}) {
  const accessToken = getRequiredEnv("META_ACCESS_TOKEN");

  try {
    const response = await graphApiClient.get(path, {
      params: {
        access_token: accessToken,
        ...params,
      },
    });

    return response.data;
  } catch (error) {
    throw mapGraphApiError(error);
  }
}

async function getInstagramProfile() {
  const instagramBusinessAccountId = getRequiredEnv(
    "INSTAGRAM_BUSINESS_ACCOUNT_ID"
  );

  return graphGet(`/${instagramBusinessAccountId}`, {
    fields: "username,followers_count,media_count",
  });
}

async function getInstagramPosts() {
  const instagramBusinessAccountId = getRequiredEnv(
    "INSTAGRAM_BUSINESS_ACCOUNT_ID"
  );
  const postLimit = Number(process.env.INSTAGRAM_POST_LIMIT || 25);

  const payload = await graphGet(`/${instagramBusinessAccountId}/media`, {
    fields:
      "id,caption,media_url,like_count,comments_count,media_type,permalink,timestamp",
    limit: Number.isFinite(postLimit) ? postLimit : 25,
  });

  const posts = (payload.data || []).map((post) => ({
    id: post.id,
    caption: post.caption || "",
    media_url: post.media_url || null,
    like_count: post.like_count || 0,
    comments_count: post.comments_count || 0,
  }));

  return {
    posts,
    paging: payload.paging || null,
  };
}

async function getInstagramInsights() {
  const instagramBusinessAccountId = getRequiredEnv(
    "INSTAGRAM_BUSINESS_ACCOUNT_ID"
  );

  const [profile, mediaPayload, insightsPayload] = await Promise.all([
    getInstagramProfile(),
    getInstagramPosts(),
    graphGet(`/${instagramBusinessAccountId}/insights`, {
      metric: "reach,impressions,accounts_engaged",
      period: "day",
    }),
  ]);

  const insightMap = (insightsPayload.data || []).reduce((acc, item) => {
    acc[item.name] = item.values?.[0]?.value ?? null;
    return acc;
  }, {});

  // Engagement is computed from media interactions to provide a stable value
  // even when account-level engagement metrics are restricted.
  const totalInteractions = mediaPayload.posts.reduce(
    (sum, post) => sum + (post.like_count || 0) + (post.comments_count || 0),
    0
  );

  const followers = profile.followers_count || 0;
  const engagementRatePercent =
    followers > 0
      ? Number(((totalInteractions / followers) * 100).toFixed(2))
      : null;

  return {
    reach: insightMap.reach,
    impressions: insightMap.impressions,
    engagement: {
      total_interactions: totalInteractions,
      accounts_engaged: insightMap.accounts_engaged,
      engagement_rate_percent: engagementRatePercent,
    },
  };
}

module.exports = {
  getInstagramProfile,
  getInstagramPosts,
  getInstagramInsights,
};