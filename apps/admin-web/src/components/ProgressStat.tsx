import React from "react";

interface ProgressStatProps {
    label: string;
    value: string;
    percentage: number;
    color: string;
}

export function ProgressStat({ label, value, percentage, color }: ProgressStatProps) {
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
