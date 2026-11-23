import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sobre TEKO, tu partner tecnológico",
  description:
    "Equipo de desarrollo de software en República Dominicana que construye productos digitales para startups y negocios en RD, US y LATAM.",
  alternates: { canonical: "/nosotros" },
  openGraph: { images: "/opengraph-image", url: "/nosotros", title: "Sobre TEKO, tu partner tecnológico | TEKO", description: "Equipo de desarrollo de software en República Dominicana que construye productos digitales para startups y negocios en RD, US y LATAM." },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
