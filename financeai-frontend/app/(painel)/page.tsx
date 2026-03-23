"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Activity, ShieldCheck, Zap, BarChart3, Sun, Moon } from "lucide-react";
import { useTheme } from "../components/ThemeProvider";

export default function LandingPage() {
  const { theme, toggleTheme } = useTheme();
  const [isLogged, setIsLogged] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Verifica o login de forma segura apenas no client-side, após a montagem do componente
  useEffect(() => {
    setIsMounted(true);
    const id = localStorage.getItem("finai_userId");
    if (id) setIsLogged(true);
  }, []);

  return (
    <div className="min-h-screen font-sans overflow-hidden relative">
      
      {/* Efeitos luminosos aplicados ao fundo para aprimorar o visual da página */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-50 dark:opacity-100">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-400/20 dark:bg-blue-600/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-emerald-400/10 dark:bg-emerald-600/10 rounded-full blur-[120px]" />
      </div>

      <nav className="relative z-10 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/20">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold tracking-tight">FinAI</span>
        </div>
        
        <div className="flex items-center gap-6">
          <button onClick={toggleTheme} className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors">
            {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          {/* Renderiza os botões dinamicamente com base no status de autenticação do usuário */}
          <div className="h-10 flex items-center">
            {isMounted && (
              isLogged ? (
                <Link href="/dashboard" className="px-5 py-2.5 text-sm font-semibold bg-white dark:bg-white/10 hover:bg-slate-100 dark:hover:bg-white/20 text-blue-600 dark:text-white rounded-full shadow-md dark:shadow-none dark:backdrop-blur-md transition-all border border-slate-200 dark:border-white/5 flex items-center gap-2">
                  Meu Painel <ArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <div className="flex items-center gap-4">
                  <Link href="/login" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-white transition-colors">Entrar</Link>
                  <Link href="/login" className="px-5 py-2.5 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-all shadow-[0_4px_14px_rgba(37,99,235,0.39)]">Criar Conta Grátis</Link>
                </div>
              )
            )}
          </div>
        </div>
      </nav>

      <main className="relative z-10 flex flex-col items-center justify-center pt-32 pb-20 px-4 text-center max-w-5xl mx-auto">
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-tight animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
          Chega de planilhas.<br/>
          <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-emerald-500 dark:from-blue-400 dark:to-emerald-400">A IA faz o trabalho sujo.</span>
        </h1>
        <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mb-12 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
          O FinAI liga-se ao seu banco de forma segura, limpa as descrições confusas do seu extrato e categoriza os seus gastos automaticamente.
        </p>
        <div className="flex flex-col sm:flex-row items-center gap-4 h-16 animate-in fade-in slide-in-from-bottom-10 duration-700 delay-300">
          {isMounted && (
            isLogged ? (
              <Link href="/dashboard" className="px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 rounded-full font-bold text-lg transition-all flex items-center gap-2 shadow-xl">
                Acessar Dashboard <ArrowRight className="w-5 h-5" />
              </Link>
            ) : (
               <Link href="/login" className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-bold text-lg transition-all flex items-center gap-2 shadow-[0_4px_20px_rgba(37,99,235,0.4)] hover:-translate-y-1">
                Assuma o Controle Hoje <ArrowRight className="w-5 h-5" />
              </Link>
            )
          )}
        </div>
      </main>

      <section className="relative z-10 max-w-7xl mx-auto px-6 py-24 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 p-8 rounded-3xl shadow-sm dark:shadow-none dark:backdrop-blur-sm">
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-500/20 rounded-2xl flex items-center justify-center mb-6 border border-blue-200 dark:border-blue-500/30">
            <Zap className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-xl font-bold mb-3">Conexão Open Finance</h3>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed">Sincronização em tempo real com todos os bancos do Brasil.</p>
        </div>
        <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 p-8 rounded-3xl shadow-sm dark:shadow-none dark:backdrop-blur-sm">
          <div className="w-12 h-12 bg-purple-100 dark:bg-purple-500/20 rounded-2xl flex items-center justify-center mb-6 border border-purple-200 dark:border-purple-500/30">
            <BarChart3 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
          <h3 className="text-xl font-bold mb-3">Inteligência Llama 3</h3>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed">Categorização hiperprecisa sem a necessidade de intervenção humana.</p>
        </div>
        <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 p-8 rounded-3xl shadow-sm dark:shadow-none dark:backdrop-blur-sm">
          <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-500/20 rounded-2xl flex items-center justify-center mb-6 border border-emerald-200 dark:border-emerald-500/30">
            <ShieldCheck className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h3 className="text-xl font-bold mb-3">Segurança Total</h3>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed">Acesso 100% "somente leitura". Ninguém movimenta o seu dinheiro.</p>
        </div>
      </section>
    </div>
  );
}