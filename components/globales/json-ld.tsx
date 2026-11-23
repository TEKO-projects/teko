// Datos estructurados para Google y motores de IA. El reemplazo de "<" evita inyección de HTML desde el CMS.
export default function JsonLd({ data }: { data: object }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}

// En el servidor la ruta relativa /api/v1 no existe; se llama directo al backend (mismo origen que el rewrite de next.config).
export async function fetchBackend<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`https://teko-production-9928.up.railway.app/api/v1${path}`, { next: { revalidate: 3600 } });
    return res.ok ? ((await res.json()) as T) : null;
  } catch {
    return null;
  }
}
