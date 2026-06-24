"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, CheckCircle2 } from "lucide-react";

type PassType = "pass-5" | "pass-10";

const PASSES = [
  {
    id: "pass-5" as PassType,
    name: "5-Session Pass",
    price: "$299",
    perSession: "$59.80/session",
    desc: "July special — 5 sessions to use across our summer schedule.",
    features: ["5 Sessions Included", "Any 5 of 6 July Dates", "Flexible Scheduling", "Performance Tracking"],
    highlight: true,
  },
];

export default function BuyPassPage() {
  const [selected, setSelected] = useState<PassType>("pass-5");
  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const pass = PASSES.find((p) => p.id === selected)!;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/buy-pass", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, passType: selected }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Purchase failed");
      }
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || "Failed. Please contact info@ltseliteprep.ca");
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-5">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-8">
            <Check className="w-10 h-10 text-black" />
          </div>
          <h2 className="text-4xl font-black mb-4 uppercase">Pass Registered</h2>
          <p className="text-white/40 mb-4 leading-relaxed">
            Check your email for payment instructions. Once payment is received, your pass will be activated and you can start booking sessions.
          </p>
          <p className="text-white/30 text-sm mb-10">
            Use <strong className="text-white/50">/book</strong> to schedule your sessions — we'll automatically detect your pass.
          </p>
          <div className="flex gap-3 justify-center">
            <Link href="/book" className="bg-white text-black font-bold px-8 py-4 rounded-2xl">
              BOOK A SESSION
            </Link>
            <Link href="/" className="bg-white/10 text-white font-bold px-8 py-4 rounded-2xl">
              HOME
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pt-32 pb-20 px-5">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-12 text-center">
          <Link href="/" className="inline-flex items-center gap-2 text-white/30 hover:text-white text-xs font-bold uppercase mb-10 transition-all">
            <ArrowLeft className="w-3 h-3" /> Back
          </Link>
          <h1 className="text-5xl font-black mb-3 uppercase tracking-tighter">
            Buy a <span className="text-white/20">Pass</span>
          </h1>
          <p className="text-white/40 text-sm">Purchase a session pass and book training sessions anytime.</p>
        </div>

        {step === 1 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
            <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-4">Choose Your Pass</p>
            {PASSES.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setSelected(p.id)}
                className={`w-full text-left p-6 rounded-2xl border transition-all
                  ${selected === p.id ? "bg-white text-black border-white" : "bg-[#111] text-white border-white/5 hover:border-white/20"}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-black text-xl uppercase">{p.name}</h3>
                      {selected === p.id && <Check className="w-5 h-5" />}
                    </div>
                    <p className={`text-sm mb-4 ${selected === p.id ? "text-black/60" : "text-white/40"}`}>{p.desc}</p>
                    <div className="flex flex-wrap gap-2">
                      {p.features.map((f) => (
                        <div key={f} className="flex items-center gap-1.5">
                          <CheckCircle2 className={`w-3.5 h-3.5 ${selected === p.id ? "text-black/50" : "text-white/30"}`} />
                          <span className={`text-xs font-bold uppercase tracking-wide ${selected === p.id ? "text-black/70" : "text-white/40"}`}>{f}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-3xl font-black">{p.price}</p>
                    <p className={`text-xs ${selected === p.id ? "text-black/40" : "text-white/30"}`}>{p.perSession}</p>
                  </div>
                </div>
              </button>
            ))}

            <button
              type="button"
              onClick={() => setStep(2)}
              className="w-full bg-white text-black font-black py-5 rounded-2xl flex items-center justify-center gap-2 mt-4"
            >
              CONTINUE — {pass.price}
              <ArrowRight className="w-5 h-5" />
            </button>

            <p className="text-center text-xs text-white/20 pt-2">
              After registration, you'll receive an e-transfer invoice via email.
            </p>
          </div>
        )}

        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-bottom-4">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="flex items-center gap-2 text-white/40 hover:text-white text-[10px] font-black uppercase mb-8 transition-all"
            >
              <ArrowLeft className="w-3 h-3" /> Back — {pass.name}
            </button>

            <div className="bg-[#111] border border-white/5 rounded-2xl p-5 mb-8 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">Selected Pass</p>
                <p className="font-black text-lg uppercase">{pass.name}</p>
              </div>
              <p className="text-3xl font-black">{pass.price}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">Your Information</p>
              <div>
                <label className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-2 block">Full Name</label>
                <input
                  required
                  type="text"
                  placeholder="JORDAN SMITH"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#0a0a0a] border border-white/5 rounded-2xl px-6 py-5 text-white font-bold outline-none focus:border-white/20 transition-colors"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-2 block">Email Address</label>
                <input
                  required
                  type="email"
                  placeholder="JORDAN@EXAMPLE.COM"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#0a0a0a] border border-white/5 rounded-2xl px-6 py-5 text-white font-bold outline-none focus:border-white/20 transition-colors"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-2 block">Phone (Optional)</label>
                <input
                  type="tel"
                  placeholder="604-000-0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-[#0a0a0a] border border-white/5 rounded-2xl px-6 py-5 text-white font-bold outline-none focus:border-white/20 transition-colors"
                />
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-bold p-4 rounded-xl text-center">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={!name || !email || loading}
                className="w-full bg-white text-black font-black py-5 rounded-2xl flex items-center justify-center gap-2 disabled:opacity-30 mt-2"
              >
                {loading ? "PROCESSING..." : `REGISTER — ${pass.price}`}
                {!loading && <ArrowRight className="w-5 h-5" />}
              </button>

              <p className="text-center text-xs text-white/20 pt-1">
                You'll receive an e-transfer invoice. Your pass activates after payment confirmation.
              </p>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
