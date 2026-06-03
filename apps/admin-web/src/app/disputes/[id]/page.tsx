"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, Scale, User, Mail, Calendar, Hammer, AlertTriangle, ShieldCheck, XOctagon, CheckCircle2, FileText, ArrowRight } from "lucide-react";
import { adminApi } from "@/services/api";

export default function DisputeDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [dispute, setDispute] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [resolutionText, setResolutionText] = useState("");
    const [applyPenalty, setApplyPenalty] = useState(true);
    const router = useRouter();

    useEffect(() => {
        adminApi.getDisputeDetails(id)
            .then(setDispute)
            .catch(err => console.error("Error fetching dispute details:", err))
            .finally(() => setLoading(false));
    }, [id]);

    const handleResolve = async (status: 'RESOLVED' | 'DISMISSED') => {
        if (!resolutionText.trim()) {
            alert("Please provide resolution notes before submitting.");
            return;
        }

        setActionLoading(true);
        try {
            await adminApi.resolveDispute(id, {
                status,
                resolution: resolutionText.trim(),
                adjustTrustScore: status === 'RESOLVED' ? applyPenalty : false,
                penaltyAmount: 0.5
            });
            alert(`Dispute ${status.toLowerCase()} successfully!`);
            router.push("/disputes");
            router.refresh();
        } catch (error) {
            console.error("Failed to update dispute status:", error);
            alert("Failed to resolve dispute");
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-500"></div>
            </div>
        );
    }

    if (!dispute) {
        return (
            <div className="text-center py-20">
                <h2 className="text-2xl font-bold text-white">Dispute Not Found</h2>
                <Link href="/disputes" className="text-sky-400 hover:underline mt-4 inline-block">Back to Disputes</Link>
            </div>
        );
    }

    const { reporter, reported, booking, rental } = dispute;

    const formatRole = (role: string) => {
        switch (role) {
            case 'HOUSEHOLD': return 'Client';
            case 'SERVICE_PROVIDER': return 'Service Provider';
            case 'RENTAL_OWNER': return 'Rental Owner';
            default: return role.toLowerCase().replace('_', ' ');
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/disputes" className="p-2 rounded-lg bg-slate-800/50 hover:bg-slate-700 transition-colors">
                        <ChevronLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                            <Scale size={24} className="text-amber-500" />
                            Dispute Investigation
                        </h1>
                        <p className="text-slate-400 text-sm">Dispute ID: {dispute.id}</p>
                    </div>
                </div>

                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-bold text-xs uppercase ${
                    dispute.status === 'PENDING' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                    dispute.status === 'RESOLVED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                    'bg-slate-800 text-slate-400 border-slate-700'
                }`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                    {dispute.status}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Transaction & Involved Parties */}
                <div className="space-y-6">
                    {/* Involved Parties Card */}
                    <div className="glass-card p-6 bg-slate-900/40 border border-slate-800 rounded-2xl space-y-6">
                        <h3 className="font-bold text-white text-base border-b border-slate-800 pb-3">Involved Parties</h3>
                        
                        {/* Reporter */}
                        <div className="space-y-3">
                            <span className="text-[10px] font-bold tracking-wider text-sky-400 uppercase">Reporter ({formatRole(reporter.role)})</span>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center overflow-hidden">
                                    {reporter.profileImage ? (
                                        <img src={reporter.profileImage} alt={reporter.fullName} className="w-full h-full object-cover" />
                                    ) : (
                                        <User size={20} className="text-slate-400" />
                                    )}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <h4 className="font-semibold text-white text-sm truncate">{reporter.fullName}</h4>
                                    <p className="text-xs text-slate-500 truncate flex items-center gap-1">
                                        <Mail size={12} />
                                        {reporter.email}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-center text-slate-700 py-1">
                            <ArrowRight size={18} className="rotate-90 lg:rotate-0" />
                        </div>

                        {/* Reported Party */}
                        <div className="space-y-3">
                            <span className="text-[10px] font-bold tracking-wider text-rose-400 uppercase">Reported User ({formatRole(reported.role)})</span>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center overflow-hidden">
                                    {reported.profileImage ? (
                                        <img src={reported.profileImage} alt={reported.fullName} className="w-full h-full object-cover" />
                                    ) : (
                                        <User size={20} className="text-slate-400" />
                                    )}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <h4 className="font-semibold text-white text-sm truncate">{reported.fullName}</h4>
                                    <p className="text-xs text-slate-500 truncate flex items-center gap-1">
                                        <Mail size={12} />
                                        {reported.email}
                                    </p>
                                    <p className="text-[11px] text-slate-400 mt-1">
                                        Trust Score: <strong className="text-amber-500">{reported.trustScore.toFixed(1)} / 5.0</strong>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Transaction Reference Card */}
                    <div className="glass-card p-6 bg-slate-900/40 border border-slate-800 rounded-2xl space-y-4">
                        <h3 className="font-bold text-white text-base border-b border-slate-800 pb-3">Transaction details</h3>
                        {booking && (
                            <div className="space-y-3">
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-slate-400">Type</span>
                                    <span className="font-semibold text-sky-400">Service Booking</span>
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-slate-400">Status</span>
                                    <span className="font-semibold text-white">{booking.status}</span>
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-slate-400">Payment</span>
                                    <span className="font-bold text-white">LKR {booking.totalPrice.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-slate-400">Scheduled At</span>
                                    <span className="text-slate-300">{new Date(booking.bookingDate).toLocaleDateString()}</span>
                                </div>
                                <div className="pt-2 text-[11px] text-slate-500 italic">
                                    Booking Reference ID: {booking.id}
                                </div>
                            </div>
                        )}
                        {rental && (
                            <div className="space-y-3">
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-slate-400">Type</span>
                                    <span className="font-semibold text-sky-400">Tool Rental ({rental.tool?.name || 'Tool'})</span>
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-slate-400">Status</span>
                                    <span className="font-semibold text-white">{rental.status}</span>
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-slate-400">Payment</span>
                                    <span className="font-bold text-white">LKR {rental.totalPrice.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-slate-400">Start Date</span>
                                    <span className="text-slate-300">{new Date(rental.startDate).toLocaleDateString()}</span>
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-slate-400">End Date</span>
                                    <span className="text-slate-300">{new Date(rental.endDate).toLocaleDateString()}</span>
                                </div>
                                <div className="pt-2 text-[11px] text-slate-500 italic">
                                    Rental Reference ID: {rental.id}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: Incident Details & Resolution Panel */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Claims Card */}
                    <div className="glass-card p-6 bg-slate-900/40 border border-slate-800 rounded-2xl space-y-6">
                        <div>
                            <h3 className="text-xs uppercase font-bold tracking-widest text-slate-500">Reason for Dispute</h3>
                            <h2 className="text-xl font-bold text-white mt-1">{dispute.reason}</h2>
                            <p className="text-xs text-slate-500 mt-1">Submitted on {new Date(dispute.createdAt).toLocaleString()}</p>
                        </div>

                        <div className="space-y-2">
                            <h3 className="text-xs uppercase font-bold tracking-widest text-slate-500">Reporter's Narrative</h3>
                            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
                                {dispute.description}
                            </div>
                        </div>

                        {/* Evidence Photos */}
                        <div className="space-y-3">
                            <h3 className="text-xs uppercase font-bold tracking-widest text-slate-500">Evidence Attachments ({dispute.evidenceImages?.length || 0})</h3>
                            {dispute.evidenceImages && dispute.evidenceImages.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    {dispute.evidenceImages.map((img: string, i: number) => (
                                        <a 
                                            key={i} 
                                            href={img} 
                                            target="_blank" 
                                            rel="noopener noreferrer" 
                                            className="group relative rounded-xl overflow-hidden aspect-video border border-slate-800 bg-slate-950 flex items-center justify-center"
                                        >
                                            <img src={img} alt={`Evidence ${i + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all text-xs font-semibold text-white">
                                                View Original
                                            </div>
                                        </a>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-slate-600 text-xs italic">No evidence images attached by the reporter.</p>
                            )}
                        </div>
                    </div>

                    {/* Resolution Action Card */}
                    <div className="glass-card p-6 bg-slate-900/40 border border-slate-800 rounded-2xl space-y-6">
                        <h3 className="font-bold text-white text-base flex items-center gap-2">
                            <CheckCircle2 size={18} className="text-emerald-400" />
                            Administrative Actions & Resolution
                        </h3>

                        {dispute.status === 'PENDING' || dispute.status === 'REVIEWING' ? (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase text-slate-400 mb-2">Resolution Findings & Summary</label>
                                    <textarea 
                                        rows={4}
                                        value={resolutionText}
                                        onChange={(e) => setResolutionText(e.target.value)}
                                        placeholder="Summarize the findings from investigation and what actions are taken (refunds, warnings, account suspension, etc.)"
                                        className="w-full rounded-xl bg-slate-950 border border-slate-800 text-slate-200 p-4 text-sm focus:outline-none focus:border-sky-500 transition-all placeholder-slate-600"
                                        disabled={actionLoading}
                                    />
                                </div>

                                <div className="flex items-center gap-2 p-3 rounded-lg bg-rose-500/5 border border-rose-500/10">
                                    <input 
                                        type="checkbox"
                                        id="applyPenalty"
                                        checked={applyPenalty}
                                        onChange={(e) => setApplyPenalty(e.target.checked)}
                                        className="rounded border-slate-800 bg-slate-950 text-rose-500 focus:ring-0 focus:ring-offset-0"
                                        disabled={actionLoading}
                                    />
                                    <label htmlFor="applyPenalty" className="text-xs text-rose-300 font-medium select-none cursor-pointer">
                                        Deduct 0.5 trust score penalty from the reported party (<span className="font-bold text-rose-400">{reported.fullName}</span>) if dispute is upheld.
                                    </label>
                                </div>

                                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                                    <button
                                        onClick={() => handleResolve('DISMISSED')}
                                        disabled={actionLoading}
                                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-slate-300 font-bold hover:bg-slate-700 transition-all disabled:opacity-50 text-sm"
                                    >
                                        <XOctagon size={16} />
                                        Dismiss Dispute
                                    </button>
                                    <button
                                        onClick={() => handleResolve('RESOLVED')}
                                        disabled={actionLoading}
                                        className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-500 text-white font-bold shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 text-sm"
                                    >
                                        <CheckCircle2 size={16} />
                                        Uphold & Resolve Dispute
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4 p-5 rounded-xl bg-slate-950/60 border border-slate-800">
                                <div className="flex justify-between items-center border-b border-slate-800/80 pb-3">
                                    <span className="text-xs text-slate-500 font-bold uppercase">Verdict Outcome</span>
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                                        dispute.status === 'RESOLVED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-slate-800 text-slate-400 border-slate-700'
                                    }`}>{dispute.status}</span>
                                </div>
                                <div className="space-y-1.5">
                                    <h4 className="text-xs text-slate-400 font-bold uppercase">Official Resolution Note:</h4>
                                    <p className="text-sm text-slate-300 leading-relaxed italic">
                                        "{dispute.resolution}"
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
