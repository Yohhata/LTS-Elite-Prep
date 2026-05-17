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
  Clock,
  CheckCircle2
} from "lucide-react";

// ── 設定データ ────────────────────────────────────────────────

const PROGRAMS = [
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
    tagline: "Personalized Development ($125)",
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
  program: "pass-5",
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

  // 選択された日付の月にカレンダーを自動移動
  useEffect(() => {
    if (selectedDate) {
      const selected = new Date(selectedDate + 'T00:00:00');
      setCurrentMonth(new Date(selected.getFullYear(), selected.getMonth(), 1));
    }
  }, [selectedDate]);

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

  // ローカルタイムゾーンで日付文字列を取得（UTCズレ防止）
  const toDateStr = (date: Date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  const isSelected = (date: Date) => {
    if (!selectedDate) return false;
    return toDateStr(date) === selectedDate;
  };

  const hasClass = (date: Date) => {
    const dateStr = toDateStr(date);
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
          const dateStr = toDateStr(date);
          const isSelected = selectedDate === dateStr;
          const active = availableDates.includes(dateStr);

          return (
            <button
              key={dateStr}
              type="button"
              onClick={() => onSelect(dateStr)}
              className={`aspect-square rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center relative
                ${isSelected ? 'bg-white text-black' : 'text-white hover:bg-white/5'}
                ${!active && !isSelected ? 'opacity-20' : ''}
              `}
            >
              {date.getDate()}
              {active && !isSelected && <span className="absolute bottom-2 w-1 h-1 rounded-full bg-white" />}
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
    program: (searchParams.get("program") as any) || "pass-5",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch classes
  useEffect(() => {
    async function getClasses() {
      const { data } = await supabase.from("classes").select("*");
      if (data) {
        // 1. 今日（ローカル）の 00:00:00 を取得
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        const futureClasses = data.filter(c => {
          const classDate = new Date(c.class_date + 'T00:00:00');
          return classDate >= today;
        });
        
        // 2. 同じ名前・日付・時間の重複を除外する
        const seen = new Set<string>();
        const uniqueClasses = futureClasses.filter(c => {
          const key = `${c.title}|${c.class_date}|${c.start_time}|${c.end_time}|${c.program}`;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });
        
        setClasses(uniqueClasses);
      }
    }
    getClasses();
  }, []);

  // pass-5 や pass-10 が選択された場合、対象となるクラス (micro-academy, futures, high) を表示
  const matchesProgram = (classProgram: string, selectedProgram: string) => {
    if (selectedProgram === 'pass-5' || selectedProgram === 'pass-10') {
      return classProgram === 'micro-academy' || classProgram === 'futures' || classProgram === 'high';
    }
    return classProgram === selectedProgram;
  };

  const availableDates = useMemo(() => {
    return classes
      .filter(c => matchesProgram(c.program, form.program))
      .map(c => c.class_date);
  }, [classes, form.program]);
  
  const selectedDayClasses = useMemo(() => {
    if (!form.preferred_date) return [];
    return classes.filter(c => c.class_date === form.preferred_date && matchesProgram(c.program, form.program));
  }, [form.preferred_date, classes, form.program]);

  const TOTAL_STEPS = 3;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (step < TOTAL_STEPS) {
      setStep(step + 1);
      return;
    }

    setLoading(true);
    const isPass = form.program === 'pass-5' || form.program === 'pass-10';

    try {
      const res = await fetch("/api/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone || null,
          program: form.program,
          preferred_date: form.preferred_date || null,
          preferred_time: form.preferred_time || null,
          message: isPass ? "PASS PURCHASE / FIRST SESSION" : (form.message || null),
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Booking failed");
      }

      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || "Failed to book. Please contact info@ltseliteprep.ca");
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
                  onClick={() => setStep(3)} 
                  className="flex-1 bg-white text-black font-black py-5 rounded-2xl flex items-center justify-center gap-2"
                >
                  CHOOSE DATE 
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
              <button type="button" onClick={() => setStep(2)} className="flex items-center gap-2 text-white/40 hover:text-white text-[10px] font-black uppercase transition-all mb-2">
                <ChevronLeft className="w-3 h-3" /> Previous: Select Level
              </button>

              <div>
                <label className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-3 block flex items-center gap-2"><CalendarIcon className="w-3 h-3" /> Available Classes</label>
                <Calendar selectedDate={form.preferred_date || ""} onSelect={date => setForm({...form, preferred_date: date, preferred_time: ""})} availableDates={availableDates} />
              </div>
              
              {/* Quick Select List */}
              <div className="pt-4">
                <label className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-4 block">Select a Session From List</label>
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  {classes.filter(c => matchesProgram(c.program, form.program)).length > 0 ? (
                    classes
                      .filter(c => matchesProgram(c.program, form.program))
                      .sort((a, b) => new Date(a.class_date + 'T00:00:00').getTime() - new Date(b.class_date + 'T00:00:00').getTime())
                      .map(c => {
                        const isSelected = form.preferred_date === c.class_date && form.preferred_time === `${c.start_time} - ${c.end_time}`;
                        const d = new Date(c.class_date + 'T00:00:00');
                        const dateLabel = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', weekday: 'short' });
                        
                        return (
                          <button 
                            key={c.id} 
                            type="button" 
                            onClick={() => setForm({...form, preferred_date: c.class_date, preferred_time: `${c.start_time} - ${c.end_time}`})}
                            className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all
                              ${isSelected ? 'bg-white text-black border-white' : 'bg-[#111] text-white/60 border-white/5 hover:border-white/10'}`}
                          >
                            <div className="flex flex-col text-left">
                              <span className="text-[10px] font-black uppercase opacity-50 mb-1">{dateLabel}</span>
                              <span className="font-bold text-sm uppercase">{c.title}</span>
                            </div>
                            <div className="text-right">
                              <span className="text-xs font-black opacity-50 block">{c.start_time.slice(0,5)} - {c.end_time.slice(0,5)}</span>
                            </div>
                          </button>
                        );
                      })
                  ) : (
                    <div className="text-center py-10 border border-dashed border-white/10 rounded-2xl">
                      <p className="text-white/20 text-xs font-bold uppercase tracking-widest">No upcoming classes found</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setStep(2)} className="w-1/3 bg-[#111] text-white/50 font-bold py-5 rounded-2xl border border-white/5">BACK</button>
                <button 
                  type="submit" 
                  disabled={(!form.preferred_date || !form.preferred_time) || loading} 
                  className="flex-1 bg-white text-black font-black py-5 rounded-2xl flex items-center justify-center gap-2 disabled:opacity-30"
                >
                  {loading ? 'SENDING...' : 'CONFIRM BOOKING'}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

