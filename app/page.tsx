// ============================================================
// トップページ (app/page.tsx) — "Community & Growth" デザイン
//
// 親しみやすく・温かみのある・カジュアルなデザインに刷新
// - 暖色アクセント（オレンジ）
// - より会話的なコピー
// - Instagram フィード埋め込み
// - コーチの顔が見えるセクション
// ============================================================

"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Users, Trophy, Calendar, Star } from "lucide-react";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CONTENT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const HERO = {
  badge: "MICRO-ACADEMY SESSIONS NOW OPEN",
  heading: ["TRAIN.", "LEARN.", "COMPETE."],
  subtext:
    "Small groups. High intent. Flexibility. The premium basketball experience in Vancouver. Register for a pass, pay later.",
  primaryBtn: "TRAIN NOW",
  secondaryBtn: "View Schedule",
};

const TICKER = [
  "LTS FUTURES",
  "LTS HIGH",
  "LTS COLLEGE",
  "VANCOUVER BC",
  "#PACT",
  "COMMUNITY",
  "GROWTH",
];

const STATS = [
  { value: "200+", label: "Athletes Trained", icon: Users },
  { value: "3", label: "Programs", icon: Trophy },
  { value: "5+", label: "Years Running", icon: Calendar },
  { value: "4.9", label: "Rating", icon: Star },
];

const PROGRAMS = [
  {
    id: "micro-academy",
    name: "Micro Academy",
    tagline: "Ages 8-18 Development",
    badge: "Combined Program",
    featured: true,
    desc: "The foundation of LTS development. We combine fundamental skill building with high-intensity competitive play for athletes aged 8-18.",
    features: [
      "Fundamental & Advanced Skills",
      "Competitive Small Group Play",
      "Court IQ & Video Analysis",
      "Professional Coaching",
    ],
    href: "/book",
    cta: "TRAIN NOW",
  },
  {
    id: "college",
    name: "LTS College",
    tagline: "College-Level Athletes",
    badge: "Elite Only",
    desc: "High-intensity training for players ready to compete at the next level. No shortcuts. Specialized for recruitment.",
    features: [
      "Elite-level conditioning",
      "Position-specific training",
      "Recruiting & Film support",
      "Data-driven tracking",
    ],
    href: "/college-contact",
    cta: "INQUIRE NOW",
  },
];

const PACT = [
  {
    letter: "P",
    word: "Purposeful",
    desc: "Every rep, every drill — done with intention.",
  },
  {
    letter: "A",
    word: "Alert",
    desc: "Stay present, read the game, make smart decisions.",
  },
  {
    letter: "C",
    word: "Conscious",
    desc: "Understand your body, your game, your growth.",
  },
  {
    letter: "T",
    word: "Technical",
    desc: "Precision and craft in every aspect of your game.",
  },
];

const COACHES = [
  {
    name: "Paolo Labrador",
    role: "Head Coach & Founder",
    bio: "Douglas College Royals MBB Asst. Coach · Magee Secondary Head Coach. “It is my personal mission to ensure that my athletes achieve their goals”",
    photo: "/images/DSC03301.jpg",
    initial: "PL",
    imageClass: "object-cover object-top scale-[1.1] origin-top",
  },
  {
    name: "Mikyle Malabuyoc",
    role: "Coach",
    bio: "",
    photo: "/images/mikyle-new.jpg",
    initial: "MM",
    imageClass: "object-cover object-top scale-[1.45] origin-top",
  },
  {
    name: "Thomas Manganini",
    role: "Coach",
    bio: "",
    photo: "/images/IMG_1872.webp",
    initial: "TM",
    imageClass: "object-cover object-top scale-[1.0]",
  },
  {
    name: "Enrique Garcia",
    role: "Coach",
    bio: "",
    photo: "/images/enrique-new.jpg",
    initial: "EG",
    imageClass: "object-cover object-top",
  },
];

