"use client";

import type { Metadata } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ShieldCheck, Users, Wrench, Settings, AlertTriangle } from "lucide-react";
import "./globals.css";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased selection:bg-sky-500/30" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        <div className="flex min-h-screen">
          {/* Sidebar */}
          <aside className="w-60 border-r border-slate-800 bg-slate-900/50 backdrop-blur-xl p-5 hidden md:block">
            <div className="flex items-center gap-2 mb-8">
              <div className="w-7 h-7 bg-sky-500 rounded-lg flex items-center justify-center font-bold text-white text-sm">B</div>
              <span className="text-lg font-bold tracking-tight text-white">BuildMate Admin</span>
            </div>

            <nav className="space-y-0.5">
              <NavItem href="/" icon={<LayoutDashboard size={16} />} label="Overview" active={pathname === "/"} />
              <NavItem href="/verifications" icon={<ShieldCheck size={16} />} label="Verifications" active={pathname.startsWith("/verifications")} />
              <NavItem href="/providers" icon={<Users size={16} />} label="Partners" active={pathname.startsWith("/providers")} />
              <NavItem href="/services" icon={<Wrench size={16} />} label="Categories" active={pathname.startsWith("/services")} />
              <NavItem href="/disputes" icon={<AlertTriangle size={16} />} label="Disputes" active={pathname.startsWith("/disputes")} />
              <NavItem href="/settings" icon={<Settings size={16} />} label="Settings" active={pathname.startsWith("/settings")} />
            </nav>
          </aside>

          <main className="flex-1 p-6 bg-[#0f172a] overflow-y-auto max-h-screen">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}

function NavItem({ label, icon, active = false, badge, href }: { label: string, icon: React.ReactNode, active?: boolean, badge?: string, href: string }) {
  return (
    <Link href={href} className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all ${active ? 'bg-sky-500/10 text-sky-400 font-semibold shadow-sm shadow-sky-500/5' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'}`}>
      <div className="flex items-center gap-3">
        {icon}
        <span className="text-[13px]">{label}</span>
      </div>
      {badge && <span className="bg-sky-500 text-[9px] text-white px-2 py-0.5 rounded-full">{badge}</span>}
    </Link>
  );
}
