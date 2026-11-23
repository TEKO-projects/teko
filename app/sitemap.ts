import type { MetadataRoute } from "next";
import { soluciones } from "@/Data/soluciones/soluciones-data";

const paths = [...soluciones.map((x) => `/soluciones/${x.slug}`), "", "/servicios", "/precios", "/portafolio", "/plataformas", "/nosotros", "/contacto", "/politica-de-privacidad", "/politica-de-cookies", "/terminos-y-condiciones"];

export default function sitemap(): MetadataRoute.Sitemap {
  return paths.map((p) => ({
    url: `https://www.teko.do${p}`,
    changeFrequency: p === "" ? "weekly" : "monthly",
    priority: p === "" ? 1 : p.startsWith("/soluciones") ? 0.9 : p.startsWith("/politica") || p.startsWith("/terminos") ? 0.2 : 0.8,
  }));
}
