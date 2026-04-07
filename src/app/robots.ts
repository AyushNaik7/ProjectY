import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://instacollab.com";

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/creators/*", "/about", "/contact", "/faq", "/privacy", "/terms"],
        disallow: [
          "/dashboard/*",
          "/api/*",
          "/onboarding/*",
          "/role-select",
          "/login",
          "/signup",
          "/settings/*",
          "/messages",
          "/requests",
          "/saved/*",
          "/campaigns/new",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
