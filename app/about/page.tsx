// ============================================================
// アバウトページ (app/about/page.tsx)
// コーチの顔が見える・コミュニティ感のあるページ
// ============================================================

"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Heart, Users, Trophy, MapPin } from "lucide-react";

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

const STORY = {
  title: "Our Story",
  paragraphs: [
    "LTS Elite Prep started in 2020 with a simple idea: every young basketball player in Vancouver deserves access to quality coaching — not just the ones who can afford expensive academies.",
    "Founded by Paolo Labrador, LTS grew from weekend sessions at a local gym to one of Vancouver's most dedicated basketball development programs. We're not the biggest — but we're the most invested in every single athlete who walks through our doors.",
    "Our name says it all: Elite Prep. We prepare athletes not just for the next game, but for the next level — whether that's making the school team, earning a college scholarship, or simply falling in love with the sport.",
  ],
};

const PACT = [
  {
    letter: "P",
    word: "Purposeful",
    desc: "Every rep, every drill — done with intention. We don't waste time, and we don't let you waste yours.",
  },
  {
    letter: "A",
    word: "Alert",
    desc: "Stay present, read the game, make smart decisions. Basketball IQ is trained, not inherited.",
  },
  {
    letter: "C",
    word: "Conscious",
    desc: "Understand your body, your game, your growth. Self-awareness is the foundation of improvement.",
  },
  {
    letter: "T",
    word: "Technical",
    desc: "Precision and craft in every aspect of your game. We obsess over the details because details win games.",
  },
];

const COACHES = [
  {
    name: "Paolo Labrador",
    role: "Founder & Head Coach",
    bio: "Paolo is the heart and soul of LTS Elite Prep. As an Assistant Coach at Douglas College and Head Coach at Magee Secondary, he brings competitive coaching experience combined with a genuine, personal investment in every athlete's growth. He built LTS because he believes that passionate, purposeful coaching shouldn't be a luxury.",
    photo: "/images/DSC03301.jpg",
    initial: "PL",
    imageClass: "object-cover object-top scale-[1.1] origin-top",
    highlights: ["Douglas College Asst. Coach", "Magee Secondary Head Coach", "NCCP Certified"],
  },
  {
    name: "Mikyle Malabuyoc",
    role: "Coach",
    photo: "/images/mikyle-new.jpg",
    initial: "MM",
    imageClass: "object-cover object-top scale-[1.45] origin-top",
    highlights: ["Vancouver Bandits (Pro)", "SFU Red Leafs Alumnus", "Guard Specialist"],
  },
  {
    name: "Thomas Manganini",
    role: "Coach",
    photo: "/images/IMG_1872.webp",
    initial: "TM",
    imageClass: "object-cover object-top scale-[1.05]",
    highlights: ["SFU Red Leafs Alumnus", "Guard Development", "Offensive Systems"],
  },
  {
    name: "Enrique Garcia",
    role: "Coach",
    photo: "/images/enrique-new.jpg",
    initial: "EG",
    imageClass: "object-cover object-top",
    highlights: ["UOttawa GeeGees Alumnus", "Defensive Specialist", "Player Development"],
  },
];

const VALUES = [
  {
    icon: Heart,
    title: "Passion Over Profit",
    desc: "We coach because we love the game and care about our athletes — not because it's a business.",
  },
  {
    icon: Users,
    title: "Community First",
    desc: "We're building more than a program — we're building a basketball family in Vancouver.",
  },
  {
    icon: Trophy,
    title: "Growth Mindset",
    desc: "We celebrate effort and improvement, not just wins. Every athlete has a unique path to greatness.",
  },
  {
    icon: MapPin,
    title: "Locally Rooted",
    desc: "Born and raised in Vancouver. We're proud to serve our local basketball community.",
  },
];

