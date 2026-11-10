"use client";

import { Sparkles, ArrowUpRight, AlertCircle, Lightbulb } from "lucide-react";

interface AiInsightsProps {
  insight: any;
  loadingInsight: boolean;
  filtroIA: string;
  setFiltroIA: (value: string) => void;
  opcoesMeses: Array<{ value: string; label: string }>;
  className?: string;
}

export function AiInsights({ insight, loadingInsight, filtroIA, setFiltroIA, opcoesMeses, className = "" }: AiInsightsProps) {
  return (
    <section className={`bg-lime text-on-lime rounded-[28px] p-6 sm:p-7 flex flex-col gap-5 ${className}`}>
      <div className="flex items-center justify-between gap-3">
        <span className="inline-flex shrink-0 whitespace-nowrap items-center gap-2 bg-on-lime text-lime rounded-full pl-3 pr-4 h-9 text-sm font-semibold">
          <Sparkles className="w-4 h-4" /> Consultor IA
        </span>
        <label className="sr-only" htmlFor="filtro-ia">Mês analisado</label>
        <select
          id="filtro-ia"
          value={filtroIA}
          onChange={(e) => setFiltroIA(e.target.value)}
          className="h-9 rounded-full bg-white/45 hover:bg-white/60 px-3 text-sm font-medium text-on-lime outline-none transition-colors"
        >
          {opcoesMeses.map((m) => (
            <option key={`ia-${m.value}`} value={m.value} className="text-black">{m.label}</option>
          ))}
        </select>
      </div>

      {loadingInsight ? (
        <div className="space-y-3 animate-pulse" aria-label="A gerar análise">
          <div className="h-4 bg-white/45 rounded-full w-full" />
          <div className="h-4 bg-white/45 rounded-full w-5/6" />
          <div className="grid grid-cols-2 gap-3 pt-3">
            <div className="h-20 bg-white/45 rounded-2xl" />
            <div className="h-20 bg-white/45 rounded-2xl" />
          </div>
        </div>
      ) : insight ? (
        <>
          <p className="text-lg sm:text-xl font-medium leading-snug text-pretty">{insight.resumo}</p>

          {(insight.destaquePositivo || insight.alerta) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {insight.destaquePositivo && (
                <div className="bg-white/45 rounded-2xl p-4">
                  <p className="text-sm font-semibold flex items-center gap-1.5 mb-1">
                    <ArrowUpRight className="w-4 h-4" /> Ponto forte
                  </p>
                  <p className="text-sm leading-snug text-on-lime/80">{insight.destaquePositivo}</p>
                </div>
              )}
              {insight.alerta && (
                <div className="bg-white/45 rounded-2xl p-4">
                  <p className="text-sm font-semibold flex items-center gap-1.5 mb-1">
                    <AlertCircle className="w-4 h-4" /> Atenção
                  </p>
                  <p className="text-sm leading-snug text-on-lime/80">{insight.alerta}</p>
                </div>
              )}
            </div>
          )}

          {insight.dicaPratica && (
            <p className="flex gap-2 text-sm leading-snug text-on-lime/80 mt-auto">
              <Lightbulb className="w-4 h-4 shrink-0 mt-0.5 text-on-lime" />
              {insight.dicaPratica}
            </p>
          )}
        </>
      ) : (
        <p className="text-on-lime/80">Não foi possível gerar a análise agora. Tente sincronizar os bancos.</p>
      )}
    </section>
  );
}
