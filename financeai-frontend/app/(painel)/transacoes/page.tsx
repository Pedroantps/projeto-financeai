"use client";

import { useState, useEffect } from "react";
import { Search, SlidersHorizontal, Utensils, Car, ShoppingCart, Tv, Coffee, Briefcase, Landmark, RefreshCw } from "lucide-react";

const getEstiloCategoria = (categoria: string) => {
  const cat = categoria.toLowerCase();
  if (cat.includes("alimentação") || cat.includes("restaurante")) return { icon: Utensils, corIcon: "text-[#b24a35] dark:text-[#f0947f]", bgIcon: "bg-[#d9674e]/15" };
  if (cat.includes("transporte") || cat.includes("uber")) return { icon: Car, corIcon: "text-[#356b88] dark:text-[#8cc1dc]", bgIcon: "bg-[#4e8fb0]/15" };
  if (cat.includes("supermercado") || cat.includes("mercado")) return { icon: ShoppingCart, corIcon: "text-pos", bgIcon: "bg-lime/35" };
  if (cat.includes("assinatura")) return { icon: Tv, corIcon: "text-[#8a6114] dark:text-[#f0c26a]", bgIcon: "bg-[#e0a43a]/20" };
  if (cat.includes("salário") || cat.includes("recebimento")) return { icon: Briefcase, corIcon: "text-pos", bgIcon: "bg-lime/35" };
  if (cat.includes("lazer")) return { icon: Coffee, corIcon: "text-[#8a6114] dark:text-[#f0c26a]", bgIcon: "bg-[#e0a43a]/20" };
  return { icon: Landmark, corIcon: "text-mute", bgIcon: "bg-surface-2" };
};

const getCorTag = (tipo: string) => {
  const t = tipo.toLowerCase();
  if (t.includes("pix")) return "bg-lime/40 text-on-lime dark:bg-lime/15 dark:text-lime";
  if (t.includes("crédito")) return "bg-[#e0a43a]/20 text-[#7a5410] dark:text-[#f0c26a]";
  return "bg-surface-2 text-mute";
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

  const selectClass = "w-full px-4 h-11 bg-surface-2 rounded-full text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary/40";

  return (
    <div className="space-y-4 sm:space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pt-2">
        <div>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-1">Transações</h1>
          <p className="text-mute">Histórico completo, com nomes e categorias limpos pela IA.</p>
        </div>
        <button
          onClick={() => setMostrarFiltros(!mostrarFiltros)}
          aria-expanded={mostrarFiltros}
          className={`self-start sm:self-auto flex items-center gap-2 h-11 px-5 rounded-full text-sm font-semibold transition-colors ${mostrarFiltros ? "bg-lime text-on-lime" : "bg-surface hover:bg-surface-2"}`}
        >
          <SlidersHorizontal className="w-4 h-4" /> Filtros
        </button>
      </div>

      <div className="bg-surface rounded-[28px] overflow-hidden">
        {/* Barra de pesquisa e filtros */}
        <div className="p-4 sm:p-5 border-b border-line space-y-4">
          <div className="relative w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-mute" />
            <input
              type="search"
              placeholder="Pesquisar loja ou categoria"
              aria-label="Pesquisar transações"
              value={pesquisa}
              onChange={(e) => setPesquisa(e.target.value)}
              className="w-full pl-10 pr-4 h-11 bg-surface-2 rounded-full text-sm placeholder:text-mute outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            />
          </div>

          {mostrarFiltros && (
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 space-y-1.5">
                <label htmlFor="f-cat" className="text-sm text-mute ml-1">Categoria</label>
                <select id="f-cat" value={filtroCategoria} onChange={(e) => setFiltroCategoria(e.target.value)} className={selectClass}>
                  {categoriasUnicas.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
              <div className="flex-1 space-y-1.5">
                <label htmlFor="f-tipo" className="text-sm text-mute ml-1">Método de pagamento</label>
                <select id="f-tipo" value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)} className={selectClass}>
                  {tiposUnicos.map(tipo => <option key={tipo} value={tipo}>{tipo}</option>)}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Tabela das transações filtradas; colunas secundárias somem em telas pequenas */}
        <div className="w-full overflow-x-auto min-h-80">
          {loading ? (
            <div className="flex items-center justify-center pt-20"><RefreshCw className="w-7 h-7 text-mute animate-spin" /></div>
          ) : transacoesFiltradas.length === 0 ? (
            <div className="flex flex-col items-center justify-center pt-20 text-center px-6">
              <p className="text-lg font-medium">Nenhuma transação encontrada</p>
              <p className="text-sm text-mute mt-1">Ajuste a pesquisa ou os filtros, ou sincronize os bancos no painel.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-line text-sm text-mute">
                  <th className="py-3 px-4 sm:px-6 font-medium">Categoria</th>
                  <th className="py-3 px-6 font-medium hidden md:table-cell">Estabelecimento</th>
                  <th className="py-3 px-6 font-medium hidden sm:table-cell">Tipo</th>
                  <th className="py-3 px-4 sm:px-6 font-medium text-right">Valor</th>
                </tr>
              </thead>
              <tbody>
                {transacoesFiltradas.map((tx) => {
                  const estilo = getEstiloCategoria(tx.categoria);
                  const Icon = estilo.icon;
                  const isGain = tx.valor > 0;
                  const dataFormatada = new Date(tx.dataOcorrencia).toLocaleDateString("pt-BR");

                  return (
                    <tr key={tx.id} className="border-b border-line last:border-0 hover:bg-surface-2/60 transition-colors">
                      <td className="py-3.5 px-4 sm:px-6 align-middle max-w-0 w-full md:max-w-none md:w-auto">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center ${estilo.bgIcon}`}>
                            <Icon className={`w-5 h-5 ${estilo.corIcon}`} />
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-sm font-semibold truncate md:hidden">{tx.nomeLimpo}</span>
                            <span className="text-sm text-mute md:text-ink md:font-semibold truncate">{tx.categoria}</span>
                            <span className="text-xs text-mute">{dataFormatada}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-6 align-middle text-sm font-medium hidden md:table-cell">{tx.nomeLimpo}</td>
                      <td className="py-3.5 px-6 align-middle hidden sm:table-cell">
                        <div className="flex flex-col items-start gap-1">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${getCorTag(tx.tipoPagamento)}`}>{tx.tipoPagamento}</span>
                          {tx.dataFatura && <span className="text-xs text-mute">Fatura: {new Date(tx.dataFatura).toLocaleDateString("pt-BR")}</span>}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 sm:px-6 align-middle text-right whitespace-nowrap">
                        <span className={`text-base font-semibold ${isGain ? "text-pos" : "text-ink"}`}>
                          {isGain ? "+" : "−"}{Math.abs(tx.valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
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
