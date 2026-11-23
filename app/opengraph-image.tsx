import { ImageResponse } from "next/og";

export const alt = "TEKO — Desarrollo de software y transformación digital en República Dominicana";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 80,
          color: "#f2f3f5",
          background: "radial-gradient(90% 90% at 0% 0%, #0b6eff 0%, #0a1a40 45%, #080a0f 100%)",
        }}
      >
        <div style={{ fontSize: 44, fontWeight: 700, letterSpacing: 6, color: "#1ec4ff" }}>TEKO</div>
        <div style={{ marginTop: 28, fontSize: 76, fontWeight: 700, lineHeight: 1.05, maxWidth: 950 }}>Software que transforma negocios</div>
        <div style={{ marginTop: 28, fontSize: 32, color: "rgba(242,243,245,0.75)" }}>
          Webs, apps móviles, sistemas y APIs a medida · República Dominicana
        </div>
        <div style={{ marginTop: 44, fontSize: 28, color: "#bfe9ff" }}>teko.do · +1 849 246 4987</div>
      </div>
    ),
    size,
  );
}
