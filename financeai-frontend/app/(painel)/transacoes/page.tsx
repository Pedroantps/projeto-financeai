"use client";

import { useState, useEffect } from "react";
import { Search, Filter, Utensils, Car, ShoppingCart, Tv, Coffee, Briefcase, Landmark, Activity, RefreshCw } from "lucide-react";

const getEstiloCategoria = (categoria: string) => {
  const cat = categoria.toLowerCase();
  if (cat.includes("alimentação") || cat.includes("restaurante")) return { icon: Utensils, corIcon: "text-rose-500", bgIcon: "bg-rose-500/10" };
  if (cat.includes("transporte") || cat.includes("uber")) return { icon: Car, corIcon: "text-sky-500", bgIcon: "bg-sky-500/10" };
  if (cat.includes("supermercado") || cat.includes("mercado")) return { icon: ShoppingCart, corIcon: "text-emerald-500", bgIcon: "bg-emerald-500/10" };
  if (cat.includes("assinatura")) return { icon: Tv, corIcon: "text-violet-500", bgIcon: "bg-violet-500/10" };
  if (cat.includes("salário") || cat.includes("recebimento")) return { icon: Briefcase, corIcon: "text-emerald-500", bgIcon: "bg-emerald-500/10" };
  if (cat.includes("lazer")) return { icon: Coffee, corIcon: "text-amber-500", bgIcon: "bg-amber-500/10" };
  return { icon: Landmark, corIcon: "text-slate-500", bgIcon: "bg-slate-500/10" };
};

const getCorTag = (tipo: string) => {
  const t = tipo.toLowerCase();
  if (t.includes("pix")) return "bg-teal-100 text-teal-700 dark:bg-teal-500/10 dark:text-teal-400";
  if (t.includes("crédito")) return "bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400";
  return "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400"; 
};

export default function TransacoesPage() {
  const [transacoes, setTransacoes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Define os estados utilizados para o controle das variáveis de filtragem
  const [pesquisa, setPesquisa] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("Todas");
  const [filtroTipo, setFiltroTipo] = useState("Todos");
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  useEffect(() => {
    const carregarTransacoes = async () => {
      const id = localStorage.getItem("finai_userId");
      if (!id) return;
      try {
        const res = await fetch(`http://localhost:3333/api/transacoes/${id}`);
        if (res.ok) {
          const data = await res.json();
          setTransacoes(data);
        }
      } catch (error) {
        console.error("Erro ao carregar transacoes:", error);
      }
      setLoading(false);
    };
    carregarTransacoes();
  }, []);

  // Extrai as categorias e tipos únicos da listagem para popular as opções dos campos de seleção
  const categoriasUnicas = ["Todas", ...Array.from(new Set(transacoes.map(t => t.categoria)))];
  const tiposUnicos = ["Todos", ...Array.from(new Set(transacoes.map(t => t.tipoPagamento)))];

  // Aplica de forma combinada os filtros de pesquisa, categoria e tipo de pagamento nas transações
  const transacoesFiltradas = transacoes.filter(tx => {
    const matchPesquisa = tx.nomeLimpo.toLowerCase().includes(pesquisa.toLowerCase()) || tx.categoria.toLowerCase().includes(pesquisa.toLowerCase());
    const matchCategoria = filtroCategoria === "Todas" || tx.categoria === filtroCategoria;
    const matchTipo = filtroTipo === "Todos" || tx.tipoPagamento === filtroTipo;
    return matchPesquisa && matchCategoria && matchTipo;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out fill-mode-both">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white mb-1">Transações</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Histórico completo refinado pela IA (Groq).</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setMostrarFiltros(!mostrarFiltros)}
            className={`flex items-center gap-2 px-4 py-2.5 border rounded-xl text-sm font-medium transition-all shadow-sm ${mostrarFiltros ? 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700'} cursor-pointer`}
          >
            <Filter className="w-4 h-4" /> Filtros
          </button>
        </div>
      </div>

      <div className="bg-white/80 dark:bg-[#0F172A]/80 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/50 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.02)] overflow-hidden">
        
        {/* Seção contendo a barra de pesquisa em texto e os menus suspensos de filtro */}
        <div className="p-4 border-b border-slate-200/50 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-900/50 space-y-4">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" placeholder="Pesquisar loja ou categoria..." 
              value={pesquisa} onChange={(e) => setPesquisa(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all shadow-sm"
            />
          </div>

          {mostrarFiltros && (
            <div className="flex flex-col sm:flex-row gap-4 pt-2 animate-in slide-in-from-top-2 duration-300">
              <div className="flex-1 space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 ml-1">Categoria</label>
                <select 
                  value={filtroCategoria} onChange={(e) => setFiltroCategoria(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer"
                >
                  {categoriasUnicas.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
              <div className="flex-1 space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 ml-1">Método de Pagamento</label>
                <select 
                  value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer"
                >
                  {tiposUnicos.map(tipo => <option key={tipo} value={tipo}>{tipo}</option>)}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Componente de tabela que renderiza a listagem final das transações já filtradas */}
        <div className="w-full overflow-x-auto min-h-100">
          {loading ? (
            <div className="flex h-full items-center justify-center mt-20"><RefreshCw className="w-8 h-8 text-blue-500 animate-spin" /></div>
          ) : transacoesFiltradas.length === 0 ? (
            <div className="flex flex-col items-center justify-center mt-20 text-slate-400">
               <Activity className="w-12 h-12 mb-3 opacity-50" />
               <p className="text-lg font-medium">Nenhuma transação encontrada.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200/50 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-900/50 text-xs uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400">
                  <th className="py-4 px-6 font-semibold">Detalhes</th>
                  <th className="py-4 px-6 font-semibold">Estabelecimento (IA)</th>
                  <th className="py-4 px-6 font-semibold">Tipo</th>
                  <th className="py-4 px-6 font-semibold text-right">Valor</th>
                </tr>
              </thead>
              <tbody>
                {transacoesFiltradas.map((tx) => {
                  const estilo = getEstiloCategoria(tx.categoria);
                  const Icon = estilo.icon;
                  const isGain = tx.valor > 0;
                  const dataFormatada = new Date(tx.dataOcorrencia).toLocaleDateString('pt-BR');
                  
                  return (
                    <tr key={tx.id} className="border-b border-slate-100 dark:border-slate-800/30 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="py-4 px-6 align-middle">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${estilo.bgIcon}`}>
                            <Icon className={`w-5 h-5 ${estilo.corIcon}`} />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-semibold text-slate-900 dark:text-white">{tx.categoria}</span>
                            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{dataFormatada}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 align-middle text-sm font-medium text-slate-700 dark:text-slate-300">{tx.nomeLimpo}</td>
                      <td className="py-4 px-6 align-middle">
                        <div className="flex flex-col items-start gap-1">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${getCorTag(tx.tipoPagamento)}`}>{tx.tipoPagamento}</span>
                          {tx.dataFatura && <span className="text-[10px] text-slate-400 font-medium">Fatura: {new Date(tx.dataFatura).toLocaleDateString('pt-BR')}</span>}
                        </div>
                      </td>
                      <td className="py-4 px-6 align-middle text-right">
                        <span className={`text-base font-bold tracking-tight ${isGain ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'}`}>
                          {isGain ? '+' : '-'} {Math.abs(tx.valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}