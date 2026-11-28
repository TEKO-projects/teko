import ServiciosView, { type ApiService } from "@/components/servicios/servicios-view";
import { fetchBackend } from "@/components/globales/json-ld";

// Servidor: los servicios llegan en el HTML inicial (Google e IA no siempre ejecutan JS).
export default async function ServiciosPage() {
  return <ServiciosView initial={await fetchBackend<ApiService[]>("/services")} />;
}
