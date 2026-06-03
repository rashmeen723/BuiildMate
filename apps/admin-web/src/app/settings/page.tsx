"use client";

import { Settings as SettingsIcon, Bell, Lock, Globe, CreditCard, Shield } from "lucide-react";

export default function SettingsPage() {
    return (
        <div className="space-y-6 animate-in fade-in duration-700">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-white">System Settings</h1>
                <p className="text-slate-400 mt-1 text-sm">Configure platform rules, notifications, and security.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="space-y-1 col-span-1">
                    <SettingNav icon={<Globe size={18} />} label="General" description="Basic platform info and branding" active />
                    <SettingNav icon={<Shield size={18} />} label="Verification" description="KYC and AI threshold settings" />
                    <SettingNav icon={<CreditCard size={18} />} label="Payments" description="Commission rates and payouts" />
                    <SettingNav icon={<Bell size={18} />} label="Notifications" description="Email and push alert rules" />
                    <SettingNav icon={<Lock size={18} />} label="Security" description="Admin roles and permissions" />
                </div>

                <div className="md:col-span-3 space-y-5">
                    <div className="glass-card p-6">
                        <h3 className="text-lg font-bold mb-5">General Configuration</h3>
                        <div className="space-y-5">
                            <div className="grid grid-cols-1 gap-1.5">
                                <label className="text-[13px] font-bold text-slate-400">Marketplace Name</label>
                                <input type="text" defaultValue="BuildMate" className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-[13px] text-white focus:outline-none focus:border-sky-500 transition-colors" />
                            </div>
                            <div className="grid grid-cols-1 gap-1.5">
                                <label className="text-[13px] font-bold text-slate-400">Support Email</label>
                                <input type="email" defaultValue="support@buildmate.com" className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-[13px] text-white focus:outline-none focus:border-sky-500 transition-colors" />
                            </div>
                            <div className="flex items-center justify-between py-4 border-t border-slate-800 mt-5">
                                <div>
                                    <h4 className="text-[14px] font-bold text-white">Maintenance Mode</h4>
                                    <p className="text-[12px] text-slate-500">Disable all frontend interactions</p>
                                </div>
                                <div className="w-10 h-5 bg-slate-800 rounded-full relative cursor-pointer">
                                    <div className="absolute left-1 top-1 w-3 h-3 bg-slate-600 rounded-full"></div>
                                </div>
                            </div>
                            <button className="w-auto bg-sky-500 text-white text-[13px] font-bold px-5 py-2 rounded-lg hover:bg-sky-600 transition-all shadow-sm shadow-sky-500/20">
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function SettingNav({ icon, label, description, active = false }: { icon: React.ReactNode, label: string, description: string, active?: boolean }) {
    return (
        <button className={`w-full text-left px-4 py-3 rounded-xl transition-all ${active ? 'bg-sky-500/10 border border-sky-500/30' : 'hover:bg-slate-900/50 border border-transparent'}`}>
            <div className="flex items-center gap-3">
                <div className={`${active ? 'text-sky-400' : 'text-slate-500'}`}>
                    {icon}
                </div>
                <div>
                    <h4 className={`text-[13px] font-bold ${active ? 'text-white' : 'text-slate-300'}`}>{label}</h4>
                    <p className="text-[10px] text-slate-500 leading-tight">{description}</p>
                </div>
            </div>
        </button>
    );
}
