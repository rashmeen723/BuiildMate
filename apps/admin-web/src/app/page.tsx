"use client";

import { useState, useEffect } from "react";
import { BarChart3, TrendingUp, ShieldAlert, Award, Clock, DollarSign, RefreshCw, Users, Box } from "lucide-react";
import { adminApi } from "@/services/api";

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

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

  useEffect(() => {
    fetchStats();
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

  const generateLinePath = (points: {x: number, y: number}[]) => {
    if (points.length === 0) return "";
    return `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(" ");
  };

  const generateAreaPath = (points: {x: number, y: number}[]) => {
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
          <h1 className="text-2xl font-bold tracking-tight text-white">System Performance</h1>
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
          title="Active Partners" 
          value={stats.activePartners.toString()} 
          change="Registered & verified" 
          color="text-sky-400" 
        />
        <StatCard 
          icon={<Box size={20} className="text-emerald-400" />}
          title="Live Rentals" 
          value={stats.liveRentals.toString()} 
          change="Tools currently rented" 
          color="text-emerald-400" 
        />
        <StatCard 
          icon={<DollarSign size={20} className="text-indigo-400" />}
          title="Total Revenue" 
          value={`Rs. ${stats.totalRevenue.toLocaleString()}`} 
          change="Cumulative earnings" 
          color="text-indigo-400" 
        />
        <StatCard 
          icon={<ShieldAlert size={20} className="text-amber-400" />}
          title="Active Disputes" 
          value={stats.activeDisputes.toString()} 
          change="Under review" 
          color="text-amber-400" 
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
                Bookings
              </span>
              <span className="flex items-center gap-1.5 text-[11px] font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"></span>
                Revenue (LKR)
              </span>
            </div>
          </div>

          {/* Custom SVG line chart for high-fidelity representation */}
          <div className="h-60 w-full relative flex items-end pt-5">
            <svg className="w-full h-full" viewBox="0 0 600 200" preserveAspectRatio="none">
              {/* Grid Lines */}
              <line x1="0" y1="50" x2="600" y2="50" stroke="#1e293b" strokeDasharray="4 4" />
              <line x1="0" y1="100" x2="600" y2="100" stroke="#1e293b" strokeDasharray="4 4" />
              <line x1="0" y1="150" x2="600" y2="150" stroke="#1e293b" strokeDasharray="4 4" />
              
              {/* Area/Gradients */}
              <defs>
                <linearGradient id="gradient-sky" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.2"/>
                  <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.0"/>
                </linearGradient>
                <linearGradient id="gradient-indigo" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity="0.3"/>
                  <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0"/>
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
          <div className="space-y-4">
            <h3 className="font-bold text-white flex items-center gap-2">
              <TrendingUp size={18} className="text-indigo-400" />
              Service Efficiency
            </h3>
            <p className="text-xs text-slate-500">Key metrics monitoring marketplace health.</p>
            
            <div className="space-y-4 pt-2">
              <ProgressStat label="Tool Utilization Rate" value={`${stats.toolUtilization.toFixed(1)}%`} percentage={stats.toolUtilization} color="bg-sky-500" />
              <ProgressStat label="User Return Rate" value={`${stats.userReturnRate.toFixed(1)}%`} percentage={stats.userReturnRate} color="bg-indigo-500" />
              <ProgressStat label="AI Verification Success" value={`${stats.aiVerificationSuccess.toFixed(1)}%`} percentage={stats.aiVerificationSuccess} color="bg-emerald-500" />
              <ProgressStat label="Escrow Payout Efficiency" value={`${stats.escrowEfficiency.toFixed(1)}%`} percentage={stats.escrowEfficiency} color="bg-violet-500" />
            </div>
          </div>

          <div className="border-t border-slate-800 pt-4 mt-6 flex justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <RefreshCw size={12} className={syncing ? "animate-spin text-slate-500" : "text-slate-500"} />
              Auto-sync active
            </span>
            <span className="font-semibold text-white">Live Node</span>
          </div>
        </div>
      </div>

      {/* Performance Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="glass-card p-5 border border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-sky-400 font-bold text-sm">
            <Clock size={16} />
            Response Time
          </div>
          <div className="text-2xl font-bold text-white">{stats.averageResponseTime.toFixed(1)} Hours</div>
          <p className="text-xs text-slate-500">Average dispute resolution speed.</p>
        </div>

        <div className="glass-card p-5 border border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
            <Award size={16} />
            Quality Rating
          </div>
          <div className="text-2xl font-bold text-white">{stats.averageRating.toFixed(2)} ★</div>
          <p className="text-xs text-slate-500">Average customer feedback score.</p>
        </div>

        <div className="glass-card p-5 border border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
            <DollarSign size={16} />
            Ticket Average
          </div>
          <div className="text-2xl font-bold text-white">Rs. {Math.round(stats.averageTicket).toLocaleString()}</div>
          <p className="text-xs text-slate-500">Average size of a tool rental transaction.</p>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, change, color, icon }: { title: string, value: string, change: string, color: string, icon: React.ReactNode }) {
  return (
    <div className="glass-card p-5 space-y-2 border border-slate-800 hover:border-slate-700 transition-colors flex justify-between items-start">
      <div className="space-y-1">
        <span className="text-[13px] font-semibold text-slate-500">{title}</span>
        <div className={`text-2xl font-bold ${color}`}>{value}</div>
        <div className="text-[11px] font-medium text-slate-500">{change}</div>
      </div>
      <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
        {icon}
      </div>
    </div>
  );
}

function ProgressStat({ label, value, percentage, color }: { label: string, value: string, percentage: number, color: string }) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs font-bold">
        <span className="text-slate-400">{label}</span>
        <span className="text-white">{value}</span>
      </div>
      <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
        <div className={`h-full ${color}`} style={{ width: `${percentage}%` }}></div>
      </div>
    </div>
  );
}
