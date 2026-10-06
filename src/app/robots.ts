import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://loomnotes.ai";

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/login", "/signup", "/privacy", "/terms", "/forgot-password"],
        disallow: ["/dashboard/", "/admin/", "/auth/", "/reset-password"],
      },
    ],
    sitemap: `${appUrl}/sitemap.xml`,
  };
}
