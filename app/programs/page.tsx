"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Clock,
  Users,
  MapPin,
  Check,
  Zap,
  Target,
  BarChart3,
  Brain,
  Shield,
} from "lucide-react";

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
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );
    const elements = document.querySelectorAll(".reveal");
    elements.forEach((el) => observer.observe(el));
    return () => {
      elements.forEach((el) => observer.unobserve(el));
      observer.disconnect();
    };
  }, []);
}

const PROGRAMS = [
  {
    id: "futures",
    name: "LTS Futures",
    tagline: "Youth Development (Ages 8–14)",
    desc: "The foundation. We make basketball fun while building real skills that will carry players for life. Perfect for young athletes looking to master the basics.",
    details: [
      "Mon, Wed, Fri 4:00 PM - 5:30 PM",
      "Focus on fundamentals & game IQ",
      "Skill-based small group training",
      "Professional coaching staff",
    ],
    featured: false,
  },
  {
    id: "high",
    name: "LTS High",
    tagline: "High School Elite (Ages 14–18)",
    desc: "Where good players become great. We push you harder, film your reps, and build the competitive edge you need to compete at the varsity level.",
    details: [
      "Mon, Wed, Fri 5:30 PM - 7:30 PM",
      "Advanced skills & video analysis",
      "High-intensity competitive prep",
      "College recruitment guidance",
    ],
    featured: true,
  },
];

const COLLEGE_DATA = {
  name: "LTS COLLEGE",
  tagline: "Post-Secondary Elite (Ages 17–22)",
  desc: "High-intensity training for post-secondary athletes looking to refine their craft and compete at the next level.",
  details: [
    "Mon, Wed, Fri 6:00 PM - 8:00 PM (Vancouver, BC)",
    "Position-specific technical mastery",
    "Elite-level conditioning & data tracking",
    "Tailored short-term & long-term planning",
  ],
};

export default function ProgramsPage() {
  useReveal();

  return (
    <div className="min-h-screen bg-[#000] pt-28 pb-24 text-white">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        {/* Header */}
        <div className="text-center mb-20 reveal">
          <span className="inline-block border border-white/10 px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase mb-6">
            Our Programs
          </span>
          <h1 className="text-6xl sm:text-7xl font-black tracking-tighter mb-4 italic uppercase">
            Elevate Your <span className="gradient-text">Game</span>
          </h1>
          <p className="text-white/40 text-lg max-w-xl mx-auto font-medium">
            Professional development paths for every stage of the basketball journey.
          </p>
        </div>

        {/* Futures & High Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-32">
          {PROGRAMS.map((p, i) => (
            <div
              key={p.id}
              className="reveal group relative bg-white/[0.03] border border-white/10 rounded-[2.5rem] p-10 hover:border-white/20 transition-all duration-500 overflow-hidden"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-10">
                  <div>
                    <h2 className="text-4xl font-black mb-2 italic uppercase leading-none">{p.name}</h2>
                    <p className="text-white/40 font-bold text-sm tracking-wide">{p.tagline}</p>
                  </div>
                  {p.featured && (
                    <span className="bg-white text-black px-3 py-1 rounded-full text-[9px] font-black tracking-widest uppercase">
                      Featured
                    </span>
                  )}
                </div>

                <p className="text-white/50 mb-10 text-lg leading-relaxed font-medium">
                  {p.desc}
                </p>

                <ul className="space-y-4 mb-12">
                  {p.details.map((detail, idx) => (
                    <li key={idx} className="flex items-center gap-3 text-white/70">
                      <Check className="w-4 h-4 text-white shrink-0" />
                      <span className="text-sm font-bold text-white/50">{detail}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href="/micro-academy"
                  className="btn-accent w-full py-4 rounded-2xl flex items-center justify-center gap-3 font-black text-sm tracking-widest transition-transform active:scale-[0.98]"
                >
                  TRAIN NOW
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Dedicated College Section */}
        <div className="reveal bg-white p-12 sm:p-20 rounded-[3rem] text-black relative overflow-hidden">
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="inline-block bg-black/5 px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase mb-6">
                Post-Secondary · Ages 17 – 22
              </span>
              <h2 className="text-7xl sm:text-8xl font-black tracking-tighter mb-8 italic uppercase leading-[0.85]">
                {COLLEGE_DATA.name}
              </h2>
              <p className="text-black/60 text-xl font-bold mb-12 leading-relaxed">
                {COLLEGE_DATA.desc}
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
                {COLLEGE_DATA.details.map((d, idx) => (
                  <div key={idx} className="flex gap-3 items-start">
                    <Zap className="w-5 h-5 text-black shrink-0 mt-0.5" />
                    <span className="text-sm font-black text-black/70 leading-tight uppercase tracking-tight">{d}</span>
                  </div>
                ))}
              </div>

              <Link
                href="/college"
                className="bg-black text-white px-10 py-5 rounded-2xl inline-flex items-center gap-4 font-black tracking-widest hover:bg-black/90 transition-all active:scale-[0.98]"
              >
                LEARN MORE & APPLY
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
            
            <div className="hidden lg:block relative">
              <div className="aspect-[4/5] bg-black/5 rounded-[3rem] border border-black/5 flex flex-col items-center justify-center p-12 text-center italic">
                <Target className="w-16 h-16 text-black/20 mb-8" />
                <p className="text-black/30 text-xl font-black leading-relaxed">
                  &ldquo;It is my personal mission to ensure that my athletes achieve their goals.&rdquo;
                </p>
                <p className="text-black/20 text-sm font-bold mt-4 uppercase tracking-widest">— Paolo Labrador</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
