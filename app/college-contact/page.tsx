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
    
    // 実際にはここで Supabase や Resend に送信
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setLoading(false);
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="min-h-[100svh] bg-[#0a0a0a] flex items-center justify-center px-5">
        <div className="text-center reveal">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-8">
            <CheckCircle2 className="w-10 h-10 text-black" />
          </div>
          <h2 className="text-4xl font-black mb-4 uppercase">Application Sent</h2>
          <p className="text-white/50 max-w-md mx-auto mb-10 leading-relaxed">
            Thank you for your interest in LTS College. Coach Paolo will review your application and reach out within 24-48 hours.
          </p>
          <Link href="/" className="text-white font-bold border-b border-white/20 pb-1 hover:border-white transition-all">
            Back to Home
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
                  type="text" 
                  placeholder="JORDAN SMITH"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-white/30 transition-all font-bold placeholder:text-white/10"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black tracking-[0.2em] text-white/30 uppercase mb-2">Email Address</label>
                <input 
                  required
                  type="email" 
                  placeholder="JORDAN@EXAMPLE.COM"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-white/30 transition-all font-bold placeholder:text-white/10"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black tracking-[0.2em] text-white/30 uppercase mb-2">Current Team / Level</label>
                <input 
                  type="text" 
                  placeholder="HS SENIOR / COLLEGE FRESHMAN"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-white/30 transition-all font-bold placeholder:text-white/10"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black tracking-[0.2em] text-white/30 uppercase mb-2">How can we help your game?</label>
                <textarea 
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
