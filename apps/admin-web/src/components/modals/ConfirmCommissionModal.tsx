import React from "react";
import { AlertCircle } from "lucide-react";

interface ConfirmCommissionModalProps {
    isOpen: boolean;
    serviceCommissionRate: number;
    rentalCommissionRate: number;
    onClose: () => void;
    onConfirm: () => void;
}

export function ConfirmCommissionModal({ isOpen, serviceCommissionRate, rentalCommissionRate, onClose, onConfirm }: ConfirmCommissionModalProps) {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
            <div className="glass-card p-6 max-w-md w-full border border-slate-800 bg-slate-950/95 shadow-2xl space-y-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <AlertCircle className="text-sky-400" size={20} />
                    Update Commission Rates
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                    Are you sure you want to update the marketplace commission rates to <span className="text-sky-400 font-bold">Services: {serviceCommissionRate}%</span> and <span className="text-sky-400 font-bold">Rentals: {rentalCommissionRate}%</span>? These percentages will apply to all subsequent bookings and tool rentals.
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
                        className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-sm font-bold shadow-lg shadow-sky-600/20 transition-colors"
                    >
                        Update Commission
                    </button>
                </div>
            </div>
        </div>
    );
}
