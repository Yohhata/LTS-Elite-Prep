// ============================================================
// プログラム詳細ページ (app/programs/page.tsx)
// 各コースの詳細・対象年齢・スケジュールの明示
// ============================================================

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Clock,
  Users,
  MapPin,
  Calendar,
  Dumbbell,
  Film,
  Brain,
  Target,
  Zap,
  Shield,
  BarChart3,
  GraduationCap,
} from "lucide-react";

// ── スクロールアニメ ──────────────────────────────────────────
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

// ── データ ────────────────────────────────────────────────────

const PROGRAMS = [
  {
    id: "futures",
    name: "LTS Futures",
    tagline: "Youth Development",
    emoji: "🌱",
    ages: "Ages 8 – 14",
    schedule: "Saturdays · 10:00 AM – 12:00 PM",
    location: "Vancouver, BC",
    groupSize: "8 – 12 athletes",
    price: "Contact for pricing",
    color: "from-green-500/20 to-emerald-500/10",
    borderColor: "border-green-500/20",
    desc: "The foundation. We make basketball fun while building real skills that will carry players for life. Perfect for young athletes just getting started or looking to take their game to the next level.",
    features: [
      { icon: Target, text: "Dribbling, passing & shooting fundamentals" },
      { icon: Users, text: "Small group sessions (max 12)" },
      { icon: Brain, text: "Basketball IQ & court awareness" },
      { icon: Zap, text: "Fun, high-energy drills & games" },
    ],
    details: [
      "Focus on building confidence and love for the game",
      "Age-appropriate skill progressions",
      "Regular 1-on-1 attention from coaches",
      "End-of-session scrimmages",
    ],
  },
  {
    id: "high",
    name: "LTS High",
    tagline: "High School Elite",
    emoji: "🔥",
    ages: "Ages 14 – 18",
    schedule: "Tuesdays & Thursdays · 5:00 PM – 7:00 PM",
    location: "Vancouver, BC",
    groupSize: "10 – 16 athletes",
    price: "Contact for pricing",
    color: "from-[#F97316]/20 to-orange-500/10",
    borderColor: "border-[#F97316]/20",
    featured: true,
    desc: "Where good players become great. We push you harder, film your reps, and build the competitive edge you need. This is our most popular program for a reason.",
    features: [
      { icon: Dumbbell, text: "Advanced skill & strength training" },
      { icon: Film, text: "Video analysis & personalized feedback" },
      { icon: Shield, text: "Competitive 5v5 scrimmages" },
      { icon: GraduationCap, text: "College prep guidance & exposure" },
    ],
    details: [
      "Positional breakdown sessions",
      "Mental toughness & leadership training",
      "Guest coaches & pro player clinics",
      "Highlight reel creation support",
    ],
  },
  {
    id: "college",
    name: "LTS College",
    tagline: "College Prep",
    emoji: "🎯",
    ages: "Ages 17 – 22",
    schedule: "Mon, Wed, Fri · 6:00 PM – 8:00 PM",
    location: "Vancouver, BC",
    groupSize: "6 – 10 athletes",
    price: "Contact for pricing",
    color: "from-blue-500/20 to-indigo-500/10",
    borderColor: "border-blue-500/20",
    desc: "High-intensity training for players ready to compete at the university level and beyond. No shortcuts — just relentless improvement.",
    features: [
      { icon: BarChart3, text: "Data-driven performance tracking" },
      { icon: Target, text: "Position-specific advanced training" },
      { icon: Brain, text: "Film study & tactical analysis" },
      { icon: GraduationCap, text: "Recruiting support & video reels" },
    ],
    details: [
      "University-level conditioning programs",
      "1-on-1 mentoring from former college players",
      "Connection to scouting networks",
      "Mental performance coaching",
    ],
  },
];

const PRIVATE = {
  name: "1-on-1 Private Training",
  emoji: "⚡",
  desc: "Personalized sessions tailored to your specific needs. Work on weaknesses, amplify strengths, and accelerate your development with dedicated coaching attention.",
  features: [
    "Fully customized training plan",
    "Flexible scheduling",
    "Video analysis included",
    "Progress tracking & goals",
  ],
};

// ── ヘルパー ──────────────────────────────────────────────────

function InfoPill({ icon: Icon, text }: { icon: any; text: string }) {
  return (
    <div className="flex items-center gap-2 text-white/50 bg-white/5 px-3 py-1.5 rounded-lg text-sm">
      <Icon className="w-4 h-4" />
      {text}
    </div>
  );
}

// ── ページ本体 ────────────────────────────────────────────────

