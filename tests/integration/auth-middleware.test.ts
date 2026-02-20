import { describe, expect, it, vi } from "vitest";
import { requireUser } from "@/lib/request-auth";

vi.mock("@/lib/supabase-server", () => ({
  verifyAccessToken: vi.fn(async () => ({ id: "user-1" })),
}));

describe("requireUser", () => {
  it("returns error response when missing token", async () => {
    const req = new Request("http://localhost", { method: "POST" });
    const result = await requireUser(req as any);
    expect(result.error).toBeTruthy();
  });

  it("returns user when token present", async () => {
    const req = new Request("http://localhost", {
      method: "POST",
      headers: { authorization: "Bearer test" },
    });
    const result = await requireUser(req as any);
    expect(result.user?.id).toBe("user-1");
  });
});
