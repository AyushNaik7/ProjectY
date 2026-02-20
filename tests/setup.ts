import { vi } from "vitest";

process.env.OPENAI_API_KEY = process.env.OPENAI_API_KEY || "test-key";
process.env.NEXT_PUBLIC_SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://test.supabase.co";
process.env.SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY || "test-role-key";

vi.stubGlobal("fetch", vi.fn());
