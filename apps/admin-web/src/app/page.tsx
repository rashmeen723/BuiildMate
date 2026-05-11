import Link from "next/link";
import { adminApi } from "@/services/api";

export default async function DashboardPage() {
  let pendingVerifications = [];
  try {
    pendingVerifications = await adminApi.getPendingVerifications();
  } catch (error) {
    console.error("Failed to load verifications:", error);
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">System Overview</h1>
        <p className="text-slate-400 mt-1">Snapshot of your marketplace activity.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Pending Review" value={pendingVerifications.length.toString()} change="+2 today" color="text-amber-400" />
        <StatCard title="Active Providers" value="142" change="+5% this week" color="text-sky-400" />
        <StatCard title="Live Rentals" value="86" change="+12% this month" color="text-emerald-400" />
        <StatCard title="Total Revenue" value="Rs. 45.2k" change="+8% this week" color="text-indigo-400" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">New Verifications</h2>
            <button className="text-sky-400 text-sm font-medium hover:underline">View All</button>
          </div>

          <div className="space-y-4">
            {pendingVerifications.length > 0 ? (
              pendingVerifications.map((v: any) => (
                <VerificationRow
                  key={v.id}
                  id={v.id}
                  name={v.fullName}
                  role={v.role}
                  status={v.status}
                  aiStatus={v.aiStatus}
                  time={new Date(v.createdAt).toLocaleDateString()}
                />
              ))
            ) : (
              <p className="text-slate-500 text-center py-8">No pending verifications found.</p>
            )}
          </div>
        </div>

        <div className="glass-card p-6">
          <h2 className="text-xl font-bold mb-6">Quick Stats</h2>
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">KYC Approval Rate</span>
              <span className="font-bold">92%</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full w-[92%]"></div>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-400">Response Time</span>
              <span className="font-bold">1.2 hrs</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div className="bg-sky-500 h-full w-[75%]"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, change, color }: { title: string, value: string, change: string, color: string }) {
  return (
    <div className="glass-card p-6 space-y-2 hover:border-slate-700 transition-colors">
      <span className="text-sm font-medium text-slate-400">{title}</span>
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
      <div className="text-xs text-slate-500">{change}</div>
    </div>
  );
}

function VerificationRow({ id, name, role, status, aiStatus, time }: { id: string, name: string, role: string, status: string, aiStatus?: string, time: string }) {
  return (
    <div className="flex items-center justify-between p-4 rounded-xl border border-slate-800 hover:bg-slate-800/30 transition-all cursor-pointer group">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center font-bold text-slate-300">
          {name.charAt(0)}
        </div>
        <div>
          <div className="font-bold">{name}</div>
          <div className="text-xs text-slate-500">{role} • {time}</div>
        </div>
      </div>
      <div className="flex items-center gap-4">
        {aiStatus === 'AI_PASSED' && (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-bold uppercase tracking-wider">AI Verified</span>
        )}
        {aiStatus === 'AI_FLAGGED' && (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/10 text-red-500 border border-red-500/20 font-bold uppercase tracking-wider">AI Flagged</span>
        )}
        <span className="text-xs px-2 py-1 rounded-md bg-amber-500/10 text-amber-500 font-medium">{status}</span>
        <Link href={`/verifications/${id}`} className="bg-white text-black px-4 py-1.5 rounded-lg text-sm font-bold hover:bg-sky-400 hover:text-white transition-all transform group-hover:scale-105">
          Verify
        </Link>
      </div>
    </div>
  );
}
