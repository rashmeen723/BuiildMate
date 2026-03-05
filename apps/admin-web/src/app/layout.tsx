import type { Metadata } from "next";
import Link from "next/link";
import { LayoutDashboard, ShieldCheck, Users, Wrench, Settings } from "lucide-react";
import "./globals.css";

export const metadata: Metadata = {
  title: "BuildMate Admin | Command Center",
  description: "Manage and verify BuildMate service providers and rentals.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased selection:bg-sky-500/30">
        <div className="flex min-h-screen">
          {/* Sidebar */}
          <aside className="w-64 border-r border-slate-800 bg-slate-900/50 backdrop-blur-xl p-6 hidden md:block">
            <div className="flex items-center gap-2 mb-10">
              <div className="w-8 h-8 bg-sky-500 rounded-lg flex items-center justify-center font-bold text-white">B</div>
              <span className="text-xl font-bold tracking-tight text-white">BuildMate Admin</span>
            </div>

            <nav className="space-y-1">
              <NavItem href="/" icon={<LayoutDashboard size={18} />} label="Overview" active />
              <NavItem href="/verifications" icon={<ShieldCheck size={18} />} label="Verifications" badge="3" />
              <NavItem href="/providers" icon={<Users size={18} />} label="Providers" />
              <NavItem href="/services" icon={<Wrench size={18} />} label="Services" />
              <NavItem href="/settings" icon={<Settings size={18} />} label="Settings" />
            </nav>
          </aside>

          <main className="flex-1 p-8 bg-[#0f172a]">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}

function NavItem({ label, icon, active = false, badge, href }: { label: string, icon: React.ReactNode, active?: boolean, badge?: string, href: string }) {
  return (
    <Link href={href} className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${active ? 'bg-sky-500/10 text-sky-400 font-semibold' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'}`}>
      <div className="flex items-center gap-3">
        {icon}
        <span className="text-sm">{label}</span>
      </div>
      {badge && <span className="bg-sky-500 text-[10px] text-white px-2 py-0.5 rounded-full">{badge}</span>}
    </Link>
  );
}
