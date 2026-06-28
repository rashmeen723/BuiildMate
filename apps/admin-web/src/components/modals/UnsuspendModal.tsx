import React from "react";
import { CheckCircle2 } from "lucide-react";

interface UnsuspendModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

export function UnsuspendModal({ isOpen, onClose, onConfirm }: UnsuspendModalProps) {
    if (!isOpen) return null;
    return (
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
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg bg-slate-850 hover:bg-slate-800 text-slate-300 text-sm font-medium transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold shadow-lg shadow-emerald-600/20 transition-colors"
                    >
                        Unsuspend Account
                    </button>
                </div>
            </div>
        </div>
    );
}
