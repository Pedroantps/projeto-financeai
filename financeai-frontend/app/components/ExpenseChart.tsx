"use client";

import { PieChart as PieIcon } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { useTheme } from "./ThemeProvider";

interface ExpenseChartProps {
  resumo: {
    saidas: number;
    grafico: Array<{ name: string; value: number; color: string }>;
  };
}

const brl = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export function ExpenseChart({ resumo }: ExpenseChartProps) {
  const { theme } = useTheme();

  return (
    <section className="bg-surface rounded-[28px] p-6 flex flex-col">
      <div className="flex items-center gap-3 mb-4">
        <span className="w-10 h-10 rounded-full border border-line flex items-center justify-center">
          <PieIcon className="w-4 h-4" />
        </span>
        <h2 className="text-lg font-medium">Gastos por categoria</h2>
      </div>

      {resumo.grafico.length === 0 ? (
        <div className="flex-1 min-h-56 flex flex-col items-center justify-center text-center text-mute">
          <p className="font-medium text-ink">Sem gastos neste período</p>
          <p className="text-sm mt-1">Mude as datas ou sincronize os bancos.</p>
        </div>
      ) : (
        <>
          <div className="h-56 w-full relative">
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-medium tracking-tight">{brl(resumo.saidas)}</span>
              <span className="text-sm text-mute">total gasto</span>
            </div>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={resumo.grafico} cx="50%" cy="50%" innerRadius={78} outerRadius={98} paddingAngle={3} cornerRadius={8} dataKey="value" stroke="none">
                  {resumo.grafico.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Pie>
                <Tooltip
                  formatter={(value: any) => brl(Number(value))}
                  contentStyle={{
                    backgroundColor: theme === "dark" ? "#1a1d18" : "#ffffff",
                    borderRadius: 14,
                    border: `1px solid ${theme === "dark" ? "#2c3027" : "#e2e4de"}`,
                  }}
                  itemStyle={{ color: theme === "dark" ? "#eef1ea" : "#151813", fontWeight: 600 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <ul className="grid grid-cols-1 gap-y-2.5 mt-5">
            {resumo.grafico.map((item, i) => (
              <li key={i} className="flex items-center gap-2 min-w-0 text-sm">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                <span className="truncate">{item.name}</span>
                <span className="ml-auto text-mute shrink-0">{brl(item.value)}</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
