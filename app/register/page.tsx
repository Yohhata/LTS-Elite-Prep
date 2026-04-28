"use client";

import { useState, useEffect } from "react";
import { ArrowRight, CheckCircle2, Zap, Calendar } from "lucide-react";
import Link from "next/link";

function useReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.1 }
    );
    document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}

export default function RegisterPage() {
  useReveal();

  const OPTIONS = [
    {
      id: "drop-in",
      name: "Single Drop-in",
      price: "$75",
      desc: "Perfect for a single high-intensity trial session.",
      features: ["2-Hour Session", "Pro Coaching", "Full Facility Access"],
      cta: "GET DROP-IN",
      highlight: false,
      href: "/book?program=futures"
    },
    {
      id: "pass-5",
      name: "5-Session Pass",
      price: "$299",
      desc: "Our most flexible option for consistent growth.",
      features: ["5 Sessions Included", "Flexible Scheduling", "Priority Booking", "Performance Tracking"],
      cta: "GET 5-PASS",
      highlight: true,
      href: "/book?program=pass-5"
    },
    {
      id: "pass-10",
      name: "10-Session Pass",
      price: "$449",
      desc: "The elite choice for serious athletes committed to results.",
      features: ["10 Sessions Included", "Maximum Value", "1-on-1 Consultation", "Video Analysis Support"],
      cta: "GET 10-PASS",
      highlight: false,
      href: "/book?program=pass-10"
    },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] pt-32 pb-20 px-5">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16 reveal">
          <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight mb-6 uppercase">
            CHOOSE YOUR <span className="text-white">PATH</span>
          </h1>
          <p className="text-white/40 text-lg max-w-xl mx-auto">
            Select a training pass to begin your development journey.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {OPTIONS.map((opt, i) => (
            <div
              key={opt.id}
              style={{ transitionDelay: `${i * 100}ms` }}
              className={`reveal relative flex flex-col p-8 rounded-3xl border transition-all duration-500
                ${opt.highlight 
                  ? "bg-white text-black border-white scale-105 z-10 shadow-2xl shadow-white/10" 
                  : "bg-[#111] text-white border-white/10 hover:border-white/20"}`}
            >
              {opt.highlight && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] font-black tracking-[0.2em] px-4 py-1.5 rounded-full uppercase">
                  Most Popular
                </div>
              )}

              <div className="mb-8">
                <h3 className="text-2xl font-black mb-2 uppercase">{opt.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black">{opt.price}</span>
                  <span className={opt.highlight ? "text-black/50" : "text-white/30"}>/total</span>
                </div>
              </div>

              <div className="flex-1 space-y-4 mb-10">
                {opt.features.map((f) => (
                  <div key={f} className="flex items-center gap-3">
                    <CheckCircle2 className={`w-5 h-5 ${opt.highlight ? "text-black" : "text-white/40"}`} />
                    <span className="text-sm font-bold uppercase tracking-wider">{f}</span>
                  </div>
                ))}
              </div>

              <Link
                href={opt.href}
                className={`w-full py-5 rounded-2xl font-black text-center transition-all active:scale-95 flex items-center justify-center gap-2
                  ${opt.highlight 
                    ? "bg-black text-white hover:bg-black/90" 
                    : "bg-white text-black hover:bg-white/90"}`}
              >
                {opt.cta}
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center reveal">
          <p className="text-white/20 text-sm">
            All passes are valid for both LTS Futures and LTS High programs. 
            Questions? <Link href="/contact" className="text-white underline">Contact us</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}
