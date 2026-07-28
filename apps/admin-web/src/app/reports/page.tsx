"use client";

import { useEffect, useState } from "react";
import { adminApi } from "@/services/api";
import { FileText, Download, Printer, TrendingUp, DollarSign, Users, Award, ShieldCheck, RefreshCw } from "lucide-react";

export default function ReportsPage() {
    const [reportData, setReportData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);

    const fetchReport = () => {
        setLoading(true);
        adminApi.getMonthlyReport()
            .then(setReportData)
            .catch(err => console.error("Error fetching report data:", err))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchReport();
    }, []);

    const exportToCSV = (type: "financial" | "marketing") => {
        if (!reportData) return;
        setGenerating(true);

        try {
            let csvContent = "data:text/csv;charset=utf-8,";
            let filename = `BuildMate_${type}_report_${new Date().toISOString().slice(0, 7)}.csv`;

            if (type === "financial") {
                csvContent += "BuildMate Monthly Financial Report\n";
                csvContent += `Report Period,${reportData.financials.month}\n\n`;
                csvContent += "Metric,Value\n";
                csvContent += `Completed Service Bookings,${reportData.financials.bookingsCount}\n`;
                csvContent += `Completed Tool Rentals,${reportData.financials.rentalsCount}\n`;
                csvContent += `Service Bookings Gross Revenue (LKR),${reportData.financials.bookingsRevenue}\n`;
                csvContent += `Service Bookings Platform Commission (LKR),${reportData.financials.bookingsProfit}\n`;
                csvContent += `Tool Rentals Gross Revenue (LKR),${reportData.financials.rentalsRevenue}\n`;
                csvContent += `Tool Rentals Platform Commission (LKR),${reportData.financials.rentalsProfit}\n`;
                csvContent += `Cash Rentals Volume,${reportData.financials.cashRentalsCount}\n`;
                csvContent += `Card Rentals Volume,${reportData.financials.cardRentalsCount}\n`;
                csvContent += `Cash Rentals Revenue (LKR),${reportData.financials.cashRentalsRevenue}\n`;
                csvContent += `Card Rentals Revenue (LKR),${reportData.financials.cardRentalsRevenue}\n`;
                csvContent += `Total System Gross Revenue (LKR),${reportData.financials.totalRevenue}\n`;
                csvContent += `Total Platform Net Profit (LKR),${reportData.financials.totalProfit}\n`;
                csvContent += `Net Merchant/Partner Payouts (LKR),${reportData.financials.netPayouts}\n`;
            } else {
                csvContent += "BuildMate Monthly Marketing & Platform Activity Report\n";
                csvContent += `Report Period,${reportData.marketing.month}\n\n`;
                csvContent += "Metric,Value\n";
                csvContent += `New Household Customer Signups,${reportData.marketing.newHouseholds}\n`;
                csvContent += `New Service Provider Signups,${reportData.marketing.newProviders}\n`;
                csvContent += `New Rental Owner Signups,${reportData.marketing.newOwners}\n`;
                csvContent += `Total User Registrations,${reportData.marketing.totalNewSignups}\n`;
                csvContent += `Top Demanded Service Category,${reportData.marketing.topService}\n`;
                csvContent += `Top Demanded Rental Tool,${reportData.marketing.topTool}\n`;
                csvContent += `Disputes Logged,${reportData.marketing.disputesLogged}\n`;
                csvContent += `Disputes Resolved,${reportData.marketing.disputesResolved}\n`;
                csvContent += `Suspended Accounts,${reportData.marketing.totalSuspensions}\n`;
                csvContent += `Top Rated Area,${reportData.marketing.topRatedArea}\n`;
                csvContent += `Top Booking Location,${reportData.marketing.topBookingLocation}\n`;
                csvContent += `Least Booking Location,${reportData.marketing.leastBookingLocation}\n`;
            }

            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", filename);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (err) {
            console.error("CSV generation failed:", err);
        } finally {
            setGenerating(false);
        }
    };

    const [printScope, setPrintScope] = useState<"all" | "financial" | "marketing">("all");

    useEffect(() => {
        const handleAfterPrint = () => {
            setPrintScope("all");
        };
        window.addEventListener("afterprint", handleAfterPrint);
        return () => window.removeEventListener("afterprint", handleAfterPrint);
    }, []);

    const printReport = (scope: "all" | "financial" | "marketing") => {
        setPrintScope(scope);
        setTimeout(() => {
            window.print();
        }, 100);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh] print:hidden">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-500"></div>
            </div>
        );
    }

    if (!reportData) {
        return (
            <div className="text-center py-20 print:hidden">
                <h2 className="text-2xl font-bold text-white">No Report Data Found</h2>
                <button onClick={fetchReport} className="mt-4 px-4 py-2 bg-sky-500 rounded-lg text-white font-bold">Retry</button>
            </div>
        );
    }

    const { financials, marketing } = reportData;

    return (
        <div className="space-y-6">
            {/* Header / Toolbar */}
            <div className="flex justify-between items-center print:hidden border-b border-white/5 pb-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                        <FileText size={24} className="text-sky-400" />
                        Report Generation Suite
                    </h1>
                    <p className="text-slate-400 mt-1 text-sm">Generate visual PDF summaries or download raw CSV audit spreadsheets.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => printReport("all")}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 font-bold hover:bg-slate-800 transition-colors"
                    >
                        <Printer size={16} />
                        Print Full PDF Report
                    </button>
                    <button
                        onClick={fetchReport}
                        className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-500 hover:text-white transition-colors"
                    >
                        <RefreshCw size={16} />
                    </button>
                </div>
            </div>

            {/* Print View Header Block */}
            <div className="hidden print:block border-b-2 border-slate-800 pb-5 mb-8">
                <div className="flex justify-between items-end">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">BuildMate Marketplace Audit</h1>
                        <p className="text-slate-500 text-sm mt-0.5">System Performance Summary Report</p>
                    </div>
                    <div className="text-right">
                        <p className="text-[11px] font-semibold text-slate-400 uppercase">Period Covered</p>
                        <p className="text-sm font-bold text-slate-800">{financials.month}</p>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 print:grid-cols-1">
                {/* Financial Performance Section */}
                <div className={`glass-card p-6 border border-white/5 flex flex-col justify-between print:border-none print:shadow-none print:bg-white print:text-slate-900 print:p-0 ${printScope === "marketing" ? "print:hidden" : ""
                    }`}>
                    <div className="space-y-6">
                        <div className="flex justify-between items-start print:border-b print:pb-2">
                            <div>
                                <h3 className="font-bold text-white text-base flex items-center gap-2 print:text-slate-900">
                                    <DollarSign size={18} className="text-emerald-400" />
                                    Monthly Financial Ledger
                                </h3>
                                <p className="text-xs text-slate-500 mt-0.5 print:hidden">Audit completed transactions and commission profits.</p>
                            </div>
                            <span className="hidden print:block text-xs font-semibold text-slate-400">Section I: Financials</span>
                        </div>

                        {/* Top profit numbers */}
                        <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10 flex items-center justify-between print:bg-slate-50 print:border-slate-200">
                            <div>
                                <span className="text-[11px] font-bold text-slate-400 uppercase">Platform Net Profit (5%)</span>
                                <div className="text-2xl font-bold text-emerald-400 print:text-emerald-700">Rs. {financials.totalProfit.toLocaleString()}</div>
                            </div>
                            <div className="text-right">
                                <span className="text-[11px] font-bold text-slate-400 uppercase">Total Gross Value</span>
                                <div className="text-lg font-bold text-white print:text-slate-900">Rs. {financials.totalRevenue.toLocaleString()}</div>
                            </div>
                        </div>

                        <div className="space-y-3 pt-2">
                            <ReportLine label="Completed Service Bookings" value={financials.bookingsCount} />
                            <ReportLine label="Completed Tool Rentals" value={financials.rentalsCount} />
                            <ReportLine label="Bookings Gross Revenue" value={`Rs. ${financials.bookingsRevenue.toLocaleString()}`} />
                            <ReportLine label="Bookings Platform Commission" value={`Rs. ${financials.bookingsProfit.toLocaleString()}`} />
                            <ReportLine label="Tool Rentals Gross Revenue" value={`Rs. ${financials.rentalsRevenue.toLocaleString()}`} />
                            <ReportLine label="Tool Rentals Platform Commission" value={`Rs. ${financials.rentalsProfit.toLocaleString()}`} />
                            <ReportLine label="Cash Rentals Count" value={financials.cashRentalsCount} />
                            <ReportLine label="Card Rentals Count" value={financials.cardRentalsCount} />
                            <ReportLine label="Cash Rentals Revenue" value={`Rs. ${financials.cashRentalsRevenue.toLocaleString()}`} />
                            <ReportLine label="Card Rentals Revenue" value={`Rs. ${financials.cardRentalsRevenue.toLocaleString()}`} />
                            <div className="border-t border-white/5 pt-3 mt-2 flex justify-between text-xs font-bold print:border-slate-200">
                                <span className="text-slate-400 print:text-slate-600">Net Merchant/Partner Payouts</span>
                                <span className="text-white print:text-slate-900">Rs. {financials.netPayouts.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 pt-4 border-t border-white/5 print:hidden flex justify-end gap-3">
                        <button
                            onClick={() => printReport("financial")}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-800 transition-colors"
                        >
                            <Printer size={14} />
                            Print Financial PDF
                        </button>
                        <button
                            onClick={() => exportToCSV("financial")}
                            disabled={generating}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-lg shadow-emerald-600/10 transition-colors disabled:opacity-50"
                        >
                            <Download size={14} />
                            Download Financials (CSV)
                        </button>
                    </div>
                </div>

                {/* Marketing & Activity Section */}
                <div className={`glass-card p-6 border border-white/5 flex flex-col justify-between print:border-none print:shadow-none print:bg-white print:text-slate-900 print:p-0 print:mt-10 ${printScope === "financial" ? "print:hidden" : ""
                    }`}>
                    <div className="space-y-6">
                        <div className="flex justify-between items-start print:border-b print:pb-2">
                            <div>
                                <h3 className="font-bold text-white text-base flex items-center gap-2 print:text-slate-900">
                                    <Users size={18} className="text-indigo-400" />
                                    Marketing & Usage Metrics
                                </h3>
                                <p className="text-xs text-slate-500 mt-0.5 print:hidden">Audit user registrations and high-demand listings.</p>
                            </div>
                            <span className="hidden print:block text-xs font-semibold text-slate-400">Section II: Marketing</span>
                        </div>

                        {/* Top marketing numbers */}
                        <div className="p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/10 flex items-center justify-between print:bg-slate-50 print:border-slate-200">
                            <div>
                                <span className="text-[11px] font-bold text-slate-400 uppercase">New User Signups</span>
                                <div className="text-2xl font-bold text-indigo-400 print:text-indigo-700">{marketing.totalNewSignups} Accounts</div>
                            </div>
                            <div className="text-right">
                                <span className="text-[11px] font-bold text-slate-400 uppercase">Top Demanded Service</span>
                                <div className="text-sm font-bold text-white print:text-slate-900 uppercase">{marketing.topService}</div>
                            </div>
                        </div>

                        <div className="space-y-3 pt-2">
                            <ReportLine label="New Household Customers" value={marketing.newHouseholds} />
                            <ReportLine label="New Service Providers" value={marketing.newProviders} />
                            <ReportLine label="New Rental Owners" value={marketing.newOwners} />
                            <ReportLine label="Top Rented Tool Item" value={marketing.topTool} />
                            <ReportLine label="Total Disputes Logged" value={marketing.disputesLogged} />
                            <ReportLine label="Total Disputes Resolved" value={marketing.disputesResolved} />
                            <ReportLine label="Suspended Accounts" value={marketing.totalSuspensions} />
                            <ReportLine label="Top Rated Area" value={marketing.topRatedArea} />
                            <ReportLine label="Top Booking Location" value={marketing.topBookingLocation} />
                            <ReportLine label="Least Booking Location" value={marketing.leastBookingLocation} />
                        </div>
                    </div>

                    <div className="mt-8 pt-4 border-t border-white/5 print:hidden flex justify-end gap-3">
                        <button
                            onClick={() => printReport("marketing")}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-800 transition-colors"
                        >
                            <Printer size={14} />
                            Print Marketing PDF
                        </button>
                        <button
                            onClick={() => exportToCSV("marketing")}
                            disabled={generating}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-lg shadow-indigo-600/10 transition-colors disabled:opacity-50"
                        >
                            <Download size={14} />
                            Download Marketing (CSV)
                        </button>
                    </div>
                </div>
            </div>

            {/* Print View Footer */}
            <div className="hidden print:flex justify-between items-center border-t-2 border-slate-800 pt-5 mt-12 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                <span>BuildMate Internal Management System</span>
                <span>System Health: Live Node</span>
            </div>
        </div>
    );
}

function ReportLine({ label, value }: { label: string, value: string | number }) {
    return (
        <div className="flex justify-between text-xs py-1 border-b border-white/5 print:border-slate-100">
            <span className="text-slate-400 print:text-slate-600">{label}</span>
            <span className="text-slate-200 font-semibold print:text-slate-800">{value}</span>
        </div>
    );
}
