import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://socioconnect.app";

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/pricing", "/features", "/faq", "/about", "/terms", "/privacy"],
        disallow: ["/app/", "/app/*", "/auth/", "/auth/*", "/api/", "/api/*"],
      },
      {
        userAgent: "Googlebot",
        allow: ["/", "/pricing", "/features", "/faq"],
        disallow: ["/app/", "/auth/"],
      },
      {
        userAgent: "Twitterbot",
        allow: "/",
      },
      {
        userAgent: "facebookexternalhit",
        allow: "/",
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
