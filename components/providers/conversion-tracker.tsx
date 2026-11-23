"use client";

import { useEffect } from "react";
import { track } from "@/lib/track";

// Un solo listener cubre todos los enlaces de contacto del sitio, sin tocar cada componente.
export default function ConversionTracker() {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest?.("a");
      const href = a?.getAttribute("href");
      if (!a || !href) return;
      const from = window.location.pathname;
      if (href.startsWith("mailto:")) track("click_email", { from });
      else if (href.startsWith("tel:")) track("click_phone", { from });
      else if (href.includes("wa.me") || href.includes("whatsapp")) track("click_whatsapp", { from });
      else if (href === "/contacto" && from !== "/contacto") track("cta_contacto", { from, label: a.textContent?.trim().slice(0, 40) ?? "" });
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);
  return null;
}
