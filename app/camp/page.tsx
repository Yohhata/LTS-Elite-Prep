"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, ChevronRight } from "lucide-react";

type PackageType = "weekend-1" | "weekend-2" | "both" | "dropin";

const SESSIONS = [
  { id: "jul11", date: "July 11 (Sat)", time: "14:00–17:00", type: "BUILD", weekend: 1 },
  { id: "jul12", date: "July 12 (Sun)", time: "16:00–19:00", type: "PERFORM", weekend: 1 },
  { id: "jul18", date: "July 18 (Sat)", time: "14:00–17:00", type: "BUILD", weekend: 2 },
  { id: "jul19", date: "July 19 (Sun)", time: "14:00–17:00", type: "PERFORM", weekend: 2 },
];

const PACKAGES: { id: PackageType; name: string; price: string; desc: string; sessions: string }[] = [
  {
    id: "weekend-1",
    name: "Weekend 1",
    price: "$249.99",
    desc: "Jul 11 (BUILD) + Jul 12 (PERFORM)",
    sessions: "2 sessions",
  },
  {
    id: "weekend-2",
    name: "Weekend 2",
    price: "$249.99",
    desc: "Jul 18 (BUILD) + Jul 19 (PERFORM)",
    sessions: "2 sessions",
  },
  {
    id: "both",
    name: "Both Weekends",
    price: "$399.99",
    desc: "All 4 sessions — Jul 11, 12, 18 & 19",
    sessions: "4 sessions",
  },
  {
    id: "dropin",
    name: "Drop-in",
    price: "$69.99",
    desc: "Single session of your choice",
    sessions: "1 session",
  },
];

