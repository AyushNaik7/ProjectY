import { beforeEach, describe, expect, it } from "vitest";
import { generateEmbedding } from "@/lib/embeddings";

const fetchMock = fetch as unknown as {
  mockResolvedValue: (value: unknown) => void;
  mockReset: () => void;
};

describe("generateEmbedding", () => {
  beforeEach(() => {
    fetchMock.mockReset();
  });

  it("calls OpenAI embeddings API and returns embedding", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        data: [{ embedding: [0.1, 0.2, 0.3], index: 0 }],
        model: "text-embedding-ada-002",
        usage: { prompt_tokens: 12, total_tokens: 12 },
      }),
    });

    const result = await generateEmbedding("test embedding");
    expect(result).toEqual([0.1, 0.2, 0.3]);
  });
});
