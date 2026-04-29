// ============================================================
// 管理者ダッシュボード (app/admin/page.tsx)
// 予約一覧の確認・管理（パスワード保護）
// ============================================================

"use client";

import { useState, useEffect, useMemo } from "react";
import { supabase, type Booking, type BookingStatus, type ClassSchedule } from "@/lib/supabase";
import {
  Search,
  Filter,
  RefreshCw,
  Calendar,
  Mail,
  Phone,
  MessageSquare,
  Lock,
  ArrowRight,
  CheckCircle,
  XCircle,
  Clock,
  Users,
  TrendingUp,
  Plus,
  Trash2,
} from "lucide-react";

// ── 管理者パスワード (MVP用) ──────────────────────────────────
// 本番では Supabase Auth を使ってください
const ADMIN_PASSWORD = "lts2026";

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);

  if (!authenticated) {
    return <LoginScreen onSuccess={() => setAuthenticated(true)} />;
  }

  return <Dashboard />;
}

// ── ログイン画面 ──────────────────────────────────────────────

function LoginScreen({ onSuccess }: { onSuccess: () => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      onSuccess();
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-5">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div
            className="w-16 h-16 rounded-2xl bg-[#F97316]/10
                        flex items-center justify-center mx-auto mb-4"
          >
            <Lock className="w-7 h-7 text-[#F97316]" />
          </div>
          <h1 className="text-2xl font-extrabold mb-2">Admin Dashboard</h1>
          <p className="text-white/40 text-sm">
            Enter the admin password to continue
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full bg-[#111] border border-white/8 text-white
                       placeholder-white/20 rounded-xl px-4 py-3.5 text-base
                       focus:outline-none focus:border-[#F97316]/40
                       focus:shadow-[0_0_0_3px_rgba(249,115,22,0.1)] transition-all"
          />
          {error && (
            <p className="text-red-400 text-sm text-center">
              Wrong password. Try again.
            </p>
          )}
          <button
            type="submit"
            className="w-full btn-accent font-bold py-3.5 rounded-xl
                       flex items-center justify-center gap-2"
          >
            Sign In
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}

// ── ダッシュボード ────────────────────────────────────────────

function Dashboard() {
  const [activeTab, setActiveTab] = useState<"bookings" | "schedule">("bookings");

  return (
    <div className="min-h-screen bg-[#0a0a0a] pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">

        {/* Header & Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold mb-1">
              Admin Dashboard
            </h1>
            <p className="text-white/40 text-sm">
              Manage your bookings and schedule
            </p>
          </div>

          <div className="flex bg-[#111] p-1 rounded-xl border border-white/10">
            <button
              onClick={() => setActiveTab("bookings")}
              className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === "bookings" ? "bg-[#F97316] text-white shadow-lg" : "text-white/50 hover:text-white"
                }`}
            >
              Bookings
            </button>
            <button
              onClick={() => setActiveTab("schedule")}
              className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === "schedule" ? "bg-[#F97316] text-white shadow-lg" : "text-white/50 hover:text-white"
                }`}
            >
              Schedule
            </button>
          </div>
        </div>

        {activeTab === "bookings" ? <BookingsTab /> : <ScheduleTab />}
      </div>
    </div>
  );
}

// ── Bookings Tab ──────────────────────────────────────────────

function BookingsTab() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<BookingStatus | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  // データ取得
  async function fetchBookings() {
    setRefreshing(true);
    const { data, error } = await supabase
      .from("bookings")
      .select("*")
      .order("created_at", { ascending: false });

    if (data) setBookings(data as Booking[]);
    if (error) console.error("Fetch error:", error);
    setLoading(false);
    setRefreshing(false);
  }

  useEffect(() => {
    fetchBookings();
  }, []);

  // フィルター
  const filtered = useMemo(() => {
    return bookings.filter((b) => {
      const matchStatus =
        statusFilter === "all" || b.status === statusFilter;
      const matchSearch =
        !searchQuery ||
        b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.program.toLowerCase().includes(searchQuery.toLowerCase());
      return matchStatus && matchSearch;
    });
  }, [bookings, statusFilter, searchQuery]);

  // ステータスごとのカウント
  const counts = useMemo(() => {
    const c = { total: bookings.length, pending: 0, confirmed: 0, cancelled: 0 };
    bookings.forEach((b) => {
      if (b.status === "pending") c.pending++;
      if (b.status === "confirmed") c.confirmed++;
      if (b.status === "cancelled") c.cancelled++;
    });
    return c;
  }, [bookings]);

  // ステータス更新
  async function updateStatus(id: string, newStatus: BookingStatus) {
    const { error } = await supabase
      .from("bookings")
      .update({ status: newStatus })
      .eq("id", id);

    if (error) {
      console.error("Update error:", error);
      return;
    }

    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: newStatus } : b))
    );
  }

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <span className="w-8 h-8 border-2 border-[#F97316]/30 border-t-[#F97316] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={Users}
          label="Total"
          value={counts.total}
          color="text-white"
          bg="bg-white/5"
        />
        <StatCard
          icon={Clock}
          label="Pending"
          value={counts.pending}
          color="text-yellow-400"
          bg="bg-yellow-400/5"
        />
        <StatCard
          icon={CheckCircle}
          label="Confirmed"
          value={counts.confirmed}
          color="text-green-400"
          bg="bg-green-400/5"
        />
        <StatCard
          icon={XCircle}
          label="Cancelled"
          value={counts.cancelled}
          color="text-red-400"
          bg="bg-red-400/5"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
          <input
            type="text"
            placeholder="Search by name, email, or program..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#111] border border-white/8 text-white
                         placeholder-white/20 rounded-xl pl-10 pr-4 py-2.5 text-sm
                         focus:outline-none focus:border-[#F97316]/40 transition-all"
          />
        </div>

        {/* Status filter buttons */}
        <div className="flex gap-2">
          {(["all", "pending", "confirmed", "cancelled"] as const).map(
            (status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`text-xs font-semibold px-3 py-2 rounded-lg capitalize
                             transition-all ${statusFilter === status
                    ? "bg-[#F97316]/10 text-[#F97316] border border-[#F97316]/20"
                    : "text-white/30 hover:text-white/50 border border-white/5"
                  }`}
              >
                {status}
              </button>
            )
          )}
        </div>
      </div>

      {/* Booking List */}
      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <Filter className="w-8 h-8 text-white/10 mx-auto mb-3" />
          <p className="text-white/30">No bookings found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((booking) => (
            <BookingCard
              key={booking.id}
              booking={booking}
              onUpdateStatus={updateStatus}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Schedule Tab ──────────────────────────────────────────────

function ScheduleTab() {
  const [classes, setClasses] = useState<ClassSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Form states
  const [title, setTitle] = useState("LTS Futures (Youth)");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("18:00");
  const [endTime, setEndTime] = useState("19:30");
  const [coach, setCoach] = useState("Paolo");
  const [capacity, setCapacity] = useState("15");

  async function fetchClasses() {
    setLoading(true);
    const { data, error } = await supabase
      .from("classes")
      .select("*")
      .order("class_date", { ascending: true })
      .order("start_time", { ascending: true });

    if (data) setClasses(data as ClassSchedule[]);
    if (error) console.error("Fetch classes error:", error);
    setLoading(false);
  }

  useEffect(() => {
    fetchClasses();
  }, []);

  async function handleAddClass(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/admin/classes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        password: ADMIN_PASSWORD,
        title,
        class_date: date,
        start_time: startTime,
        end_time: endTime,
        coach,
        capacity,
      }),
    });

    if (res.ok) {
      setShowForm(false);
      fetchClasses();
    } else {
      alert("Failed to add class");
    }
  }

  async function handleDeleteClass(id: string) {
    if (!confirm("Are you sure you want to delete this class?")) return;

    const res = await fetch(`/api/admin/classes?id=${id}&password=${ADMIN_PASSWORD}`, {
      method: "DELETE",
    });

    if (res.ok) {
      fetchClasses();
    } else {
      alert("Failed to delete class");
    }
  }

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <span className="w-8 h-8 border-2 border-[#F97316]/30 border-t-[#F97316] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Upcoming Classes</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-[#F97316] text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-[#EA580C] transition-all"
        >
          {showForm ? <XCircle className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? "Cancel" : "Add Class"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAddClass} className="bg-[#111] border border-white/10 rounded-2xl p-6 mb-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-2">Class Title</label>
            <input required type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#F97316]/50 focus:outline-none" />
          </div>
          <div>
            <label className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-2">Date (YYYY-MM-DD)</label>
            <input required type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#F97316]/50 focus:outline-none" />
          </div>
          <div>
            <label className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-2">Start Time</label>
            <input required type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#F97316]/50 focus:outline-none" />
          </div>
          <div>
            <label className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-2">End Time</label>
            <input required type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#F97316]/50 focus:outline-none" />
          </div>
          <div>
            <label className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-2">Coach</label>
            <input required type="text" value={coach} onChange={(e) => setCoach(e.target.value)} className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#F97316]/50 focus:outline-none" />
          </div>
          <div>
            <label className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-2">Capacity</label>
            <input required type="number" value={capacity} onChange={(e) => setCapacity(e.target.value)} className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#F97316]/50 focus:outline-none" />
          </div>
          <div className="sm:col-span-2 pt-2">
            <button type="submit" className="w-full bg-white text-black font-bold py-3.5 rounded-xl hover:bg-[#F97316] hover:text-white transition-all">
              Save Class Schedule
            </button>
          </div>
        </form>
      )}

      {classes.length === 0 ? (
        <div className="text-center py-20 bg-[#111] rounded-2xl border border-white/5">
          <Calendar className="w-8 h-8 text-white/10 mx-auto mb-3" />
          <p className="text-white/30">No upcoming classes scheduled.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {classes.map((c) => (
            <div key={c.id} className="bg-[#111] border border-white/10 rounded-2xl p-5 relative group">
              <button
                onClick={() => handleDeleteClass(c.id)}
                className="absolute top-4 right-4 text-white/20 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <div className="text-xs font-bold text-[#F97316] tracking-widest uppercase mb-1">
                {c.class_date}
              </div>
              <h3 className="font-bold text-lg mb-2 truncate pr-6">{c.title}</h3>

              <div className="flex flex-col gap-1.5 mt-4">
                <DetailRow icon={Clock} label="Time" value={`${c.start_time.slice(0, 5)} - ${c.end_time.slice(0, 5)}`} />
                <DetailRow icon={Users} label="Coach" value={c.coach || "TBA"} />
                <DetailRow icon={TrendingUp} label="Spots" value={`${c.capacity - c.booked_count} available`} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Stats Card ───────────────────────────────────────────────

function StatCard({
  icon: Icon,
  label,
  value,
  color,
  bg,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  color: string;
  bg: string;
}) {
  return (
    <div className="bg-[#111] border border-white/7 rounded-2xl p-5">
      <div className="flex items-center gap-3 mb-3">
        <div
          className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center`}
        >
          <Icon className={`w-4 h-4 ${color}`} />
        </div>
        <span className="text-xs font-semibold uppercase tracking-widest text-white/30">
          {label}
        </span>
      </div>
      <p className={`text-3xl font-extrabold ${color}`}>{value}</p>
    </div>
  );
}

// ── Booking Card ─────────────────────────────────────────────

function BookingCard({
  booking,
  onUpdateStatus,
}: {
  booking: Booking;
  onUpdateStatus: (id: string, status: BookingStatus) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  const date = new Date(booking.created_at);
  const dateStr = date.toLocaleDateString("en-CA", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  const timeStr = date.toLocaleTimeString("en-CA", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div
      className="bg-[#111] border border-white/7 rounded-2xl overflow-hidden
                 hover:border-white/12 transition-all"
    >
      {/* Main Row */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex flex-col sm:flex-row sm:items-center
                   gap-3 sm:gap-6 p-5 text-left"
      >
        {/* Status Badge */}
        <StatusBadge status={booking.status} />

        {/* Name & Program */}
        <div className="flex-1 min-w-0">
          <p className="font-bold text-base truncate">{booking.name}</p>
          <p className="text-xs text-white/30 capitalize mt-0.5">
            {booking.program === "trial" ? "Free Trial" : 
             booking.program === "pass-5" ? "5-Session Pass" :
             booking.program === "pass-10" ? "10-Session Pass" :
             `LTS ${booking.program}`}
          </p>
        </div>

        {/* Date */}
        <div className="text-right">
          <p className="text-xs text-white/40">{dateStr}</p>
          <p className="text-xs text-white/20">{timeStr}</p>
        </div>

        {/* Expand arrow */}
        <ArrowRight
          className={`w-4 h-4 text-white/20 transition-transform shrink-0
                      ${expanded ? "rotate-90" : ""}`}
        />
      </button>

      {/* Expanded Details */}
      {expanded && (
        <div className="border-t border-white/5 px-5 py-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            <DetailRow icon={Mail} label="Email" value={booking.email} />
            <DetailRow
              icon={Phone}
              label="Phone"
              value={booking.phone || "—"}
            />
            <DetailRow
              icon={Calendar}
              label="Date / Session"
              value={(booking.program === "pass-5" || booking.program === "pass-10") ? "🎫 PASS PURCHASE" : (booking.preferred_date || "—")}
            />
            <DetailRow
              icon={Clock}
              label="Time / Slot"
              value={(booking.program === "pass-5" || booking.program === "pass-10") ? "N/A (Bulk Pass)" : (booking.preferred_time || "—")}
            />
          </div>

          {booking.message && (
            <div className="bg-white/3 border border-white/5 rounded-xl p-3 mb-4">
              <div className="flex items-center gap-2 text-xs text-white/30 mb-1">
                <MessageSquare className="w-3 h-3" />
                Message
              </div>
              <p className="text-sm text-white/50">{booking.message}</p>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2">
            {booking.status !== "confirmed" && (
              <button
                onClick={() => onUpdateStatus(booking.id, "confirmed")}
                className="text-xs font-semibold px-4 py-2 rounded-lg
                           bg-green-500/10 text-green-400 border border-green-500/20
                           hover:bg-green-500/20 transition-all"
              >
                ✓ Confirm
              </button>
            )}
            {booking.status !== "pending" && booking.status !== "cancelled" && (
              <button
                onClick={() => onUpdateStatus(booking.id, "pending")}
                className="text-xs font-semibold px-4 py-2 rounded-lg
                           bg-yellow-500/10 text-yellow-400 border border-yellow-500/20
                           hover:bg-yellow-500/20 transition-all"
              >
                ⏳ Set Pending
              </button>
            )}
            {booking.status !== "cancelled" && (
              <button
                onClick={() => onUpdateStatus(booking.id, "cancelled")}
                className="text-xs font-semibold px-4 py-2 rounded-lg
                           bg-red-500/10 text-red-400 border border-red-500/20
                           hover:bg-red-500/20 transition-all"
              >
                ✕ Cancel
              </button>
            )}
            <a
              href={`mailto:${booking.email}`}
              className="text-xs font-semibold px-4 py-2 rounded-lg
                         bg-white/5 text-white/40 border border-white/10
                         hover:bg-white/10 hover:text-white transition-all"
            >
              ✉ Email
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Helper Components ────────────────────────────────────────

function StatusBadge({ status }: { status: BookingStatus }) {
  const config = {
    pending: { class: "badge-pending", text: "Pending" },
    confirmed: { class: "badge-confirmed", text: "Confirmed" },
    cancelled: { class: "badge-cancelled", text: "Cancelled" },
  };
  const c = config[status];
  return (
    <span
      className={`${c.class} text-xs font-bold px-3 py-1 rounded-full
                  inline-flex items-center`}
    >
      {c.text}
    </span>
  );
}

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="w-3.5 h-3.5 text-white/20 shrink-0" />
      <span className="text-xs text-white/25">{label}:</span>
      <span className="text-sm text-white/60 truncate">{value}</span>
    </div>
  );
}
