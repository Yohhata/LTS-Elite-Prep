// ============================================================
// 予約フォームページ (app/book/page.tsx)
// サイト内完結の予約フォーム（スマホ最適化）
// ============================================================

"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabase, type BookingInsert } from "@/lib/supabase";
import { ArrowRight, CheckCircle, ArrowLeft, Check } from "lucide-react";

// ── 設定データ ────────────────────────────────────────────────

const PAGE_HEADER = {
  badge: "Session Booking",
  title: "Book Your Session",
  subtitle:
    "Fill in the form and we'll reach out within 24 hours to confirm your spot. No payment required.",
};

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

const SUCCESS_MESSAGE = {
  title: "BOOKING REQUEST SENT",
  body: "We received your request and will reach out within 24 hours to confirm your session. Check your email for updates.",
  btnText: "Book Another Session",
};

const EMPTY_FORM: BookingInsert = {
  name: "",
  email: "",
  phone: "",
  program: "futures",
  preferred_date: "",
  preferred_time: "",
  message: "",
};

// ── ページ本体 ────────────────────────────────────────────────

export default function BookPage() {
  return (
    <Suspense fallback={<BookPageLoading />}>
      <BookPageInner />
    </Suspense>
  );
}

function BookPageLoading() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] pt-28 pb-24 flex items-center justify-center">
      <span className="w-8 h-8 border-2 border-[#F97316]/30 border-t-[#F97316] rounded-full animate-spin" />
    </div>
  );
}