export default function AboutPage() {
  useReveal();

  return (
    <div className="min-h-screen bg-[#0a0a0a] pt-28 pb-24">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        {/* Hero */}
        <div className="text-center mb-20 reveal">
          <span
            className="inline-flex items-center gap-2
                       text-xs font-semibold tracking-widest uppercase
                       border border-white/10 text-white/50
                       rounded-full px-3.5 py-1.5 mb-5"
          >
            About Us
          </span>
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight mb-4">
            More Than a{" "}
            <span className="text-white">Program</span>
          </h1>
          <p className="text-white/40 text-lg max-w-xl mx-auto">
            We&rsquo;re a community of coaches and athletes united by a love for
            basketball and a commitment to growth.
          </p>
        </div>

        {/* Story */}
        <section className="mb-24 reveal">
          <div className="max-w-3xl mx-auto">
            <span
              className="inline-flex items-center gap-2
                         text-xs font-semibold tracking-widest uppercase
                         border border-white/10 text-white/50
                         rounded-full px-3.5 py-1.5 mb-5"
            >
              {STORY.title}
            </span>
            {STORY.paragraphs.map((p, i) => (
              <p
                key={i}
                className="text-white/50 text-lg leading-relaxed mb-5 last:mb-0"
              >
                {p}
              </p>
            ))}
          </div>
        </section>

        {/* Photo Banner */}
        <section className="mb-24 reveal">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { src: "/images/DSC03076.jpg", alt: "Coach speaking to team" },
              { src: "/images/SBU02221.jpg", alt: "Dribble practice" },
              { src: "/images/DSC00881.jpg", alt: "Layup training" },
            ].map((img, i) => (
              <div key={i} className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-white/5">
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-700"
                  sizes="(max-width: 640px) 100vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              </div>
            ))}
          </div>
        </section>

        {/* Values */}
        <section className="mb-24">
          <div className="text-center mb-12 reveal">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              What We Stand For
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {VALUES.map(({ icon: Icon, title, desc }, i) => (
              <div
                key={title}
                style={{ transitionDelay: `${i * 80}ms` }}
                className="reveal card card-warm bg-[#111] border border-white/10
                           rounded-2xl p-6 text-center"
              >
                <div
                  className="w-12 h-12 rounded-xl bg-white/5
                              flex items-center justify-center mx-auto mb-4"
                >
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-extrabold text-lg mb-2">{title}</h3>
                <p className="text-white/40 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* PACT */}
        <section className="mb-24">
          <div className="bg-[#060606] border border-white/5 rounded-3xl p-8 sm:p-12 reveal">
            <div className="text-center mb-10">
              <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-3">
                The <span className="text-white">PACT</span>
              </h2>
              <p className="text-white/40 max-w-lg mx-auto">
                Our guiding philosophy. Every athlete at LTS makes a personal
                commitment to their own development.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {PACT.map(({ letter, word, desc }, i) => (
                <div
                  key={letter}
                  style={{ transitionDelay: `${i * 60}ms` }}
                  className="reveal bg-[#111] border border-white/10 rounded-2xl p-6"
                >
                  <span className="text-4xl font-extrabold text-white leading-none">
                    {letter}
                  </span>
                  <p className="font-extrabold text-lg mt-2 mb-2">{word}</p>
                  <p className="text-white/40 text-sm leading-relaxed">
                    {desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Coaches */}
        <section className="mb-24">
          <div className="text-center mb-12 reveal">
            <span
              className="inline-flex items-center gap-2
                         text-xs font-semibold tracking-widest uppercase
                         border border-white/10 text-white/50
                         rounded-full px-3.5 py-1.5 mb-5"
            >
              Coaching Staff
            </span>
            <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
              Meet the Team
            </h2>
            <p className="text-white/40 mt-3 max-w-lg mx-auto">
              Real players turned real coaches. They know what it takes because
              they&rsquo;ve been there.
            </p>
          </div>

          <div className="space-y-6">
            {COACHES.map((coach, i) => (
              <div
                key={coach.name}
                style={{ transitionDelay: `${i * 80}ms` }}
                className="reveal bg-[#111] border border-white/7 rounded-2xl overflow-hidden"
              >
                <div className="flex flex-col md:flex-row">
                  {/* Photo */}
                  <div
                    className="relative md:w-64 h-64 md:h-auto
                               bg-gradient-to-br from-[#161616] to-[#111]
                               flex items-center justify-center shrink-0 overflow-hidden"
                  >
                    {coach.photo ? (
                      <Image
                        src={coach.photo}
                        alt={coach.name}
                        fill
                        sizes="(max-width: 768px) 100vw, 256px"
                        className={coach.imageClass || "object-cover object-top"}
                      />
                    ) : (
                      <span
                        className="w-24 h-24 rounded-full
                                   bg-gradient-to-br from-[#F97316]/20 to-[#F97316]/5
                                   border-2 border-[#F97316]/20
                                   flex items-center justify-center
                                   text-3xl font-extrabold text-[#F97316]/60"
                      >
                        {coach.initial}
                      </span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-6 md:p-8 flex-1">
                    <h3 className="text-2xl font-extrabold mb-1">
                      {coach.name}
                    </h3>
                    <p className="text-sm font-bold uppercase tracking-wider text-[#F97316]/50 mb-4">
                      {coach.role}
                    </p>
                    <p className="text-white/50 leading-relaxed mb-4">
                      {coach.bio}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {coach.highlights.map((h) => (
                        <span
                          key={h}
                          className="text-xs font-medium border border-white/8
                                     text-white/40 rounded-full px-3 py-1"
                        >
                          {h}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="text-center reveal">
          <div
            className="bg-gradient-to-br from-[#111] to-[#0a0a0a]
                        border border-white/7 rounded-3xl p-12"
          >
            <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">
              Come{" "}
              <span className="gradient-text">Train With Us</span>
            </h2>
            <p className="text-white/40 text-lg mb-8 max-w-lg mx-auto">
              Your first session is free. Come meet the coaches, see the vibe,
              and find out if LTS is the right fit for you.
            </p>
            <Link
              href="/book"
              className="btn-accent inline-flex items-center gap-2
                         font-bold text-lg px-10 py-4 rounded-2xl
                         active:scale-95 group"
            >
              Book a Free Trial
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
