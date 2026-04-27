// ============================================================
// SCHEDULE PAGE (app/schedule/page.tsx)
// Calendar + Philosophy
// ============================================================

"use client";

import Link from "next/link";
import { Calendar as CalendarIcon, Clock, MapPin, ArrowRight } from "lucide-react";

export default function SchedulePage() {
  return (
    <div className="min-h-screen bg-[#000000] text-white pt-28 pb-24">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        
        {/* Header */}
        <div className="mb-16">
          <h1 className="text-5xl sm:text-7xl font-black uppercase tracking-tighter mb-6">
            Session<br/><span className="text-white/40">Schedule</span>
          </h1>
          <div className="flex flex-col sm:flex-row gap-6 text-white/50 font-bold uppercase tracking-widest text-xs">
            <div className="flex items-center gap-2"><MapPin className="w-4 h-4" /> Vancouver, BC</div>
            <div className="flex items-center gap-2"><Clock className="w-4 h-4" /> Updated Weekly</div>
          </div>
        </div>

        {/* Calendar Placeholder */}
        <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8 sm:p-12 mb-20">
          <div className="flex items-center gap-4 mb-10">
            <div className="w-12 h-12 bg-white text-black rounded-full flex items-center justify-center">
              <CalendarIcon className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-black uppercase">Upcoming Sessions</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
            {["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"].map((day) => (
              <div key={day} className="space-y-4">
                <div className="text-[10px] font-black text-white/20 tracking-[0.2em]">{day}</div>
                <div className="h-32 border border-white/5 rounded-2xl bg-white/[0.02] flex items-center justify-center">
                  <span className="text-[10px] font-bold text-white/10 italic">TBA</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 p-8 bg-white text-black rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-6">
            <p className="font-black text-xl uppercase italic">Ready to get on the court?</p>
            <Link href="/micro-academy" className="bg-black text-white px-8 py-4 rounded-xl font-black text-sm hover:scale-105 transition-all">
              TRAIN NOW
            </Link>
          </div>
        </div>

        {/* Philosophy Section */}
        <section className="max-w-4xl">
          <h2 className="text-3xl sm:text-4xl font-black uppercase mb-8 leading-[1.1]">
            The best way to learn the game of basketball is by playing the game of basketball.
          </h2>
          <p className="text-xl text-white/40 font-medium leading-relaxed mb-10">
            Group sessions provide athletes with the opportunity to refine their skills within the constraints of play. 
            Our environment realistically places players in situations that are common in competition.
          </p>
          <Link href="/about" className="inline-flex items-center gap-3 font-black border-b-4 border-white pb-1 text-2xl hover:text-white/60 hover:border-white/60 transition-all">
            LEARN MORE <ArrowRight className="w-6 h-6" />
          </Link>
        </section>

      </div>
    </div>
  );
}
