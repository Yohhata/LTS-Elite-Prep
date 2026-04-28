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
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const OPTIONS = [
    {
      id: "drop-in",
      name: "Single Drop-in",
      price: "$75",
      desc: "Perfect for a single high-intensity trial session.",
      features: ["2-Hour Session", "Pro Coaching", "Full Facility Access"],
      cta: "GET DROP-IN",
      highlight: false,
    },
    {
      id: "pass-5",
      name: "5-Session Pass",
      price: "$299",
      desc: "Our most flexible option for consistent growth.",
      features: ["5 Sessions Included", "Flexible Scheduling", "Priority Booking", "Performance Tracking"],
      cta: "GET 5-PASS",
      highlight: true,
    },
    {
      id: "pass-10",
      name: "10-Session Pass",
      price: "$449",
      desc: "The elite choice for serious athletes committed to results.",
      features: ["10 Sessions Included", "Maximum Value", "1-on-1 Consultation", "Video Analysis Support"],
      cta: "GET 10-PASS",
      highlight: false,
    },
  ];

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name"),
      email: formData.get("email"),
      type: selectedPlan.id,
    };

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error("Failed");
      setSubmitted(true);
    } catch (err) {
      alert("Error sending request. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-5">
        <div className="text-center">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-8">
            <CheckCircle2 className="w-10 h-10 text-black" />
          </div>
          <h2 className="text-4xl font-black mb-4 uppercase">Registration Sent</h2>
          <p className="text-white/50 max-w-md mx-auto mb-10 leading-relaxed">
            Check your email for the payment instructions. Once E-transfer is received, we will confirm your session.
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

              <button
                onClick={() => setSelectedPlan(opt)}
                className={`w-full py-5 rounded-2xl font-black text-center transition-all active:scale-95 flex items-center justify-center gap-2
                  ${opt.highlight 
                    ? "bg-black text-white hover:bg-black/90" 
                    : "bg-white text-black hover:bg-white/90"}`}
              >
                {opt.cta}
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>

        {/* Simple Modal / Form Overlay */}
        {selectedPlan && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-5 bg-black/90 backdrop-blur-sm">
            <div className="bg-[#111] w-full max-w-md p-8 sm:p-10 rounded-3xl border border-white/10 relative">
              <button 
                onClick={() => setSelectedPlan(null)}
                className="absolute top-6 right-6 text-white/30 hover:text-white"
              >
                CLOSE
              </button>
              <h3 className="text-2xl font-black mb-1 uppercase">Complete Registration</h3>
              <p className="text-white/40 text-sm mb-8 uppercase tracking-widest font-bold">
                Plan: <span className="text-white">{selectedPlan.name} ({selectedPlan.price})</span>
              </p>
              
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-[10px] font-black tracking-[0.2em] text-white/30 uppercase mb-2">Athlete Name</label>
                  <input 
                    required name="name" type="text" placeholder="JORDAN SMITH"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black tracking-[0.2em] text-white/30 uppercase mb-2">Email Address</label>
                  <input 
                    required name="email" type="email" placeholder="JORDAN@EXAMPLE.COM"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white font-bold"
                  />
                </div>
                <button 
                  disabled={loading}
                  className="w-full bg-white text-black font-black py-5 rounded-2xl flex items-center justify-center gap-2"
                >
                  {loading ? "SENDING..." : "CONFIRM & GET INVOICE"}
                </button>
              </form>
            </div>
          </div>
        )}

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
