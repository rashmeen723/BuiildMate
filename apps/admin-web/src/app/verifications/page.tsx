"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShieldCheck, ChevronRight, BrainCircuit, AlertCircle, CheckCircle2, Clock, XCircle, Search } from "lucide-react";
import { adminApi } from "@/services/api";

export default function VerificationsPage() {
    const [verifications, setVerifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Search and filter states
    const [searchQuery, setSearchQuery] = useState("");
    const [roleFilter, setRoleFilter] = useState("ALL");
    const [statusFilter, setStatusFilter] = useState("ALL");

    const fetchVerifications = () => {
        setLoading(true);
        adminApi.getPendingVerifications()
            .then(setVerifications)
            .catch(err => console.error("Error fetching verifications:", err))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchVerifications();
    }, []);

    // Filter verification list
    const filteredVerifications = verifications.filter((item) => {
        const matchesSearch = 
            item.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.email.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesRole = 
            roleFilter === "ALL" || 
            item.role === roleFilter;

        let matchesStatus = true;
        if (statusFilter === "PENDING") {
            matchesStatus = item.status === "PENDING";
        } else if (statusFilter === "APPROVED") {
            matchesStatus = item.status === "APPROVED";
        } else if (statusFilter === "REJECTED") {
            matchesStatus = item.status === "REJECTED";
        } else if (statusFilter === "FLAGGED") {
            matchesStatus = item.aiStatus === "AI_FLAGGED";
        }

        return matchesSearch && matchesRole && matchesStatus;
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-500"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-white">Trust & Verification</h1>
                    <p className="text-slate-400 mt-1 text-sm">Manage pending applications and AI-flagged identity checks.</p>
                </div>
            </div>

            {/* Filter controls */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-5">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                    <input 
                        type="text" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search applications by name or email..." 
                        className="w-full bg-white/5 border border-white/5 rounded-xl pl-10 pr-4 py-2.5 text-[13px] text-white focus:outline-none focus:border-sky-500/50 placeholder-slate-500 transition-all"
                    />
                </div>
                
                <div className="flex flex-wrap items-center gap-3">
                    {/* Role Filter */}
                    <div className="flex items-center gap-2 bg-white/5 border border-white/5 rounded-xl px-3 py-1.5">
                        <span className="text-[11px] font-bold text-slate-500 uppercase">Role:</span>
                        <select 
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                            className="bg-transparent text-[13px] font-semibold text-slate-300 focus:outline-none cursor-pointer"
                        >
                            <option value="ALL">All Roles</option>
                            <option value="SERVICE_PROVIDER">Service Providers</option>
                            <option value="RENTAL_OWNER">Rental Owners</option>
                        </select>
                    </div>

                    {/* Status Filter */}
                    <div className="flex items-center gap-2 bg-white/5 border border-white/5 rounded-xl px-3 py-1.5">
                        <span className="text-[11px] font-bold text-slate-500 uppercase">Status:</span>
                        <select 
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="bg-transparent text-[13px] font-semibold text-slate-300 focus:outline-none cursor-pointer"
                        >
                            <option value="ALL">All Status</option>
                            <option value="PENDING">Pending</option>
                            <option value="APPROVED">Approved</option>
                            <option value="REJECTED">Rejected</option>
                            <option value="FLAGGED">AI Flagged</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {filteredVerifications.length > 0 ? (
                    filteredVerifications.map((item) => (
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
                ) : verifications.length === 0 ? (
                    <div className="text-center py-20 bg-slate-900/50 border border-dashed border-slate-800 rounded-3xl">
                        <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-600">
                            <ShieldCheck size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-white">All caught up!</h3>
                        <p className="text-slate-500 mt-1">No new applications are waiting for review.</p>
                    </div>
                ) : (
                    <div className="text-center py-20 bg-slate-900/50 border border-dashed border-slate-800 rounded-3xl">
                        <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-600">
                            <AlertCircle size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-white">No results found</h3>
                        <p className="text-slate-500 mt-1">Try clearing your filters or adjusting your search term.</p>
                        <button 
                            onClick={() => { setSearchQuery(""); setRoleFilter("ALL"); setStatusFilter("ALL"); }}
                            className="mt-4 px-4 py-2 bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 font-bold rounded-lg transition-colors text-xs"
                        >
                            Reset Filters
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
