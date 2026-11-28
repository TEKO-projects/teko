import PreciosView from "@/components/precios/precios-view";
import type { Plan } from "@/components/precios/section-planes";
import type { FAQ } from "@/components/precios/section-faq";
import { fetchBackend } from "@/components/globales/json-ld";

export default async function PreciosPage() {
  const [plans, faqs] = await Promise.all([fetchBackend<Plan[]>("/plans"), fetchBackend<FAQ[]>("/faqs")]);
  return <PreciosView plans={plans} faqs={faqs} />;
}
