import PortafolioView from "@/components/portafolio/portafolio-view";
import type { PortfolioCategory, Project } from "@/components/portafolio/section-portafolio-grid";
import { fetchBackend } from "@/components/globales/json-ld";

export default async function PortafolioPage() {
  const [categories, projects] = await Promise.all([
    fetchBackend<PortfolioCategory[]>("/portfolio/categories"),
    fetchBackend<Project[]>("/portfolio"),
  ]);
  return <PortafolioView categories={categories} projects={projects} />;
}
