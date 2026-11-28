import type { Metadata } from "next";
import "./../style/globals.css";
import { Geist, Instrument_Serif } from "next/font/google";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Analytics } from "@vercel/analytics/next";
import { GoogleAnalytics } from "@next/third-parties/google";
import JsonLd from "@/components/globales/json-ld";
import ConversionTracker from "@/components/providers/conversion-tracker";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });
const instrumentSerif = Instrument_Serif({ subsets: ["latin"], weight: "400", style: ["normal", "italic"], variable: "--font-instrument-serif" });

export const metadata: Metadata = {
  title: {
    default: "TEKO | Desarrollo de software en República Dominicana",
    template: "%s | TEKO",
  },
  description:
    "Agencia de desarrollo de software en República Dominicana. Creamos plataformas web, aplicaciones móviles, sistemas empresariales y APIs a medida para empresas que quieren crecer con tecnología. Más de 50 proyectos entregados.",
  keywords: [
    "desarrollo de software República Dominicana",
    "agencia digital RD",
    "desarrollo web a medida",
    "aplicaciones móviles RD",
    "transformación digital",
    "software empresarial",
    "diseño UX/UI",
    "APIs y backend",
    "TEKO",
    "teko.do",
  ],
  authors: [{ name: "TEKO" }],
  creator: "TEKO",
  metadataBase: new URL("https://www.teko.do"),
  openGraph: {
    type: "website",
    locale: "es_DO",
    url: "https://www.teko.do",
    siteName: "TEKO",
    title: "TEKO | Desarrollo de Software & Transformación Digital",
    description:
      "Creamos productos digitales que transforman negocios: sitios web, apps móviles, sistemas internos y APIs. Agenda una cita sin compromiso.",
  },
  twitter: {
    card: "summary_large_image",
    title: "TEKO | Desarrollo de Software & Transformación Digital",
    description:
      "Creamos productos digitales que transforman negocios: sitios web, apps móviles, sistemas internos y APIs. Agenda una cita sin compromiso.",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
  robots: {
    index: true,
    follow: true,
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://www.teko.do/#org",
      name: "TEKO",
      url: "https://www.teko.do/",
      logo: "https://www.teko.do/LogoTeko.png",
      email: "info@teko.do",
      telephone: "+1-849-594-0040",
      address: { "@type": "PostalAddress", addressCountry: "DO" },
      founder: { "@type": "Person", name: "John Marte", jobTitle: "Founder & Tech Lead" },
      contactPoint: { "@type": "ContactPoint", contactType: "sales", telephone: "+1-849-594-0040", email: "info@teko.do", url: "https://wa.me/18495940040", areaServed: "DO", availableLanguage: ["es", "en"] },
      slogan: "Software que transforma negocios",
      description:
        "Agencia de desarrollo de software y transformación digital en República Dominicana: plataformas web, apps móviles, sistemas empresariales y APIs a medida.",
      areaServed: [{ "@type": "Country", name: "República Dominicana" }, { "@type": "Country", name: "Estados Unidos" }, { "@type": "Place", name: "Latinoamérica" }],
      knowsAbout: ["Desarrollo de software a medida", "Aplicaciones móviles", "Diseño UX/UI", "APIs e integraciones", "Cloud"],
      sameAs: ["https://www.instagram.com/teko.dr/"],
    },
    { "@type": "WebSite", "@id": "https://www.teko.do/#web", url: "https://www.teko.do/", name: "TEKO", inLanguage: "es-DO", publisher: { "@id": "https://www.teko.do/#org" } },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es-DO"
      suppressHydrationWarning
      className={cn("h-full ", "font-sans", geist.variable, instrumentSerif.variable)}
    >
      <body className="min-h-full flex flex-col bg-white text-[#101828] transition-colors duration-300 dark:bg-[#0a0e1a] dark:text-white">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange={false}
        >
          <JsonLd data={jsonLd} />
          <ConversionTracker />
          <Analytics />
          <TooltipProvider>
            {children}
          </TooltipProvider>
        </ThemeProvider>
      </body>
      {process.env.NEXT_PUBLIC_GA_ID && <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />}
    </html>
  );
}
