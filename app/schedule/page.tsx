"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { supabase } from "@/lib/supabase";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, MapPin, Users } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

// ── カレンダーコンポーネント (Display Only) ───────────────────────

function PublicCalendar({ 
  classes 
}: { 
  classes: any[]
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

  const toDateStr = (date: Date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  const getClassesForDate = (date: Date) => {
    const dateStr = toDateStr(date);
    return classes.filter(c => c.class_date === dateStr);
  };

  return (
    <div className="bg-[#111] border border-white/5 rounded-3xl overflow-hidden p-8 shadow-2xl">
      <div className="flex items-center justify-between mb-8 px-2">
        <h3 className="font-black text-white uppercase tracking-tighter text-2xl">{monthName}</h3>
        <div className="flex gap-2">
          <button onClick={prevMonth} className="p-3 hover:bg-white/5 rounded-xl text-white/40 transition-all border border-white/5"><ChevronLeft className="w-5 h-5" /></button>
          <button onClick={nextMonth} className="p-3 hover:bg-white/5 rounded-xl text-white/40 transition-all border border-white/5"><ChevronRight className="w-5 h-5" /></button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2 text-center mb-4">
        {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((d, i) => (
          <span key={`${d}-${i}`} className="text-[10px] font-black text-white/20 py-2 tracking-widest">{d}</span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {daysInMonth.map((date, i) => {
          if (!date) return <div key={`empty-${i}`} className="aspect-square" />;
          const dayClasses = getClassesForDate(date);
          const hasClasses = dayClasses.length > 0;
          const isToday = toDateStr(new Date()) === toDateStr(date);

          return (
            <div
              key={toDateStr(date)}
              className={`aspect-square rounded-2xl p-2 transition-all border flex flex-col items-center justify-center gap-1
                ${hasClasses ? 'bg-white/5 border-white/10' : 'border-transparent opacity-20'}
              `}
            >
              <span className={`text-sm font-bold ${hasClasses ? 'text-white' : 'text-white/60'}`}>{date.getDate()}</span>
              <div className="flex gap-1">
                {dayClasses.map((c, idx) => (
                  <div key={idx} className={`w-1.5 h-1.5 rounded-full ${(c.program === 'micro-academy' || c.program === 'futures' || c.program === 'high') ? 'bg-white' : 'bg-white/20'}`} />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 flex flex-wrap gap-4 pt-8 border-t border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-white" />
          <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Micro Academy</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-white/40" />
          <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">LTS College</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-white/20" />
          <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Private Training</span>
        </div>
      </div>
    </div>
  );
}

// ── メインページ ────────────────────────────────────────────────

function ScheduleInner() {
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchClasses() {
      const { data } = await supabase
        .from("classes")
        .select("*")
        .gte("class_date", new Date().toISOString().split('T')[0])
        .order("class_date", { ascending: true });
      
      if (data) setClasses(data);
      setLoading(false);
    }
    fetchClasses();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-[#ffffff] selection:text-white pb-20">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-black/50 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <Image 
              src="/logo/logo1.png" 
              alt="LTS Elite Prep" 
              width={180} 
              height={60} 
              className="h-10 sm:h-12 w-auto object-contain brightness-0 invert" 
              priority
            />
          </Link>
          <Link href="/book" className="bg-white text-black px-6 py-2.5 rounded-full font-black text-xs uppercase hover:bg-white/90 transition-all">
            Book Now
          </Link>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 pt-32">
        <div className="max-w-3xl mb-16">
          <h1 className="text-6xl sm:text-7xl font-black tracking-tighter mb-6 uppercase leading-[0.9]">
            Training<br /><span className="text-white/20">Schedule</span>
          </h1>
          <p className="text-white/40 text-lg max-w-xl font-medium leading-relaxed">
            Check our upcoming sessions and availability. All sessions are updated in real-time by our coaching staff.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Calendar Section */}
          <div className="lg:col-span-2">
            {loading ? (
              <div className="aspect-video bg-[#111] rounded-3xl animate-pulse flex items-center justify-center">
                <span className="text-white/10 font-black uppercase tracking-widest">Loading Calendar...</span>
              </div>
            ) : (
              <PublicCalendar classes={classes} />
            )}
          </div>

          {/* Upcoming List Section */}
          <div className="space-y-6">
            <h2 className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Clock className="w-3 h-3" /> Upcoming Sessions
            </h2>
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
              {classes.length > 0 ? (
                classes.slice(0, 10).map((c) => (
                  <div key={c.id} className="bg-[#111] border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-all group">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <span className="text-[10px] font-black text-white/40 uppercase tracking-widest block mb-1">
                          {new Date(c.class_date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                        </span>
                        <h3 className="font-black text-lg uppercase tracking-tight group-hover:text-white transition-colors">
                          {(c.program === 'futures' || c.program === 'high') ? 'Micro Academy' : c.title}
                        </h3>
                      </div>
                      <div className="px-3 py-1 bg-white/5 rounded-full border border-white/5">
                        <span className="text-[10px] font-black uppercase text-white/40">
                          {(c.program === 'futures' || c.program === 'high') ? 'Micro Academy' : c.program}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-white/40 text-xs">
                        <Clock className="w-3 h-3" />
                        <span>{c.start_time.slice(0, 5)} - {c.end_time.slice(0, 5)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-white/40 text-xs">
                        <MapPin className="w-3 h-3" />
                        <span>Vancouver, BC</span>
                      </div>
                      <div className="flex items-center gap-2 text-white/40 text-xs">
                        <Users className="w-3 h-3" />
                        <span>{c.booked_count} / {c.capacity} Spotted</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-20 border border-dashed border-white/5 rounded-3xl">
                  <p className="text-white/20 text-xs font-bold uppercase tracking-widest">No sessions scheduled</p>
                </div>
              )}
            </div>
            
            <Link href="/book" className="block w-full bg-white text-black text-center py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-white/90 active:scale-[0.98] transition-all shadow-2xl mt-8">
              Book A Session
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function SchedulePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <ScheduleInner />
    </Suspense>
  );
}
