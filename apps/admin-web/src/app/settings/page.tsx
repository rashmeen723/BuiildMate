"use client";

import { useState, useEffect } from "react";
import { adminApi } from "@/services/api";
import { Settings as SettingsIcon, ShieldCheck, Lock, CheckCircle2, ShieldAlert, Loader2 } from "lucide-react";

export default function SettingsPage() {
    const [adminUser, setAdminUser] = useState<any>(null);

    // Form inputs - Password
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    // Feedback States - Password
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    useEffect(() => {
        const userJson = localStorage.getItem("admin_user");
        if (userJson) {
            try {
                setAdminUser(JSON.parse(userJson));
            } catch (err) {
                console.error("Error parsing admin profile:", err);
            }
        }
    }, []);

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        if (newPassword !== confirmPassword) {
            setError("Passwords do not match. Please verify.");
            return;
        }

        if (newPassword.length < 8) {
            setError("New password must be at least 8 characters long.");
            return;
        }

        setLoading(true);

        try {
            await adminApi.changePassword(currentPassword, newPassword);
            setSuccess("Your administrator password has been updated successfully.");
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (err: any) {
            setError(err.message || "Failed to update password. Check your current password.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-700">
            {/* Header */}
            <div className="border-b border-white/5 pb-4">
                <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                    <SettingsIcon size={24} className="text-sky-400" />
                    System Settings
                </h1>
                <p className="text-slate-400 mt-1 text-sm">Configure administrator credentials and manage your profile.</p>
            </div>

            {/* Content layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Stacked Left Columns */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Profile Card */}
                    <div className="glass-card p-6 border border-white/5 bg-slate-950/40 space-y-6">
                        <div>
                            <h3 className="font-bold text-white text-sm flex items-center gap-2">
                                <ShieldCheck size={16} className="text-sky-400" />
                                Administrator Profile
                            </h3>
                            <p className="text-[11px] text-slate-500 mt-0.5">Current session credentials & role</p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Full Name</span>
                                <span className="text-xs font-semibold text-white mt-0.5 block">{adminUser?.fullName || "Rashmeen Admin"}</span>
                            </div>
                            <div>
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Email Address</span>
                                <span className="text-xs font-semibold text-white mt-0.5 block">{adminUser?.email || "admin@buildmate.com"}</span>
                            </div>
                            <div>
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Platform Role</span>
                                <span className="text-xs font-bold text-sky-400 mt-0.5 block uppercase">{adminUser?.role || "ADMIN"}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Columns (Update Password) */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Password update Card */}
                    <div className="glass-card p-6 border border-white/5 bg-slate-950/40 space-y-6">
                        <div>
                            <h3 className="font-bold text-white text-sm flex items-center gap-2">
                                <Lock size={16} className="text-indigo-400" />
                                Update Password
                            </h3>
                            <p className="text-[11px] text-slate-500 mt-0.5">Change your admin portal credentials</p>
                        </div>

                        {error && (
                            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 flex gap-2.5 items-start text-xs text-rose-400 leading-normal animate-in fade-in duration-200">
                                <ShieldAlert size={16} className="shrink-0 mt-0.5" />
                                <span>{error}</span>
                            </div>
                        )}
                        {success && (
                            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex gap-2.5 items-start text-xs text-emerald-400 leading-normal animate-in fade-in duration-200">
                                <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
                                <span>{success}</span>
                            </div>
                        )}

                        <form onSubmit={handlePasswordChange} className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Current Password</label>
                                <input 
                                    type="password"
                                    required
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    placeholder="Enter current password"
                                    className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-2.5 text-[13px] text-white focus:outline-none focus:border-sky-500/50 placeholder-slate-700 transition-all"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">New Password</label>
                                <input 
                                    type="password"
                                    required
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Enter new password (min 8 chars)"
                                    className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-2.5 text-[13px] text-white focus:outline-none focus:border-sky-500/50 placeholder-slate-700 transition-all"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Confirm New Password</label>
                                <input 
                                    type="password"
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Confirm new password"
                                    className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-2.5 text-[13px] text-white focus:outline-none focus:border-sky-500/50 placeholder-slate-700 transition-all"
                                />
                            </div>

                            <div className="flex justify-end pt-2">
                                <button 
                                    type="submit"
                                    disabled={loading}
                                    className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-lg shadow-sky-600/10 transition-all disabled:opacity-50"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 size={14} className="animate-spin" />
                                            Updating...
                                        </>
                                    ) : (
                                        "Save Changes"
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

            </div>
        </div>
    );
}
