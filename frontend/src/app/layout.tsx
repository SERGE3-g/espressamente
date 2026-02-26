import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/styles/globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { QueryProvider } from "@/lib/providers";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: {
    default: "Espressamente | Caffè di Qualità, Macchine e Assistenza",
    template: "%s | Espressamente",
  },
  description:
    "Espressamente: il tuo negozio di caffè specializzato. Caffè di qualità, macchine da caffè dei migliori brand e assistenza tecnica professionale.",
  keywords: [
    "caffè",
    "macchine da caffè",
    "espresso",
    "assistenza macchine caffè",
    "caffè specialty",
    "caffè in grani",
  ],
  authors: [{ name: "Espressamente" }],
  openGraph: {
    type: "website",
    locale: "it_IT",
    url: "https://espressamente.it",
    siteName: "Espressamente",
    title: "Espressamente | Caffè di Qualità, Macchine e Assistenza",
    description:
      "Il tuo negozio di caffè specializzato. Qualità, passione e competenza dal chicco alla tazzina.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="it" className={inter.variable}>
      <body className="min-h-screen flex flex-col bg-brand-50 text-brand-900">
        <QueryProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </QueryProvider>
      </body>
    </html>
  );
}
