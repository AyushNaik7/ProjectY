import { MetadataRoute } from "next";
import { supabaseAdmin } from "@/lib/supabase-server";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://instacollab.com";

  // Fetch all creator handles
  const { data: creators } = await supabaseAdmin
    .from("creators")
    .select("instagram_handle, updated_at")
    .not("instagram_handle", "is", null);

  const creatorUrls =
    creators?.map((creator) => ({
      url: `${baseUrl}/creators/${creator.instagram_handle}`,
      lastModified: new Date(creator.updated_at),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })) || [];

  // Static pages
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/faq`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: "yearly" as const,
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: "yearly" as const,
      priority: 0.3,
    },
  ];

  return [...staticPages, ...creatorUrls];
}
