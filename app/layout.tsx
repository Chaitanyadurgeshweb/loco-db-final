
import "./globals.css";
import type { Metadata, Viewport } from "next";
import { Hanken_Grotesk, JetBrains_Mono } from "next/font/google";

import AppShell from "@/components/AppShell";
import SiteFooter from "@/components/SiteFooter";

const sans = Hanken_Grotesk({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono", display: "swap" });

export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover", themeColor: "#011523" };

export const metadata: Metadata = {
  title: {
    default: "Loco Portal: Indian Railways Locomotive Reference",
    template: "%s | Loco Portal",
  },

  description:
    "Independent, unofficial reference database of Indian Railways locomotives, classes, sheds, zones and production units. Not affiliated with Indian Railways.",

  verification: {
    google: "qS8v6R_luWcZp1QU-sHyI_3Q9O8Vtd9PRllduFkSvRM",
  },
};

export default function Root({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable}`}>
      <body>
        <AppShell footer={<SiteFooter />}>{children}</AppShell>
      </body>
    </html>
  );
}
