"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, ShieldCheck, Users, Wrench, Settings, AlertTriangle, FileText, LogOut } from "lucide-react";
import "./globals.css";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const isLoginPage = pathname === "/login";

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    const userJson = localStorage.getItem("admin_user");

    if (isLoginPage) {
      if (token && userJson) {
        try {
          const user = JSON.parse(userJson);
          if (user.role === "ADMIN") {
            router.replace("/");
            return;
          }
        } catch {
          // ignore parsing error and let them log in
        }
      }
      setAuthorized(true);
      return;
    }

    if (!token || !userJson) {
      setAuthorized(false);
      router.replace("/login");
    } else {
      try {
        const user = JSON.parse(userJson);
        if (user.role !== "ADMIN") {
          localStorage.removeItem("admin_token");
          localStorage.removeItem("admin_user");
          setAuthorized(false);
          router.replace("/login");
        } else {
          setAuthorized(true);
        }
      } catch {
        localStorage.removeItem("admin_token");
        localStorage.removeItem("admin_user");
        setAuthorized(false);
        router.replace("/login");
      }
    }
  }, [pathname, isLoginPage, router]);

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_user");
    window.location.href = "/login";
  };

  if (!authorized) {
    return (
      <html lang="en">
        <head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
        </head>
        <body className="antialiased bg-[#07090e] flex items-center justify-center min-h-screen" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-sky-500"></div>
        </body>
      </html>
    );
  }

  if (isLoginPage) {
    return (
      <html lang="en">
        <head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
        </head>
        <body className="antialiased bg-[#07090e]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          {children}
        </body>
      </html>
    );
  }

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased selection:bg-sky-500/30 bg-[#07090e]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        <div className="flex min-h-screen">
          {/* Sidebar */}
          <aside className="w-64 border-r border-white/5 bg-[#090d16]/40 backdrop-blur-2xl p-6 hidden md:flex flex-col justify-between">
            <div className="space-y-8">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-tr from-sky-500 to-indigo-600 rounded-lg flex items-center justify-center font-bold text-white text-sm shadow-lg shadow-sky-500/20">B</div>
                <div>
                  <span className="text-sm font-bold tracking-tight text-white block">BuildMate</span>
                  <span className="text-[10px] text-sky-400 font-semibold tracking-widest uppercase">Admin Panel</span>
                </div>
              </div>

              <nav className="space-y-1">
                <NavItem href="/" icon={<LayoutDashboard size={16} />} label="Dashboard Overview" active={pathname === "/"} />
                <NavItem href="/verifications" icon={<ShieldCheck size={16} />} label="Identity Verification" active={pathname.startsWith("/verifications")} />
                <NavItem href="/providers" icon={<Users size={16} />} label="System Users" active={pathname.startsWith("/providers")} />
                <NavItem href="/categories" icon={<Wrench size={16} />} label="Marketplace Categories" active={pathname.startsWith("/categories")} />
                <NavItem href="/disputes" icon={<AlertTriangle size={16} />} label="Customer Disputes" active={pathname.startsWith("/disputes")} />
                <NavItem href="/reports" icon={<FileText size={16} />} label="Reports Center" active={pathname.startsWith("/reports")} />
                <NavItem href="/settings" icon={<Settings size={16} />} label="System Settings" active={pathname.startsWith("/settings")} />
              </nav>
            </div>

            {/* Bottom Profile Widget */}
            <div className="p-4 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-sky-400 to-indigo-500 flex items-center justify-center text-white font-bold text-xs shadow-md shadow-indigo-500/10">R</div>
                <div>
                  <p className="text-[12px] font-bold text-white">Rashmeen</p>
                  <p className="text-[10px] text-slate-500">Super Admin</p>
                </div>
              </div>
              <button 
                onClick={handleLogout}
                className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-500 hover:text-rose-400 hover:bg-rose-500/5 transition-all"
                title="Log Out"
              >
                <LogOut size={14} />
              </button>
            </div>
          </aside>

          <main className="flex-1 p-8 overflow-y-auto max-h-screen">
            <div className="max-w-7xl mx-auto space-y-6">
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
    <Link href={href} className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl transition-all duration-200 group ${active ? 'sidebar-link-active' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'}`}>
      <div className="flex items-center gap-3">
        <span className={`transition-colors duration-200 ${active ? 'text-sky-400' : 'text-slate-400 group-hover:text-slate-300'}`}>
          {icon}
        </span>
        <span className="text-[13px] tracking-wide">{label}</span>
      </div>
      {badge && <span className="bg-sky-500 text-[9px] text-white px-2 py-0.5 rounded-full">{badge}</span>}
    </Link>
  );
}
