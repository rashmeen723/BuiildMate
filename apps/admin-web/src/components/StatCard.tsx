import React from "react";

interface StatCardProps {
    title: string;
    value: string;
    change: string;
    color: string;
    icon: React.ReactNode;
    glowClass: string;
}

export function StatCard({ title, value, change, color, icon, glowClass }: StatCardProps) {
    return (
        <div className={`glass-card stat-card-glow ${glowClass} p-5 space-y-2 flex justify-between items-start`}>
            <div className="space-y-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{title}</span>
                <div className="text-2xl font-bold tracking-tight text-white">{value}</div>
                <span className="text-[11px] text-slate-400 block">{change}</span>
            </div>
            <div className={`p-2.5 rounded-xl bg-slate-900 border border-slate-800 ${color} shadow-lg shadow-black/40`}>
                {icon}
            </div>
        </div>
    );
}