const TESTIMONIALS = [
  {
    quote:
      "IMPROVED NOT JUST STRICT BAG AND SKILL WORK BUT BOTH OFF BALL MOVEMENT AND PASSING. BEING ABLE TO READ DEFENSES WHILE PLAYING THROUGH CONTACT. WORKING AGAINST MULTIPLE DEFENDERS GUARDING ME AT ONCE TO MAKE A READ AND BE ABLE TO SCORE WHILE DOUBLE TEAMED TO MAKE IN GAME SITUATIONS EASIER AND SLOWS DOWN THE GAME WHEN IN HIGH PRESSURE SITUATIONS.",
    author: "Andres Garcia",
    role: "UPREP CANADA, Vancouver College 2025",
    stars: 5,
  },
  {
    quote:
      "VERY HIGH LEVEL SKILLS TRAINING. ALSO IMPROVING PHYSICAL AND MENTAL ASPECTS OF THE GAME THROUGHOUT DRILLS THAT INCLUDE REAL GAME LIKE SCENARIOS. CONDITIONING AT LTS HAS ALSO BEEN A KEY PART OF GROWTH THIS SUMMER. THROUGHOUT MY TRAINING SESSIONS WITH LTS I AM CONFIDENT ENOUGH TO SAY THAT I HAVE GROWN BOTH MENTALLY AND PHYSICALLY THROUGHOUT THE GAME OF BASKETBALL.",
    author: "Vincent Velasquez",
    role: "Vancouver College / University of the Fraser Valley",
    stars: 5,
  },
  {
    quote:
      "I MET COACH PAOLO THROUGH THE BASKETBALL COMMUNITY. HIS TRAINING HELPED ME IMPROVE IN ALL ASPECTS OF THE GAME. COACH PAOLO SHOWED CARE FOR EVERY LITTLE DETAIL AND MADE SURE TO KEEP ME RIGHT DURING MY OFF SEASON BEFORE COLLEGE BASKETBALL.",
    author: "Justin Pamintuan",
    role: "Byrne Creek / Capilano University",
    stars: 5,
  },
];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// スクロール reveal hook
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

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

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ページ本体
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export default function Home() {
  useReveal();
  return (
    <>
      <HeroSection />
      <TickerSection />
      <StatsSection />
      <ProgramsSection />
      <PactSection />
      <CoachesSection />
      <TestimonialsSection />
      <CtaSection />
    </>
  );
}

// ── セクションラベル ──────────────────────────────────────────
function SectionLabel({ text }: { text: string }) {
  return (
    <span
      className="inline-flex items-center gap-2
                 text-xs font-semibold tracking-widest uppercase
                 border border-white/20 text-white/70
                 rounded-full px-3.5 py-1.5 mb-5"
    >
      <span className="w-1.5 h-1.5 rounded-full bg-white/50" />
      {text}
    </span>
  );
}

