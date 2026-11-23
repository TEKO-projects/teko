import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contacto y cotización de proyectos",
  description:
    "Agenda una cita sin compromiso o solicita tu cotización de software, web o app móvil con TEKO. Escríbenos a info@teko.do.",
  alternates: { canonical: "/contacto" },
  openGraph: { images: "/opengraph-image", url: "/contacto", title: "Contacto y cotización de proyectos | TEKO", description: "Agenda una cita sin compromiso o solicita tu cotización de software, web o app móvil con TEKO. Escríbenos a info@teko.do." },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
