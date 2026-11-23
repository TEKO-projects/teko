import Link from "next/link";
import JsonLd from "@/components/globales/json-ld";
import { soluciones } from "@/Data/soluciones/soluciones-data";

const faqs = [
  { q: "¿Qué hace TEKO?", a: "TEKO es una empresa de desarrollo de software en República Dominicana. Diseñamos y construimos páginas web, aplicaciones móviles, sistemas a medida, APIs y automatizaciones para startups y negocios en RD, Estados Unidos y Latinoamérica." },
  { q: "¿Cómo puedo cotizar un proyecto con TEKO?", a: "Escribe desde la página de contacto, a info@teko.do o al +1 849 246 4987. Agendamos una cita sin compromiso para entender tu proyecto y te enviamos una propuesta." },
  { q: "¿Con qué tecnologías trabaja TEKO?", a: "React, Next.js, Node, Python, bases de datos relacionales e infraestructura en la nube como Vercel y AWS, además de Figma para el diseño." },
];

// Texto visible y enlazado en el HTML inicial: es lo que leen Google y los asistentes de IA al describir a TEKO.
export default function SectionResumen() {
  return (
    <section className="px-6 py-16 md:px-[100px] md:py-20" style={{ background: "#080a0f", color: "#f2f3f5" }}>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
        }}
      />
      <div className="mx-auto max-w-[900px]">
        <h2 className="text-[clamp(26px,3.2vw,38px)] font-semibold leading-[1.1] tracking-[-0.03em]">Empresa de desarrollo de software en República Dominicana</h2>
        <p className="mt-5 text-[16px] font-light leading-[1.7]" style={{ color: "rgba(242,243,245,0.78)" }}>
          {faqs[0].a}
        </p>
        <ul className="mt-6 flex flex-wrap gap-3">
          {soluciones.map((s) => (
            <li key={s.slug}>
              <Link href={`/soluciones/${s.slug}`} className="inline-block rounded-full border px-4 py-2 text-sm transition-colors hover:bg-white/5" style={{ borderColor: "rgba(255,255,255,0.18)" }}>
                {s.nombre}
              </Link>
            </li>
          ))}
        </ul>
        <dl className="mt-10 space-y-5">
          {faqs.slice(1).map((f) => (
            <div key={f.q}>
              <dt className="text-[16px] font-semibold">{f.q}</dt>
              <dd className="mt-1.5 text-[15px] font-light leading-[1.65]" style={{ color: "rgba(242,243,245,0.72)" }}>{f.a}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
