import React from "react";
import { Trash2 } from "lucide-react";

interface DeleteUserModalProps {
    isOpen: boolean;
    userName: string;
    isDoubleConfirm: boolean;
    onDoubleConfirmChange: (val: boolean) => void;
    onClose: () => void;
    onConfirm: () => void;
}

export function DeleteUserModal({ isOpen, userName, isDoubleConfirm, onDoubleConfirmChange, onClose, onConfirm }: DeleteUserModalProps) {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
            <div className="glass-card p-6 max-w-md w-full border border-slate-800 bg-slate-950/95 shadow-2xl space-y-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Trash2 className="text-rose-500" size={20} />
                    Remove Provider Profile
                </h3>
                
                {!isDoubleConfirm ? (
                    <>
                        <p className="text-slate-300 text-sm leading-relaxed">
                            Are you sure you want to completely delete <strong className="text-white">"{userName}"</strong> from the system?
                        </p>
                        <div className="bg-rose-500/10 border border-rose-500/20 rounded-lg p-3 text-[13px] text-rose-400">
                            This action will permanently delete their profile, active tool listings, rental transaction history, disputes, and reviews.
                        </div>
                        <div className="flex justify-end gap-3 pt-2">
                            <button
                                onClick={onClose}
                                className="px-4 py-2 rounded-lg bg-slate-850 hover:bg-slate-800 text-slate-300 text-sm font-medium transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => onDoubleConfirmChange(true)}
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
                                    onDoubleConfirmChange(false);
                                }}
                                className="px-4 py-2 rounded-lg bg-slate-850 hover:bg-slate-800 text-slate-300 text-sm font-medium transition-colors"
                            >
                                Back
                            </button>
                            <button
                                onClick={onConfirm}
                                className="px-4 py-2 rounded-lg bg-rose-700 hover:bg-rose-800 text-white text-sm font-bold shadow-lg shadow-rose-700/20 transition-colors animate-pulse"
                            >
                                Confirm Delete
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
