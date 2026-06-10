"use client";

import { useState, useEffect } from "react";
import { Send, CheckCircle2, Loader2 } from "lucide-react";
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

export default function CollegeContactPage() {
  useReveal();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name"),
      email: formData.get("email"),
      level: formData.get("level"),
      message: formData.get("message"),
    };

    try {
      const res = await fetch("/api/college-inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error("Failed to send");
      setSubmitted(true);
    } catch (err) {
      alert("Something went wrong. Please try again or email us directly at info@ltseliteprep.ca");
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-5">
        <div className="text-center animate-in fade-in zoom-in duration-500">
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-10 shadow-[0_0_50px_rgba(255,255,255,0.1)]">
            <CheckCircle2 className="w-12 h-12 text-black" />
          </div>
          <h2 className="text-5xl font-black mb-6 uppercase tracking-tighter italic">Application <span className="text-white/20">Sent</span></h2>
          <p className="text-white/40 max-w-sm mx-auto mb-12 text-sm font-bold uppercase tracking-widest leading-relaxed">
            Coach Paolo will review your application and reach out within 24-48 hours.
          </p>
          <Link href="/" className="inline-block bg-white text-black font-black px-10 py-5 rounded-2xl hover:scale-105 transition-all active:scale-95">
            BACK TO HOME
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] pt-32 pb-20 px-5">
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          
          {/* Text Side */}
          <div className="reveal">
            <span className="inline-block bg-white/5 border border-white/10 text-white/50 text-[10px] font-black tracking-[0.2em] px-4 py-1.5 rounded-full uppercase mb-6">
              Elite Level Only
            </span>
            <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight mb-8 uppercase leading-[0.9]">
              LTS <span className="text-white">COLLEGE</span> INQUIRY
            </h1>
            <p className="text-white/40 text-lg leading-relaxed mb-8">
              LTS College is a high-intensity environment for university-bound and professional athletes. 
              Admission is based on skill level and commitment.
            </p>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center shrink-0 border border-white/5">
                  <span className="font-black text-white/20">01</span>
                </div>
                <div>
                  <h4 className="font-bold text-white mb-1">Professional Standards</h4>
                  <p className="text-sm text-white/30">We maintain an environment that mirrors pro-level training sessions.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center shrink-0 border border-white/5">
                  <span className="font-black text-white/20">02</span>
                </div>
                <div>
                  <h4 className="font-bold text-white mb-1">Personal Mentoring</h4>
                  <p className="text-sm text-white/30">Direct access to recruitment advice and tactical film study.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Form Side */}
          <div className="reveal bg-[#111] p-8 sm:p-10 rounded-3xl border border-white/5 shadow-2xl">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-[10px] font-black tracking-[0.2em] text-white/30 uppercase mb-2">Full Name</label>
                <input 
                  required
                  name="name"
                  type="text" 
                  placeholder="JORDAN SMITH"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-white/30 transition-all font-bold placeholder:text-white/10"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black tracking-[0.2em] text-white/30 uppercase mb-2">Email Address</label>
                <input 
                  required
                  name="email"
                  type="email" 
                  placeholder="JORDAN@EXAMPLE.COM"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-white/30 transition-all font-bold placeholder:text-white/10"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black tracking-[0.2em] text-white/30 uppercase mb-2">Current Team / Level</label>
                <input 
                  name="level"
                  type="text" 
                  placeholder="HS SENIOR / COLLEGE FRESHMAN"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-white/30 transition-all font-bold placeholder:text-white/10"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black tracking-[0.2em] text-white/30 uppercase mb-2">How can we help your game?</label>
                <textarea 
                  name="message"
                  rows={4}
                  placeholder="TELL US ABOUT YOUR GOALS..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-white/30 transition-all font-bold placeholder:text-white/10 resize-none"
                />
              </div>
              
              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-white text-black font-black py-5 rounded-2xl flex items-center justify-center gap-2 hover:bg-white/90 transition-all active:scale-95 disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>APPLY NOW <Send className="w-5 h-5" /></>}
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}
