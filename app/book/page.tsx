"use client";

import { useState, useEffect, Suspense, useMemo } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Zap,
} from "lucide-react";

// ── Calendar ─────────────────────────────────────────────────

function Calendar({
  selectedDate,
  onSelect,
  availableDates,
}: {
  selectedDate: string;
  onSelect: (date: string) => void;
  availableDates: string[];
}) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    if (selectedDate) {
      const sel = new Date(selectedDate + "T00:00:00");
      setCurrentMonth(new Date(sel.getFullYear(), sel.getMonth(), 1));
    }
  }, [selectedDate]);

  const daysInMonth = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const date = new Date(year, month, 1);
    const days: (Date | null)[] = [];
    for (let i = 0; i < date.getDay(); i++) days.push(null);
    while (date.getMonth() === month) {
      days.push(new Date(date));
      date.setDate(date.getDate() + 1);
    }
    return days;
  }, [currentMonth]);

  const toStr = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

  const monthName = currentMonth.toLocaleString("en-US", { month: "long", year: "numeric" });

  return (
    <div className="bg-[#111] border border-white/5 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-bold text-white uppercase tracking-widest text-xs">{monthName}</h3>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
            className="p-2 hover:bg-white/5 rounded-lg text-white/40 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
            className="p-2 hover:bg-white/5 rounded-lg text-white/40 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center mb-2">
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
          <span key={i} className="text-[10px] font-black text-white/20 py-2">{d}</span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {daysInMonth.map((date, i) => {
          if (!date) return <div key={`e${i}`} className="aspect-square" />;
          const ds = toStr(date);
          const sel = selectedDate === ds;
          const active = availableDates.includes(ds);
          return (
            <button
              key={ds}
              type="button"
              onClick={() => onSelect(ds)}
              className={`aspect-square rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center relative
                ${sel ? "bg-white text-black" : "text-white hover:bg-white/5"}
                ${!active && !sel ? "opacity-20 cursor-default" : ""}`}
            >
              {date.getDate()}
              {active && !sel && <span className="absolute bottom-2 w-1 h-1 rounded-full bg-white" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────

export default function BookPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <BookPageInner />
    </Suspense>
  );
}

type ProgramType = "session" | "private";

function BookPageInner() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [programType, setProgramType] = useState<ProgramType>("session");
  const [classes, setClasses] = useState<any[]>([]);
  const [preferredDate, setPreferredDate] = useState("");
  const [preferredTime, setPreferredTime] = useState("");
  const [name, setName] = useState("");
  const [parentName, setParentName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    async function getClasses() {
      const { data } = await supabase.from("classes").select("*");
      if (!data) return;
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const future = data.filter((c) => new Date(c.class_date + "T00:00:00") >= today);
      const seen = new Set<string>();
      setClasses(
        future.filter((c) => {
          const key = `${c.title}|${c.class_date}|${c.start_time}|${c.end_time}|${c.program}`;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        })
      );
    }
    getClasses();
  }, []);

  const filteredClasses = useMemo(() => {
    return classes.filter((c) =>
      programType === "private"
        ? c.program === "private"
        : c.program === "micro-academy" || c.program === "futures" || c.program === "high"
    );
  }, [classes, programType]);

  const availableDates = useMemo(() => filteredClasses.map((c) => c.class_date), [filteredClasses]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          parentName,
          email,
          program: programType === "private" ? "private" : "micro-academy",
          preferred_date: preferredDate || null,
          preferred_time: preferredTime || null,
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Booking failed");
      }
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || "Failed. Please contact info@ltseliteprep.ca");
      setLoading(false);
    }
  }

  // ── Submitted ─────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-5">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-8">
            <Check className="w-10 h-10 text-black" />
          </div>
          <h2 className="text-4xl font-black mb-4 uppercase">You're Booked</h2>
          <p className="text-white/40 mb-10 leading-relaxed">
            Check your email — if you have an active pass, 1 session was deducted automatically.
            Otherwise, you'll receive payment instructions for your drop-in.
          </p>
          <Link href="/" className="bg-white text-black font-bold px-10 py-4 rounded-2xl">
            BACK TO HOME
          </Link>
        </div>
      </div>
    );
  }

  // ── Step 1: Program Type ──────────────────────────────────
  if (step === 1) {
    return (
      <div className="min-h-screen bg-black pt-32 pb-20 px-5">
        <div className="max-w-xl mx-auto">
          <div className="mb-12 text-center">
            <Link href="/" className="inline-flex items-center gap-2 text-white/30 hover:text-white text-xs font-bold uppercase mb-10 transition-all">
              <ArrowLeft className="w-3 h-3" /> Back
            </Link>
            <h1 className="text-5xl font-black mb-3 uppercase tracking-tighter">
              Book <span className="text-white/20">Session</span>
            </h1>
            <p className="text-white/40 text-sm">Choose your session type, then pick a date.</p>
          </div>

          <div className="space-y-3">
            {/* Book Session — top, highlighted */}
            <button
              type="button"
              onClick={() => { setProgramType("session"); setStep(2); }}
              className="w-full text-left p-6 rounded-2xl border bg-white text-black border-white transition-all group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-black text-xl uppercase mb-1">Book Session</h3>
                  <p className="text-sm text-black/50">Micro Academy · Drop-in $70 · Pass holders deducted automatically</p>
                </div>
                <ArrowRight className="w-5 h-5 text-black/40 group-hover:text-black transition-colors" />
              </div>
            </button>

            {/* Buy Pass */}
            <Link
              href="/buy-pass"
              className="w-full text-left p-6 rounded-2xl border bg-[#111] border-white/5 hover:border-white/20 transition-all group flex items-center justify-between"
            >
              <div>
                <h3 className="font-black text-xl uppercase text-white mb-1">Buy Pass</h3>
                <p className="text-sm text-white/40">5-Session $299 · 10-Session $449 · Save per session</p>
              </div>
              <ArrowRight className="w-5 h-5 text-white/30 group-hover:text-white transition-colors" />
            </Link>

            {/* Private Training */}
            <button
              type="button"
              onClick={() => { setProgramType("private"); setStep(2); }}
              className="w-full text-left p-6 rounded-2xl border bg-[#111] border-white/5 hover:border-white/20 transition-all group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-black text-xl uppercase text-white mb-1">1-on-1 Private Training</h3>
                  <p className="text-sm text-white/40">$85 per session · Personalized coaching</p>
                </div>
                <ArrowRight className="w-5 h-5 text-white/30 group-hover:text-white transition-colors" />
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Step 2: Schedule ─────────────────────────────────────
  if (step === 2) {
    return (
      <div className="min-h-screen bg-black pt-32 pb-20 px-5">
        <div className="max-w-xl mx-auto">
          <div className="mb-10 text-center">
            <button onClick={() => setStep(1)} className="inline-flex items-center gap-2 text-white/30 hover:text-white text-xs font-bold uppercase mb-10 transition-all">
              <ArrowLeft className="w-3 h-3" /> Back
            </button>
            <h1 className="text-4xl font-black mb-2 uppercase tracking-tighter">
              {programType === "private" ? "Private Training" : "Choose Session"}
            </h1>
            <p className="text-white/40 text-sm">Select a date and session from the schedule below.</p>
          </div>

          <div className="space-y-6">
            <div>
              <label className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-3 flex items-center gap-2">
                <CalendarIcon className="w-3 h-3" /> Available Dates
              </label>
              <Calendar
                selectedDate={preferredDate}
                onSelect={(d) => { setPreferredDate(d); setPreferredTime(""); }}
                availableDates={availableDates}
              />
            </div>

            <div>
              <label className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-4 block">
                Sessions
              </label>
              <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
                {filteredClasses.length > 0 ? (
                  filteredClasses
                    .sort((a, b) => new Date(a.class_date + "T00:00:00").getTime() - new Date(b.class_date + "T00:00:00").getTime())
                    .map((c) => {
                      const isSel = preferredDate === c.class_date && preferredTime === `${c.start_time} - ${c.end_time}`;
                      const d = new Date(c.class_date + "T00:00:00");
                      const dateLabel = d.toLocaleDateString("en-US", { month: "short", day: "numeric", weekday: "short" });
                      return (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => { setPreferredDate(c.class_date); setPreferredTime(`${c.start_time} - ${c.end_time}`); }}
                          className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all
                            ${isSel ? "bg-white text-black border-white" : "bg-[#111] text-white/60 border-white/5 hover:border-white/15"}`}
                        >
                          <div className="text-left">
                            <span className={`text-[10px] font-black uppercase block mb-1 ${isSel ? "opacity-40" : "opacity-40"}`}>{dateLabel}</span>
                            <span className="font-bold text-sm uppercase">{c.title}</span>
                          </div>
                          <span className={`text-xs font-black ${isSel ? "text-black/60" : "text-white/30"}`}>
                            {c.start_time.slice(0, 5)} – {c.end_time.slice(0, 5)}
                          </span>
                        </button>
                      );
                    })
                ) : (
                  <div className="text-center py-12 border border-dashed border-white/10 rounded-2xl">
                    <p className="text-white/20 text-xs font-bold uppercase tracking-widest">No upcoming sessions</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setStep(1)} className="w-1/3 bg-[#111] text-white/50 font-bold py-5 rounded-2xl border border-white/5">
                BACK
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                disabled={!preferredDate || !preferredTime}
                className="flex-1 bg-white text-black font-black py-5 rounded-2xl flex items-center justify-center gap-2 disabled:opacity-30"
              >
                YOUR INFO <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Step 3: Info Form ────────────────────────────────────
  return (
    <div className="min-h-screen bg-black pt-32 pb-20 px-5">
      <div className="max-w-xl mx-auto">
        <div className="mb-10 text-center">
          <button onClick={() => setStep(2)} className="inline-flex items-center gap-2 text-white/30 hover:text-white text-xs font-bold uppercase mb-10 transition-all">
            <ArrowLeft className="w-3 h-3" /> Back
          </button>
          <h1 className="text-4xl font-black mb-2 uppercase tracking-tighter">Your Info</h1>
          {preferredDate && (
            <p className="text-white/40 text-sm mt-2">
              {new Date(preferredDate + "T00:00:00").toLocaleDateString("en-US", {
                weekday: "long", month: "long", day: "numeric",
              })}
              {preferredTime ? ` · ${preferredTime}` : ""}
            </p>
          )}
        </div>

        <div className="bg-white/3 border border-white/8 rounded-2xl p-4 mb-6 flex items-start gap-3">
          <Zap className="w-4 h-4 text-white/40 mt-0.5 shrink-0" />
          <p className="text-xs text-white/40 leading-relaxed">
            If you have an active session pass, <strong className="text-white/60">enter the same email you used to buy it</strong> — your pass will be detected automatically and 1 session deducted. Otherwise, you'll be billed ${ programType === "private" ? "85" : "70"} as a drop-in.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-2 block">Athlete Full Name</label>
            <input
              required
              type="text"
              placeholder="JORDAN SMITH"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#111] border border-white/5 rounded-2xl px-6 py-5 text-white font-bold outline-none focus:border-white/20 transition-colors"
            />
          </div>
          <div>
            <label className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-2 block">Parent Name</label>
            <input
              required
              type="text"
              placeholder="MICHAEL SMITH"
              value={parentName}
              onChange={(e) => setParentName(e.target.value)}
              className="w-full bg-[#111] border border-white/5 rounded-2xl px-6 py-5 text-white font-bold outline-none focus:border-white/20 transition-colors"
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
              className="w-full bg-[#111] border border-white/5 rounded-2xl px-6 py-5 text-white font-bold outline-none focus:border-white/20 transition-colors"
            />
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-bold p-4 rounded-xl text-center">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setStep(2)} className="w-1/3 bg-[#111] text-white/50 font-bold py-5 rounded-2xl border border-white/5">
              BACK
            </button>
            <button
              type="submit"
              disabled={!name || !parentName || !email || loading}
              className="flex-1 bg-white text-black font-black py-5 rounded-2xl flex items-center justify-center gap-2 disabled:opacity-30"
            >
              {loading ? "BOOKING..." : "CONFIRM BOOKING"}
              {!loading && <ArrowRight className="w-5 h-5" />}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
