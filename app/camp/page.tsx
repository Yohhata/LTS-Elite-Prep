"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";

export default function CampPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <CampPageInner />
    </Suspense>
  );
}

function CampPageInner() {
  const searchParams = useSearchParams();
  const campId = searchParams.get("camp") || "";
  const campName = searchParams.get("name") || "LTS Summer Camp / Clinic";
  const campPrice = searchParams.get("price") || "";
  const campDate = searchParams.get("date") || "";

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [athleteName, setAthleteName] = useState("");
  const [parentName, setParentName] = useState("");
  const [parentEmail, setParentEmail] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/camp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ athleteName, parentName, parentEmail, campId, campName, campPrice }),
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
            We've received your registration. Check the parent's email for payment instructions.
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
        <div className="mb-12 text-center">
          <Link href="/" className="inline-flex items-center gap-2 text-white/30 hover:text-white text-xs font-bold uppercase mb-10 transition-all">
            <ArrowLeft className="w-3 h-3" /> Back
          </Link>
          <h1 className="text-4xl font-black mb-3 uppercase tracking-tighter">
            Secure Your <span className="text-white/20">Spot</span>
          </h1>
          <p className="text-xl font-black text-white">{campName}</p>
          {campDate && <p className="text-white/40 text-sm mt-1">{campDate}</p>}
          {campPrice && <p className="text-2xl font-black text-white/40 mt-1">{campPrice}</p>}
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-2 block">
              Athlete Full Name
            </label>
            <input
              required
              type="text"
              placeholder="JORDAN SMITH"
              value={athleteName}
              onChange={(e) => setAthleteName(e.target.value)}
              className="w-full bg-[#111] border border-white/5 rounded-2xl px-6 py-5 text-white font-bold outline-none"
            />
          </div>
          <div>
            <label className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-2 block">
              Parent Full Name
            </label>
            <input
              required
              type="text"
              placeholder="MICHAEL SMITH"
              value={parentName}
              onChange={(e) => setParentName(e.target.value)}
              className="w-full bg-[#111] border border-white/5 rounded-2xl px-6 py-5 text-white font-bold outline-none"
            />
          </div>
          <div>
            <label className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-2 block">
              Parent Email (for invoice)
            </label>
            <input
              required
              type="email"
              placeholder="PARENT@EXAMPLE.COM"
              value={parentEmail}
              onChange={(e) => setParentEmail(e.target.value)}
              className="w-full bg-[#111] border border-white/5 rounded-2xl px-6 py-5 text-white font-bold outline-none"
            />
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-bold p-4 rounded-xl text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={!athleteName || !parentName || !parentEmail || loading}
            className="w-full bg-white text-black font-black py-5 rounded-2xl flex items-center justify-center gap-2 disabled:opacity-30 mt-4"
          >
            {loading ? "SENDING..." : "REGISTER NOW"}
            {!loading && <ArrowRight className="w-5 h-5" />}
          </button>

          <p className="text-center text-xs text-white/20 pt-2">
            After registration, payment instructions will be sent to the parent's email.
          </p>
        </form>
      </div>
    </div>
  );
}
