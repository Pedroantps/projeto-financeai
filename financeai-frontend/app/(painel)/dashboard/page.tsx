"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Loader2 } from "lucide-react";
import { useTheme } from "next-themes"; 

const CORES = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#6366f1'];

export default function DashboardPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [nome, setNome] = useState("");
  const { theme } = useTheme();

  const [isLoading, setIsLoading] = useState(false);
  const [isFirstLoad, setIsFirstLoad] = useState(true); 
  
  const [dataInicio, setDataInicio] = useState(() => {
    const hoje = new Date();
    return new Date(hoje.getFullYear(), hoje.getMonth(), 1).toISOString().split('T')[0];
  });
  
  const [dataFim, setDataFim] = useState(() => {
    const hoje = new Date();
    return new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0).toISOString().split('T')[0];
  });

  const [resumo, setResumo] = useState({ entradas: 0, saidas: 0, saldo: 0, grafico: [] });

  const carregarDashboard = async (userId: string, inicio: string, fim: string) => {
    setIsLoading(true);
    try {
      const inicioISO = new Date(`${inicio}T00:00:00`).toISOString();
      const fimISO = new Date(`${fim}T23:59:59`).toISOString();

      const url = `http://localhost:3000/api/dashboard/${userId}?dataInicio=${inicioISO}&dataFim=${fimISO}`;

      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setResumo(data);
      }
    } catch (error) {
      console.error("Erro ao carregar os dados:", error);
    } finally {
        setIsLoading(false);
        setIsFirstLoad(false);
    }
  };

  useEffect(() => {
    setIsMounted(true);
    const userId = localStorage.getItem("finai_userId");
    const userName = localStorage.getItem("finai_userName");

    if (userId) {
      setIsLoggedIn(true);
      setNome(userName || "Usuário");
      
      if (dataInicio && dataFim) {
        carregarDashboard(userId, dataInicio, dataFim);
      }
    }
  }, [dataInicio, dataFim]);

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
  };

  if (!isMounted) return null;

  if (!isLoggedIn) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <div className="bg-white dark:bg-gray-900 p-10 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 max-w-md w-full text-center">
          <div className="text-6xl mb-6">🔒</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Acesso Restrito</h2>
          <Link href="/login" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full transition-colors inline-block w-full">Fazer Login Agora</Link>
        </div>
      </div>
    );
  }

  const gastouMaisQueGanhou = resumo.saidas > resumo.entradas;

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Resumo Financeiro 🚀</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Aqui está a análise da IA sobre o seu dinheiro.</p>
        </div>
        
        <div className="flex flex-col items-start bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl border border-gray-200 dark:border-gray-700/50">
          <label className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">Período de Análise</label>
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 w-full">
            <input 
              type="date" 
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
              className="bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 py-2 px-3 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto"
            />
            <span className="text-gray-400 font-medium">até</span>
            <input 
              type="date" 
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
              max={new Date().toISOString().split('T')[0]} 
              className="bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 py-2 px-3 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto"
            />
          </div>
        </div>
      </div>

      {isFirstLoad ? (
        <div className="bg-white dark:bg-gray-900 p-12 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 text-center flex flex-col items-center justify-center max-h-60">
          <Loader2 className="animate-spin w-12 h-12 text-blue-600 mb-4" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Calculando resumo financeiro...</h3>
          <p className="text-gray-500 dark:text-gray-400 max-w-sm">
            Aguarde enquanto a nossa Inteligência Artificial analisa as suas entradas e saídas.
          </p>
        </div>
      ) : (
      <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 transition-opacity ${isLoading ? 'opacity-50' : 'opacity-100'}`}>
        
        <div className="p-6 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-100 dark:border-green-900/50">
          <p className="text-sm text-green-600 dark:text-green-400 font-medium mb-1">Recebimentos</p>
          <p className="text-3xl font-bold text-green-700 dark:text-green-500">{formatarMoeda(resumo.entradas)}</p>
        </div>
        
        <div className="p-6 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-100 dark:border-red-900/50">
          <p className="text-sm text-red-600 dark:text-red-400 font-medium mb-1">Pagamentos</p>
          <p className="text-3xl font-bold text-red-700 dark:text-red-500">{formatarMoeda(resumo.saidas)}</p>
        </div>
        
        <div className={`p-6 rounded-xl border ${resumo.saldo >= 0 ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-900/50' : 'bg-orange-50 dark:bg-orange-900/20 border-orange-100 dark:border-orange-900/50'}`}>
          <p className={`text-sm font-medium mb-1 ${resumo.saldo >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-orange-600 dark:text-orange-400'}`}>Balanço do Período</p>
          <p className={`text-3xl font-bold ${resumo.saldo >= 0 ? 'text-blue-700 dark:text-blue-500' : 'text-orange-700 dark:text-orange-500'}`}>{formatarMoeda(resumo.saldo)}</p>
        </div>
      </div>
      )}

      {(resumo.entradas > 0 || resumo.saidas > 0) && (
        <div className={`p-4 rounded-xl border font-medium text-center ${gastouMaisQueGanhou ? 'bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-900/50 text-red-600 dark:text-red-400' : 'bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-900/50 text-green-600 dark:text-green-400'}`}>
          {gastouMaisQueGanhou 
            ? "⚠️ Atenção: As suas despesas ultrapassaram os seus recebimentos neste período selecionado." 
            : "✅ Parabéns! Gastou menos do que recebeu neste período."}
        </div>
      )}

      {/* ÁREA DO GRÁFICO */}
      <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Despesas por Categoria</h2>
        {resumo.grafico.length > 0 ? (
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={resumo.grafico} cx="50%" cy="50%" innerRadius={80} outerRadius={120} paddingAngle={5} dataKey="value" stroke={theme === "dark" ? "#111827" : "#fff"}>
                  {resumo.grafico.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CORES[index % CORES.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: any) => formatarMoeda(Number(value))} 
                  contentStyle={{ 
                    borderRadius: '10px', 
                    border: '1px solid',
                    borderColor: theme === "dark" ? '#374151' : '#f3f4f6',
                    backgroundColor: theme === "dark" ? '#1f2937' : '#ffffff',
                    color: theme === "dark" ? '#f9fafb' : '#111827',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' 
                  }} 
                />
                <Legend wrapperStyle={{ color: theme === "dark" ? '#d1d5db' : '#374151' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-64 flex items-center justify-center text-gray-400 dark:text-gray-500 border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-xl">
            Nenhum dado de despesa para este período.
          </div>
        )}
      </div>
    </div>
  );
}