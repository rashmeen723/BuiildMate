"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShieldCheck, ChevronRight, BrainCircuit, AlertCircle, CheckCircle2, Clock, XCircle } from "lucide-react";
import { adminApi } from "@/services/api";

export default function VerificationsPage() {
    const [verifications, setVerifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        adminApi.getPendingVerifications()
            .then(setVerifications)
            .catch(err => console.error("Error fetching verifications:", err))
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
                <h1 className="text-2xl font-bold tracking-tight text-white">Trust & Verification</h1>
                <p className="text-slate-400 mt-1 text-sm">Manage pending applications and AI-flagged identity checks.</p>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {verifications.length > 0 ? (
                    verifications.map((item) => (
                        <Link 
                            key={item.id} 
                            href={`/verifications/${item.id}`}
                            className="group flex items-center justify-between p-5 bg-slate-900/50 border border-slate-800 hover:border-sky-500/50 hover:bg-slate-800/50 rounded-xl transition-all"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-sky-500/10 flex items-center justify-center text-sky-400">
                                    <ShieldCheck size={20} />
                                </div>
                                <div>
                                    <div className="flex items-center gap-3">
                                        <h3 className="font-bold text-white text-[15px]">{item.fullName}</h3>
                                        <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 text-[9px] font-bold uppercase tracking-wider">
                                            {item.role.replace('_', ' ')}
                                        </span>
                                    </div>
                                    <p className="text-slate-500 text-[13px] mt-0.5">{item.email}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-6">
                                {/* AI Status */}
                                <div className="hidden lg:flex items-center gap-2">
                                    <BrainCircuit size={16} className={item.aiStatus === 'AI_FLAGGED' ? 'text-rose-400' : 'text-emerald-400'} />
                                    <div>
                                        <p className="text-[9px] text-slate-500 font-bold uppercase">AI Verdict</p>
                                        <p className={`text-[11px] font-semibold ${item.aiStatus === 'AI_FLAGGED' ? 'text-rose-400' : 'text-emerald-400'}`}>
                                            {item.aiStatus === 'AI_FLAGGED' ? 'Needs Attention' : 'Ready for Review'}
                                        </p>
                                    </div>
                                </div>

                                {/* Application Status */}
                                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/50 border ${
                                    item.status === 'APPROVED' ? 'border-emerald-500/20 text-emerald-400' :
                                    item.status === 'REJECTED' ? 'border-rose-500/20 text-rose-400' :
                                    item.aiStatus === 'AI_FLAGGED' ? 'border-rose-500/20 text-rose-400' :
                                    'border-amber-500/20 text-amber-400'
                                }`}>
                                    {item.status === 'APPROVED' ? (
                                        <CheckCircle2 size={14} className="text-emerald-400" />
                                    ) : item.status === 'REJECTED' ? (
                                        <XCircle size={14} className="text-rose-400" />
                                    ) : item.aiStatus === 'AI_FLAGGED' ? (
                                        <AlertCircle size={14} className="text-rose-400" />
                                    ) : (
                                        <Clock size={14} className="text-amber-400" />
                                    )}
                                    <span className="text-[13px] font-medium uppercase tracking-wider">
                                        {item.status === 'APPROVED' ? 'Approved' :
                                         item.status === 'REJECTED' ? 'Rejected' :
                                         item.aiStatus === 'AI_FLAGGED' ? 'Flagged' : 'Pending'}
                                    </span>
                                </div>

                                <ChevronRight className="text-slate-600 group-hover:text-sky-400 group-hover:translate-x-1 transition-all" size={18} />
                            </div>
                        </Link>
                    ))
                ) : (
                    <div className="text-center py-20 bg-slate-900/50 border border-dashed border-slate-800 rounded-3xl">
                        <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-600">
                            <ShieldCheck size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-white">All caught up!</h3>
                        <p className="text-slate-500 mt-1">No new applications are waiting for review.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
