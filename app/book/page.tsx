"use client";

import { useState, useEffect, Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import {
  ArrowRight,
  ArrowLeft,
  Check,
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
} from "lucide-react";

// ── Types ────────────────────────────────────────────────────

type ProgramId = "pass-5" | "pass-10" | "drop-in" | "pass-usage" | "private";

// ── Config ───────────────────────────────────────────────────

const PASS_PROGRAMS: { id: ProgramId; name: string; price: string; desc: string }[] = [
  {
    id: "pass-5",
    name: "5-Session Pass",
    price: "$299",
    desc: "Our most flexible option. Train across 5 sessions at your pace.",
  },
  {
    id: "pass-10",
    name: "10-Session Pass",
    price: "$449",
    desc: "The elite choice. Maximum value for serious athletes.",
  },
];

const SESSION_PROGRAMS: { id: ProgramId; name: string; price: string; desc: string; confirmOnly?: boolean }[] = [
  {
    id: "drop-in",
    name: "Drop-In",
    price: "$70",
    desc: "Single session. Show up and train.",
  },
  {
    id: "pass-usage",
    name: "Already Have a Pass",
    price: "Pre-paid",
    desc: "Book your next session using your existing pass.",
    confirmOnly: true,
  },
  {
    id: "private",
    name: "1-on-1 Private Training",
    price: "$85",
    desc: "Fully personalized coaching session.",
  },
];

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
            className="p-2 hover:bg-white/5 rounded-lg text-white/40"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
            className="p-2 hover:bg-white/5 rounded-lg text-white/40"
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
                ${!active && !sel ? "opacity-20" : ""}`}
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

function BookPageInner() {
  const searchParams = useSearchParams();
  const initialProgram = (searchParams.get("program") as ProgramId) || null;

  // Which top-level category is selected
  const [category, setCategory] = useState<"buy-pass" | "session" | null>(null);
  const [selectedProgram, setSelectedProgram] = useState<ProgramId | null>(initialProgram);

  // Flow state
  const [step, setStep] = useState(1); // 1=select, 2=schedule or info, 3=info (session only)
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Classes from DB
  const [classes, setClasses] = useState<any[]>([]);

  // Form state
  const [preferredDate, setPreferredDate] = useState("");
  const [preferredTime, setPreferredTime] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  // Set initial category from URL param
  useEffect(() => {
    if (initialProgram) {
      if (initialProgram === "pass-5" || initialProgram === "pass-10") {
        setCategory("buy-pass");
        setStep(2);
      } else {
        setCategory("session");
        setStep(2);
      }
    }
  }, []);

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

  const matchesProgram = (classProgram: string, prog: ProgramId) => {
    if (prog === "drop-in" || prog === "pass-usage") {
      return classProgram === "micro-academy" || classProgram === "futures" || classProgram === "high";
    }
    if (prog === "private") return classProgram === "private";
    return false;
  };

  const availableDates = useMemo(() => {
    if (!selectedProgram) return [];
    return classes.filter((c) => matchesProgram(c.program, selectedProgram)).map((c) => c.class_date);
  }, [classes, selectedProgram]);

  const isPassPurchase = selectedProgram === "pass-5" || selectedProgram === "pass-10";
  const isConfirmOnly = selectedProgram === "pass-usage"; // confirmation email, not invoice

  async function handlePassSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, type: selectedProgram }),
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

  async function handleSessionSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone: phone || null,
          program: selectedProgram === "drop-in" ? "micro-academy" : selectedProgram === "pass-usage" ? "micro-academy" : selectedProgram,
          preferred_date: preferredDate || null,
          preferred_time: preferredTime || null,
          message: selectedProgram === "pass-usage" ? "PASS USAGE" : selectedProgram === "drop-in" ? "DROP-IN" : null,
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

  // ── Submitted ────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-5">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-8">
            <Check className="w-10 h-10 text-black" />
          </div>
          <h2 className="text-4xl font-black mb-4 uppercase">
            {isPassPurchase ? "Registration Sent" : "Request Sent"}
          </h2>
          <p className="text-white/40 mb-10 leading-relaxed">
            {isConfirmOnly
              ? "We've received your booking. You'll receive a confirmation email shortly."
              : "We've received your request. Check your email for payment instructions."}
          </p>
          <Link href="/" className="bg-white text-black font-bold px-10 py-4 rounded-2xl">
            BACK TO HOME
          </Link>
        </div>
      </div>
    );
  }

  // ── Step 1: Category & Program Selection ─────────────────────
  if (step === 1) {
    return (
      <div className="min-h-screen bg-black pt-32 pb-20 px-5">
        <div className="max-w-xl mx-auto">
          <div className="mb-12 text-center">
            <Link href="/" className="inline-flex items-center gap-2 text-white/30 hover:text-white text-xs font-bold uppercase mb-10 transition-all">
              <ArrowLeft className="w-3 h-3" /> Back
            </Link>
            <h1 className="text-5xl font-black mb-4 uppercase tracking-tighter">
              Book <span className="text-white/20">Session</span>
            </h1>
          </div>

          {/* Buy a Pass & Save */}
          <div className="mb-6">
            <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-3">Buy a Pass &amp; Save</p>
            <div className="space-y-3">
              {PASS_PROGRAMS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    setSelectedProgram(p.id);
                    setCategory("buy-pass");
                    setStep(2);
                  }}
                  className="w-full text-left p-6 rounded-2xl border bg-[#111] text-white/70 border-white/5 hover:border-white/20 hover:text-white transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-black text-lg uppercase tracking-tight text-white">{p.name}</h4>
                      <p className="text-sm text-white/40 mt-1">{p.desc}</p>
                    </div>
                    <div className="text-right ml-4 shrink-0">
                      <span className="text-xl font-black text-white">{p.price}</span>
                      <ArrowRight className="w-4 h-4 text-white/30 group-hover:text-white mt-1 ml-auto transition-all" />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Session options */}
          <div>
            <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-3">Single Session</p>
            <div className="space-y-3">
              {SESSION_PROGRAMS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    setSelectedProgram(p.id);
                    setCategory("session");
                    setStep(2);
                  }}
                  className="w-full text-left p-6 rounded-2xl border bg-[#111] text-white/70 border-white/5 hover:border-white/20 hover:text-white transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-black text-lg uppercase tracking-tight text-white">{p.name}</h4>
                      <p className="text-sm text-white/40 mt-1">{p.desc}</p>
                    </div>
                    <div className="text-right ml-4 shrink-0">
                      <span className="text-xl font-black text-white">{p.price}</span>
                      <ArrowRight className="w-4 h-4 text-white/30 group-hover:text-white mt-1 ml-auto transition-all" />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Pass Purchase Flow: Step 2 = Registration Form ────────────
  if (category === "buy-pass" && step === 2) {
    const prog = PASS_PROGRAMS.find((p) => p.id === selectedProgram)!;
    return (
      <div className="min-h-screen bg-black pt-32 pb-20 px-5">
        <div className="max-w-xl mx-auto">
          <div className="mb-10 text-center">
            <button onClick={() => setStep(1)} className="inline-flex items-center gap-2 text-white/30 hover:text-white text-xs font-bold uppercase mb-10 transition-all">
              <ArrowLeft className="w-3 h-3" /> Back
            </button>
            <h1 className="text-4xl font-black mb-2 uppercase tracking-tighter">{prog.name}</h1>
            <p className="text-3xl font-black text-white/30">{prog.price}</p>
            <p className="text-white/40 text-sm mt-2">{prog.desc}</p>
          </div>

          <form onSubmit={handlePassSubmit} className="space-y-5">
            <div>
              <label className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-2 block">Full Name</label>
              <input
                required
                type="text"
                placeholder="JORDAN SMITH"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#111] border border-white/5 rounded-2xl px-6 py-5 text-white font-bold outline-none"
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
                className="w-full bg-[#111] border border-white/5 rounded-2xl px-6 py-5 text-white font-bold outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-2 block">Phone (Optional)</label>
              <input
                type="tel"
                placeholder="604-000-0000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
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
              disabled={!name || !email || loading}
              className="w-full bg-white text-black font-black py-5 rounded-2xl flex items-center justify-center gap-2 disabled:opacity-30 mt-4"
            >
              {loading ? "SENDING..." : `REGISTER — ${prog.price}`}
              {!loading && <ArrowRight className="w-5 h-5" />}
            </button>

            <p className="text-center text-xs text-white/20 pt-2">
              After registration, you'll receive payment instructions via email.
            </p>
          </form>
        </div>
      </div>
    );
  }

  // ── Session Flow: Step 2 = Schedule ──────────────────────────
  if (category === "session" && step === 2) {
    const prog = SESSION_PROGRAMS.find((p) => p.id === selectedProgram)!;
    return (
      <div className="min-h-screen bg-black pt-32 pb-20 px-5">
        <div className="max-w-xl mx-auto">
          <div className="mb-10 text-center">
            <button onClick={() => setStep(1)} className="inline-flex items-center gap-2 text-white/30 hover:text-white text-xs font-bold uppercase mb-10 transition-all">
              <ArrowLeft className="w-3 h-3" /> Back
            </button>
            <h1 className="text-4xl font-black mb-2 uppercase tracking-tighter">{prog.name}</h1>
            <p className="text-2xl font-black text-white/30">{prog.price}</p>
          </div>

          <div className="space-y-6">
            <div>
              <label className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-3 block flex items-center gap-2">
                <CalendarIcon className="w-3 h-3" /> Available Sessions
              </label>
              <Calendar
                selectedDate={preferredDate}
                onSelect={(d) => { setPreferredDate(d); setPreferredTime(""); }}
                availableDates={availableDates}
              />
            </div>

            <div>
              <label className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-4 block">
                Select a Session
              </label>
              <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
                {classes.filter((c) => matchesProgram(c.program, selectedProgram!)).length > 0 ? (
                  classes
                    .filter((c) => matchesProgram(c.program, selectedProgram!))
                    .sort((a, b) => new Date(a.class_date + "T00:00:00").getTime() - new Date(b.class_date + "T00:00:00").getTime())
                    .map((c) => {
                      const isSel = preferredDate === c.class_date && preferredTime === `${c.start_time} - ${c.end_time}`;
                      const d = new Date(c.class_date + "T00:00:00");
                      const label = d.toLocaleDateString("en-US", { month: "short", day: "numeric", weekday: "short" });
                      return (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => { setPreferredDate(c.class_date); setPreferredTime(`${c.start_time} - ${c.end_time}`); }}
                          className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all
                            ${isSel ? "bg-white text-black border-white" : "bg-[#111] text-white/60 border-white/5 hover:border-white/10"}`}
                        >
                          <div className="text-left">
                            <span className="text-[10px] font-black uppercase opacity-50 block mb-1">{label}</span>
                            <span className="font-bold text-sm uppercase">{c.title}</span>
                          </div>
                          <span className="text-xs font-black opacity-50">{c.start_time.slice(0, 5)} – {c.end_time.slice(0, 5)}</span>
                        </button>
                      );
                    })
                ) : (
                  <div className="text-center py-10 border border-dashed border-white/10 rounded-2xl">
                    <p className="text-white/20 text-xs font-bold uppercase tracking-widest">No upcoming sessions</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3 pt-4">
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

  // ── Session Flow: Step 3 = Booking Form ──────────────────────
  if (category === "session" && step === 3) {
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
                {new Date(preferredDate + "T00:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                {preferredTime ? ` · ${preferredTime}` : ""}
              </p>
            )}
          </div>

          <form onSubmit={handleSessionSubmit} className="space-y-5">
            <div>
              <label className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-2 block">Full Name</label>
              <input
                required
                type="text"
                placeholder="JORDAN SMITH"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#111] border border-white/5 rounded-2xl px-6 py-5 text-white font-bold outline-none"
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
                className="w-full bg-[#111] border border-white/5 rounded-2xl px-6 py-5 text-white font-bold outline-none"
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-bold p-4 rounded-xl text-center">
                {error}
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <button type="button" onClick={() => setStep(2)} className="w-1/3 bg-[#111] text-white/50 font-bold py-5 rounded-2xl border border-white/5">
                BACK
              </button>
              <button
                type="submit"
                disabled={!name || !email || loading}
                className="flex-1 bg-white text-black font-black py-5 rounded-2xl flex items-center justify-center gap-2 disabled:opacity-30"
              >
                {loading ? "SENDING..." : "BOOK SESSION"}
                {!loading && <ArrowRight className="w-5 h-5" />}
              </button>
            </div>

            {isConfirmOnly && (
              <p className="text-center text-xs text-white/20 pt-1">
                You'll receive a confirmation email (no payment required — session deducted from your pass).
              </p>
            )}
          </form>
        </div>
      </div>
    );
  }

  return null;
}
