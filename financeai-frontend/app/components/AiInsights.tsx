"use client";

import { Activity, ArrowUpRight, AlertCircle } from "lucide-react";

interface AiInsightsProps {
  insight: any;
  loadingInsight: boolean;
  filtroIA: string;
  setFiltroIA: (value: string) => void;
  opcoesMeses: Array<{ value: string; label: string }>;
}

export function AiInsights({ insight, loadingInsight, filtroIA, setFiltroIA, opcoesMeses }: AiInsightsProps) {
  return (
    <div className="bg-linear-to-br from-blue-600 to-blue-800 dark:from-blue-900 dark:to-slate-900 rounded-3xl p-6 shadow-xl relative overflow-hidden flex flex-col justify-between">
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
      <div>
        <div className="flex items-center justify-between mb-4 relative z-10">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-white/20 rounded-lg backdrop-blur-sm"><Activity className="w-5 h-5 text-white" /></div>
            <h3 className="text-lg font-bold tracking-tight text-white">Consultor IA</h3>
          </div>
          
          <select 
            value={filtroIA} 
            onChange={(e) => setFiltroIA(e.target.value)} 
            className="bg-white/10 hover:bg-white/20 transition-colors text-white text-xs font-medium border border-white/20 rounded-lg px-2 py-1 outline-none cursor-pointer backdrop-blur-sm"
          >
            {opcoesMeses.map(m => <option key={`ia-${m.value}`} value={m.value} className="text-slate-900">{m.label}</option>)}
          </select>
        </div>
        
        {loadingInsight ? (
          <div className="space-y-3 animate-pulse mt-6">
            <div className="h-4 bg-white/20 rounded w-full"></div>
            <div className="h-4 bg-white/20 rounded w-5/6"></div>
            <div className="h-4 bg-white/20 rounded w-4/6 mt-4"></div>
          </div>
        ) : insight ? (
          <div className="relative z-10">
            <p className="text-blue-50 text-sm leading-relaxed mb-5">{insight.resumo}</p>
            <div className="space-y-3">
              {insight.destaquePositivo && (
                <div className="bg-emerald-500/20 backdrop-blur-md rounded-xl p-3 border border-emerald-500/30"><p className="text-xs font-bold text-emerald-300 mb-1 flex items-center gap-1"><ArrowUpRight className="w-3 h-3" /> Ponto Forte</p><p className="text-xs text-blue-50 leading-tight">{insight.destaquePositivo}</p></div>
              )}
              {insight.alerta && (
                <div className="bg-rose-500/20 backdrop-blur-md rounded-xl p-3 border border-rose-500/30"><p className="text-xs font-bold text-rose-300 mb-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Atenção</p><p className="text-xs text-blue-50 leading-tight">{insight.alerta}</p></div>
              )}
              {insight.dicaPratica && (
                <div className="bg-black/20 backdrop-blur-md rounded-xl p-3 border border-white/10 mt-2"><p className="text-xs font-bold text-blue-300 mb-1 flex items-center gap-1">Dica Prática</p><p className="text-xs text-blue-50 leading-tight">{insight.dicaPratica}</p></div>
              )}
            </div>
          </div>
        ) : (
          <p className="text-blue-200 text-sm mt-4">Não foi possível gerar insights no momento.</p>
        )}
      </div>
    </div>
  );
}