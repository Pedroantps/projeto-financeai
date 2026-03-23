"use client";

import { ArrowUpRight, ArrowDownRight, Wallet } from "lucide-react";

interface SummaryCardsProps {
  resumo: {
    entradas: number;
    saidas: number;
    saldo: number;
  };
}

export function SummaryCards({ resumo }: SummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-white/80 dark:bg-[#0F172A]/80 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/50 p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.02)] transition-transform hover:-translate-y-1">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800/80 flex items-center justify-center">
            <Wallet className="w-6 h-6 text-slate-700 dark:text-slate-300" />
          </div>
        </div>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Saldo do Período</p>
        <h2 className={`text-3xl font-extrabold tracking-tight ${resumo.saldo >= 0 ? 'text-slate-900 dark:text-white' : 'text-rose-600'}`}>{resumo.saldo.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</h2>
      </div>
      
      <div className="bg-white/80 dark:bg-[#0F172A]/80 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/50 p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.02)] transition-transform hover:-translate-y-1">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center"><ArrowUpRight className="w-6 h-6 text-emerald-600 dark:text-emerald-500" /></div>
        </div>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Ganhos do Período</p>
        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">{resumo.entradas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</h2>
      </div>

      <div className="bg-white/80 dark:bg-[#0F172A]/80 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/50 p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.02)] transition-transform hover:-translate-y-1">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center"><ArrowDownRight className="w-6 h-6 text-rose-600 dark:text-rose-500" /></div>
        </div>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Gastos do Período</p>
        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">{resumo.saidas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</h2>
      </div>
    </div>
  );
}