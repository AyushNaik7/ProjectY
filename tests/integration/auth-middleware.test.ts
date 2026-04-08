import { describe, expect, it, vi } from "vitest";
import { requireUser } from "@/lib/request-auth";

const mockGetAuth = vi.fn();
const mockGetUser = vi.fn();

vi.mock("@clerk/nextjs/server", () => ({
  getAuth: (...args: any[]) => mockGetAuth(...args),
  clerkClient: vi.fn(async () => ({
    users: {
      getUser: mockGetUser,
    },
  })),
}));

describe("requireUser", () => {
  it("returns error response when missing token", async () => {
    mockGetAuth.mockReturnValueOnce({ userId: null });

    const req = new Request("http://localhost", { method: "POST" });
    const result = await requireUser(req as any);
    expect(result.error).toBeTruthy();
  });

  it("returns user when token present", async () => {
    mockGetAuth.mockReturnValueOnce({ userId: "user-1" });
    mockGetUser.mockResolvedValueOnce({
      firstName: "Test",
      lastName: "User",
      username: "testuser",
      publicMetadata: { role: "creator" },
      emailAddresses: [{ emailAddress: "test@example.com" }],
    });

    const req = new Request("http://localhost", {
      method: "POST",
      headers: { authorization: "Bearer test" },
    });
    const result = await requireUser(req as any);
    expect(result.user?.id).toBe("user-1");
  });
});
