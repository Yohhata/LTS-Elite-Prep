// ============================================================
// ナビゲーションバー (components/Navbar.tsx)
// カジュアル・フレンドリーなデザインに刷新
// ============================================================

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";

const LOGO = {
  badge: "LTS",
  name: "Elite Prep",
};

const NAV_LINKS = [
  { href: "/programs", label: "Programs" },
  { href: "/about", label: "About" },
  { href: "/book", label: "Book" },
  { href: "/college-contact", label: "College" },
  { href: "/admin", label: "Admin" },
];

const CTA = {
  href: "/book",
  label: "TRAIN NOW",
};

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`
        fixed inset-x-0 top-0 z-50 transition-all duration-500 nav-glass
        ${scrolled
          ? "bg-[#0a0a0a]/90 border-b border-white/5 py-0"
          : "bg-transparent border-b border-transparent py-1"}
      `}
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8
                      flex items-center justify-between h-16 md:h-20">

        {/* ── ロゴ ── */}
        <Link href="/" onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2.5 group">
          <Image 
            src="/logo/logo1.png" 
            alt="LTS Elite Prep" 
            width={240} 
            height={80} 
            className="h-12 sm:h-16 w-auto object-contain transition-transform duration-300 group-hover:scale-[1.02]" 
            priority
          />
        </Link>

        {/* ── デスクトップナビ ── */}
        <nav className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map(({ href, label }) => (
            <Link key={href} href={href}
                  className="text-sm font-medium text-white/50
                             hover:text-white transition-colors tracking-wide
                             relative after:absolute after:bottom-[-4px] after:left-0
                             after:w-0 after:h-[2px] after:bg-white
                             after:transition-all after:duration-300
                             hover:after:w-full">
              {label}
            </Link>
          ))}
          <Link href={CTA.href}
                className="bg-white text-black font-black text-sm
                           px-6 py-3 rounded-xl active:scale-95 transition-all
                           hover:bg-white/90 hover:scale-105">
            {CTA.label}
          </Link>
        </nav>

        {/* ── モバイルハンバーガー ── */}
        <button
          className="md:hidden p-2 text-white/50 hover:text-white transition-colors relative z-50"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* ── モバイルドロワー ── */}
      <div className={`
        md:hidden overflow-hidden transition-all duration-300
        bg-[#0a0a0a]/98 nav-glass border-b border-white/5
        ${menuOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0 pointer-events-none"}
      `}>
        <nav className="flex flex-col px-5 pt-2 pb-8 gap-1">
          {NAV_LINKS.map(({ href, label }) => (
            <Link key={href} href={href}
                  onClick={() => setMenuOpen(false)}
                  className="py-4 text-white/50 hover:text-white font-medium
                             transition-colors border-b border-white/5 last:border-0">
              {label}
            </Link>
          ))}
          <Link href={CTA.href}
                onClick={() => setMenuOpen(false)}
                className="mt-6 btn-accent font-black py-4 rounded-xl
                           text-center text-black">
            {CTA.label}
          </Link>
        </nav>
      </div>
    </header>
  );
}
