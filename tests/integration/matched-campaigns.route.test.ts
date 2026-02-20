import { describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/matched-campaigns/route";

vi.mock("@/lib/request-auth", () => ({
  requireUser: vi.fn(async () => ({
    user: { id: "creator-1", user_metadata: { role: "creator" } },
  })),
}));

vi.mock("@/lib/vector-matching", () => ({
  getVectorMatchedCampaigns: vi.fn(async () => [
    { id: "camp-1", title: "Test", matchScore: 90, matchReasons: [] },
  ]),
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

describe("matched-campaigns route", () => {
  it("returns matches for creator", async () => {
    const req = new Request("http://localhost/api/matched-campaigns", {
      method: "POST",
      headers: { authorization: "Bearer test" },
    });

    const res = await POST(req as any);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.campaigns.length).toBe(1);
  });
});
