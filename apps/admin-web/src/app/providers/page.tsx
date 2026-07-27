"use client";

import { useState, useEffect } from "react";
import { Users, Search, Filter, ShieldCheck, CheckCircle2, AlertCircle, Clock } from "lucide-react";
import { adminApi } from "@/services/api";
import { SuspendModal } from "../../components/modals/SuspendModal";
import { UnsuspendModal } from "../../components/modals/UnsuspendModal";

export default function ProvidersPage() {
    const [providers, setProviders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Search and filter states
    const [searchQuery, setSearchQuery] = useState("");
    const [roleFilter, setRoleFilter] = useState("ALL");
    const [statusFilter, setStatusFilter] = useState("ALL");

    // Derived filtered users list
    const filteredProviders = providers.filter((user) => {
        const matchesSearch = 
            user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesRole = 
            roleFilter === "ALL" || 
            user.role === roleFilter;

        let matchesStatus = true;
        if (statusFilter === "SUSPENDED") {
            matchesStatus = user.isSuspended;
        } else if (statusFilter === "ACTIVE") {
            matchesStatus = !user.isSuspended && user.status === "APPROVED";
        } else if (statusFilter === "PENDING") {
            matchesStatus = !user.isSuspended && user.status === "PENDING";
        }

        return matchesSearch && matchesRole && matchesStatus;
    });

    // Custom Modal States
    const [showSuspendModal, setShowSuspendModal] = useState(false);
    const [suspendUserId, setSuspendUserId] = useState<string | null>(null);
    const [suspendReason, setSuspendReason] = useState("");

    const [showUnsuspendModal, setShowUnsuspendModal] = useState(false);
    const [unsuspendUserId, setUnsuspendUserId] = useState<string | null>(null);



    const fetchProviders = () => {
        setLoading(true);
        adminApi.getProviders()
            .then(setProviders)
            .catch(err => console.error("Error fetching providers:", err))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchProviders();
    }, []);

    const handleSuspendClick = (id: string) => {
        setSuspendUserId(id);
        setSuspendReason("");
        setShowSuspendModal(true);
    };

    const confirmSuspend = async () => {
        if (!suspendUserId) return;
        try {
            await adminApi.suspendUser(suspendUserId, suspendReason || "Suspended by Administrator");
            setShowSuspendModal(false);
            setSuspendUserId(null);
            setSuspendReason("");
            fetchProviders();
        } catch (err: any) {
            alert(`Failed to suspend user: ${err.message}`);
        }
    };

    const handleUnsuspendClick = (id: string) => {
        setUnsuspendUserId(id);
        setShowUnsuspendModal(true);
    };

    const confirmUnsuspend = async () => {
        if (!unsuspendUserId) return;
        try {
            await adminApi.unsuspendUser(unsuspendUserId);
            setShowUnsuspendModal(false);
            setUnsuspendUserId(null);
            fetchProviders();
        } catch (err: any) {
            alert(`Failed to unsuspend user: ${err.message}`);
        }
    };


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
                    <h1 className="text-2xl font-bold tracking-tight text-white">User Directory</h1>
                    <p className="text-slate-400 mt-1 text-sm">Manage all active platform customers, service providers, and rental owners.</p>
                </div>
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-5">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                    <input 
                        type="text" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search users by name or email..." 
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
                            <option value="HOUSEHOLD">Household Customers</option>
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
                            <option value="ACTIVE">Active</option>
                            <option value="PENDING">Pending Verification</option>
                            <option value="SUSPENDED">Suspended</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="glass-card overflow-hidden">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-slate-800 bg-slate-900/50">
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Provider</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Role</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Rating</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                        {filteredProviders.length > 0 ? filteredProviders.map((provider) => (
                            <tr key={provider.id} className="hover:bg-slate-800/30 transition-colors">
                                <td className="px-6 py-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center font-bold text-xs text-slate-300">
                                            {provider.fullName.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="text-[13px] font-bold text-white">{provider.fullName}</div>
                                            <div className="text-[11px] text-slate-500">{provider.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="text-xs font-medium text-slate-300 uppercase">
                                        {provider.role.replace('_', ' ')}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    {provider.isSuspended ? (
                                        <div className="flex items-center gap-2 text-rose-500" title={provider.suspensionReason}>
                                            <AlertCircle size={14} />
                                            <span className="text-xs font-bold uppercase">Suspended</span>
                                        </div>
                                    ) : (
                                        <>
                                            {provider.status === 'APPROVED' && (
                                                <div className="flex items-center gap-2 text-emerald-500">
                                                    <CheckCircle2 size={14} />
                                                    <span className="text-xs font-bold uppercase">Active</span>
                                                </div>
                                            )}
                                            {provider.status === 'PENDING' && (
                                                <div className="flex items-center gap-2 text-amber-500">
                                                    <Clock size={14} />
                                                    <span className="text-xs font-bold uppercase">Pending</span>
                                                </div>
                                            )}
                                            {(provider.status === 'REJECTED' || provider.status === 'AI_FLAGGED') && (
                                                <div className="flex items-center gap-2 text-rose-500">
                                                    <AlertCircle size={14} />
                                                    <span className="text-xs font-bold uppercase">Action Required</span>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </td>
                                <td className="px-6 py-4 font-medium text-slate-300">{provider.trustScore.toFixed(1)} ★</td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-3">
                                        <a href={`/verifications/${provider.id}`} className="text-sky-400 hover:text-sky-300 text-sm font-bold">
                                            View
                                        </a>
                                        {provider.isSuspended ? (
                                            <button
                                                onClick={() => handleUnsuspendClick(provider.id)}
                                                className="text-emerald-500 hover:text-emerald-400 text-xs font-bold bg-emerald-500/10 px-2 py-1 rounded transition-all active:scale-95"
                                            >
                                                Unsuspend
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => handleSuspendClick(provider.id)}
                                                className="text-amber-500 hover:text-amber-400 text-xs font-bold bg-amber-500/10 px-2 py-1 rounded transition-all active:scale-95"
                                            >
                                                Suspend
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={5} className="p-10 text-center text-slate-500 italic">
                                    No users found matching your criteria.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <SuspendModal 
                isOpen={showSuspendModal}
                reason={suspendReason}
                onReasonChange={setSuspendReason}
                onClose={() => {
                    setShowSuspendModal(false);
                    setSuspendUserId(null);
                    setSuspendReason("");
                }}
                onConfirm={confirmSuspend}
            />

            <UnsuspendModal 
                isOpen={showUnsuspendModal}
                onClose={() => {
                    setShowUnsuspendModal(false);
                    setUnsuspendUserId(null);
                }}
                onConfirm={confirmUnsuspend}
            />
        </div>
    );
}
