import type { MetadataRoute } from "next";

const paths = ["", "/servicios", "/precios", "/portafolio", "/plataformas", "/nosotros", "/contacto", "/politica-de-privacidad", "/politica-de-cookies", "/terminos-y-condiciones"];

export default function sitemap(): MetadataRoute.Sitemap {
  return paths.map((p) => ({
    url: `https://www.teko.do${p}`,
    changeFrequency: p === "" ? "weekly" : "monthly",
    priority: p === "" ? 1 : p.startsWith("/politica") || p.startsWith("/terminos") ? 0.2 : 0.8,
  }));
}
