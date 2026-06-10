// ============================================================
// MICRO-ACADEMY SESSIONS (app/micro-academy/page.tsx)
// Small groups. High intent. Flexibility.
// ============================================================

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Check, Zap, Users, Target, ArrowRight } from "lucide-react";

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

export default function MicroAcademyPage() {
  useReveal();
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="min-h-screen bg-[#000000] text-white pt-28 pb-24">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        
        {/* Hero Section */}
        <div className="mb-20 text-center animate-fade-in">
          <span className="inline-flex items-center gap-2 text-xs font-black tracking-[0.3em] uppercase border border-white/20 px-4 py-2 rounded-full mb-8">
            Introducing
          </span>
          <h1 className="text-5xl sm:text-7xl md:text-8xl font-black tracking-tighter mb-6 leading-[0.9]">
            MICRO-ACADEMY<br/>SESSIONS
          </h1>
          <p className="text-xl sm:text-2xl text-white/60 font-medium tracking-tight">
            Small groups. High intent. Flexibility.
          </p>
          <div className="flex flex-wrap justify-center gap-6 mt-10">
            <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-white/40">
              <Users className="w-4 h-4" /> Small Groups
            </div>
            <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-white/40">
              <Target className="w-4 h-4" /> High Intent
            </div>
            <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-white/40">
              <Zap className="w-4 h-4" /> Flexibility
            </div>
          </div>
        </div>

        {/* Philosophy Banner */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-1 mb-20 border border-white/10 rounded-3xl overflow-hidden">
          {["TRAIN", "LEARN", "COMPETE"].map((word) => (
            <div key={word} className="bg-white/5 py-12 text-center border-x border-white/5">
              <h2 className="text-3xl font-black tracking-widest">{word}</h2>
            </div>
          ))}
        </div>

        {/* Pricing & Form */}
        <div id="get-pass" className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start mb-24">
          
          {/* Left: Packages */}
          <div className="space-y-6">
            <h2 className="text-3xl font-black uppercase tracking-tight mb-8">Choose Your Pass</h2>
            
            <PackageCard 
              sessions={5} 
              price={299} 
              discount="Save 15%" 
              perSession={60} 
              onSelect={() => setShowForm(true)}
            />
            
            <PackageCard 
              sessions={10} 
              price={449} 
              discount="Save 30%" 
              perSession={45} 
              featured
              onSelect={() => setShowForm(true)}
            />

            <p className="text-xs text-white/30 uppercase tracking-widest font-bold text-center mt-6">
              (Sessions must be completed within 60 days of purchase)
            </p>
          </div>

          {/* Right: Perks & Info */}
          <div className="bg-white text-black p-8 sm:p-12 rounded-[2rem]">
            <h3 className="text-2xl font-black uppercase mb-8">Additional Perks</h3>
            <ul className="space-y-6">
              <PerkItem text="10% off individual sessions" />
              <PerkItem text="Free Trial at HYPEROO FITNESS" />
              <PerkItem text="45-minute phone consultation (regarding goals, etc.)" />
              <PerkItem text="Access to on-site weight room" />
            </ul>

            <div className="mt-12 pt-12 border-t border-black/10">
              {!showForm ? (
                <div className="space-y-4">
                  <button 
                    onClick={() => {
                      setShowForm(true);
                      document.getElementById('get-pass')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="w-full bg-black text-white font-black py-5 rounded-2xl hover:scale-[1.02] transition-all"
                  >
                    GET A PASS
                  </button>
                  <div className="flex gap-4">
                    <Link href="/schedule" className="flex-1 text-center border border-black/10 py-4 rounded-xl font-bold hover:bg-black/5 transition-all">
                      View Schedule
                    </Link>
                    <Link href="#learn-more" className="flex-1 text-center border border-black/10 py-4 rounded-xl font-bold hover:bg-black/5 transition-all">
                      LEARN MORE
                    </Link>
                  </div>
                </div>
              ) : (
                <MicroAcademyForm onCancel={() => setShowForm(false)} />
              )}
            </div>
          </div>
        </div>

        {/* Philosophy Section */}
        <section id="learn-more" className="py-24 border-t border-white/10">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl sm:text-5xl font-black uppercase mb-10 leading-tight">
              The best way to learn the game of basketball is by playing the game of basketball.
            </h2>
            <div className="space-y-8 text-lg text-white/50 leading-relaxed font-medium">
              <p>
                Group sessions provide athletes with the opportunity to refine their skills within the constraints of play. 
              </p>
              <p>
                Our environment realistically places players in situations that are common in competition, ensuring that 
                training translates directly to the court.
              </p>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}

function PackageCard({ sessions, price, discount, perSession, featured = false, onSelect }: any) {
  return (
    <div 
      onClick={onSelect}
      className={`relative p-8 rounded-3xl border cursor-pointer transition-all hover:scale-[1.02] ${
      featured ? "border-white bg-white/10" : "border-white/10 bg-white/5 hover:border-white/30"
    }`}>
      {featured && (
        <span className="absolute -top-3 left-8 bg-white text-black text-[10px] font-black px-3 py-1 rounded-full uppercase">
          Best Value
        </span>
      )}
      <div className="flex justify-between items-end">
        <div>
          <h4 className="text-4xl font-black">{sessions} SESSIONS</h4>
          <p className="text-white/40 font-bold uppercase tracking-widest text-sm mt-1">{discount}</p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-black">${price}</p>
          <p className="text-[10px] font-black uppercase text-white/40 mt-1">
            ${perSession.toFixed(2)} PER SESSION!
          </p>
        </div>
      </div>
    </div>
  );
}

function PerkItem({ text }: { text: string }) {
  return (
    <li className="flex items-center gap-4">
      <div className="w-6 h-6 rounded-full bg-black flex items-center justify-center shrink-0">
        <Check className="w-3.5 h-3.5 text-white" />
      </div>
      <span className="font-bold text-lg leading-tight">{text}</span>
    </li>
  );
}

function MicroAcademyForm({ onCancel }: { onCancel: () => void }) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    await new Promise(r => setTimeout(r, 1500));
    setSuccess(true);
    setLoading(false);
  }

  if (success) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center mx-auto mb-6">
          <Check className="w-8 h-8" />
        </div>
        <h4 className="text-2xl font-black uppercase mb-2">Registration Sent</h4>
        <p className="text-black/60 font-medium mb-8">We'll reach out shortly regarding your pass.</p>
        <button onClick={onCancel} className="font-black border-b-2 border-black">Close</button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h3 className="text-2xl font-black uppercase">Register for a MICRO-ACADEMY pass</h3>
          <p className="text-black/40 font-bold uppercase text-xs mt-1">Register now, pay later.</p>
        </div>
        <button onClick={onCancel} className="text-black/20 hover:text-black">
          <Target className="w-6 h-6" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-black/40">Athlete Name</label>
          <div className="grid grid-cols-2 gap-3">
            <input required placeholder="First Name" className="w-full bg-black/5 border-none rounded-xl px-4 py-3 placeholder:text-black/20" />
            <input required placeholder="Last Name" className="w-full bg-black/5 border-none rounded-xl px-4 py-3 placeholder:text-black/20" />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-black/40">Parent Name</label>
          <div className="grid grid-cols-2 gap-3">
            <input required placeholder="First Name" className="w-full bg-black/5 border-none rounded-xl px-4 py-3 placeholder:text-black/20" />
            <input required placeholder="Last Name" className="w-full bg-black/5 border-none rounded-xl px-4 py-3 placeholder:text-black/20" />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-black/40">Parent Email</label>
          <input required type="email" placeholder="email@example.com" className="w-full bg-black/5 border-none rounded-xl px-4 py-4 placeholder:text-black/20" />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-black/40">Pass Type</label>
          <select required className="w-full bg-black/5 border-none rounded-xl px-4 py-4 text-black/60 appearance-none">
            <option value="">Select an option</option>
            <option value="5">5 Sessions - $299</option>
            <option value="10">10 Sessions - $449</option>
          </select>
        </div>

        <button 
          disabled={loading}
          className="w-full bg-black text-white font-black py-5 rounded-2xl disabled:opacity-50"
        >
          {loading ? "SENDING..." : "SUBMIT"}
        </button>
      </form>
    </div>
  );
}
