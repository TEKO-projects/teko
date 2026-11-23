import type { Metadata } from "next";
import JsonLd, { fetchBackend } from "@/components/globales/json-ld";

export const metadata: Metadata = {
  title: "Servicios de desarrollo de software, diseño y cloud en RD",
  description:
    "Desarrollo web y de software a medida, apps móviles, diseño UX/UI, branding, APIs, integraciones, cloud y mantenimiento para empresas en República Dominicana y LATAM.",
  alternates: { canonical: "/servicios" },
  openGraph: { images: "/opengraph-image", url: "/servicios", title: "Servicios de desarrollo de software, diseño y cloud en RD | TEKO", description: "Desarrollo web y de software a medida, apps móviles, diseño UX/UI, branding, APIs, integraciones, cloud y mantenimiento para empresas en República Dominicana y LATAM." },
};

type Service = { title: string; description: string | null; category: { name: string } | null };

export default async function Layout({ children }: { children: React.ReactNode }) {
  const services = await fetchBackend<Service[]>("/services");
  return (
    <>
      {services?.length ? (
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "OfferCatalog",
            name: "Servicios de TEKO",
            url: "https://www.teko.do/servicios",
            itemListElement: services.map((s) => ({
              "@type": "Offer",
              itemOffered: {
                "@type": "Service",
                name: s.title,
                description: s.description ?? undefined,
                category: s.category?.name,
                provider: { "@id": "https://www.teko.do/#org" },
                areaServed: ["DO", "US", "Latin America"],
              },
            })),
          }}
        />
      ) : null}
      {children}
    </>
  );
}
