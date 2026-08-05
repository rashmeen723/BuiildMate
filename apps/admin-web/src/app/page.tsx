"use client";

import { useState, useEffect } from "react";
import { BarChart3, TrendingUp, ShieldAlert, Award, Clock, DollarSign, RefreshCw, Users, Box, CreditCard, Megaphone, Loader2, CheckCircle2 } from "lucide-react";
import { adminApi } from "@/services/api";
import { StatCard } from "../components/StatCard";
import { ProgressStat } from "../components/ProgressStat";
import { ConfirmCommissionModal } from "../components/modals/ConfirmCommissionModal";

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  // Form inputs - Commission
  const [serviceCommissionRate, setServiceCommissionRate] = useState<number>(5.0);
  const [rentalCommissionRate, setRentalCommissionRate] = useState<number>(7.0);
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsSuccess, setSettingsSuccess] = useState<string | null>(null);
  const [settingsError, setSettingsError] = useState<string | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  // Form inputs - Broadcast Announcement
  const [broadcastTitle, setBroadcastTitle] = useState("");
  const [broadcastMessage, setBroadcastMessage] = useState("");
  const [targetAudience, setTargetAudience] = useState<"ALL" | "SERVICE_PROVIDER" | "RENTAL_OWNER" | "HOUSEHOLD">("ALL");
  const [broadcastLoading, setBroadcastLoading] = useState(false);
  const [broadcastSuccess, setBroadcastSuccess] = useState<string | null>(null);
  const [broadcastError, setBroadcastError] = useState<string | null>(null);

  const fetchStats = () => {
    setSyncing(true);
    adminApi.getStats()
      .then(setStats)
      .catch(err => console.error("Error fetching stats:", err))
      .finally(() => {
        setLoading(false);
        setSyncing(false);
      });
  };

  const fetchSettings = async () => {
    try {
      const data = await adminApi.getSettings();
      if (data) {
        if (typeof data.serviceCommissionRate === "number") {
          setServiceCommissionRate(data.serviceCommissionRate);
        }
        if (typeof data.rentalCommissionRate === "number") {
          setRentalCommissionRate(data.rentalCommissionRate);
        }
      }
    } catch (err) {
      console.error("Error loading platform settings:", err);
    }
  };

  const handleSettingsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsConfirmOpen(true);
  };

  const confirmSettingsSubmit = async () => {
    setIsConfirmOpen(false);
    setSettingsError(null);
    setSettingsSuccess(null);
    setSettingsLoading(true);

    try {
      const data = await adminApi.updateSettings(Number(serviceCommissionRate), Number(rentalCommissionRate));
      setSettingsSuccess("Commission rates updated successfully!");
      fetchStats(); // Refresh the dynamic stats/earnings card
      if (data.settings) {
        if (typeof data.settings.serviceCommissionRate === "number") {
          setServiceCommissionRate(data.settings.serviceCommissionRate);
        }
        if (typeof data.settings.rentalCommissionRate === "number") {
          setRentalCommissionRate(data.settings.rentalCommissionRate);
        }
      }
    } catch (err: any) {
      setSettingsError(err.message || "Failed to update commission rates.");
    } finally {
      setSettingsLoading(false);
    }
  };

  const handleBroadcastSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBroadcastError(null);
    setBroadcastSuccess(null);
    setBroadcastLoading(true);

    try {
      const data = await adminApi.broadcastAnnouncement({
        title: broadcastTitle,
        message: broadcastMessage,
        targetAudience
      });
      setBroadcastSuccess(`Broadcast announced successfully to ${data.count} marketplace users!`);
      setBroadcastTitle("");
      setBroadcastMessage("");
    } catch (err: any) {
      setBroadcastError(err.message || "Failed to dispatch broadcast announcement.");
    } finally {
      setBroadcastLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchSettings();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-500"></div>
      </div>
    );
  }

  const monthlyData = stats?.monthlyData || [];

  // Calculate max values for mapping (fallback to safety values to avoid 0 division)
  const maxBookings = Math.max(...monthlyData.map((d: any) => d.bookings), 10);
  const maxRevenue = Math.max(...monthlyData.map((d: any) => d.revenue), 1000);

  // Generate points: 6 months, width = 600, height = 200
  const bookingPoints = monthlyData.map((d: any, idx: number) => {
    const x = (idx / 5) * 600;
    const y = 200 - (d.bookings / maxBookings) * 140 - 30; // padding top/bottom
    return { x, y };
  });

  const revenuePoints = monthlyData.map((d: any, idx: number) => {
    const x = (idx / 5) * 600;
    const y = 200 - (d.revenue / maxRevenue) * 140 - 30;
    return { x, y };
  });

  const generateLinePath = (points: { x: number, y: number }[]) => {
    if (points.length === 0) return "";
    return `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(" ");
  };

  const generateAreaPath = (points: { x: number, y: number }[]) => {
    if (points.length === 0) return "";
    return `M 0 200 L ` + points.map(p => `${p.x} ${p.y}`).join(" L ") + ` L 600 200 Z`;
  };

  const bookingsLinePath = generateLinePath(bookingPoints);
  const bookingsAreaPath = generateAreaPath(bookingPoints);
  const revenueLinePath = generateLinePath(revenuePoints);
  const revenueAreaPath = generateAreaPath(revenuePoints);

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">System Overview</h1>
          <p className="text-slate-400 text-sm mt-1">Real-time telemetry and marketplace performance metrics.</p>
        </div>
        <button
          onClick={fetchStats}
          disabled={syncing}
          className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors disabled:opacity-50"
          title="Refresh Data"
        >
          <RefreshCw size={16} className={syncing ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          icon={<Users size={20} className="text-sky-400" />}
          title="Registered Users"
          value={stats.registeredUsers.toString()}
          change="Total system accounts"
          color="text-sky-400"
          glowClass="glow-sky"
        />
        <StatCard
          icon={<Box size={20} className="text-emerald-400" />}
          title="Live Rentals"
          value={stats.liveRentals.toString()}
          change="Tools currently rented"
          color="text-emerald-400"
          glowClass="glow-emerald"
        />
        <StatCard
          icon={<DollarSign size={20} className="text-indigo-400" />}
          title="Commission Earnings"
          value={`Rs. ${stats.monthlyCommission ? stats.monthlyCommission.toLocaleString(undefined, {minimumFractionDigits: 1, maximumFractionDigits: 1}) : '0.0'}`}
          change={`Gross Vol: Rs. ${stats.monthlyRevenue.toLocaleString()}`}
          color="text-indigo-400"
          glowClass="glow-indigo"
        />
        <StatCard
          icon={<ShieldAlert size={20} className="text-amber-400" />}
          title="Active Disputes"
          value={stats.activeDisputes.toString()}
          change="Under review"
          color="text-amber-400"
          glowClass="glow-amber"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Analytics Graph Block */}
        <div className="glass-card p-6 border border-slate-800 lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="font-bold text-white flex items-center gap-2">
                <BarChart3 size={18} className="text-sky-400" />
                Platform Activity Trends
              </h3>
              <p className="text-xs text-slate-500">Monthly booking completions vs total transaction value.</p>
            </div>
            <div className="flex gap-2">
              <span className="flex items-center gap-1.5 text-[11px] font-bold text-sky-400 bg-sky-500/10 px-2.5 py-1 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse"></span>
                Bookings (Services & Rentals)
              </span>
              <span className="flex items-center gap-1.5 text-[11px] font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"></span>
                Revenue (LKR)
              </span>
            </div>
          </div>

          {/* Custom SVG line chart for high-fidelity representation */}
          <div className="h-44 w-full relative flex items-end pt-5">
            <svg className="w-full h-full" viewBox="0 0 600 200" preserveAspectRatio="none">
              {/* Grid Lines */}
              <line x1="0" y1="50" x2="600" y2="50" stroke="#1e293b" strokeDasharray="4 4" />
              <line x1="0" y1="100" x2="600" y2="100" stroke="#1e293b" strokeDasharray="4 4" />
              <line x1="0" y1="150" x2="600" y2="150" stroke="#1e293b" strokeDasharray="4 4" />

              {/* Area/Gradients */}
              <defs>
                <linearGradient id="gradient-sky" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="gradient-indigo" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Bookings Area path */}
              {bookingsAreaPath && (
                <path d={bookingsAreaPath} fill="url(#gradient-sky)" />
              )}
              {/* Revenue Area path */}
              {revenueAreaPath && (
                <path d={revenueAreaPath} fill="url(#gradient-indigo)" />
              )}

              {/* Bookings Line path */}
              {bookingsLinePath && (
                <path
                  d={bookingsLinePath}
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              )}
              {/* Revenue Line path */}
              {revenueLinePath && (
                <path
                  d={revenueLinePath}
                  fill="none"
                  stroke="#6366f1"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              )}

              {/* Dot markers at points */}
              {bookingPoints.map((p: any, i: number) => (
                <circle key={`b-${i}`} cx={p.x} cy={p.y} r={4} fill="#38bdf8" />
              ))}
              {revenuePoints.map((p: any, i: number) => (
                <circle key={`r-${i}`} cx={p.x} cy={p.y} r={4} fill="#6366f1" />
              ))}
            </svg>

            {/* Legend/Month Labels */}
            <div className="absolute bottom-0 left-0 right-0 flex justify-between px-2 text-[10px] font-bold text-slate-500 select-none">
              {monthlyData.map((d: any, idx: number) => (
                <span key={idx}>{d.month}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar: Performance Telemetry */}
        <div className="glass-card p-6 border border-slate-800 flex flex-col justify-between">
          <div className="space-y-3">
            <h3 className="font-bold text-white flex items-center gap-2">
              <TrendingUp size={18} className="text-indigo-400" />
              Service Efficiency
            </h3>
            <p className="text-xs text-slate-500">Key metrics monitoring marketplace health.</p>

            <div className="space-y-3 pt-1.5">
              <ProgressStat label="Tool Utilization Rate" value={`${stats.toolUtilization.toFixed(1)}%`} percentage={stats.toolUtilization} color="bg-sky-500" />
              <ProgressStat label="User Return Rate" value={`${stats.userReturnRate.toFixed(1)}%`} percentage={stats.userReturnRate} color="bg-indigo-500" />
              <ProgressStat label="AI Verification Success" value={`${stats.aiVerificationSuccess.toFixed(1)}%`} percentage={stats.aiVerificationSuccess} color="bg-emerald-500" />
            </div>
          </div>

          <div className="border-t border-slate-800 pt-3.5 mt-5 flex justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <RefreshCw size={12} className={syncing ? "animate-spin text-slate-500" : "text-slate-500"} />
              Auto-sync active
            </span>
            <span className="font-semibold text-white">Live Node</span>
          </div>
        </div>
      </div>

      {/* Row 2: Marketplace Fees and Broadcast Announcements */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Commission Configuration Card */}
        <div className="glass-card p-6 border border-white/5 bg-slate-950/40 space-y-4 lg:col-span-1">
          <div>
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <CreditCard size={16} className="text-sky-400" />
              Marketplace Fees
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">Configure platform commissions</p>
          </div>

          {settingsError && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400 leading-normal animate-in fade-in duration-200">
              {settingsError}
            </div>
          )}
          {settingsSuccess && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 leading-normal animate-in fade-in duration-200">
              {settingsSuccess}
            </div>
          )}

          <form onSubmit={handleSettingsSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Service Booking Fee (%)</label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  required
                  value={serviceCommissionRate}
                  onChange={(e) => setServiceCommissionRate(parseFloat(e.target.value) || 0)}
                  className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-2.5 text-[13px] text-white focus:outline-none focus:border-sky-500/50 transition-all font-semibold"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 font-semibold text-xs">%</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Equipment Rental Fee (%)</label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  required
                  value={rentalCommissionRate}
                  onChange={(e) => setRentalCommissionRate(parseFloat(e.target.value) || 0)}
                  className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-2.5 text-[13px] text-white focus:outline-none focus:border-sky-500/50 transition-all font-semibold"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 font-semibold text-xs">%</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={settingsLoading}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-lg shadow-sky-600/10 transition-all disabled:opacity-50"
            >
              {settingsLoading ? (
                <>
                  <Loader2 size={12} className="animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Commission"
              )}
            </button>
          </form>
        </div>

        {/* Announcement Broadcast Center Card */}
        <div className="glass-card p-6 border border-white/5 bg-slate-950/40 space-y-6 lg:col-span-2">
          <div>
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Megaphone size={16} className="text-pink-400" />
              Broadcast Announcement Center
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">Send a global alert, news update, or maintenance window info to platform users</p>
          </div>

          {broadcastError && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 flex gap-2.5 items-start text-xs text-rose-400 leading-normal animate-in fade-in duration-200">
              <ShieldAlert size={16} className="shrink-0 mt-0.5" />
              <span>{broadcastError}</span>
            </div>
          )}
          {broadcastSuccess && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex gap-2.5 items-start text-xs text-emerald-400 leading-normal animate-in fade-in duration-200">
              <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
              <span>{broadcastSuccess}</span>
            </div>
          )}

          <form onSubmit={handleBroadcastSubmit} className="space-y-4">
            {/* Target Audience selection */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Target Audience</label>
              <select
                value={targetAudience}
                onChange={(e: any) => setTargetAudience(e.target.value)}
                className="w-full bg-[#0a0d14] border border-white/5 rounded-xl px-4 py-2.5 text-[13px] text-white focus:outline-none focus:border-sky-500/50 transition-all font-semibold"
              >
                <option value="ALL">All Marketplace Users</option>
                <option value="SERVICE_PROVIDER">Service Providers Only</option>
                <option value="RENTAL_OWNER">Rental Owners Only</option>
                <option value="HOUSEHOLD">Household Customers Only</option>
              </select>
            </div>

            {/* Broadcast Title */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Announcement Title</label>
              <input
                type="text"
                required
                value={broadcastTitle}
                onChange={(e) => setBroadcastTitle(e.target.value)}
                placeholder="e.g. Scheduled System Maintenance"
                className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-2.5 text-[13px] text-white focus:outline-none focus:border-sky-500/50 placeholder-slate-700 transition-all"
              />
            </div>

            {/* Broadcast Message Body */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Announcement Message</label>
              <textarea
                required
                rows={4}
                value={broadcastMessage}
                onChange={(e) => setBroadcastMessage(e.target.value)}
                placeholder="Write details of policy adjustments, site maintenance schedules, or news notifications here..."
                className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-2.5 text-[13px] text-white focus:outline-none focus:border-sky-500/50 placeholder-slate-700 transition-all resize-none"
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={broadcastLoading}
                className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-lg shadow-sky-600/10 transition-all disabled:opacity-50"
              >
                {broadcastLoading ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Dispatching...
                  </>
                ) : (
                  "Dispatch Broadcast"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Confirm Commission Modal */}
      <ConfirmCommissionModal
        isOpen={isConfirmOpen}
        serviceCommissionRate={serviceCommissionRate}
        rentalCommissionRate={rentalCommissionRate}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={confirmSettingsSubmit}
      />
    </div>
  );
}
