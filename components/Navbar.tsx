"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";

const NAV_LINKS = [
  { href: "/programs", label: "Programs" },
  { href: "/college", label: "LTS College" },
  { href: "/about", label: "About" },
  { href: "/schedule", label: "Schedule" },
];

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
          ? "bg-[#000]/90 border-b border-white/5 py-0"
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
            className="h-10 sm:h-14 w-auto object-contain transition-transform duration-300 group-hover:scale-[1.02]" 
            priority
          />
        </Link>

        {/* ── デスクトップナビ ── */}
        <nav className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map(({ href, label }) => (
            <Link key={href} href={href}
                  className="text-[11px] font-black uppercase text-white/40
                             hover:text-white transition-colors tracking-[0.2em]
                             relative after:absolute after:bottom-[-4px] after:left-0
                             after:h-[2px] after:bg-white
                             after:w-0 after:transition-all after:duration-300
                             hover:after:w-full">
              {label}
            </Link>
          ))}
          <Link href="/book"
                className="bg-white text-black font-black text-xs tracking-widest uppercase
                           px-6 py-3.5 rounded-xl active:scale-95 transition-all
                           hover:bg-white/90">
            TRAIN NOW
          </Link>
        </nav>

        {/* ── モバイルハンバーガー ── */}
        <button
          className="md:hidden p-2 text-white/50 hover:text-white transition-colors"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* ── モバイルドロワー ── */}
      <div className={`
        md:hidden overflow-hidden transition-all duration-300
        bg-[#000]/98 nav-glass border-b border-white/5
        ${menuOpen ? "max-h-[500px]" : "max-h-0"}
      `}>
        <nav className="flex flex-col px-6 pt-2 pb-8 gap-2">
          {NAV_LINKS.map(({ href, label }) => (
            <Link key={href} href={href}
                  onClick={() => setMenuOpen(false)}
                  className="py-4 text-[10px] text-white/40 hover:text-white font-black tracking-widest uppercase
                             transition-colors border-b border-white/5 last:border-0">
              {label}
            </Link>
          ))}
          <Link href="/book"
                onClick={() => setMenuOpen(false)}
                className="mt-6 bg-white text-black font-black py-4 rounded-xl
                           text-center text-xs tracking-widest uppercase">
            TRAIN NOW
          </Link>
        </nav>
      </div>
    </header>
  );
}