// ── ヒーロー ──────────────────────────────────────────────────
function HeroSection() {
  return (
    <section className="relative min-h-[100svh] flex items-center overflow-hidden">
      {/* 背景写真 */}
      <Image
        src="/images/DSC00881.jpg"
        alt="Basketball training at LTS Elite Prep"
        fill
        priority
        className="object-cover opacity-30"
        sizes="100vw"
      />

      {/* gradient overlay with warm tint */}
      {/* gradient overlay with white tint */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/5 via-black/60 to-[#0a0a0a]" />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-5 sm:px-8 pt-28 pb-20">
        {/* Badge */}
        <div className="opacity-0 animate-fade-up delay-100">
          <SectionLabel text={HERO.badge} />
        </div>

        {/* Heading */}
        <h1
          className="font-extrabold tracking-tight leading-[0.95] mb-8
                     text-5xl sm:text-6xl md:text-7xl xl:text-8xl
                     opacity-0 animate-fade-up delay-200"
        >
          {HERO.heading.map((line, i) => (
            <span key={i} className="block text-white">
              {i === 1 ? (
                <em className="text-white/40 not-italic">{line}</em>
              ) : (
                line
              )}
            </span>
          ))}
        </h1>

        {/* Subtext */}
        <p
          className="text-white/50 text-lg sm:text-xl max-w-xl leading-relaxed mb-10
                     opacity-0 animate-fade-up delay-300"
        >
          {HERO.subtext}
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 opacity-0 animate-fade-up delay-500">
          <Link
            href="/book"
            className="group flex items-center justify-center gap-2
                       btn-accent font-black text-lg
                       px-10 py-5 rounded-2xl active:scale-95"
          >
            {HERO.primaryBtn}
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link
            href="/schedule"
            className="flex items-center justify-center
                       border border-white/15 hover:border-white/30
                       hover:bg-white/5 text-white font-black text-lg
                       px-10 py-5 rounded-2xl transition-all"
          >
            {HERO.secondaryBtn}
          </Link>
        </div>
      </div>
    </section>
  );
}

// ── ティッカー ────────────────────────────────────────────────
function TickerSection() {
  return (
    <div className="border-y border-white/5 bg-[#060606] py-4 overflow-hidden">
      <div className="flex animate-marquee whitespace-nowrap">
        {[0, 1].map((i) => (
          <span key={i} className="flex gap-16 mr-16">
            {TICKER.map((item) => (
              <span
                key={item}
                className="text-xs font-bold tracking-[0.25em] text-white/15"
              >
                {item}
                <span className="ml-16 text-[#ffffff]/20">●</span>
              </span>
            ))}
          </span>
        ))}
      </div>
    </div>
  );
}

// ── Stats ────────────────────────────────────────────────────
function StatsSection() {
  return (
    <section className="py-16 bg-[#0a0a0a] border-b border-white/5">
      <div className="max-w-5xl mx-auto px-5 sm:px-8">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
          {STATS.map(({ value, label, icon: Icon }) => (
            <div key={label} className="reveal">
              <div className="flex justify-center mb-3">
                <div
                  className="w-10 h-10 rounded-xl bg-[#ffffff]/10
                              flex items-center justify-center"
                >
                  <Icon className="w-5 h-5 text-[#ffffff]" />
                </div>
              </div>
              <p className="text-3xl sm:text-4xl font-extrabold text-white mb-1">
                {value}
              </p>
              <p className="text-xs font-semibold uppercase tracking-widest text-white/30">
                {label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Programs ─────────────────────────────────────────────────
function ProgramsSection() {
  return (
    <section id="programs" className="py-24 lg:py-32 bg-[#0a0a0a]">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <div className="mb-14 reveal text-center">
          <SectionLabel text="Programs" />
          <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
            Find Your Level
          </h2>
          <p className="text-white/40 mt-3 max-w-lg mx-auto">
            Programs built for where you are — and where you want to go.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start max-w-5xl mx-auto">
          {PROGRAMS.map((program, i) => (
            <div
              key={program.id}
              style={{ transitionDelay: `${i * 80}ms` }}
              className={`reveal card relative rounded-2xl p-7 flex flex-col transition-all duration-500
                          ${program.featured
                  ? "md:scale-105 md:z-10 bg-white text-black shadow-2xl"
                  : "bg-[#111] border border-white/5 text-white hover:border-white/20"
                }`}
            >
              {/* Badge */}
              <div className="mb-6">
                <span
                  className={`text-[10px] font-black tracking-[0.2em] uppercase px-3 py-1.5 rounded-full border
                    ${program.featured 
                      ? "bg-black text-white border-black" 
                      : "bg-white/5 text-white/40 border-white/10"}`}
                >
                  {program.badge}
                </span>
              </div>

              <h3 className="text-3xl font-extrabold mb-1">{program.name}</h3>
              <p className={`text-sm font-bold mb-4 uppercase tracking-wide ${program.featured ? 'text-black/40' : 'text-white/30'}`}>
                {program.tagline}
              </p>
              <p className={`text-sm leading-relaxed mb-8 ${program.featured ? 'text-black/60' : 'text-white/50'}`}>
                {program.desc}
              </p>

              <ul className="space-y-2.5 mb-8 flex-1">
                {program.features.map((f) => (
                  <li
                    key={f}
                    className={`flex items-center gap-2.5 text-sm ${program.featured ? 'text-black/80' : 'text-white/60'}`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${program.featured ? 'bg-black/20' : 'bg-white/20'}`} />
                    {f}
                  </li>
                ))}
              </ul>

              {program.id === "micro-academy" ? (
                <div className="space-y-3 mt-6">
                  <Link
                    href="/book?program=pass-5"
                    className={`block text-center font-black py-4 rounded-xl text-sm transition-all
                      ${program.featured
                        ? "border border-black/15 hover:border-black/30 hover:bg-black/5 text-black"
                        : "border border-white/10 hover:border-white/30 hover:bg-white/5 text-white"
                      }`}
                  >
                    5-DAY PASS ($299)
                  </Link>
                  <Link
                    href="/book?program=pass-10"
                    className={`block text-center font-black py-4 rounded-xl text-sm transition-all
                      ${program.featured
                        ? "bg-black text-white hover:bg-black/90 shadow-xl"
                        : "bg-white text-black hover:bg-white/90 shadow-xl"
                      }`}
                  >
                    10-DAY PASS ($449)
                  </Link>
                  <Link
                    href="/book?program=pass-usage"
                    className={`block text-center font-bold py-2 rounded-xl text-xs transition-all uppercase tracking-wider
                      ${program.featured
                        ? "text-black/50 hover:text-black hover:underline"
                        : "text-white/40 hover:text-white hover:underline"
                      }`}
                  >
                    Already have a pass? Book here
                  </Link>
                </div>
              ) : (
                <Link
                  href={program.href}
                  className={`block text-center font-black py-4 rounded-xl
                             text-sm transition-all ${program.featured
                      ? "bg-black text-white hover:bg-black/90 shadow-xl"
                      : "border border-white/10 hover:border-white/30 hover:bg-white/5 text-white"
                    }`}
                >
                  {program.cta}
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── PACT Section ─────────────────────────────────────────────
function PactSection() {
  return (
    <section className="py-24 lg:py-32 bg-[#060606] border-y border-white/5">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left: Text */}
          <div className="reveal">
            <SectionLabel text="Our Philosophy" />
            <div className="w-10 h-10 bg-white flex items-center justify-center rotate-[-10deg]">
              <span className="text-black font-black text-sm tracking-tighter">LTS</span>
            </div>
            <div className="flex flex-col -gap-1">
              <span className="text-white font-black tracking-tighter text-2xl leading-none">ELITE</span>
              <span className="text-white/40 font-black tracking-tighter text-[10px] leading-none uppercase">Basketball Prep</span>
            </div>
            <p className="text-white/50 text-lg leading-relaxed mb-4">
              Every athlete at LTS Elite Prep makes a personal commitment — a
              PACT to their own development.
            </p>
            <p className="text-white/40 text-base leading-relaxed mb-8">
              It&rsquo;s not just about basketball. It&rsquo;s about discipline,
              growth, and becoming the best version of yourself — on and off the
              court.
            </p>
            <Link
              href="/book"
              className="inline-flex items-center gap-2
                         bg-white text-black font-bold px-6 py-3 rounded-xl text-sm
                         group"
            >
              Make Your PACT
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Right: PACT cards */}
          <div className="grid grid-cols-2 gap-4">
            {PACT.map(({ letter, word, desc }, i) => (
              <div
                key={letter}
                style={{ transitionDelay: `${i * 60}ms` }}
                className="reveal card card-warm bg-[#111] border border-white/7 rounded-2xl p-6"
              >
                <span
                  className="text-5xl font-extrabold leading-none
                             text-white"
                >
                  {letter}
                </span>
                <p className="font-extrabold text-lg mt-2 mb-1">{word}</p>
                <p className="text-white/40 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Coaches ──────────────────────────────────────────────────
function CoachesSection() {
  return (
    <section className="py-24 lg:py-32 bg-[#0a0a0a]">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <div className="mb-14 reveal text-center">
          <SectionLabel text="The Team" />
          <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
            Coaches Who&rsquo;ve <span className="text-white">Been There</span>
          </h2>
          <p className="text-white/40 mt-3 max-w-lg mx-auto">
            Real players turned real coaches. They know what it takes.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {COACHES.map((coach, i) => (
            <div
              key={coach.name}
              style={{ transitionDelay: `${i * 80}ms` }}
              className="reveal card card-warm bg-[#0f0f0f] border border-white/10 rounded-2xl overflow-hidden"
            >
              <div className="relative aspect-[4/5] bg-[#111] flex items-center justify-center overflow-hidden">
                {coach.photo ? (
                  <Image
                    src={coach.photo}
                    alt={coach.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 25vw"
                    className={coach.imageClass || "object-cover object-top"}
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-extrabold text-white/10 uppercase">
                      {coach.initial}
                    </span>
                  </div>
                )}
              </div>

              <div className="p-6">
                <h3 className="font-extrabold text-xl">{coach.name}</h3>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 mt-1 mb-4">
                  {coach.role}
                </p>
                {coach.bio && (
                  <p className="text-white/60 text-xs leading-relaxed line-clamp-3">
                    {coach.bio}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Testimonials ─────────────────────────────────────────────
function TestimonialsSection() {
  return (
    <section className="py-24 bg-[#060606] border-t border-white/5">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <div className="mb-12 reveal text-center">
          <SectionLabel text="What Players Say" />
          <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
            Straight From the Athletes
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {TESTIMONIALS.map(({ quote, author, role, stars }, i) => (
            <div
              key={author}
              style={{ transitionDelay: `${i * 80}ms` }}
              className="reveal card card-warm bg-[#111] border border-white/7 rounded-2xl p-7"
            >
              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: stars }).map((_, j) => (
                  <Star
                    key={j}
                    className="w-4 h-4 text-[#ffffff] fill-[#ffffff]"
                  />
                ))}
              </div>

              <p className="text-white/60 text-sm leading-relaxed mb-6">
                &ldquo;{quote}&rdquo;
              </p>

              <div>
                <p className="font-bold text-sm">{author}</p>
                <p className="text-xs text-white/30 mt-0.5">{role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Instagram Feed ───────────────────────────────────────────


// ── CTA Banner ───────────────────────────────────────────────
function CtaSection() {
  return (
    <section className="py-32 bg-[#0a0a0a] relative overflow-hidden">
      {/* Warm glow */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2
                   w-[800px] h-[400px] bg-[#ffffff]/5
                   rounded-full blur-[120px] pointer-events-none"
      />

      <div className="relative max-w-4xl mx-auto px-5 text-center reveal">
        <SectionLabel text="Get Started" />

        <h2 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight mb-6">
          Ready to
          <br />
          <span className="gradient-text">Level Up?</span>
        </h2>

        <p className="text-white/40 text-lg mb-10 max-w-xl mx-auto">
          Your first session is on us. Come out, meet the coaches, and see what
          LTS is about. No commitment, no pressure.
        </p>

        <Link
          href="/book"
          className="inline-flex items-center gap-3
                     btn-accent font-black text-xl
                     px-12 py-6 rounded-2xl active:scale-95 group"
        >
          TRAIN NOW
          <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
        </Link>

        <p className="text-white/20 text-sm mt-8 font-bold tracking-widest">
          REGISTER FOR A PASS · PAY LATER
        </p>
      </div>
    </section>
  );
}
