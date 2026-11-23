import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Portafolio de proyectos digitales",
  description:
    "Casos reales de plataformas web, apps móviles y sistemas empresariales desarrollados por TEKO para negocios en República Dominicana y LATAM.",
  alternates: { canonical: "/portafolio" },
  openGraph: { images: "/opengraph-image", url: "/portafolio", title: "Portafolio de proyectos digitales | TEKO", description: "Casos reales de plataformas web, apps móviles y sistemas empresariales desarrollados por TEKO para negocios en República Dominicana y LATAM." },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
