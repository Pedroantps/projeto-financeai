"use client";

import { ArrowLeftRight } from "lucide-react";

interface SummaryCardsProps {
  resumo: {
    entradas: number;
    saidas: number;
    saldo: number;
  };
}

const brl = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

// Cartão de fluxo: entradas x saídas do período, com barras proporcionais
export function SummaryCards({ resumo }: SummaryCardsProps) {
  const maior = Math.max(resumo.entradas, resumo.saidas, 1);
  const pctGasto = resumo.entradas > 0 ? Math.round((resumo.saidas / resumo.entradas) * 100) : null;

  const linhas = [
    { label: "Ganhos", valor: resumo.entradas, cor: "bg-lime" },
    { label: "Gastos", valor: resumo.saidas, cor: "bg-primary" },
  ];

  return (
    <section className="bg-surface rounded-[28px] p-6 flex flex-col">
      <div className="flex items-center gap-3 mb-6">
        <span className="w-10 h-10 rounded-full border border-line flex items-center justify-center">
          <ArrowLeftRight className="w-4 h-4" />
        </span>
        <h2 className="text-lg font-medium">Entradas e saídas</h2>
      </div>

      <p className="text-4xl font-normal tracking-tight">{brl(resumo.entradas)}</p>
      <p className="text-sm text-mute mt-1">
        {pctGasto === null
          ? "Nenhuma entrada neste período"
          : <>Você gastou <span className={`font-semibold ${pctGasto > 100 ? "text-neg" : "text-pos"}`}>{pctGasto}%</span> do que ganhou</>}
      </p>

      <div className="space-y-5 mt-auto pt-8">
        {linhas.map((l) => (
          <div key={l.label}>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-mute">{l.label}</span>
              <span className="font-medium">{brl(l.valor)}</span>
            </div>
            <div className="h-2.5 rounded-full bg-surface-2 overflow-hidden">
              <div className={`h-full rounded-full ${l.cor}`} style={{ width: `${(l.valor / maior) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
