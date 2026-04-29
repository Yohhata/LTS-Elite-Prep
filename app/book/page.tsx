// ============================================================
// 予約フォームページ (app/book/page.tsx)
// カレンダー機能統合・ステップ形式予約フロー
// ============================================================

"use client";

import { useState, useEffect, Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabase, type BookingInsert } from "@/lib/supabase";
import { 
  ArrowRight, 
  CheckCircle, 
  ArrowLeft, 
  Check, 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon,
  Clock
} from "lucide-react";

// ── 設定データ ────────────────────────────────────────────────

const PROGRAMS = [
  {
    id: "futures",
    name: "LTS Futures (Drop-in)",
    tagline: "Elementary & Middle School ($75)",
  },
  {
    id: "high",
    name: "LTS High (Drop-in)",
    tagline: "High School Elite ($75)",
  },
  {
    id: "pass-5",
    name: "5-Session Pass",
    tagline: "Flexible Growth ($299)",
  },
  {
    id: "pass-10",
    name: "10-Session Pass",
    tagline: "Elite Commitment ($449)",
  },
  {
    id: "private",
    name: "1-on-1 Private Training",
    tagline: "Personalized Development",
  },
];

const TIME_SLOTS = [
  "Morning (9am – 12pm)",
  "Afternoon (12pm – 4pm)",
  "Evening (4pm – 8pm)",
];

const EMPTY_FORM: BookingInsert = {
  name: "",
  email: "",
  phone: "",
  program: "futures",
  preferred_date: "",
  preferred_time: "",
  message: "",
};

// ── カレンダーコンポーネント ───────────────────────────────────


