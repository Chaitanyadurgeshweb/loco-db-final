
import "./globals.css";
import type { Metadata } from "next";

import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

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
    <html lang="en">
      <body>
        <SiteHeader />
        <main
          id="main"
          tabIndex={-1}
          className="container-page flex-1 w-full py-8 focus:outline-none"
        >
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
