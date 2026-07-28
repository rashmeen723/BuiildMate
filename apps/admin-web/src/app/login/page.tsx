"use client";

import { useState } from "react";
import { adminApi } from "@/services/api";
import { Lock, Mail, ShieldAlert, KeyRound, Loader2, CheckCircle2, ArrowLeft, Eye, EyeOff } from "lucide-react";

type AuthMode = "LOGIN" | "FORGOT" | "RESET";

export default function LoginPage() {
    const [mode, setMode] = useState<AuthMode>("LOGIN");

    // Form Inputs
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [code, setCode] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    // Feedback States
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    // Password visibility states
    const [showPassword, setShowPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // 1. Handle Regular Login
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage(null);
        setLoading(true);

        try {
            const data = await adminApi.login(email, password);

            if (data.user.role !== "ADMIN") {
                throw new Error("Access Denied: Only system administrators can access this portal.");
            }

            localStorage.setItem("admin_token", data.access_token);
            localStorage.setItem("admin_user", JSON.stringify(data.user));

            window.location.href = "/";
        } catch (err: any) {
            setError(err.message || "Failed to sign in. Please verify your credentials.");
            setLoading(false);
        }
    };

    // 2. Handle OTP Code Request (Forgot Password)
    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage(null);
        setLoading(true);

        try {
            await adminApi.forgotPassword(email);
            setSuccessMessage("A 6-digit verification code has been dispatched to your email.");
            setMode("RESET");
        } catch (err: any) {
            setError(err.message || "Failed to send verification code. Ensure your email exists.");
        } finally {
            setLoading(false);
        }
    };

    // 3. Handle Password Reset
    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage(null);

        if (newPassword !== confirmPassword) {
            setError("Passwords do not match. Please verify.");
            return;
        }

        setLoading(true);

        try {
            await adminApi.resetPassword(email, code, newPassword);
            setSuccessMessage("Password reset successfully. You can now log in!");
            setMode("LOGIN");
            setPassword("");
            setCode("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (err: any) {
            setError(err.message || "Failed to reset password. Check if code is valid or expired.");
        } finally {
            setLoading(false);
        }
    };

    const handleBackToLogin = () => {
        setError(null);
        setSuccessMessage(null);
        setMode("LOGIN");
    };

    return (
        <div className="min-h-screen w-full relative flex items-center justify-center bg-[#07090e] overflow-hidden">
            {/* Ambient Background Mesh Gradients */}
            <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-sky-500/10 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none"></div>

            {/* Login Card */}
            <div className="w-full max-w-md p-8 glass-card border border-white/5 bg-slate-950/60 shadow-2xl relative z-10 space-y-6 mx-4">

                {/* Header Text Section */}
                <div className="space-y-2 text-center">
                    <div className="inline-flex p-3 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-400 mb-2">
                        <KeyRound size={26} />
                    </div>

                    {mode === "LOGIN" && (
                        <>
                            <h1 className="text-2xl font-bold tracking-tight text-white">Admin Portal</h1>
                            <p className="text-xs text-slate-400">Sign in to manage the BuildMate marketplace.</p>
                        </>
                    )}
                    {mode === "FORGOT" && (
                        <>
                            <h1 className="text-2xl font-bold tracking-tight text-white">Forgot Password</h1>
                            <p className="text-xs text-slate-400">Request a verification code to reset your account credentials.</p>
                        </>
                    )}
                    {mode === "RESET" && (
                        <>
                            <h1 className="text-2xl font-bold tracking-tight text-white">Reset Password</h1>
                            <p className="text-xs text-slate-400">Enter the verification code sent to your email and your new password.</p>
                        </>
                    )}
                </div>

                {/* Status Messages */}
                {error && (
                    <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 flex gap-2.5 items-start text-xs text-rose-400 leading-normal animate-in fade-in duration-200">
                        <ShieldAlert size={16} className="shrink-0 mt-0.5" />
                        <span>{error}</span>
                    </div>
                )}
                {successMessage && (
                    <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex gap-2.5 items-start text-xs text-emerald-400 leading-normal animate-in fade-in duration-200">
                        <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
                        <span>{successMessage}</span>
                    </div>
                )}

                {/* Mode Form Renderings */}
                {mode === "LOGIN" && (
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Email Address</label>
                            <div className="relative">
                                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="admin@buildmate.com"
                                    className="w-full bg-white/5 border border-white/5 rounded-xl pl-11 pr-4 py-2.5 text-[13px] text-white focus:outline-none focus:border-sky-500/50 placeholder-slate-600 transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <div className="flex justify-between items-center">
                                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Password</label>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setError(null);
                                        setSuccessMessage(null);
                                        setMode("FORGOT");
                                    }}
                                    className="text-[11px] font-semibold text-sky-400 hover:text-sky-300 transition-colors"
                                >
                                    Forgot Password?
                                </button>
                            </div>
                            <div className="relative">
                                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full bg-white/5 border border-white/5 rounded-xl pl-11 pr-10 py-2.5 text-[13px] text-white focus:outline-none focus:border-sky-500/50 placeholder-slate-600 transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-350 transition-colors"
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full mt-4 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-lg shadow-sky-600/10 transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50"
                        >
                            {loading ? (
                                <>
                                    <Loader2 size={14} className="animate-spin" />
                                    Authenticating...
                                </>
                            ) : (
                                "Sign In"
                            )}
                        </button>
                    </form>
                )}

                {mode === "FORGOT" && (
                    <form onSubmit={handleForgotPassword} className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Email Address</label>
                            <div className="relative">
                                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="admin@buildmate.com"
                                    className="w-full bg-white/5 border border-white/5 rounded-xl pl-11 pr-4 py-2.5 text-[13px] text-white focus:outline-none focus:border-sky-500/50 placeholder-slate-600 transition-all"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-lg shadow-sky-600/10 transition-all"
                        >
                            {loading ? (
                                <>
                                    <Loader2 size={14} className="animate-spin" />
                                    Sending Code...
                                </>
                            ) : (
                                "Send Reset Code"
                            )}
                        </button>

                        <button
                            type="button"
                            onClick={handleBackToLogin}
                            className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-slate-400 hover:text-white text-xs font-semibold transition-colors mt-2"
                        >
                            <ArrowLeft size={14} />
                            Back to Sign In
                        </button>
                    </form>
                )}

                {mode === "RESET" && (
                    <form onSubmit={handleResetPassword} className="space-y-4">
                        {/* OTP Verification Code */}
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">6-Digit Code</label>
                            <input
                                type="text"
                                required
                                maxLength={6}
                                value={code}
                                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                                placeholder="123456"
                                className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-2.5 text-center text-lg tracking-widest text-white focus:outline-none focus:border-sky-500/50 placeholder-slate-700 transition-all font-mono"
                            />
                        </div>

                        {/* New Password */}
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">New Password</label>
                            <div className="relative">
                                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                                <input
                                    type={showNewPassword ? "text" : "password"}
                                    required
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="New Password (min 8 chars)"
                                    className="w-full bg-white/5 border border-white/5 rounded-xl pl-11 pr-10 py-2.5 text-[13px] text-white focus:outline-none focus:border-sky-500/50 placeholder-slate-600 transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-350 transition-colors"
                                >
                                    {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        {/* Confirm Password */}
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Confirm New Password</label>
                            <div className="relative">
                                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Confirm Password"
                                    className="w-full bg-white/5 border border-white/5 rounded-xl pl-11 pr-10 py-2.5 text-[13px] text-white focus:outline-none focus:border-sky-500/50 placeholder-slate-600 transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-350 transition-colors"
                                >
                                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-lg shadow-sky-600/10 transition-all"
                        >
                            {loading ? (
                                <>
                                    <Loader2 size={14} className="animate-spin" />
                                    Resetting...
                                </>
                            ) : (
                                "Reset Password"
                            )}
                        </button>

                        <button
                            type="button"
                            onClick={handleBackToLogin}
                            className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-slate-400 hover:text-white text-xs font-semibold transition-colors mt-2"
                        >
                            <ArrowLeft size={14} />
                            Back to Sign In
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}