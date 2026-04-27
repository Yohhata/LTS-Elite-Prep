"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Send, CheckCircle, Info, Clock, MapPin, Target } from "lucide-react";

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

export default function CollegePage() {
  useReveal();
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("loading");
    
    // Simulate API call
    setTimeout(() => {
      setStatus("success");
    }, 1500);
  };

  if (status === "success") {
    return (
      <div className="min-h-screen bg-[#000] flex items-center justify-center px-5">
        <div className="max-w-md w-full text-center reveal">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce">
            <CheckCircle className="w-10 h-10 text-black" />
          </div>
          <h1 className="text-4xl font-black mb-4">APPLICATION SENT</h1>
          <p className="text-white/50 mb-10 leading-relaxed">
            Thank you for your interest in LTS COLLEGE. Coach Paolo will review your information and reach out within 24-48 hours regarding your goals and next steps.
          </p>
          <Link href="/" className="btn-accent px-10 py-4 rounded-xl font-black inline-block">
            BACK TO HOME
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#000] pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <Link href="/programs" className="inline-flex items-center gap-2 text-white/40 hover:text-white mb-12 transition-colors group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          BACK TO PROGRAMS
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Content */}
          <div className="reveal">
            <span className="inline-block border border-white/10 px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase mb-6">
              Ages 17 – 22
            </span>
            <h1 className="text-6xl sm:text-7xl font-black tracking-tighter mb-8">
              LTS <span className="gradient-text">COLLEGE</span>
            </h1>
            <p className="text-white/60 text-xl leading-relaxed mb-10">
              High-intensity training for post-secondary athletes looking to refine their craft and compete at the next level. This is a specialized program designed for serious players.
            </p>

            <div className="space-y-6 mb-12">
              <div className="flex gap-4 p-6 bg-white/5 border border-white/5 rounded-2xl">
                <Clock className="w-6 h-6 text-white shrink-0" />
                <div>
                  <h3 className="font-black text-sm uppercase mb-1">Schedule</h3>
                  <p className="text-white/40 text-sm">Mon, Wed, Fri · 6:00 PM - 8:00 PM</p>
                </div>
              </div>
              <div className="flex gap-4 p-6 bg-white/5 border border-white/5 rounded-2xl">
                <MapPin className="w-6 h-6 text-white shrink-0" />
                <div>
                  <h3 className="font-black text-sm uppercase mb-1">Location</h3>
                  <p className="text-white/40 text-sm">Vancouver, BC</p>
                </div>
              </div>
              <div className="flex gap-4 p-6 bg-white/5 border border-white/5 rounded-2xl">
                <Target className="w-6 h-6 text-white shrink-0" />
                <div>
                  <h3 className="font-black text-sm uppercase mb-1">Focus</h3>
                  <p className="text-white/40 text-sm">Position-specific technical mastery & elite conditioning.</p>
                </div>
              </div>
            </div>

            <div className="p-8 bg-white/5 border border-white/5 rounded-3xl">
              <p className="italic text-white/50 text-lg leading-relaxed">
                &ldquo;The best way to learn the game of basketball is by playing the game of basketball at the highest intent.&rdquo;
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="reveal delay-200">
            <div className="bg-white p-8 sm:p-12 rounded-[2rem] text-black">
              <h2 className="text-3xl font-black mb-2 uppercase italic">Contact Us</h2>
              <p className="text-black/40 text-sm mb-8 font-bold">Apply for a College spot below.</p>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest ml-1">Name (required)</label>
                    <input
                      required
                      type="text"
                      placeholder="Athlete Name"
                      className="w-full bg-black/5 border border-black/10 rounded-xl px-4 py-3.5 focus:border-black outline-none transition-all font-bold"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest ml-1">School (required)</label>
                    <input
                      required
                      type="text"
                      placeholder="Current School"
                      className="w-full bg-black/5 border border-black/10 rounded-xl px-4 py-3.5 focus:border-black outline-none transition-all font-bold"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest ml-1">Email (required)</label>
                  <input
                    required
                    type="email"
                    placeholder="you@example.com"
                    className="w-full bg-black/5 border border-black/10 rounded-xl px-4 py-3.5 focus:border-black outline-none transition-all font-bold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest ml-1">Phone (required)</label>
                  <input
                    required
                    type="tel"
                    placeholder="604-000-0000"
                    className="w-full bg-black/5 border border-black/10 rounded-xl px-4 py-3.5 focus:border-black outline-none transition-all font-bold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest ml-1">Message (required)</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Tell us about your goals and basketball experience."
                    className="w-full bg-black/5 border border-black/10 rounded-xl px-4 py-3.5 focus:border-black outline-none transition-all font-bold resize-none"
                  ></textarea>
                </div>

                <button
                  disabled={status === "loading"}
                  type="submit"
                  className="w-full bg-black text-white font-black py-4 rounded-xl flex items-center justify-center gap-3 hover:bg-black/90 transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  {status === "loading" ? "SENDING..." : "SUBMIT APPLICATION"}
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
