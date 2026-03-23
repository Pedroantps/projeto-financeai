"use client";

import { useState, useEffect } from "react";
import { RefreshCw, Filter, Calendar } from "lucide-react";
import { SummaryCards } from "../../components/SummaryCards";
import { ExpenseChart } from "../../components/ExpenseChart";
import { AiInsights } from "../../components/AiInsights";

const CORES_GRAFICO = ["#f43f5e", "#0ea5e9", "#10b981", "#8b5cf6", "#f59e0b", "#06b6d4", "#ec4899", "#64748b"];

// Gera as opções referentes aos últimos 6 meses para utilização no filtro de insights da IA
const gerarUltimosMeses = () => {
  const meses = [];
  const hoje = new Date();
  for (let i = 0; i < 6; i++) {
    const d = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
    const mesStr = String(d.getMonth() + 1).padStart(2, '0');
    const anoStr = d.getFullYear();
    const label = d.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    meses.push({ value: `${anoStr}-${mesStr}`, label: label.charAt(0).toUpperCase() + label.slice(1) });
  }
  return meses;
};

// Converte uma string no formato mês/ano (ex: "2026-03") em datas exatas de início e fim do período
const obterDatasDoMes = (mesAnoStr: string) => {
  const [ano, mes] = mesAnoStr.split('-');
  const inicio = new Date(Number(ano), Number(mes) - 1, 1).toISOString();
  const fim = new Date(Number(ano), Number(mes), 0, 23, 59, 59).toISOString();
  return { dataInicio: inicio, dataFim: fim };
};

