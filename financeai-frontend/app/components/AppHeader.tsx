"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, User, Settings, LogOut, LogIn } from "lucide-react";

interface AppHeaderProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
  isLogged: boolean;
}

export function AppHeader({ isCollapsed, setIsCollapsed, isLogged }: AppHeaderProps) {
  const pathname = usePathname();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  return (
    <header className="h-16 flex items-center justify-between px-8 border-b border-slate-200/50 dark:border-slate-800/50 bg-white/40 dark:bg-[#020617]/40 backdrop-blur-md z-10 shrink-0">
      <div className="flex items-center gap-4">
        <button onClick={() => setIsCollapsed(!isCollapsed)} className="md:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
          <Menu className="w-5 h-5" />
        </button>
        <div className="text-sm font-medium text-slate-500 dark:text-slate-400">
          {pathname === "/dashboard" && "Visão Geral Inteligente"}
          {pathname === "/transacoes" && "Tabela de Transações"}
          {pathname === "/bancos" && "Gerenciador de Conexões"}
        </div>
      </div>

      <div className="flex items-center gap-4 relative z-50">
        {isLogged && (
          <p className="text-sm text-slate-500 dark:text-slate-400 hidden sm:block">
            Olá, <span className="font-semibold text-slate-900 dark:text-white">{typeof window !== "undefined" ? localStorage.getItem("finai_userName") : ""}</span>
          </p>
        )}
        <button onClick={() => setIsUserMenuOpen(!isUserMenuOpen)} className={`w-10 h-10 rounded-full p-0.5 hover:scale-105 transition-transform focus:outline-none shadow-md ${isLogged ? 'bg-linear-to-tr from-blue-600 to-emerald-400' : 'bg-slate-200 dark:bg-slate-800'} cursor-pointer`}>
          <div className="w-full h-full rounded-full bg-white dark:bg-slate-900 flex items-center justify-center font-bold text-sm text-slate-700 dark:text-white">
            {isLogged ? (typeof window !== "undefined" ? localStorage.getItem("finai_userName")?.charAt(0).toUpperCase() : "U") : <User className="w-5 h-5 text-slate-400" />}
          </div>
        </button>
        
        {isUserMenuOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsUserMenuOpen(false)} />
            <div className="absolute right-0 top-12 mt-2 w-64 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl shadow-slate-200/50 dark:shadow-black/50 overflow-hidden z-50 animate-in fade-in slide-in-from-top-4 duration-300">
              {isLogged ? (
                <>
                  <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-800/20">
                    <p className="text-sm font-bold text-slate-900 dark:text-white">Minha Conta</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">{typeof window !== "undefined" ? localStorage.getItem("finai_userName") : ""}</p>
                  </div>
                  <div className="p-2 space-y-1">
                    <button className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer">
                      <User className="w-4 h-4" /> Editar Perfil
                    </button>
                    <button className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer">
                      <Settings className="w-4 h-4" /> Configurações
                    </button>
                  </div>
                  <div className="p-2 border-t border-slate-100 dark:border-slate-800/60">
                    <button onClick={() => { localStorage.removeItem("finai_userId"); window.location.href = "/"; }} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-rose-600 dark:text-rose-500 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors cursor-pointer">
                      <LogOut className="w-4 h-4" /> Sair da Conta
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-800/20">
                    <p className="text-sm font-bold text-slate-900 dark:text-white">Visitante</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">Faça login para continuar</p>
                  </div>
                  <div className="p-2">
                    <button onClick={() => window.location.href = "/login"} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-blue-600 dark:text-blue-400 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors cursor-pointer">
                      <LogIn className="w-4 h-4" /> Fazer Login
                    </button>
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </header>
  );
}