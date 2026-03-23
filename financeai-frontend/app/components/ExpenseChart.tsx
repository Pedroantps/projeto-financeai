"use client";

import { AlertCircle } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { useTheme } from "./ThemeProvider";

interface ExpenseChartProps {
  resumo: {
    saidas: number;
    grafico: Array<{ name: string; value: number; color: string }>;
  };
}

export function ExpenseChart({ resumo }: ExpenseChartProps) {
  const { theme } = useTheme();

  return (
    <div className="lg:col-span-2 bg-white/80 dark:bg-[#0F172A]/80 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/50 p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
      <h3 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white mb-6">Gastos por Categoria</h3>
      {resumo.grafico.length === 0 ? (
         <div className="h-75 flex flex-col items-center justify-center text-slate-400">
           <AlertCircle className="w-10 h-10 mb-2 opacity-50" />
           <p>Sem gastos neste período.</p>
         </div>
      ) : (
        <div className="h-75 w-full relative">
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
            <span className="text-sm font-medium text-slate-500">Total</span>
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              R$ {resumo.saidas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={resumo.grafico} cx="50%" cy="50%" innerRadius={100} outerRadius={130} paddingAngle={5} dataKey="value" stroke="none">
                {resumo.grafico.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
              </Pie>
              <Tooltip formatter={(value: any) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} contentStyle={{ backgroundColor: theme === 'dark' ? '#0F172A' : '#ffffff', borderRadius: '16px', border: theme === 'dark' ? '1px solid #1e293b' : '1px solid #e2e8f0' }} itemStyle={{ color: theme === 'dark' ? '#f8fafc' : '#0f172a', fontWeight: 600 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
      <div className="flex flex-wrap items-center justify-center gap-4 mt-4">
        {resumo.grafico.map((item, i) => (
          <div key={i} className="flex items-center gap-2"><span className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: item.color }} /><span className="text-sm font-medium text-slate-600 dark:text-slate-300">{item.name}</span></div>
        ))}
      </div>
    </div>
  );
}