function Calendar({ 
  selectedDate, 
  onSelect, 
  availableDates 
}: { 
  selectedDate: string, 
  onSelect: (date: string) => void,
  availableDates: string[]
}) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const daysInMonth = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const date = new Date(year, month, 1);
    const days = [];
    
    const firstDay = date.getDay();
    for (let i = 0; i < firstDay; i++) days.push(null);
    
    while (date.getMonth() === month) {
      days.push(new Date(date));
      date.setDate(date.getDate() + 1);
    }
    return days;
  }, [currentMonth]);

  const monthName = currentMonth.toLocaleString('en-US', { month: 'long', year: 'numeric' });
  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));

  const isSelected = (date: Date) => {
    if (!selectedDate) return false;
    return date.toISOString().split('T')[0] === selectedDate;
  };

  const hasClass = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return availableDates.includes(dateStr);
  };

  return (
    <div className="bg-[#111] border border-white/5 rounded-2xl overflow-hidden p-6">
      <div className="flex items-center justify-between mb-6 px-2">
        <h3 className="font-bold text-white uppercase tracking-widest text-xs">{monthName}</h3>
        <div className="flex gap-1">
          <button onClick={prevMonth} type="button" className="p-2 hover:bg-white/5 rounded-lg text-white/40 transition-all"><ChevronLeft className="w-4 h-4" /></button>
          <button onClick={nextMonth} type="button" className="p-2 hover:bg-white/5 rounded-lg text-white/40 transition-all"><ChevronRight className="w-4 h-4" /></button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center mb-2">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
          <span key={`${d}-${i}`} className="text-[10px] font-black text-white/20 py-2">{d}</span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {daysInMonth.map((date, i) => {
          if (!date) return <div key={`empty-${i}`} className="aspect-square" />;
          const dateStr = date.toISOString().split('T')[0];
          const active = hasClass(date);
          const selected = isSelected(date);

          return (
            <button
              key={dateStr}
              type="button"
              onClick={() => onSelect(dateStr)}
              className={`aspect-square rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center relative
                ${selected ? 'bg-white text-black' : 'text-white hover:bg-white/5'}
                ${!active && !selected ? 'opacity-20' : ''}
              `}
            >
              {date.getDate()}
              {active && !selected && <span className="absolute bottom-2 w-1 h-1 rounded-full bg-white animate-pulse" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── ページ本体 ────────────────────────────────────────────────

export default function BookPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <BookPageInner />
    </Suspense>
  );
}

function BookPageInner() {
  const searchParams = useSearchParams();
  const [submitted, setSubmitted] = useState(false);
  const [step, setStep] = useState(1);
  const [classes, setClasses] = useState<any[]>([]);
  const [form, setForm] = useState<BookingInsert>({
    ...EMPTY_FORM,
    program: (searchParams.get("program") as any) || "futures",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch classes
  useEffect(() => {
    async function getClasses() {
      const { data } = await supabase.from("classes").select("*");
      if (data) setClasses(data);
    }
    getClasses();
  }, []);

  const availableDates = useMemo(() => classes.map(c => c.class_date), [classes]);
  
  const selectedDayClasses = useMemo(() => {
    if (!form.preferred_date) return [];
    return classes.filter(c => c.class_date === form.preferred_date);
  }, [form.preferred_date, classes]);

  const TOTAL_STEPS = 3;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (step < TOTAL_STEPS) {
      setStep(step + 1);
      return;
    }

    setLoading(true);
    try {
      await supabase.from("bookings").insert({
        name: form.name,
        email: form.email,
        phone: form.phone || null,
        program: form.program,
        preferred_date: form.preferred_date || null,
        preferred_time: form.preferred_time || null,
        message: form.message || null,
      });

      const gasUrl = process.env.NEXT_PUBLIC_GOOGLE_WEBHOOK_URL; 
      if (gasUrl) {
        const priceMap: any = { futures: "$75", high: "$75", "pass-5": "$299", "pass-10": "$449", private: "TBD" };
        fetch(gasUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...form, amount: priceMap[form.program] || "TBD" }),
          mode: 'no-cors'
        });
      }
      setSubmitted(true);
    } catch (err) {
      setError("Failed to book. Please contact info@ltseliteprep.ca");
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-5">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-8"><Check className="w-10 h-10 text-black" /></div>
          <h2 className="text-4xl font-black mb-4 uppercase">Request Sent</h2>
          <p className="text-white/40 mb-10 leading-relaxed">We've received your booking. Check your email for payment instructions.</p>
          <Link href="/" className="bg-white text-black font-bold px-10 py-4 rounded-2xl">BACK TO HOME</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pt-32 pb-20 px-5">
      <div className="max-w-xl mx-auto">
        <div className="mb-12 text-center">
          <Link href="/" className="inline-flex items-center gap-2 text-white/30 hover:text-white text-xs font-bold uppercase mb-10 transition-all"><ArrowLeft className="w-3 h-3" /> Back</Link>
          <h1 className="text-5xl font-black mb-4 uppercase tracking-tighter">Book <span className="text-white/20">Session</span></h1>
          <div className="flex items-center justify-center gap-4">
            {[1, 2, 3].map(s => (
              <div key={s} className={`h-1 rounded-full transition-all duration-500 ${step >= s ? 'w-12 bg-white' : 'w-4 bg-white/10'}`} />
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {step === 1 && (
            <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4">
              <div>
                <label className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-2 block">Full Name</label>
                <input required type="text" placeholder="JORDAN SMITH" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full bg-[#111] border border-white/5 rounded-2xl px-6 py-5 text-white font-bold outline-none" />
              </div>
              <div>
                <label className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-2 block">Email Address</label>
                <input required type="email" placeholder="JORDAN@EXAMPLE.COM" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full bg-[#111] border border-white/5 rounded-2xl px-6 py-5 text-white font-bold outline-none" />
              </div>
              <button type="button" onClick={() => form.name && form.email && setStep(2)} className="w-full bg-white text-black font-black py-5 rounded-2xl flex items-center justify-center gap-2 mt-4">NEXT STEP <ArrowRight className="w-5 h-5" /></button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
              <label className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-2 block">Select Program</label>
              <div className="grid grid-cols-1 gap-3">
                {PROGRAMS.map(p => (
                  <button key={p.id} type="button" onClick={() => {
                      setForm({...form, program: p.id as any});
                    }} className={`text-left p-6 rounded-2xl border transition-all ${form.program === p.id ? 'bg-white text-black border-white' : 'bg-[#111] text-white/60 border-white/5 hover:border-white/10'}`}>
                    <div className="flex items-center justify-between">
                      <h4 className="font-black text-lg uppercase tracking-tight">{p.name}</h4>
                      {form.program === p.id && <Check className="w-5 h-5" />}
                    </div>
                  </button>
                ))}
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setStep(1)} className="w-1/3 bg-[#111] text-white/50 font-bold py-5 rounded-2xl border border-white/5">BACK</button>
                <button 
                  type="button" 
                  onClick={() => {
                    if (form.program === 'pass-5' || form.program === 'pass-10') {
                      // Skip step 3 (calendar) and proceed to confirm
                      // We'll handle the submission differently in step 3 or by adding a final confirmation here
                      setStep(3); 
                    } else {
                      setStep(3);
                    }
                  }} 
                  className="flex-1 bg-white text-black font-black py-5 rounded-2xl flex items-center justify-center gap-2"
                >
                  {form.program === 'pass-5' || form.program === 'pass-10' ? 'PROCEED' : 'CHOOSE DATE'} 
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
              {(form.program === 'pass-5' || form.program === 'pass-10') ? (
                <div className="text-center py-10 bg-[#111] border border-white/5 rounded-3xl">
                  <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-black mb-2 uppercase">Ready to Purchase?</h3>
                  <p className="text-white/40 text-sm mb-8 px-10">
                    You are purchasing a <span className="text-white font-bold">{form.program === 'pass-5' ? '5-Session Pass' : '10-Session Pass'}</span>. 
                    An invoice will be sent to your email shortly.
                  </p>
                </div>
              ) : (
                <>
                  <div>
                    <label className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-3 block flex items-center gap-2"><CalendarIcon className="w-3 h-3" /> Available Classes</label>
                    <Calendar selectedDate={form.preferred_date || ""} onSelect={date => setForm({...form, preferred_date: date})} availableDates={availableDates} />
                  </div>
                  
                  {form.preferred_date && (
                    <div className="animate-in fade-in slide-in-from-top-2">
                      <label className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-3 block flex items-center gap-2"><Clock className="w-3 h-3" /> Available Time</label>
                      <div className="grid grid-cols-1 gap-2">
                        {selectedDayClasses.length > 0 ? (
                          selectedDayClasses.map(c => (
                            <button key={c.id} type="button" onClick={() => setForm({...form, preferred_time: `${c.start_time} - ${c.end_time}`})} className={`text-left px-5 py-4 rounded-xl border text-sm font-bold transition-all ${form.preferred_time === `${c.start_time} - ${c.end_time}` ? 'bg-white text-black border-white' : 'bg-[#111] text-white/40 border-white/5 hover:border-white/10'}`}>
                              {c.start_time.slice(0,5)} - {c.end_time.slice(0,5)} ({c.title})
                            </button>
                          ))
                        ) : (
                          <p className="text-white/20 text-xs font-bold uppercase tracking-widest text-center py-4 border border-dashed border-white/10 rounded-xl">No classes scheduled for this date</p>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setStep(2)} className="w-1/3 bg-[#111] text-white/50 font-bold py-5 rounded-2xl border border-white/5">BACK</button>
                <button 
                  type="submit" 
                  disabled={((form.program !== 'pass-5' && form.program !== 'pass-10') && (!form.preferred_date || !form.preferred_time)) || loading} 
                  className="flex-1 bg-white text-black font-black py-5 rounded-2xl flex items-center justify-center gap-2 disabled:opacity-30"
                >
                  {loading ? 'SENDING...' : (form.program === 'pass-5' || form.program === 'pass-10' ? 'CONFIRM PURCHASE' : 'CONFIRM BOOKING')}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

