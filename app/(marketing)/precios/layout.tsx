import type { Metadata } from "next";
import JsonLd, { fetchBackend } from "@/components/globales/json-ld";

export const metadata: Metadata = {
  title: "Planes y precios de desarrollo de software",
  description:
    "Tres planes de desarrollo de software y transformación digital, del primer sitio web a sistemas completos. Cotiza con TEKO en República Dominicana.",
  alternates: { canonical: "/precios" },
  openGraph: { images: "/opengraph-image", url: "/precios", title: "Planes y precios de desarrollo de software | TEKO", description: "Tres planes de desarrollo de software y transformación digital, del primer sitio web a sistemas completos. Cotiza con TEKO en República Dominicana." },
};

type Faq = { question: string; answer: string };

export default async function Layout({ children }: { children: React.ReactNode }) {
  const faqs = await fetchBackend<Faq[]>("/faqs");
  return (
    <>
      {faqs?.length ? (
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.question, acceptedAnswer: { "@type": "Answer", text: f.answer } })),
          }}
        />
      ) : null}
      {children}
    </>
  );
}
