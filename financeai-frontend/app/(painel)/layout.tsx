"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Lock, LogIn } from "lucide-react";
import { ThemeProvider } from "../components/ThemeProvider";
import { AppSidebar } from "../components/AppSidebar";
import { AppHeader } from "../components/AppHeader";

function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isLogged, setIsLogged] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const id = localStorage.getItem("finai_userId");
    if (id) {
      setIsLogged(true);
    } else {
      setIsLogged(false);
    }
    setIsChecking(false);
  }, [pathname]); 

  if (isChecking) return null;

  return (
    <div className="flex h-screen w-full bg-[#F8FAFC] dark:bg-[#020617] transition-colors duration-500 text-slate-900 dark:text-slate-100 font-sans overflow-hidden">
      
      <AppSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} isLogged={isLogged} />

      <main className="flex-1 flex flex-col relative overflow-hidden">
        <AppHeader isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} isLogged={isLogged} />

        <div className="flex-1 overflow-auto p-8 relative z-0">
          {!isLogged && pathname !== "/" ? (
            <div className="h-full flex flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-500">
              <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/20 rounded-3xl flex items-center justify-center mb-6 border border-blue-100 dark:border-blue-800/50 shadow-sm">
                <Lock className="w-10 h-10 text-blue-600 dark:text-blue-500" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mb-3">
                Acesso Restrito
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-center max-w-sm mb-8">
                Esta área é exclusiva para utilizadores registados. Faça login para acessar os seus dados financeiros.
              </p>
              <Link 
                href="/login" 
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium shadow-lg shadow-blue-600/20 transition-all hover:-translate-y-0.5"
              >
                <LogIn className="w-5 h-5" />
                Fazer Login Agora
              </Link>
            </div>
          ) : (
            children
          )}
        </div>
      </main>
    </div>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <LayoutContent>{children}</LayoutContent>
    </ThemeProvider>
  );
}