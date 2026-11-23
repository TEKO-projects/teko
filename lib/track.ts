import { sendGAEvent } from "@next/third-parties/google";
import { track as vercelTrack } from "@vercel/analytics";

// Envía un evento de conversión a Google Analytics (si está configurado) y a Vercel.
export function track(name: string, params: Record<string, string> = {}) {
  if (process.env.NEXT_PUBLIC_GA_ID) sendGAEvent("event", name, params);
  vercelTrack(name, params);
}
