import { describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/requests/route";

vi.mock("@/lib/request-auth", () => ({
  requireUser: vi.fn(async () => ({
    user: { id: "brand-1", user_metadata: { role: "brand" } },
  })),
}));

vi.mock("@/lib/supabase-server", () => ({
  supabaseAdmin: {
    from: (table: string) => {
      const selectBuilder = {
        eq: () => selectBuilder,
        limit: async () => ({ data: [] }),
        single: async () => ({
          data: { id: "camp-1", brand_id: "brand-1" },
        }),
      };

      if (table === "collaboration_requests") {
        return {
          select: () => selectBuilder,
          insert: () => ({
            select: () => ({ single: async () => ({ data: { id: "req-1" } }) }),
          }),
        };
      }

      return {
        select: () => selectBuilder,
      };
    },
  },
}));

vi.mock("@/lib/request-context", () => ({
  createRequestContext: () => ({
    requestId: "req-1",
    startTimeMs: Date.now(),
    log: { info: vi.fn(), error: vi.fn() },
  }),
  attachRequestId: (res: Response) => res,
  logRequestCompleted: vi.fn(),
}));

describe("requests route", () => {
  it("creates a collaboration request", async () => {
    const req = new Request("http://localhost/api/requests", {
      method: "POST",
      headers: { authorization: "Bearer test" },
      body: JSON.stringify({ creatorId: "creator-1", campaignId: "camp-1" }),
    });

    const res = await POST(req as any);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.requestId).toBe("req-1");
  });
});
