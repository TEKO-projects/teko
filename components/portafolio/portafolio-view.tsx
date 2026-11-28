"use client";

import SectionPortafolioGrid, { type PortfolioCategory, type Project } from "@/components/portafolio/section-portafolio-grid";
import PortafolioHero from "@/components/portafolio/portafolio-hero";

export default function PortafolioView({ categories, projects }: { categories: PortfolioCategory[] | null; projects: Project[] | null }) {
  return (
    <main style={{ background: "#080a0f" }}>
      <PortafolioHero />
      <SectionPortafolioGrid initialCategories={categories} initialProjects={projects} />
    </main>
  );
}
