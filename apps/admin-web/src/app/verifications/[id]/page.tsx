"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, ShieldCheck, User, Mail, Phone, Calendar, Download, CheckCircle, XCircle, FileText, ExternalLink, MapPin, BrainCircuit, AlertCircle, BadgeCheck } from "lucide-react";
import { adminApi } from "@/services/api";

export default function VerificationDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        adminApi.getVerificationDetails(id)
            .then(setUser)
            .catch(err => console.error("Error fetching details:", err))
            .finally(() => setLoading(false));
    }, [id]);

    const handleAction = async (status: 'APPROVED' | 'REJECTED') => {
        setActionLoading(true);
        try {
            await adminApi.updateVerificationStatus(id, status);
            router.push("/");
            router.refresh();
        } catch (error) {
            console.error("Failed to update status:", error);
            alert("Failed to update status");
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

    if (!user) {
        return (
            <div className="text-center py-20">
                <h2 className="text-2xl font-bold">User Not Found</h2>
                <Link href="/" className="text-sky-400 hover:underline mt-4 inline-block">Back to Dashboard</Link>
            </div>
        );
    }

    const profile = user.serviceProvider || user.rentalOwner;
    const roleLabel = user.serviceProvider ? "Service Provider" : "Rental Owner";
    const subRole = user.serviceProvider ? profile.category : profile.businessName;

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/" className="p-2 rounded-lg bg-slate-800/50 hover:bg-slate-700 transition-colors">
                        <ChevronLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Review Application</h1>
                        <p className="text-slate-400 text-sm">ID: {user.id}</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => handleAction('REJECTED')}
                        disabled={actionLoading}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-500 font-bold hover:bg-rose-500/20 transition-all disabled:opacity-50"
                    >
                        <XCircle size={18} />
                        Reject
                    </button>
                    <button
                        onClick={() => handleAction('APPROVED')}
                        disabled={actionLoading}
                        className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-500 text-white font-bold shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                    >
                        <CheckCircle size={18} />
                        Approve Provider
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Personal Highlights */}
                <div className="space-y-6">
                    <div className="glass-card p-6">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-24 h-24 rounded-full bg-sky-500/10 border-2 border-sky-500/50 flex items-center justify-center mb-4 overflow-hidden">
                                {user.profileImage ? (
                                    <img src={user.profileImage} alt={user.fullName} className="w-full h-full object-cover" />
                                ) : (
                                    <User size={48} className="text-sky-400" />
                                )}
                            </div>
                            <h2 className="text-xl font-bold">{user.fullName}</h2>
                            <span className="text-sm px-3 py-1 rounded-full bg-sky-500/10 text-sky-400 font-medium mt-2">
                                {roleLabel} • {subRole}
                            </span>
                        </div>

                        <div className="mt-8 space-y-4">
                            <InfoRow icon={<Mail size={16} />} label="Email" value={user.email} />
                            <InfoRow icon={<Phone size={16} />} label="Phone" value={user.phone || "N/A"} />
                            <InfoRow icon={<Calendar size={16} />} label="Registered" value={new Date(user.createdAt).toLocaleDateString()} />
                            <InfoRow icon={<MapPin size={16} />} label="Location" value={profile?.formattedAddress || "N/A"} />
                        </div>
                    </div>

                    <div className="glass-card p-6">
                        <h3 className="font-bold flex items-center gap-2 mb-4">
                            <ShieldCheck size={18} className="text-emerald-400" />
                            Security Check
                        </h3>
                        <ul className="text-sm space-y-3">
                            <li className="flex items-center gap-2 text-slate-400">
                                <div className={`w-1.5 h-1.5 rounded-full ${user.isEmailVerified ? 'bg-emerald-500' : 'bg-slate-600'}`}></div>
                                Email verification {user.isEmailVerified ? 'passed' : 'pending'}
                            </li>
                            <li className="flex items-center gap-2 text-slate-400">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                                Account created successfully
                            </li>
                            <li className="flex items-center gap-2 text-slate-300">
                                <div className={`w-1.5 h-1.5 rounded-full ${profile?.status === 'PENDING' ? 'bg-amber-500' : 'bg-emerald-500'}`}></div>
                                Profile status: {profile?.status}
                            </li>
                        </ul>
                    </div>

                    {/* AI Verification Section */}
                    {user.documents?.some((d: any) => d.aiResult) && (
                        <div className="glass-card p-6 border-sky-500/20 bg-sky-500/5">
                            <h3 className="font-bold flex items-center gap-2 mb-4 text-sky-400">
                                <BrainCircuit size={18} />
                                AI Insights
                            </h3>
                            <div className="space-y-4">
                                {user.documents.filter((d: any) => d.aiResult).map((doc: any, i: number) => {
                                    const ai = doc.aiResult;
                                    return (
                                        <div key={i} className="p-3 rounded-lg bg-slate-900/50 border border-slate-800">
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="text-[10px] font-bold uppercase text-slate-500">{doc.documentType}</span>
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${ai.status === 'AI_PASSED' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                                                    {Math.round(ai.confidence * 100)}% Match
                                                </span>
                                            </div>
                                            <p className="text-xs text-slate-300 leading-relaxed italic">"{ai.reason}"</p>
                                            
                                            <div className="mt-3 space-y-1.5">
                                                <AiCheck label="Name Match" passed={ai.checks?.nameMatch} />
                                                <AiCheck label="Not Expired" passed={ai.checks?.notExpired} />
                                                <AiCheck label="Authentic" passed={ai.checks?.looksAuthentic} />
                                                <AiCheck label="Face Match" passed={ai.checks?.faceMatch} />
                                            </div>

                                            {doc.selfieUrl && (
                                                <div className="mt-4 pt-4 border-t border-slate-800">
                                                    <p className="text-[10px] font-bold text-slate-500 uppercase mb-2">Live Selfie Comparison</p>
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <div className="aspect-square rounded-lg overflow-hidden border border-slate-800 bg-slate-900">
                                                            <img src={doc.documentUrl} alt="ID Photo" className="w-full h-full object-cover" />
                                                            <span className="absolute bottom-1 left-1 text-[8px] bg-black/50 px-1 rounded">ID PHOTO</span>
                                                        </div>
                                                        <div className="aspect-square rounded-lg overflow-hidden border border-sky-500/30 bg-slate-900">
                                                            <img src={doc.selfieUrl} alt="Live Selfie" className="w-full h-full object-cover" />
                                                            <span className="absolute bottom-1 left-1 text-[8px] bg-sky-500/50 px-1 rounded">LIVE SELFIE</span>
                                                        </div>
                                                    </div>
                                                    <div className="mt-2 flex items-center justify-between">
                                                        <span className="text-[10px] text-slate-400">Match Score</span>
                                                        <span className={`text-xs font-bold ${doc.faceMatchScore > 0.8 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                                            {Math.round(doc.faceMatchScore * 100)}%
                                                        </span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Column: Documents & Info */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Documents */}
                    <div className="glass-card p-8">
                        <h3 className="text-xl font-bold mb-6">Verification Documents</h3>
                        {user.documents && user.documents.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {user.documents.map((doc: any, i: number) => (
                                    <div key={i} className="group relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-900/50 p-2">
                                        <div className="aspect-video bg-slate-800 rounded-xl flex items-center justify-center mb-4 overflow-hidden">
                                            {doc.documentUrl.match(/\.(jpeg|jpg|gif|png)$/) ? (
                                                <img src={doc.documentUrl} alt={doc.documentType} className="w-full h-full object-cover" />
                                            ) : (
                                                <FileText size={48} className="text-slate-600" />
                                            )}
                                        </div>
                                        <div className="px-3 pb-3 flex justify-between items-end">
                                            <div>
                                                <div className="font-bold text-sm">{doc.documentType}</div>
                                                <div className="text-[10px] text-slate-500 uppercase tracking-widest">{new Date(doc.createdAt).toLocaleDateString()}</div>
                                            </div>
                                            <a href={doc.documentUrl} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-sky-500/10 text-sky-400 hover:bg-sky-500 hover:text-white transition-all">
                                                <ExternalLink size={16} />
                                            </a>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-slate-500 text-center py-10">No documents uploaded.</p>
                        )}
                    </div>

                    {/* Profile Details (Experience, Skills, etc.) */}
                    <div className="glass-card p-8">
                        <h3 className="text-xl font-bold mb-6">Profile Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <h4 className="text-sm font-semibold text-slate-400 mb-2 uppercase tracking-wider">Experience</h4>
                                <p className="text-lg font-bold">{profile?.yearsOfExperience || profile?.yearsInBusiness} Years</p>
                            </div>
                            {user.serviceProvider && (
                                <div>
                                    <h4 className="text-sm font-semibold text-slate-400 mb-2 uppercase tracking-wider">Skills</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {profile?.skills.map((skill: string, i: number) => (
                                            <span key={i} className="px-2 py-1 rounded-md bg-slate-800 border border-slate-700 text-xs text-slate-300">
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {user.rentalOwner && (
                                <div>
                                    <h4 className="text-sm font-semibold text-slate-400 mb-2 uppercase tracking-wider">Tool Categories</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {profile?.toolCategories.map((cat: string, i: number) => (
                                            <span key={i} className="px-2 py-1 rounded-md bg-slate-800 border border-slate-700 text-xs text-slate-300">
                                                {cat}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function AiCheck({ label, passed }: { label: string, passed: boolean }) {
    return (
        <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-400">{label}</span>
            {passed ? (
                <BadgeCheck size={14} className="text-emerald-500" />
            ) : (
                <AlertCircle size={14} className="text-rose-500" />
            )}
        </div>
    );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
    return (
        <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-2 text-slate-400">
                {icon}
                <span className="text-xs">{label}</span>
            </div>
            <span className="text-sm font-semibold text-right max-w-[150px] truncate">{value}</span>
        </div>
    );
}
