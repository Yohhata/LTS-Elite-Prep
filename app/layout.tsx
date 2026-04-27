// ============================================================
// ルートレイアウト (app/layout.tsx)
// Syne (headings) + Inter (body) — Community & Growth デザイン
// ============================================================

import type { Metadata } from "next";
import { Anton, Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// ── SEO ──────────────────────────────────────────────────────
export const metadata: Metadata = {
  title: "LTS Elite Prep | Basketball Development in Vancouver",
  description:
    "Vancouver's premium basketball development program. Programs for ages 8–22 — Futures, High, and College. Book your session today!",
  keywords: "basketball training, Vancouver, youth basketball, college prep, LTS Elite Prep",
  openGraph: {
    title: "LTS Elite Prep | Basketball Development",
    description: "Train with coaches who've been there. Book your session today.",
    type: "website",
    locale: "en_CA",
  },
};

// フォント設定
const anton = Anton({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-anton",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-inter",
});

// ── レイアウト ────────────────────────────────────────────────
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${anton.variable} ${inter.variable}`}>
      <body className="min-h-screen flex flex-col bg-[#000000] text-white">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
