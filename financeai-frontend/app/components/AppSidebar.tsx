"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, LayoutDashboard, ArrowLeftRight, Building2, LogOut, LogIn, Sun, Moon, ChevronLeft, Home } from "lucide-react";
import { useTheme } from "./ThemeProvider";

interface AppSidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
  isLogged: boolean;
}

export function AppSidebar({ isCollapsed, setIsCollapsed, isLogged }: AppSidebarProps) {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();

  const navItems = [
    { name: "Início", path: "/", icon: Home },
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Transações", path: "/transacoes", icon: ArrowLeftRight },
    { name: "Meus Bancos", path: "/bancos", icon: Building2 },
  ];

  return (
    <aside className={`${isCollapsed ? 'w-20' : 'w-64'} transition-all duration-500 ease-in-out h-full border-r border-slate-200/50 dark:border-slate-800/50 bg-white/70 dark:bg-[#0F172A]/70 backdrop-blur-xl flex flex-col justify-between py-6 z-20 shrink-0 shadow-[4px_0_24px_rgba(0,0,0,0.02)] dark:shadow-[4px_0_24px_rgba(0,0,0,0.2)] relative`}>
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-8 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full p-1 shadow-md z-30 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors hidden md:block"
      >
        <ChevronLeft className={`w-4 h-4 text-slate-500 transition-transform duration-500 ${isCollapsed ? 'rotate-180' : ''}`} />
      </button>

      <div className="px-4">
        <Link href="/dashboard" className={`flex items-center gap-3 px-2 mb-10 ${isCollapsed ? 'justify-center' : ''}`}>
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/20 shrink-0">
            <Activity className="w-5 h-5 text-white" />
          </div>
          {!isCollapsed && <span className="text-xl font-bold tracking-tight bg-linear-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent animate-in fade-in duration-300">FinAI</span>}
        </Link>

        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            const Icon = item.icon;
            return (
              <Link key={item.name} href={item.path} title={isCollapsed ? item.name : undefined} className={`flex items-center gap-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${isCollapsed ? 'justify-center px-0' : 'px-3'} ${isActive ? "bg-blue-600/10 dark:bg-blue-600/20 text-blue-700 dark:text-blue-400" : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100"}`}>
                <Icon className={`w-5 h-5 shrink-0 ${isActive ? "text-blue-600 dark:text-blue-500" : "text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors"}`} />
                {!isCollapsed && <span className="animate-in fade-in duration-300">{item.name}</span>}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="space-y-2 px-4">
        <button onClick={toggleTheme} title={isCollapsed ? "Alternar Tema" : undefined} className={`w-full flex items-center gap-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${isCollapsed ? 'justify-center px-0' : 'px-3'} cursor-pointer`}>
          {theme === "dark" ? <Sun className="w-5 h-5 shrink-0" /> : <Moon className="w-5 h-5 shrink-0" />}
          {!isCollapsed && <span className="animate-in fade-in duration-300">{theme === "dark" ? "Modo Claro" : "Modo Escuro"}</span>}
        </button>
        {isLogged ? (
          <button onClick={() => { localStorage.removeItem("finai_userId"); window.location.href = "/"; }} title={isCollapsed ? "Sair" : undefined} className={`w-full flex items-center gap-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-400 transition-colors ${isCollapsed ? 'justify-center px-0' : 'px-3'} cursor-pointer`}>
            <LogOut className="w-5 h-5 shrink-0" />
            {!isCollapsed && <span className="animate-in fade-in duration-300">Sair</span>}
          </button>
        ) : (
          <button onClick={() => { window.location.href = "/login"; }} title={isCollapsed ? "Entrar" : undefined} className={`w-full flex items-center gap-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 hover:text-blue-600 dark:hover:text-blue-400 transition-colors ${isCollapsed ? 'justify-center px-0' : 'px-3'} cursor-pointer`}>
            <LogIn className="w-5 h-5 shrink-0" />
            {!isCollapsed && <span className="animate-in fade-in duration-300">Entrar</span>}
          </button>
        )}
      </div>
    </aside>
  );
}