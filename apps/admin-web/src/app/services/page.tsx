"use client";

import { useState, useEffect } from "react";
import { Wrench, Plus, MoveVertical, Edit3, Trash2, Box } from "lucide-react";
import { adminApi } from "@/services/api";

export default function ServicesPage() {
    const [data, setData] = useState<{ services: any[], rentals: any[] }>({ services: [], rentals: [] });
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'service' | 'rental'>('service');

    const [showAddModal, setShowAddModal] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState("");

    const [showEditModal, setShowEditModal] = useState(false);
    const [editCategoryOldName, setEditCategoryOldName] = useState("");
    const [editCategoryNewName, setEditCategoryNewName] = useState("");

    const fetchCategories = () => {
        setLoading(true);
        adminApi.getServices()
            .then(res => {
                if (res && res.services && res.rentals) {
                    setData(res);
                } else if (Array.isArray(res)) {
                    setData({ services: res, rentals: [] });
                }
            })
            .catch(err => console.error("Error fetching services:", err))
            .finally(() => setLoading(false));
    };

    const handleAddCategorySubmit = async () => {
        if (!newCategoryName.trim()) {
            alert("Please enter a category name.");
            return;
        }

        try {
            await adminApi.addCategory(activeTab, newCategoryName);
            setShowAddModal(false);
            fetchCategories();
        } catch (err: any) {
            alert(`Failed to add category: ${err.message}`);
        }
    };

    const handleEditCategorySubmit = async () => {
        if (!editCategoryNewName.trim()) {
            alert("Please enter a new category name.");
            return;
        }

        try {
            await adminApi.updateCategory(activeTab, editCategoryOldName, editCategoryNewName);
            setShowEditModal(false);
            fetchCategories();
        } catch (err: any) {
            alert(`Failed to update category: ${err.message}`);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleDeleteCategory = async (type: 'service' | 'rental', name: string) => {
        const confirmDelete = window.confirm(`Are you sure you want to delete the ${type === 'service' ? 'service provider' : 'rental tool'} category "${name}"?\nActive providers/tools in this category will be remapped to "Other".`);
        if (!confirmDelete) return;

        try {
            await adminApi.deleteCategory(type, name);
            fetchCategories();
        } catch (err: any) {
            alert(`Failed to delete category: ${err.message}`);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-500"></div>
            </div>
        );
    }

    const currentList = activeTab === 'service' ? data.services : data.rentals;

    return (
        <div className="space-y-6 animate-in fade-in duration-700">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-white">Marketplace Categories</h1>
                    <p className="text-slate-400 mt-1 text-sm">Configure service categories, tool rental categories, and marketplace fees.</p>
                </div>
                <button
                    onClick={() => {
                        setNewCategoryName("");
                        setShowAddModal(true);
                    }}
                    className="flex items-center gap-2 bg-sky-500 text-white px-4 py-2 rounded-lg text-[13px] font-bold shadow-sm shadow-sky-500/20 hover:bg-sky-600 transition-all"
                >
                    <Plus size={16} />
                    Add Category
                </button>
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-4 border-b border-slate-800 pb-px">
                <button
                    onClick={() => setActiveTab('service')}
                    className={`pb-3 text-sm font-bold border-b-2 transition-all ${
                        activeTab === 'service'
                            ? 'border-sky-500 text-sky-400'
                            : 'border-transparent text-slate-400 hover:text-slate-200'
                    }`}
                >
                    Service Provider Roles ({data.services.length})
                </button>
                <button
                    onClick={() => setActiveTab('rental')}
                    className={`pb-3 text-sm font-bold border-b-2 transition-all ${
                        activeTab === 'rental'
                            ? 'border-sky-500 text-sky-400'
                            : 'border-transparent text-slate-400 hover:text-slate-200'
                    }`}
                >
                    Rental Tool Classes ({data.rentals.length})
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                {currentList.length > 0 ? currentList.map((cat, i) => (
                    <div key={i} className="group glass-card p-5 hover:border-sky-500/50 transition-all">
                        <div className="flex justify-between items-start mb-3">
                            <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-sky-400 transition-colors">
                                {activeTab === 'service' ? <Wrench size={20} /> : <Box size={20} />}
                            </div>
                            <button className="text-slate-600 hover:text-slate-400">
                                <MoveVertical size={16} />
                            </button>
                        </div>
                        <h3 className="text-lg font-bold text-white mb-0.5">{cat.name}</h3>
                        <p className="text-slate-500 text-[13px] mb-5">
                            {cat.providers} {activeTab === 'service' ? 'Active Providers' : 'Registered Tools'}
                        </p>
                        
                        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${cat.status === 'Active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-800 text-slate-500'}`}>
                                {cat.status}
                            </span>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => {
                                        setEditCategoryOldName(cat.name);
                                        setEditCategoryNewName(cat.name);
                                        setShowEditModal(true);
                                    }}
                                    className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-colors"
                                >
                                    <Edit3 size={14} />
                                </button>
                                <button
                                    onClick={() => handleDeleteCategory(activeTab, cat.name)}
                                    className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-rose-400 transition-colors"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>
                    </div>
                )) : (
                    <div className="col-span-full p-10 text-center text-slate-500 italic border border-dashed border-slate-800 rounded-3xl">
                        No categories found in this section.
                    </div>
                )}
            </div>

            {/* Add Category Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-slate-900 border border-slate-850 rounded-2xl max-w-md w-full p-6 space-y-6 shadow-2xl relative">
                        <div>
                            <h3 className="text-xl font-bold text-white">Add New Category</h3>
                            <p className="text-slate-400 text-sm mt-1">
                                Add a new category for {activeTab === 'service' ? 'Service Providers' : 'Rental Tools'}.
                            </p>
                        </div>
                        
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Category Name</label>
                            <input
                                type="text"
                                value={newCategoryName}
                                onChange={(e) => setNewCategoryName(e.target.value)}
                                placeholder={activeTab === 'service' ? "e.g. Roofing Specialist" : "e.g. Generators"}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-sky-500/50 transition-colors"
                            />
                        </div>

                        <div className="flex justify-end gap-3 pt-2">
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="px-4 py-2.5 rounded-xl text-[13px] font-bold text-slate-400 hover:text-white bg-slate-850 hover:bg-slate-800 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAddCategorySubmit}
                                className="px-4 py-2.5 rounded-xl text-[13px] font-bold text-white bg-sky-500 hover:bg-sky-600 shadow-lg shadow-sky-500/20 transition-all"
                            >
                                Add Category
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Category Modal */}
            {showEditModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-slate-900 border border-slate-850 rounded-2xl max-w-md w-full p-6 space-y-6 shadow-2xl relative">
                        <div>
                            <h3 className="text-xl font-bold text-white">Rename Category</h3>
                            <p className="text-slate-400 text-sm mt-1">
                                Update name of {activeTab === 'service' ? 'Service Provider' : 'Rental Tool'} category.
                            </p>
                        </div>
                        
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Current Name</label>
                                <input
                                    type="text"
                                    value={editCategoryOldName}
                                    disabled
                                    className="w-full bg-slate-950/50 border border-slate-850 rounded-xl px-4 py-3 text-slate-500 text-sm cursor-not-allowed"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">New Category Name</label>
                                <input
                                    type="text"
                                    value={editCategoryNewName}
                                    onChange={(e) => setEditCategoryNewName(e.target.value)}
                                    placeholder="Enter new category name..."
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-sky-500/50 transition-colors"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-2">
                            <button
                                onClick={() => setShowEditModal(false)}
                                className="px-4 py-2.5 rounded-xl text-[13px] font-bold text-slate-400 hover:text-white bg-slate-850 hover:bg-slate-800 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleEditCategorySubmit}
                                className="px-4 py-2.5 rounded-xl text-[13px] font-bold text-white bg-sky-500 hover:bg-sky-600 shadow-lg shadow-sky-500/20 transition-all"
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
