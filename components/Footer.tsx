// ============================================================
// フッター (components/Footer.tsx)
// Warm & community-driven — Instagram prominent
// ============================================================

import Link from "next/link";
import Image from "next/image";

const BRAND = {
  badge: "LTS",
  name: "Elite Prep",
  tagline:
    "Vancouver's community-driven basketball development academy — training the next generation with passion and purpose.",
};

const CONTACT = {
  email: "info@ltseliteprep.ca",
  location: "Vancouver, BC, Canada",
  instagramUrl: "https://www.instagram.com/lts_elite_prep/",
  instagramHandle: "@lts_elite_prep",
};

const FOOTER_LINKS = [
  { href: "/", label: "Home" },
  { href: "/programs", label: "Programs" },
  { href: "/about", label: "About" },
  { href: "/micro-academy", label: "TRAIN NOW" },
  { href: "/schedule", label: "Schedule" },
  { href: "/admin", label: "Admin" },
];

export default function Footer() {
  return (
    <footer className="bg-[#060606] border-t border-white/5 py-14">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        {/* 3カラム */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 mb-10">
          {/* ブランド */}
          <div>
            <Link
              href="/"
              className="flex items-center gap-2.5 mb-5 w-fit group"
            >
              <Image 
                src="/logo/logo1.png" 
                alt="LTS Elite Prep" 
                width={240} 
                height={80} 
                className="h-14 sm:h-20 w-auto object-contain opacity-80 group-hover:opacity-100 transition-opacity" 
              />
            </Link>
            <p className="text-white/40 text-sm leading-relaxed max-w-xs">
              {BRAND.tagline}
            </p>
            {/* Instagram リンク */}
            <a
              href={CONTACT.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-5
                         text-sm text-white/40 hover:text-[#F97316] transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
              {CONTACT.instagramHandle}
            </a>
          </div>

          {/* ページリンク */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-white/25 mb-5">
              Navigate
            </p>
            <ul className="space-y-3">
              {FOOTER_LINKS.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm text-white/40 hover:text-white transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 連絡先 */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-white/25 mb-5">
              Contact
            </p>
            <ul className="space-y-3 text-sm text-white/40">
              <li>
                <a
                  href={`mailto:${CONTACT.email}`}
                  className="hover:text-white transition-colors"
                >
                  {CONTACT.email}
                </a>
              </li>
              <li>{CONTACT.location}</li>
            </ul>
          </div>
        </div>

        {/* コピーライト */}
        <div
          className="border-t border-white/5 pt-6
                     flex flex-col sm:flex-row justify-between gap-2
                     text-xs text-white/20"
        >
          <p>
            © {new Date().getFullYear()} LTS Elite Prep. All rights reserved.
          </p>
          <p>Built with ❤️ in Vancouver</p>
        </div>
      </div>
    </footer>
  );
}
