"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertTriangle, ChevronRight, Scale, Clock, CheckCircle2, XOctagon } from "lucide-react";
import { adminApi } from "@/services/api";

export default function DisputesPage() {
    const [disputes, setDisputes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        adminApi.getDisputes()
            .then(setDisputes)
            .catch(err => console.error("Error fetching disputes:", err))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-500"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-700">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                    <AlertTriangle className="text-rose-500" size={26} />
                    Disputes & Trust
                </h1>
                <p className="text-slate-400 mt-1 text-sm">Investigate reported issues, manage merchant claims, and apply penalties.</p>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {disputes.length > 0 ? (
                    disputes.map((item) => (
                        <Link 
                            key={item.id} 
                            href={`/disputes/${item.id}`}
                            className="group flex flex-col md:flex-row md:items-center justify-between p-5 bg-slate-900/50 border border-slate-800 hover:border-sky-500/50 hover:bg-slate-800/50 rounded-xl transition-all gap-4"
                        >
                            <div className="flex items-start gap-4">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                    item.status === 'PENDING' ? 'bg-amber-500/10 text-amber-400' :
                                    item.status === 'RESOLVED' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-700/30 text-slate-400'
                                }`}>
                                    <Scale size={20} />
                                </div>
                                <div>
                                    <div className="flex items-center flex-wrap gap-2">
                                        <h3 className="font-bold text-white text-[15px]">{item.reason}</h3>
                                        <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 text-[9px] font-bold uppercase tracking-wider">
                                            {item.bookingId ? "Service Booking" : "Tool Rental"}
                                        </span>
                                    </div>
                                    <p className="text-slate-400 text-xs mt-1 line-clamp-1">{item.description}</p>
                                    <div className="flex gap-4 mt-2 text-[11px] text-slate-500 font-medium">
                                        <span>From: <strong className="text-slate-300">{item.reporter.fullName}</strong></span>
                                        <span>Against: <strong className="text-slate-300">{item.reported.fullName}</strong></span>
                                        <span>Date: {new Date(item.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between md:justify-end gap-6 border-t border-slate-800 md:border-t-0 pt-3 md:pt-0">
                                {/* Status badge */}
                                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-lg border font-semibold text-xs capitalize ${
                                    item.status === 'PENDING' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                                    item.status === 'RESOLVED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                    item.status === 'DISMISSED' ? 'bg-slate-800 text-slate-400 border-slate-700' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                }`}>
                                    {item.status === 'PENDING' && <Clock size={12} />}
                                    {item.status === 'RESOLVED' && <CheckCircle2 size={12} />}
                                    {item.status === 'DISMISSED' && <XOctagon size={12} />}
                                    <span className="text-[12px]">{item.status.toLowerCase()}</span>
                                </div>

                                <ChevronRight className="text-slate-600 group-hover:text-sky-400 group-hover:translate-x-1 transition-all hidden md:block" size={18} />
                            </div>
                        </Link>
                    ))
                ) : (
                    <div className="text-center py-20 bg-slate-900/50 border border-dashed border-slate-800 rounded-3xl">
                        <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-600">
                            <AlertTriangle size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-white">No active disputes!</h3>
                        <p className="text-slate-500 mt-1">Excellent! The marketplace is running smoothly with no reported claims.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