export default function ProgramsPage() {
  useReveal();

  return (
    <div className="min-h-screen bg-[#0a0a0a] pt-28 pb-24">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        {/* Header */}
        <div className="text-center mb-20 reveal">
          <span
            className="inline-flex items-center gap-2
                       text-xs font-semibold tracking-widest uppercase
                       border border-white/10 text-white/50
                       rounded-full px-3.5 py-1.5 mb-5"
          >
            Our Programs
          </span>
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight mb-4">
            Find Your <span className="text-white">Level</span>
          </h1>
          <p className="text-white/40 text-lg max-w-xl mx-auto">
            Three programs built for where you are — and where you want to go.
            Join the team today.
          </p>
        </div>

        {/* Hero Photo Banner */}
        <div className="relative w-full h-64 sm:h-80 rounded-3xl overflow-hidden mb-20 reveal border border-white/5">
          <Image
            src="/images/SBU02221.jpg"
            alt="Basketball dribble training at LTS"
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/30 to-transparent" />
          <div className="absolute bottom-6 left-8">
            <p className="text-white/70 text-sm font-semibold">Training Session · Vancouver, BC</p>
          </div>
        </div>

        {/* Program Cards */}
        <div className="space-y-16">
          {PROGRAMS.map((program, i) => (
            <div
              key={program.id}
              style={{ transitionDelay: `${i * 100}ms` }}
              className={`reveal bg-[#111] border ${program.borderColor || "border-white/7"}
                          rounded-3xl overflow-hidden`}
            >
              {/* Featured badge */}
              {"featured" in program && program.featured && (
                <div
                  className="bg-white text-black text-center text-xs font-extrabold
                              tracking-widest uppercase py-2"
                >
                  Most Popular Program
                </div>
              )}

              <div className="p-8 sm:p-10 lg:p-12">
                {/* Top: Name + Age + Price */}
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 mb-8">
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <h2 className="text-3xl sm:text-4xl font-extrabold">
                        {program.name}
                      </h2>
                    </div>
                    <p className="text-white/50 text-lg">{program.tagline}</p>
                  </div>

                  <div className="flex flex-wrap gap-3 lg:flex-col lg:items-end">
                    <InfoPill icon={Users} text={program.ages} />
                    <InfoPill icon={Clock} text={program.schedule} />
                    <InfoPill icon={MapPin} text={program.location} />
                    <InfoPill icon={Users} text={program.groupSize} />
                  </div>
                </div>

                {/* Description */}
                <p className="text-white/50 leading-relaxed mb-8 max-w-3xl">
                  {program.desc}
                </p>

                {/* Features Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                  {program.features.map(({ icon: Icon, text }) => (
                    <div
                      key={text}
                      className="flex items-center gap-3 bg-white/3 border border-white/5
                                 rounded-xl px-4 py-3"
                    >
                      <div
                        className="w-8 h-8 rounded-lg bg-white/5
                                    flex items-center justify-center shrink-0"
                      >
                        <Icon className="w-4 h-4 text-white/50" />
                      </div>
                      <span className="text-sm text-white/70">{text}</span>
                    </div>
                  ))}
                </div>

                {/* Details */}
                <div className="bg-white/2 border border-white/5 rounded-xl p-5 mb-8">
                  <p className="text-xs font-bold uppercase tracking-widest text-white/25 mb-3">
                    What&rsquo;s Included
                  </p>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {program.details.map((d) => (
                      <li
                        key={d}
                        className="flex items-center gap-2 text-sm text-white/50"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-white/20 shrink-0" />
                        {d}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* CTA */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    href={program.id === 'college' ? '/college-contact' : `/book?program=${program.id}`}
                    className="btn-accent inline-flex items-center justify-center gap-2
                               font-bold px-8 py-3.5 rounded-xl group"
                  >
                    {program.id === 'college' ? 'INQUIRE NOW' : 'TRAIN NOW'}
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <span className="text-sm text-white/30 flex items-center">
                    {program.price}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Private Training */}
        <div className="mt-16 reveal">
          <div
            className="bg-[#111] border border-white/7 rounded-3xl p-8 sm:p-10
                        text-center max-w-3xl mx-auto"
          >
            <h2 className="text-3xl font-extrabold mb-3">{PRIVATE.name}</h2>
            <p className="text-white/50 leading-relaxed mb-6 max-w-lg mx-auto">
              {PRIVATE.desc}
            </p>
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              {PRIVATE.features.map((f) => (
                <span
                  key={f}
                  className="text-xs font-semibold border border-white/10
                             text-white/50 rounded-full px-3 py-1.5"
                >
                  {f}
                </span>
              ))}
            </div>
            <Link
              href="/book?program=private"
              className="btn-accent inline-flex items-center gap-2
                         font-bold px-8 py-3.5 rounded-xl group"
            >
              Inquire About Private Training
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>



        {/* FAQ-style note */}
        <div className="mt-16 text-center reveal">
          <p className="text-white/30 text-sm">
            Not sure which program is right for you?{" "}
            <Link href="/book" className="text-white hover:underline">
              Contact us
            </Link>{" "}
            and we&rsquo;ll help you find the perfect fit.
          </p>
        </div>
      </div>
    </div>
  );
}


