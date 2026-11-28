import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Check } from "lucide-react";
import JsonLd from "@/components/globales/json-ld";
import { getSolucion, soluciones } from "@/Data/soluciones/soluciones-data";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return soluciones.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const s = getSolucion((await params).slug);
  if (!s) return {};
  const url = `/soluciones/${s.slug}`;
  return {
    title: s.title,
    description: s.description,
    alternates: { canonical: url },
    openGraph: { url, title: `${s.title} | TEKO`, description: s.description, images: "/opengraph-image" },
  };
}

export default async function SolucionPage({ params }: Props) {
  const s = getSolucion((await params).slug);
  if (!s) notFound();
  const url = `https://www.teko.do/soluciones/${s.slug}`;

  return (
    <main className="px-6 pb-20 pt-[120px] md:px-[100px] md:pt-[150px]" style={{ background: "#080a0f", color: "#f2f3f5" }}>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Service",
              "@id": `${url}#service`,
              name: s.h1,
              description: s.respuesta,
              url,
              serviceType: s.nombre,
              provider: { "@id": "https://www.teko.do/#org" },
              areaServed: ["DO", "US", "Latin America"],
            },
            {
              "@type": "FAQPage",
              mainEntity: s.faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
            },
            {
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "Inicio", item: "https://www.teko.do" },
                { "@type": "ListItem", position: 2, name: "Servicios", item: "https://www.teko.do/servicios" },
                { "@type": "ListItem", position: 3, name: s.nombre, item: url },
              ],
            },
          ],
        }}
      />

      <article className="mx-auto max-w-[900px]">
        <nav aria-label="Ruta" className="text-sm" style={{ color: "rgba(242,243,245,0.55)" }}>
          <Link href="/" className="hover:text-white">Inicio</Link> / <Link href="/servicios" className="hover:text-white">Servicios</Link> / {s.nombre}
        </nav>

        <h1 className="mt-6 text-[clamp(32px,4.6vw,52px)] font-semibold leading-[1.05] tracking-[-0.035em]" style={{ textWrap: "balance" }}>
          {s.h1}
        </h1>
        <p className="mt-6 text-[17px] font-light leading-[1.65]" style={{ color: "rgba(242,243,245,0.8)" }}>
          {s.respuesta}
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/contacto" className="rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-[#080a0f] transition-colors hover:bg-[#e8ecf5]">
            Solicitar cotización
          </Link>
          <a href="https://wa.me/18495940040" target="_blank" rel="noopener noreferrer" className="rounded-full border px-6 py-3.5 text-sm font-semibold transition-colors hover:bg-white/5" style={{ borderColor: "rgba(255,255,255,0.18)" }}>
            WhatsApp +1 849 594 0040
          </a>
        </div>

        <h2 className="mt-16 text-[28px] font-semibold tracking-[-0.03em]">Qué incluye</h2>
        <ul className="mt-6 grid gap-4 sm:grid-cols-2">
          {s.incluye.map((i) => (
            <li key={i.titulo} className="rounded-[18px] border p-5" style={{ borderColor: "rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.03)" }}>
              <h3 className="text-[16px] font-semibold">{i.titulo}</h3>
              <p className="mt-2 text-[14.5px] font-light leading-[1.6]" style={{ color: "rgba(242,243,245,0.7)" }}>{i.texto}</p>
            </li>
          ))}
        </ul>

        <h2 className="mt-16 text-[28px] font-semibold tracking-[-0.03em]">Para quién es</h2>
        <ul className="mt-6 space-y-3">
          {s.paraQuien.map((p) => (
            <li key={p} className="flex gap-3 text-[15.5px] font-light leading-[1.6]" style={{ color: "rgba(242,243,245,0.8)" }}>
              <Check className="mt-1 h-4 w-4 shrink-0 text-[#1ec4ff]" aria-hidden /> {p}
            </li>
          ))}
        </ul>

        <h2 className="mt-16 text-[28px] font-semibold tracking-[-0.03em]">Preguntas frecuentes</h2>
        <dl className="mt-6 space-y-5">
          {s.faqs.map((f) => (
            <div key={f.q}>
              <dt className="text-[16px] font-semibold">{f.q}</dt>
              <dd className="mt-1.5 text-[15px] font-light leading-[1.65]" style={{ color: "rgba(242,243,245,0.72)" }}>{f.a}</dd>
            </div>
          ))}
        </dl>

        <h2 className="mt-16 text-[22px] font-semibold tracking-[-0.03em]">Otras soluciones de TEKO</h2>
        <ul className="mt-4 flex flex-wrap gap-3">
          {soluciones.filter((o) => o.slug !== s.slug).map((o) => (
            <li key={o.slug}>
              <Link href={`/soluciones/${o.slug}`} className="inline-block rounded-full border px-4 py-2 text-sm transition-colors hover:bg-white/5" style={{ borderColor: "rgba(255,255,255,0.18)" }}>
                {o.nombre}
              </Link>
            </li>
          ))}
        </ul>
      </article>
    </main>
  );
}
