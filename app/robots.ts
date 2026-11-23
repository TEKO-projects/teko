import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/api/", "/en-construccion"] }],
    sitemap: "https://www.teko.do/sitemap.xml",
  };
}
