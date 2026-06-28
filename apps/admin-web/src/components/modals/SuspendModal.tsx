import React from "react";
import { AlertCircle } from "lucide-react";

interface SuspendModalProps {
    isOpen: boolean;
    reason: string;
    onReasonChange: (reason: string) => void;
    onClose: () => void;
    onConfirm: () => void;
}

export function SuspendModal({ isOpen, reason, onReasonChange, onClose, onConfirm }: SuspendModalProps) {
    if (!isOpen) return null;
    return (
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
                    value={reason}
                    onChange={(e) => onReasonChange(e.target.value)}
                    placeholder="e.g., Unsafe tools provided, failed verification, or trust score fell below safety threshold..."
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-amber-500 transition-colors h-24 resize-none"
                />
                <div className="flex justify-end gap-3 pt-2">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg bg-slate-850 hover:bg-slate-800 text-slate-300 text-sm font-medium transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-sm font-bold shadow-lg shadow-amber-600/20 transition-colors"
                    >
                        Suspend Account
                    </button>
                </div>
            </div>
        </div>
    );
}
