"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { RefreshCw, Calendar, ArrowUpRight, Plus } from "lucide-react";
import { SummaryCards } from "../../components/SummaryCards";
import { ExpenseChart } from "../../components/ExpenseChart";
import { AiInsights } from "../../components/AiInsights";
import { RecentTransactions } from "../../components/RecentTransactions";

// Paleta das categorias: tons terrosos e verdes que conversam com o lima da marca
const CORES_GRAFICO = ["#2f5d1e", "#9fd45b", "#e0a43a", "#4e8fb0", "#d9674e", "#7f9a6b", "#c9b98c", "#5b6470"];

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
  const [recentes, setRecentes] = useState<any[]>([]);

  // Recupera o ID do usuário local e dispara as chamadas iniciais de dados assim que o componente é montado
  useEffect(() => {
    const id = localStorage.getItem("finai_userId");
    setUserId(id);
    if (id) {
      carregarDashboard(id, dataInicio, dataFim);
      carregarInsight(id, filtroIA);
      carregarRecentes(id);
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

  // Busca as 4 transações mais recentes para o cartão de últimas transações
  const carregarRecentes = async (id: string) => {
    try {
      const res = await fetch(`http://localhost:3333/api/transacoes/${id}`);
      if (res.ok) {
        const data = await res.json();
        const ordenadas = [...data].sort((a: any, b: any) => new Date(b.dataOcorrencia).getTime() - new Date(a.dataOcorrencia).getTime());
        setRecentes(ordenadas.slice(0, 4));
      }
    } catch (error) {
      console.error(error);
    }
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

      const resAntesGlobal = await fetch(`http://localhost:3333/api/dashboard/${userId}`);
      const dadosAntesGlobal = await resAntesGlobal.json();
      const volumeAntesGlobal = dadosAntesGlobal.entradas + dadosAntesGlobal.saidas;

      for (const banco of bancos) {
        await fetch("http://localhost:3333/api/transacoes/sincronizar", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ conexaoId: banco.id })
        });
      }

      const resDepoisGlobal = await fetch(`http://localhost:3333/api/dashboard/${userId}`);
      const dadosDepoisGlobal = await resDepoisGlobal.json();
      const volumeDepoisGlobal = dadosDepoisGlobal.entradas + dadosDepoisGlobal.saidas;

      if (volumeAntesGlobal !== volumeDepoisGlobal) {
        console.log("💰 Novas movimentações detectadas! Apagando todos os caches da IA...");
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith(`finai_insight_${userId}_`)) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach(k => localStorage.removeItem(k));
      } else {
        console.log("🛡️ Nenhuma transação nova. Caches mantidos, tokens poupados!");
      }
      
      await carregarDashboard(userId, dataInicio, dataFim);
      await carregarInsight(userId, filtroIA); 
      await carregarRecentes(userId);
      
    } catch (error) {
      alert("Houve um problema ao sincronizar.");
    }
    setLoadingSync(false);
  };

  const brl = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 sm:gap-5">

      {/* Cartão principal: saldo do período, filtro de datas e ações */}
      <section className="md:col-span-2 lg:col-span-7 bg-surface rounded-[28px] p-6 sm:p-7 flex flex-col gap-8 relative">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex w-full sm:w-auto items-center gap-1 bg-surface-2 rounded-full p-1 pl-3 text-sm [&>input]:min-w-0 [&>input]:flex-1">
            <Calendar className="w-4 h-4 text-mute shrink-0 hidden sm:block" aria-hidden />
            <label className="sr-only" htmlFor="data-inicio">Data inicial</label>
            <input
              id="data-inicio"
              type="date"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
              className="bg-transparent px-1.5 py-1.5 font-medium outline-none rounded-full"
            />
            <span className="text-mute" aria-hidden>até</span>
            <label className="sr-only" htmlFor="data-fim">Data final</label>
            <input
              id="data-fim"
              type="date"
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
              className="bg-transparent px-1.5 py-1.5 font-medium outline-none rounded-full"
            />
          </div>
        </div>

        <div>
          <p className="text-mute mb-1">Saldo do período</p>
          {loadingDados ? (
            <div className="h-16 w-72 max-w-full rounded-2xl bg-surface-2 animate-pulse" />
          ) : (
            <p className={`text-5xl sm:text-6xl font-normal tracking-tight ${resumo.saldo < 0 ? "text-neg" : ""}`}>
              {brl(resumo.saldo)}
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 pr-20">
          <button
            onClick={handleSincronizar}
            disabled={loadingSync}
            className="h-11 px-5 rounded-full bg-primary text-on-primary text-sm font-semibold flex items-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-60"
          >
            <RefreshCw className={`w-4 h-4 ${loadingSync ? "animate-spin" : ""}`} />
            {loadingSync ? "A sincronizar..." : "Sincronizar bancos"}
          </button>
          <Link
            href="/bancos"
            className="h-11 px-5 rounded-full border border-line text-sm font-semibold flex items-center gap-2 hover:bg-surface-2 transition-colors"
          >
            <Plus className="w-4 h-4" /> Conectar banco
          </Link>
        </div>

        <Link
          href="/transacoes"
          aria-label="Ver todas as transações"
          className="absolute right-6 bottom-6 sm:right-7 sm:bottom-7 w-16 h-16 rounded-full bg-lime text-on-lime flex items-center justify-center hover:scale-105 transition-transform"
        >
          <ArrowUpRight className="w-7 h-7" />
        </Link>
      </section>

      <AiInsights
        className="md:col-span-2 lg:col-span-5"
        insight={insight}
        loadingInsight={loadingInsight}
        filtroIA={filtroIA}
        setFiltroIA={setFiltroIA}
        opcoesMeses={opcoesMeses}
      />

      <div className="lg:col-span-4 grid">
        <ExpenseChart resumo={resumo} />
      </div>
      <div className="lg:col-span-4 grid">
        <SummaryCards resumo={resumo} />
      </div>
      <div className="md:col-span-2 lg:col-span-4 grid">
        <RecentTransactions transacoes={recentes} />
      </div>
    </div>
  );
}