export default function CampPage() {
  const [step, setStep] = useState<1 | 2>(1);
  const [pkg, setPkg] = useState<PackageType>("both");
  const [dropinSession, setDropinSession] = useState("");

  const [athleteName, setAthleteName] = useState("");
  const [parentName, setParentName] = useState("");
  const [parentEmail, setParentEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const selectedPkg = PACKAGES.find((p) => p.id === pkg)!;

  const canProceed = pkg !== "dropin" || dropinSession !== "";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/camp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          athleteName,
          parentName,
          parentEmail,
          campId: "blueprint-2026-july",
          campName: "Blueprint Series",
          campPrice: selectedPkg.price,
          packageType: pkg,
          dropinSession: pkg === "dropin" ? dropinSession : null,
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Registration failed");
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
          <h2 className="text-4xl font-black mb-4 uppercase">Registration Sent</h2>
          <p className="text-white/40 mb-10 leading-relaxed">
            We've received your registration for the Blueprint Series. Check the parent's email for payment instructions.
          </p>
          <Link href="/" className="bg-white text-black font-bold px-10 py-4 rounded-2xl">
            BACK TO HOME
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pt-32 pb-20 px-5">
      <div className="max-w-xl mx-auto">
        {/* Header */}
        <div className="mb-10 text-center">
          <Link href="/" className="inline-flex items-center gap-2 text-white/30 hover:text-white text-xs font-bold uppercase mb-10 transition-all">
            <ArrowLeft className="w-3 h-3" /> Back
          </Link>
          <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mb-3">July 2026 · High School</p>
          <h1 className="text-5xl font-black mb-2 uppercase tracking-tighter">
            Blueprint <span className="text-white/20">Series</span>
          </h1>
          <p className="text-white/40 text-sm">4 sessions across 2 weekends — BUILD the mechanics, PERFORM in game.</p>
          <div className="inline-block mt-4 px-4 py-1.5 rounded-full border border-red-500/30 bg-red-500/10">
            <p className="text-red-400 text-xs font-black uppercase tracking-widest">Registration closes July 10</p>
          </div>
        </div>

        {/* Schedule */}
        <div className="bg-[#111] border border-white/5 rounded-2xl p-5 mb-8">
          <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-4">Schedule</p>
          <div className="space-y-2">
            {SESSIONS.map((s) => (
              <div key={s.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                <div className="flex items-center gap-3">
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${s.type === "BUILD" ? "bg-white/10 text-white/60" : "bg-white/5 text-white/40"}`}>
                    {s.type}
                  </span>
                  <span className="text-sm font-bold text-white">{s.date}</span>
                </div>
                <span className="text-xs text-white/30 font-bold">{s.time}</span>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-white/20 mt-4">BUILD: mechanics training · PERFORM: game application</p>
        </div>

        {step === 1 && (
          <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4">
            <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-2">Choose Your Package</p>

            {PACKAGES.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => { setPkg(p.id); if (p.id !== "dropin") setDropinSession(""); }}
                className={`w-full text-left p-5 rounded-2xl border transition-all
                  ${pkg === p.id ? "bg-white text-black border-white" : "bg-[#111] text-white border-white/5 hover:border-white/20"}`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-black uppercase">{p.name}</h3>
                      {pkg === p.id && <Check className="w-4 h-4" />}
                    </div>
                    <p className={`text-xs ${pkg === p.id ? "text-black/50" : "text-white/40"}`}>{p.desc}</p>
                  </div>
                  <div className="text-right shrink-0 ml-4">
                    <p className="text-2xl font-black">{p.price}</p>
                    <p className={`text-[10px] ${pkg === p.id ? "text-black/40" : "text-white/30"}`}>{p.sessions}</p>
                  </div>
                </div>
              </button>
            ))}

            {/* Drop-in session picker */}
            {pkg === "dropin" && (
              <div className="mt-2 space-y-2">
                <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-2">Select Session</p>
                {SESSIONS.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setDropinSession(s.id)}
                    className={`w-full text-left p-4 rounded-xl border transition-all flex items-center justify-between
                      ${dropinSession === s.id ? "bg-white text-black border-white" : "bg-[#0a0a0a] text-white border-white/5 hover:border-white/15"}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded ${dropinSession === s.id ? "bg-black/10" : "bg-white/5"}`}>
                        {s.type}
                      </span>
                      <span className="text-sm font-bold">{s.date}</span>
                    </div>
                    <span className={`text-xs font-bold ${dropinSession === s.id ? "text-black/50" : "text-white/30"}`}>{s.time}</span>
                  </button>
                ))}
              </div>
            )}

            <button
              type="button"
              onClick={() => setStep(2)}
              disabled={!canProceed}
              className="w-full bg-white text-black font-black py-5 rounded-2xl flex items-center justify-center gap-2 mt-4 disabled:opacity-30"
            >
              CONTINUE — {selectedPkg.price}
              <ArrowRight className="w-5 h-5" />
            </button>

            <p className="text-center text-xs text-white/20 pt-1">
              Payment via e-transfer after registration. High school athletes only.
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
              <ArrowLeft className="w-3 h-3" /> Back
            </button>

            {/* Package summary */}
            <div className="bg-[#111] border border-white/5 rounded-2xl p-5 mb-8 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">Selected Package</p>
                <p className="font-black text-lg uppercase">{selectedPkg.name}</p>
                <p className="text-xs text-white/40">{selectedPkg.desc}</p>
                {pkg === "dropin" && dropinSession && (
                  <p className="text-xs text-white/50 mt-1">
                    {SESSIONS.find((s) => s.id === dropinSession)?.date} · {SESSIONS.find((s) => s.id === dropinSession)?.time}
                  </p>
                )}
              </div>
              <p className="text-3xl font-black">{selectedPkg.price}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">Athlete & Parent Info</p>

              <div>
                <label className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-2 block">Athlete Full Name</label>
                <input
                  required
                  type="text"
                  placeholder="JORDAN SMITH"
                  value={athleteName}
                  onChange={(e) => setAthleteName(e.target.value)}
                  className="w-full bg-[#0a0a0a] border border-white/5 rounded-2xl px-6 py-5 text-white font-bold outline-none focus:border-white/20 transition-colors"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-2 block">Parent Full Name</label>
                <input
                  required
                  type="text"
                  placeholder="MICHAEL SMITH"
                  value={parentName}
                  onChange={(e) => setParentName(e.target.value)}
                  className="w-full bg-[#0a0a0a] border border-white/5 rounded-2xl px-6 py-5 text-white font-bold outline-none focus:border-white/20 transition-colors"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-2 block">Parent Email (for invoice)</label>
                <input
                  required
                  type="email"
                  placeholder="PARENT@EXAMPLE.COM"
                  value={parentEmail}
                  onChange={(e) => setParentEmail(e.target.value)}
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
                disabled={!athleteName || !parentName || !parentEmail || loading}
                className="w-full bg-white text-black font-black py-5 rounded-2xl flex items-center justify-center gap-2 disabled:opacity-30 mt-2"
              >
                {loading ? "SENDING..." : `REGISTER — ${selectedPkg.price}`}
                {!loading && <ArrowRight className="w-5 h-5" />}
              </button>

              <p className="text-center text-xs text-white/20 pt-1">
                Payment instructions sent to parent's email. Registration closes July 10.
              </p>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
