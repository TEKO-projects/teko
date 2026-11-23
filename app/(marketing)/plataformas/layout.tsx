import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Plataformas y herramientas digitales propias",
  description:
    "Plataformas web creadas por TEKO, como Social Manager y Rapidito, para potenciar la operación digital de tu negocio.",
  alternates: { canonical: "/plataformas" },
  openGraph: { images: "/opengraph-image", url: "/plataformas", title: "Plataformas y herramientas digitales propias | TEKO", description: "Plataformas web creadas por TEKO, como Social Manager y Rapidito, para potenciar la operación digital de tu negocio." },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
