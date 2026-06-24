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
  const [activeTab, setActiveTab] = useState<"bookings" | "passes" | "camp" | "college" | "schedule">("bookings");

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
              Manage your bookings, passes, college inquiries and schedule
            </p>
          </div>

          <div className="flex bg-[#111] p-1 rounded-xl border border-white/10 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveTab("bookings")}
              className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${activeTab === "bookings" ? "bg-[#F97316] text-white shadow-lg" : "text-white/50 hover:text-white"
                }`}
            >
              Bookings
            </button>
            <button
              onClick={() => setActiveTab("passes")}
              className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${activeTab === "passes" ? "bg-[#F97316] text-white shadow-lg" : "text-white/50 hover:text-white"
                }`}
            >
              Pass Holders
            </button>
            <button
              onClick={() => setActiveTab("camp")}
              className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${activeTab === "camp" ? "bg-[#F97316] text-white shadow-lg" : "text-white/50 hover:text-white"
                }`}
            >
              Camp
            </button>
            <button
              onClick={() => setActiveTab("college")}
              className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${activeTab === "college" ? "bg-[#F97316] text-white shadow-lg" : "text-white/50 hover:text-white"
                }`}
            >
              College
            </button>
            <button
              onClick={() => setActiveTab("schedule")}
              className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${activeTab === "schedule" ? "bg-[#F97316] text-white shadow-lg" : "text-white/50 hover:text-white"
                }`}
            >
              Schedule
            </button>
          </div>
        </div>

        {activeTab === "bookings" && <BookingsTab type="sessions" />}
        {activeTab === "passes" && <PassHoldersTab />}
        {activeTab === "camp" && <CampTab />}
        {activeTab === "college" && <BookingsTab type="college" />}
        {activeTab === "schedule" && <ScheduleTab />}
      </div>
    </div>
  );
}

// ── Bookings Tab ──────────────────────────────────────────────

function BookingsTab({ type }: { type: "sessions" | "passes" | "college" }) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<BookingStatus | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  // データ取得
  async function fetchBookings() {
    setRefreshing(true);
    setFetchError(null);
    const { data, error } = await supabase
      .from("bookings")
      .select("*")
      .order("created_at", { ascending: false });

    if (data) {
      // タブの種類に応じてフィルタリング
      const filteredData = data.filter(b => {
        if (type === "college") return b.program === "college";
        // sessions タブの場合は、カレッジ以外の全ての予約（パス購入・パス利用を含む）を表示
        return b.program !== "college";
      });
      setBookings(filteredData as Booking[]);
    }
    if (error) setFetchError(error.message || "Failed to load bookings.");
    setLoading(false);
    setRefreshing(false);
  }

  useEffect(() => {
    fetchBookings();
  }, [type]); // タブ切り替え時に再取得

  // プログラム更新（移動）
  async function updateProgram(id: string, newProgram: any) {
    const { error } = await supabase
      .from("bookings")
      .update({ program: newProgram })
      .eq("id", id);
    
    if (!error) {
      // 別のプログラムに移動したため、現在のリストからは消す（または再取得）
      fetchBookings();
    }
  }

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

      {/* Fetch Error */}
      {fetchError && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-bold px-5 py-4 rounded-2xl flex items-center justify-between">
          <span>{fetchError}</span>
          <button onClick={fetchBookings} className="text-xs underline opacity-70 hover:opacity-100">Retry</button>
        </div>
      )}

      {/* Booking List */}
      {!fetchError && filtered.length === 0 ? (
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
              onUpdateProgram={updateProgram}
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
  const [program, setProgram] = useState("futures");
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
        program,
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
            <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-2 block">Class Title</label>
            <input required value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-black border border-white/5 rounded-xl px-4 py-3 text-white outline-none focus:border-[#F97316]/50 transition-all" />
          </div>
          <div>
            <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-2 block">Program</label>
            <select value={program} onChange={e => setProgram(e.target.value)} className="w-full bg-black border border-white/5 rounded-xl px-4 py-3 text-white outline-none focus:border-[#F97316]/50 transition-all">
              <option value="micro-academy">Micro Academy</option>
              <option value="college">LTS College</option>
              <option value="private">Private Training</option>
            </select>
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
  onUpdateProgram,
}: {
  booking: Booking;
  onUpdateStatus: (id: string, status: BookingStatus) => void;
  onUpdateProgram: (id: string, program: string) => void;
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
            <div className="flex-1" />
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest mr-2">Move to:</span>
              {(["futures", "high", "college"] as const).map(prog => (
                booking.program !== prog && (
                  <button
                    key={prog}
                    onClick={() => onUpdateProgram(booking.id, prog)}
                    className="text-[10px] font-bold px-3 py-1.5 rounded-lg
                               bg-white/5 text-white/40 border border-white/5
                               hover:bg-white/10 hover:text-white transition-all capitalize"
                  >
                    {prog}
                  </button>
                )
              ))}
            </div>
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

// ── Camp Tab ──────────────────────────────────────────────────────

const PACKAGE_LABELS: Record<string, string> = {
  "weekend-1": "Weekend 1 (Jul 11+12)",
  "weekend-2": "Weekend 2 (Jul 18+19)",
  "both": "Both Weekends",
  "dropin": "Drop-in",
};

const SESSION_LABELS: Record<string, string> = {
  jul11: "Jul 11 BUILD",
  jul12: "Jul 12 PERFORM",
  jul18: "Jul 18 BUILD",
  jul19: "Jul 19 PERFORM",
};

function CampTab() {
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  async function fetchRegistrations() {
    setLoading(true);
    setFetchError(null);
    try {
      const { data, error } = await supabase
        .from("camp_registrations")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setRegistrations(data || []);
    } catch (err: any) {
      setFetchError(err.message || "Failed to fetch camp registrations");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchRegistrations(); }, []);

  const filtered = registrations.filter(r =>
    !search ||
    r.athlete_name?.toLowerCase().includes(search.toLowerCase()) ||
    r.parent_name?.toLowerCase().includes(search.toLowerCase()) ||
    r.parent_email?.toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    total: registrations.length,
    both: registrations.filter(r => r.package_type === "both").length,
    weekend1: registrations.filter(r => r.package_type === "weekend-1").length,
    weekend2: registrations.filter(r => r.package_type === "weekend-2").length,
    dropin: registrations.filter(r => r.package_type === "dropin").length,
  };

  return (
    <div>
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
        {[
          { label: "Total", value: stats.total },
          { label: "Both Weekends", value: stats.both },
          { label: "Weekend 1", value: stats.weekend1 },
          { label: "Weekend 2", value: stats.weekend2 },
          { label: "Drop-in", value: stats.dropin },
        ].map(s => (
          <div key={s.label} className="bg-[#111] border border-white/5 rounded-xl p-4 text-center">
            <p className="text-2xl font-black">{s.value}</p>
            <p className="text-[10px] text-white/40 uppercase tracking-widest mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input
            type="text"
            placeholder="Search athlete, parent, or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-[#111] border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white outline-none focus:border-white/30"
          />
        </div>
        <button
          onClick={fetchRegistrations}
          className="p-2.5 bg-[#111] border border-white/10 rounded-xl hover:border-white/30 transition-colors"
        >
          <RefreshCw className="w-4 h-4 text-white/50" />
        </button>
      </div>

      {fetchError && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-4 rounded-xl mb-4 flex justify-between items-center">
          <span>{fetchError}</span>
          <button onClick={fetchRegistrations} className="text-xs underline opacity-70 hover:opacity-100">Retry</button>
        </div>
      )}

      {loading ? (
        <div className="text-center py-20 text-white/30">Loading…</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-white/20 border border-dashed border-white/10 rounded-2xl">
          <p className="font-bold uppercase tracking-widest text-sm">No registrations found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(r => {
            const pkgLabel = PACKAGE_LABELS[r.package_type] || r.package_type || "—";
            const sessionLabel = r.dropin_session ? SESSION_LABELS[r.dropin_session] || r.dropin_session : null;
            const date = r.created_at ? new Date(r.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—";
            return (
              <div key={r.id} className="bg-[#111] border border-white/5 rounded-2xl p-5">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1 flex-wrap">
                      <span className="font-black text-white">{r.athlete_name}</span>
                      <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-white/10 text-white/60">
                        {pkgLabel}
                        {sessionLabel ? ` · ${sessionLabel}` : ""}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-white/40">
                      <span className="flex items-center gap-1"><Users className="w-3 h-3" /> Parent: {r.parent_name || "—"}</span>
                      <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {r.parent_email || "—"}</span>
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {date}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xl font-black text-white">{r.amount || "—"}</p>
                    <p className={`text-[10px] uppercase font-bold mt-0.5 ${
                      r.status === "paid" ? "text-green-400" :
                      r.status === "cancelled" ? "text-red-400" :
                      "text-yellow-400"
                    }`}>
                      {r.status || "pending"}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Pass Holders Tab ──────────────────────────────────────────────

function PassHoldersTab() {
  const [passHolders, setPassHolders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  async function fetchPassHolders() {
    setRefreshing(true);
    setFetchError(null);
    const { data, error } = await supabase
      .from("pass_holders")
      .select("*")
      .eq("status", "active")
      .order("created_at", { ascending: false });

    if (error) setFetchError(error.message || "Failed to load pass holders.");
    if (data) setPassHolders(data);
    setLoading(false);
    setRefreshing(false);
  }

  useEffect(() => {
    fetchPassHolders();
  }, []);

  async function addSessions(holder: any, count: number) {
    if (!confirm(`Add ${count} sessions to ${holder.name}?`)) return;
    setRefreshing(true);
    const { error } = await supabase
      .from("pass_holders")
      .update({ sessions_total: holder.sessions_total + count })
      .eq("id", holder.id);
    if (!error) fetchPassHolders();
    else setRefreshing(false);
  }

  async function deductSession(holder: any) {
    if (!confirm(`Manually deduct 1 session from ${holder.name}?`)) return;
    setRefreshing(true);
    const newUsed = holder.sessions_used + 1;
    const updates: any = { sessions_used: newUsed };
    if (newUsed >= holder.sessions_total) updates.status = "expired";
    const { error } = await supabase
      .from("pass_holders")
      .update(updates)
      .eq("id", holder.id);
    if (!error) fetchPassHolders();
    else setRefreshing(false);
  }

  async function cancelPass(holder: any) {
    if (!confirm(`Cancel ALL passes for ${holder.name}? This cannot be undone.`)) return;
    setRefreshing(true);
    const { error } = await supabase
      .from("pass_holders")
      .update({ status: "cancelled" })
      .eq("id", holder.id);
    if (!error) fetchPassHolders();
    else setRefreshing(false);
  }

  if (loading && !refreshing) {
    return <div className="text-white/50 text-center py-20 font-bold tracking-widest text-sm uppercase animate-pulse">Loading Pass Holders...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-black uppercase mb-1">Active Pass Holders</h2>
          <p className="text-white/40 text-sm">Live from the <code className="text-white/30">pass_holders</code> table. Sessions auto-deducted on booking.</p>
        </div>
        <button onClick={fetchPassHolders} className="flex items-center gap-2 text-xs font-bold text-white/50 hover:text-white transition-all uppercase px-4 py-2 border border-white/10 rounded-xl hover:border-white/30">
          <RefreshCw className={`w-3 h-3 ${refreshing ? "animate-spin" : ""}`} /> Refresh
        </button>
      </div>

      {fetchError && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-bold px-5 py-4 rounded-2xl flex items-center justify-between">
          <span>{fetchError}</span>
          <button onClick={fetchPassHolders} className="text-xs underline opacity-70 hover:opacity-100">Retry</button>
        </div>
      )}

      {!fetchError && passHolders.length === 0 ? (
        <div className="text-center py-32 bg-[#111] border border-white/5 rounded-3xl">
          <CheckCircle className="w-12 h-12 text-white/10 mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">No Active Passes</h3>
          <p className="text-white/40 text-sm max-w-sm mx-auto">There are currently no users with active session passes.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {passHolders.map(holder => {
            const remaining = holder.sessions_total - holder.sessions_used;
            const passLabel = holder.pass_type === "pass-5" ? "5-Session Pass" : "10-Session Pass";
            return (
              <div key={holder.id} className="bg-[#111] p-6 rounded-2xl border border-white/10 flex flex-col justify-between">
                <div className="mb-4">
                  <div className="flex items-start justify-between mb-1">
                    <h3 className="font-black text-xl uppercase truncate flex-1">{holder.name}</h3>
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/30 bg-white/5 px-2 py-1 rounded-lg ml-2 shrink-0">{passLabel}</span>
                  </div>
                  <p className="text-white/50 text-xs truncate flex items-center gap-2">
                    <Mail className="w-3 h-3 shrink-0" /> {holder.email}
                  </p>
                  {holder.phone && (
                    <p className="text-white/30 text-xs mt-1 flex items-center gap-2">
                      <Phone className="w-3 h-3 shrink-0" /> {holder.phone}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between py-4 border-y border-white/5 mb-4">
                  <div className="text-center">
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-1">Total</p>
                    <p className="font-bold text-lg">{holder.sessions_total}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-1">Used</p>
                    <p className="font-bold text-lg">{holder.sessions_used}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#F97316] mb-1">Left</p>
                    <p className="font-black text-2xl text-white">{remaining}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button onClick={() => addSessions(holder, 5)} title="Add 5 sessions" className="flex-1 bg-white/5 hover:bg-white/10 text-white font-bold py-2 rounded-lg text-[10px] uppercase transition-all">+5</button>
                  <button onClick={() => deductSession(holder)} title="Deduct 1 session" className="flex-1 bg-white/5 hover:bg-white/10 text-white font-bold py-2 rounded-lg text-[10px] uppercase transition-all">-1</button>
                  <button onClick={() => cancelPass(holder)} title="Cancel pass" className="bg-red-500/10 hover:bg-red-500/20 text-red-500 font-bold px-3 py-2 rounded-lg transition-all">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