function BookPageInner() {
  const searchParams = useSearchParams();
  const [submitted, setSubmitted] = useState(false);
  const [step, setStep] = useState(1);

  // URL パラメータでプログラムを自動選択
  const preselectedProgram = searchParams.get("program") || "futures";

  if (submitted) {
    return <SuccessMessage onReset={() => setSubmitted(false)} />;
  }

  return (
    <div className="min-h-screen bg-[#000000] pt-28 pb-24">
      <div className="max-w-lg mx-auto px-5 sm:px-8">
        {/* 戻るリンク */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-white/30
                     hover:text-white/60 transition-colors mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to Home
        </Link>

        {/* ページヘッダー */}
        <div className="mb-10 text-center">
          <span
            className="inline-flex items-center gap-2
                       text-xs font-semibold tracking-widest uppercase
                       border border-white/10 text-white/50
                       rounded-full px-3.5 py-1.5 mb-5"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-white/50" />
            {PAGE_HEADER.badge}
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">
            Book Your <span className="text-white">Session</span>
          </h1>
          <p className="text-white/40 text-lg max-w-xl mx-auto">
            {PAGE_HEADER.subtitle}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1 bg-white/5 rounded-full mb-8 overflow-hidden">
          <div
            className={`h-full bg-white transition-all duration-500`}
            style={{ width: `${(step / 2) * 100}%` }}
          />
        </div>
        <div className="flex justify-between mb-10 px-1">
          {[1, 2].map((s) => (
            <span
              key={s}
              className={`text-[10px] font-bold tracking-widest uppercase transition-colors
                             ${step >= s ? "text-white" : "text-white/20"}`}
            >
              Step 0{s}
            </span>
          ))}
        </div>

        {/* 予約フォーム */}
        <BookingForm
          initialProgram={preselectedProgram}
          onSuccess={() => setSubmitted(true)}
          onStepChange={setStep}
        />
      </div>
    </div>
  );
}

// ── 予約フォーム ──────────────────────────────────────────────

function BookingForm({
  initialProgram,
  onSuccess,
  onStepChange,
}: {
  initialProgram: string;
  onSuccess: () => void;
  onStepChange: (step: number) => void;
}) {
  const [form, setForm] = useState<BookingInsert>({
    ...EMPTY_FORM,
    program: (initialProgram as BookingInsert["program"]) || "trial",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { error: dbError } = await supabase.from("bookings").insert({
        name: form.name,
        email: form.email,
        phone: form.phone || null,
        program: form.program,
        preferred_date: form.preferred_date || null,
        preferred_time: form.preferred_time || null,
        message: form.message || null,
      });

      if (dbError) throw dbError;
      onSuccess();
    } catch (err) {
      console.error("Booking error:", err);
      setError(
        "Something went wrong. Please email us directly at info@ltseliteprep.ca"
      );
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Step 1: Info */}
      <div className="space-y-5">
        <Field label="Full Name *">
          <Input
            name="name"
            type="text"
            placeholder="Your full name"
            value={form.name}
            onChange={handleChange}
            required
            onFocus={() => onStepChange(1)}
          />
        </Field>
        <Field label="Email *">
          <Input
            name="email"
            type="email"
            placeholder="your@email.com"
            value={form.email}
            onChange={handleChange}
            required
          />
        </Field>
      </div>

      {/* Step 2: Selection */}
      <div className="space-y-5" onFocus={() => onStepChange(2)}>
        <label className="text-sm font-semibold text-white/50 block">
          Select Program *
        </label>
        <div className="grid grid-cols-1 gap-3">
          {PROGRAMS.map(({ id, name, tagline }) => (
            <button
              key={id}
              type="button"
              onClick={() => setForm((prev) => ({ ...prev, program: id as any }))}
              className={`relative text-left p-4 rounded-2xl border transition-all duration-300 ${
                form.program === id
                  ? "border-white bg-white/5"
                  : "border-white/5 bg-transparent hover:border-white/20"
              }`}
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-colors
                                   ${
                                     form.program === id
                                       ? "bg-white text-black"
                                       : "bg-white/5 text-white/40"
                                   }`}
              >

              </div>
              <h3 className="font-bold text-lg mb-1">{name}</h3>
              <p className="text-xs text-white/30">{tagline}</p>

              {form.program === id && (
                <div className="absolute top-4 right-4">
                  <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center">
                    <Check className="w-3 h-3 text-black" />
                  </div>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* メッセージ */}
      <Field label="Message (optional)">
        <textarea
          name="message"
          placeholder="Tell us about your experience level, goals, or any questions..."
          value={form.message ?? ""}
          onChange={handleChange}
          rows={4}
          className={`${INPUT_CLASS} resize-none`}
        />
      </Field>

      {/* エラー */}
      {error && (
        <p
          className="text-red-400 text-sm bg-red-500/8 border border-red-500/15
                     rounded-xl px-4 py-3"
        >
          {error}
        </p>
      )}

      {/* 送信ボタン */}
      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-2
                   bg-white text-black font-extrabold text-base
                   py-4 rounded-2xl transition-all hover:bg-white/90 disabled:opacity-40"
      >
        {loading ? (
          <>
            <span className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
            Sending...
          </>
        ) : (
          <>
            Send Booking Request
            <ArrowRight className="w-5 h-5" />
          </>
        )}
      </button>

      <p className="text-center text-white/20 text-xs">
        No payment required · We&apos;ll confirm your spot via email
      </p>
    </form>
  );
}

// ── 送信完了画面 ──────────────────────────────────────────────

function SuccessMessage({ onReset }: { onReset: () => void }) {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-5">
      <div className="text-center max-w-md">
        <div
          className="w-20 h-20 rounded-full
                     bg-gradient-to-br from-[#F97316]/20 to-[#F97316]/5
                     border border-[#F97316]/20
                     flex items-center justify-center mx-auto mb-6"
        >
          <CheckCircle className="w-8 h-8 text-[#F97316]" />
        </div>
        <h2 className="text-3xl font-extrabold mb-3">
          {SUCCESS_MESSAGE.title}
        </h2>
        <p className="text-white/40 leading-relaxed mb-8">
          {SUCCESS_MESSAGE.body}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={onReset}
            className="inline-flex items-center justify-center gap-2
                       border border-white/15 hover:border-[#F97316]/30
                       text-white font-semibold px-6 py-3
                       rounded-xl transition-all"
          >
            {SUCCESS_MESSAGE.btnText}
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2
                       text-white/40 hover:text-white font-semibold px-6 py-3
                       rounded-xl transition-all"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

// ── 共通スタイル & ヘルパー ───────────────────────────────────

const INPUT_CLASS = `
  w-full bg-[#111] border border-white/8
  text-white placeholder-white/20
  rounded-xl px-4 py-3.5 text-base
  focus:outline-none focus:border-white/40
  focus:bg-[#161616] focus:shadow-[0_0_0_3px_rgba(255,255,255,0.05)]
  transition-all
`;

const SELECT_CLASS = `
  w-full bg-[#111] border border-white/8
  text-white/80
  rounded-xl px-4 py-3.5 text-base
  focus:outline-none focus:border-white/40
  focus:bg-[#161616] focus:shadow-[0_0_0_3px_rgba(255,255,255,0.05)]
  transition-all appearance-none cursor-pointer
`;

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-semibold text-white/50">{label}</label>
      {children}
    </div>
  );
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={INPUT_CLASS} />;
}