export default function DashboardPage() {
  const [userId, setUserId] = useState<string | null>(null);
  
  // Define o primeiro e o último dia do mês atual como o padrão inicial para os filtros do dashboard principal
  const hoje = new Date();
  const primeiroDia = new Date(hoje.getFullYear(), hoje.getMonth(), 1).toISOString().split('T')[0];
  const ultimoDia = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0).toISOString().split('T')[0];

  // Estados responsáveis pelo controle do intervalo de datas do dashboard principal
  const [dataInicio, setDataInicio] = useState(primeiroDia);
  const [dataFim, setDataFim] = useState(ultimoDia);

  // Estado independente para o filtro de mês da IA, evitando conflitos com o intervalo de datas global
  const opcoesMeses = gerarUltimosMeses();
  const [filtroIA, setFiltroIA] = useState(opcoesMeses[0].value);

  // Estados para o gerenciamento de carregamento e o armazenamento das respostas da API
  const [loadingSync, setLoadingSync] = useState(false);
  const [loadingDados, setLoadingDados] = useState(true);
  const [loadingInsight, setLoadingInsight] = useState(true);
  
  const [resumo, setResumo] = useState({ entradas: 0, saidas: 0, saldo: 0, grafico: [] });
  const [insight, setInsight] = useState<any>(null);

  // Recupera o ID do usuário local e dispara as chamadas iniciais de dados assim que o componente é montado
  useEffect(() => {
    const id = localStorage.getItem("finai_userId");
    setUserId(id);
    if (id) {
      carregarDashboard(id, dataInicio, dataFim);
      carregarInsight(id, filtroIA);
    }
  }, []);

  // Observa os filtros de data globais e recarrega os indicadores do dashboard em caso de alteração
  useEffect(() => {
    if (userId) carregarDashboard(userId, dataInicio, dataFim);
  }, [dataInicio, dataFim]);

  // Atualiza os insights do assistente virtual (via cache ou nova chamada) quando o mês selecionado muda
  useEffect(() => {
    if (userId) carregarInsight(userId, filtroIA);
  }, [filtroIA]);

  // Consulta o resumo financeiro com base nas datas informadas e preenche as informações do gráfico de gastos
  const carregarDashboard = async (id: string, inicio: string, fim: string) => {
    setLoadingDados(true);
    try {
      // Inclui o horário limite nas strings de data para assegurar a cobertura integral dos dias no fuso local
      const startIso = new Date(`${inicio}T00:00:00`).toISOString();
      const endIso = new Date(`${fim}T23:59:59`).toISOString();
      
      const res = await fetch(`http://localhost:3333/api/dashboard/${id}?dataInicio=${startIso}&dataFim=${endIso}`);
      if (res.ok) {
        const data = await res.json();
        const graficoComCores = data.grafico.map((item: any, index: number) => ({
          ...item, color: CORES_GRAFICO[index % CORES_GRAFICO.length]
        }));
        setResumo({ ...data, grafico: graficoComCores });
      }
    } catch (error) {
      console.error(error);
    }
    setLoadingDados(false);
  };

  // Obtém os insights de IA, utilizando armazenamento em cache no localStorage para otimizar requisições
  const carregarInsight = async (id: string, mesParam: string) => {
    const cacheKey = `finai_insight_${id}_${mesParam}`;
    const insightSalvo = localStorage.getItem(cacheKey);

    if (insightSalvo) {
      setInsight(JSON.parse(insightSalvo));
      setLoadingInsight(false);
      return;
    }

    setLoadingInsight(true);
    try {
      const { dataInicio, dataFim } = obterDatasDoMes(mesParam);
      const res = await fetch(`http://localhost:3333/api/insights/${id}?dataInicio=${dataInicio}&dataFim=${dataFim}`);
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem(cacheKey, JSON.stringify(data)); 
        setInsight(data);
      }
    } catch (error) {
      console.error(error);
    }
    setLoadingInsight(false);
  };

  // Executa o fluxo de sincronização bancária, disparando o webhook de atualização e revalidando os caches
  const handleSincronizar = async () => {
    if (!userId) return;
    setLoadingSync(true);
    try {
      const resBancos = await fetch(`http://localhost:3333/api/bancos/usuario/${userId}`);
      const bancos = await resBancos.json();

      if (bancos.length === 0) {
        alert("Não tem bancos conectados.");
        setLoadingSync(false);
        return;
      }

      const { dataInicio: inicioIA, dataFim: fimIA } = obterDatasDoMes(filtroIA);
      const resAntes = await fetch(`http://localhost:3333/api/dashboard/${userId}?dataInicio=${inicioIA}&dataFim=${fimIA}`);
      const dadosAntes = await resAntes.json();
      const volumeAntes = dadosAntes.entradas + dadosAntes.saidas; // Utiliza a soma total das operações como um hash de verificação

      for (const banco of bancos) {
        await fetch("http://localhost:3333/api/transacoes/sincronizar", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ conexaoId: banco.id })
        });
      }

      const resDepois = await fetch(`http://localhost:3333/api/dashboard/${userId}?dataInicio=${inicioIA}&dataFim=${fimIA}`);
      const dadosDepois = await resDepois.json();
      const volumeDepois = dadosDepois.entradas + dadosDepois.saidas;

      if (volumeAntes !== volumeDepois) {
        console.log("💰 Novas movimentações detectadas! Apagando cache e chamando o Consultor IA...");
        localStorage.removeItem(`finai_insight_${userId}_${filtroIA}`);
      } else {
        console.log("🛡️ Nenhuma transação nova neste mês. Cache mantido, tokens poupados!");
      }
      
      await carregarDashboard(userId, dataInicio, dataFim);
      await carregarInsight(userId, filtroIA); 
      
    } catch (error) {
      alert("Houve um problema ao sincronizar.");
    }
    setLoadingSync(false);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out fill-mode-both">
      
      {/* Renderiza a seção superior contendo o título da página e o botão de sincronização manual */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white mb-1">Visão Geral</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Análise refinada com Inteligência Artificial.</p>
        </div>
        <button onClick={handleSincronizar} disabled={loadingSync} className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl text-sm font-medium shadow-lg shadow-blue-600/20 transition-all group disabled:opacity-70 w-full md:w-auto cursor-pointer">
          <RefreshCw className={`w-4 h-4 ${loadingSync ? "animate-spin" : "group-hover:rotate-180 transition-transform duration-500"}`} />
          {loadingSync ? "A Atualizar..." : "Sincronizar Bancos"}
        </button>
      </div>

      {/* Componente contendo os campos de inputs de data para a filtragem geral do período de análise */}
      <div className="bg-white/80 dark:bg-[#0F172A]/80 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/50 p-4 rounded-2xl shadow-sm flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-medium text-sm mr-2">
          <Filter className="w-4 h-4" /> Período de Análise:
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 transition-colors focus-within:border-blue-500/50 focus-within:ring-1 focus-within:ring-blue-500/50">
            <Calendar className="w-4 h-4 text-slate-400" />
            <input 
              type="date" 
              value={dataInicio} 
              onChange={(e) => setDataInicio(e.target.value)} 
              className="bg-transparent text-sm font-semibold text-slate-700 dark:text-slate-200 outline-none cursor-pointer scheme-light dark:scheme-dark"
            />
            <span className="text-slate-400 font-medium px-1">-</span>
            <input 
              type="date" 
              value={dataFim} 
              onChange={(e) => setDataFim(e.target.value)} 
              className="bg-transparent text-sm font-semibold text-slate-700 dark:text-slate-200 outline-none cursor-pointer scheme-light dark:scheme-dark"
            />
          </div>
        </div>
      </div>

      {loadingDados ? (
        <div className="flex h-64 items-center justify-center"><RefreshCw className="w-8 h-8 text-blue-500 animate-spin" /></div>
      ) : (
        <>
          <SummaryCards resumo={resumo} />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <ExpenseChart resumo={resumo} />
            <AiInsights insight={insight} loadingInsight={loadingInsight} filtroIA={filtroIA} setFiltroIA={setFiltroIA} opcoesMeses={opcoesMeses} />
          </div>
        </>
      )}
    </div>
  );
}