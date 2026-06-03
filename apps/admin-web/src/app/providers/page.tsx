"use client";

import { useState, useEffect } from "react";
import { Users, Search, Filter, ShieldCheck, CheckCircle2, AlertCircle, Clock, Trash2 } from "lucide-react";
import { adminApi } from "@/services/api";

export default function ProvidersPage() {
    const [providers, setProviders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Custom Modal States
    const [showSuspendModal, setShowSuspendModal] = useState(false);
    const [suspendUserId, setSuspendUserId] = useState<string | null>(null);
    const [suspendReason, setSuspendReason] = useState("");

    const [showUnsuspendModal, setShowUnsuspendModal] = useState(false);
    const [unsuspendUserId, setUnsuspendUserId] = useState<string | null>(null);

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
    const [deleteUserName, setDeleteUserName] = useState("");
    const [isDoubleConfirm, setIsDoubleConfirm] = useState(false);

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

    const handleDeleteClick = (id: string, name: string) => {
        setDeleteUserId(id);
        setDeleteUserName(name);
        setIsDoubleConfirm(false);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!deleteUserId) return;
        try {
            await adminApi.deleteUser(deleteUserId);
            setShowDeleteModal(false);
            setDeleteUserId(null);
            setDeleteUserName("");
            setIsDoubleConfirm(false);
            fetchProviders();
        } catch (err: any) {
            alert(`Failed to delete user: ${err.message}`);
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
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-white">Provider Directory</h1>
                    <p className="text-slate-400 mt-1 text-sm">Manage all active service providers and rental owners.</p>
                </div>
                <div className="flex gap-3">
                   <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                        <input 
                            type="text" 
                            placeholder="Search providers..." 
                            className="bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-[13px] focus:outline-none focus:border-sky-500 transition-colors w-60"
                        />
                   </div>
                   <button className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-2 rounded-lg text-[13px] font-medium hover:bg-slate-800 transition-colors">
                        <Filter size={14} />
                        Filters
                   </button>
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
                        {providers.length > 0 ? providers.map((provider) => (
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
                                        <button
                                            onClick={() => handleDeleteClick(provider.id, provider.fullName)}
                                            className="text-rose-500 hover:text-rose-400 p-1 rounded hover:bg-rose-500/10 transition-colors"
                                            title="Delete User"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={5} className="p-10 text-center text-slate-500 italic">
                                    No providers found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Suspend Confirmation Modal */}
            {showSuspendModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
                    <div className="glass-card p-6 max-w-md w-full border border-slate-800 bg-slate-950/95 shadow-2xl space-y-4">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <AlertCircle className="text-amber-500" size={20} />
                            Suspend Provider Account
                        </h3>
                        <p className="text-slate-400 text-sm">
                            Provide a reason for suspending this user. They will be locked out of all dashboards until the account is unsuspended.
                        </p>
                        <textarea
                            value={suspendReason}
                            onChange={(e) => setSuspendReason(e.target.value)}
                            placeholder="e.g., Unsafe tools provided, failed verification, or trust score fell below safety threshold..."
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-amber-500 transition-colors h-24 resize-none"
                        />
                        <div className="flex justify-end gap-3 pt-2">
                            <button
                                onClick={() => {
                                    setShowSuspendModal(false);
                                    setSuspendUserId(null);
                                    setSuspendReason("");
                                }}
                                className="px-4 py-2 rounded-lg bg-slate-850 hover:bg-slate-800 text-slate-300 text-sm font-medium transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmSuspend}
                                className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-sm font-bold shadow-lg shadow-amber-600/20 transition-colors"
                            >
                                Suspend Account
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Unsuspend Confirmation Modal */}
            {showUnsuspendModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
                    <div className="glass-card p-6 max-w-md w-full border border-slate-800 bg-slate-950/95 shadow-2xl space-y-4">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <CheckCircle2 className="text-emerald-500" size={20} />
                            Restore Account Access
                        </h3>
                        <p className="text-slate-300 text-sm">
                            Are you sure you want to lift this suspension? The user will be able to log back in and their trust score will be reset to 5.0.
                        </p>
                        <div className="flex justify-end gap-3 pt-2">
                            <button
                                onClick={() => {
                                    setShowUnsuspendModal(false);
                                    setUnsuspendUserId(null);
                                }}
                                className="px-4 py-2 rounded-lg bg-slate-850 hover:bg-slate-800 text-slate-300 text-sm font-medium transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmUnsuspend}
                                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold shadow-lg shadow-emerald-600/20 transition-colors"
                            >
                                Unsuspend Account
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
                    <div className="glass-card p-6 max-w-md w-full border border-slate-800 bg-slate-950/95 shadow-2xl space-y-4">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <Trash2 className="text-rose-500" size={20} />
                            Remove Provider Profile
                        </h3>
                        
                        {!isDoubleConfirm ? (
                            <>
                                <p className="text-slate-300 text-sm leading-relaxed">
                                    Are you sure you want to completely delete <strong className="text-white">"{deleteUserName}"</strong> from the system?
                                </p>
                                <div className="bg-rose-500/10 border border-rose-500/20 rounded-lg p-3 text-[13px] text-rose-400">
                                    This action will permanently delete their profile, active tool listings, rental transaction history, disputes, and reviews.
                                </div>
                                <div className="flex justify-end gap-3 pt-2">
                                    <button
                                        onClick={() => {
                                            setShowDeleteModal(false);
                                            setDeleteUserId(null);
                                            setDeleteUserName("");
                                        }}
                                        className="px-4 py-2 rounded-lg bg-slate-850 hover:bg-slate-800 text-slate-300 text-sm font-medium transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={() => setIsDoubleConfirm(true)}
                                        className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-sm font-bold shadow-lg shadow-rose-600/20 transition-colors"
                                    >
                                        Proceed
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <p className="text-slate-300 text-sm leading-relaxed">
                                    This is a **critical action** and cannot be undone. Please confirm to finalize user deletion.
                                </p>
                                <div className="flex justify-end gap-3 pt-2">
                                    <button
                                        onClick={() => {
                                            setIsDoubleConfirm(false);
                                        }}
                                        className="px-4 py-2 rounded-lg bg-slate-850 hover:bg-slate-800 text-slate-305 text-sm font-medium transition-colors"
                                    >
                                        Back
                                    </button>
                                    <button
                                        onClick={confirmDelete}
                                        className="px-4 py-2 rounded-lg bg-rose-700 hover:bg-rose-800 text-white text-sm font-bold shadow-lg shadow-rose-700/20 transition-colors animate-pulse"
                                    >
                                        Confirm Delete
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
