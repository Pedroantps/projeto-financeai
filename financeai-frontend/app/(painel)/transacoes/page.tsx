"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, Search, ReceiptText } from "lucide-react";

export default function TransacoesPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  const [transacoes, setTransacoes] = useState<any[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);

  // 👇 NOVOS ESTADOS PARA OS FILTROS
  const [buscaTexto, setBuscaTexto] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("todas");
  const [filtroTipo, setFiltroTipo] = useState("todos"); // todos, entradas, saidas

  const [isLoading, setIsLoading] = useState(true);

  const carregarTransacoes = async (userId: string) => {
    setIsLoading(true);

    try {
      const response = await fetch(`http://localhost:3000/api/transacoes/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setTransacoes(data);
      }
    } catch (error) {
      console.error("Erro ao carregar transações:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setIsMounted(true);
    const userId = localStorage.getItem("finai_userId");

    if (userId) {
      setIsLoggedIn(true);
      carregarTransacoes(userId);
    }
  }, []);

  const handleSincronizar = async () => {
    setIsSyncing(true);
    const userId = localStorage.getItem("finai_userId");

    try {
      const resBancos = await fetch(`http://localhost:3000/api/bancos/${userId}`);
      const bancos = await resBancos.json();

      if (bancos.length === 0) {
        alert("Você precisa conectar um banco na tela 'Meus Bancos' primeiro!");
        setIsSyncing(false);
        return;
      }

      const resSync = await fetch("http://localhost:3000/api/transacoes/sincronizar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conexaoId: bancos[0].id }),
      });

      if (resSync.ok) {
        if (userId) carregarTransacoes(userId);
      } else {
        alert("Erro na sincronização. Verifique o terminal do Node.js.");
      }
    } catch (error) {
      alert("Falha de comunicação com o servidor.");
    }
    
    setIsSyncing(false);
  };

  if (!isMounted) return null;

  if (!isLoggedIn) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <div className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100 max-w-md w-full text-center">
          <div className="text-6xl mb-6">🔒</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Acesso Restrito</h2>
          <Link href="/login" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full transition-colors inline-block w-full">
            Fazer Login Agora
          </Link>
        </div>
      </div>
    );
  }

  // 👇 LÓGICA INTELIGENTE DOS FILTROS
  // 1. Extrai todas as categorias únicas que existem no banco (sem repetição)
  const categoriasUnicas = Array.from(new Set(transacoes.map(t => t.categoria))).sort();

  // 2. Aplica os 3 filtros ao mesmo tempo de forma instantânea!
  const transacoesFiltradas = transacoes.filter((t) => {
    // Filtro 1: Texto (busca no nome limpo OU na descrição original do banco)
    const matchTexto = t.nomeLimpo.toLowerCase().includes(buscaTexto.toLowerCase()) || 
                       t.descricaoOriginal.toLowerCase().includes(buscaTexto.toLowerCase());
    
    // Filtro 2: Categoria
    const matchCategoria = filtroCategoria === "todas" || t.categoria === filtroCategoria;
    
    // Filtro 3: Entradas/Saídas
    const matchTipo = filtroTipo === "todos" || 
                      (filtroTipo === "entradas" && t.valor > 0) || 
                      (filtroTipo === "saidas" && t.valor < 0);

    return matchTexto && matchCategoria && matchTipo;
  });

  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 min-h-[70vh]">
      {/* CABEÇALHO E BOTÃO SINCRONIZAR */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Transações</h1>
          <p className="text-gray-500 mt-1">Seus gastos categorizados por Inteligência Artificial.</p>
        </div>
        
        <button 
          onClick={handleSincronizar}
          disabled={isSyncing}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-sm flex items-center gap-2 cursor-pointer"
        >
          {isSyncing ? "⏳ Analisando..." : "🔄 Sincronizar com Bancos"}
        </button>
      </div>

      {/* 👇 BARRA DE FILTROS SUPER ELEGANTE */}
      {transacoes.length > 0 && (
        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 mb-6 flex flex-col md:flex-row gap-4 items-center">
          
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            
            <input 
              type="text" 
              placeholder="Buscar loja, app ou banco..." 
              value={buscaTexto}
              onChange={(e) => setBuscaTexto(e.target.value)}
              className="w-full bg-white border border-gray-300 text-gray-700 py-2.5 pl-10 pr-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
            />
          </div>

          {/* Filtro de Categoria Dinâmico */}
          <div className="w-full md:w-56">
            <select 
              value={filtroCategoria}
              onChange={(e) => setFiltroCategoria(e.target.value)}
              className="w-full bg-white border border-gray-300 text-gray-700 py-2.5 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm cursor-pointer"
            >
              <option value="todas">Todas as Categorias</option>
              {categoriasUnicas.map(cat => (
                <option key={cat as string} value={cat as string}>{cat as string}</option>
              ))}
            </select>
          </div>

          {/* Filtro de Tipo (Entrada/Saída) */}
          <div className="w-full md:w-56">
            <select 
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value)}
              className="w-full bg-white border border-gray-300 text-gray-700 py-2.5 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm cursor-pointer"
            >
              <option value="todos">Entradas e Saídas</option>
              <option value="entradas">Só Entradas (+)</option>
              <option value="saidas">Só Saídas (-)</option>
            </select>
          </div>
        </div>
      )}

      {/* TABELA DE TRANSAÇÕES */}
      {isLoading ? (
        <div className="border-2 border-dashed border-gray-200 rounded-2xl p-12 text-center flex flex-col items-center justify-center min-h-75">
          <Loader2 className="animate-spin w-12 h-12 text-blue-600 mb-4" />
          <h3 className="text-lg font-bold text-gray-900 mb-2">Buscando transações...</h3>
          <p className="text-gray-500 max-w-sm">
            Aguarde um momento enquanto conectamos com segurança ao seu banco de dados.
          </p>
        </div>
      ) : transacoes.length === 0 ? (
        <div className="border-2 border-dashed border-gray-200 rounded-2xl p-12 text-center flex flex-col items-center justify-center min-h-75">
          <ReceiptText className="w-16 h-16 text-gray-300 mb-4" />
          <h3 className="text-lg font-bold text-gray-900 mb-2">Nenhuma transação encontrada</h3>
          <p className="text-gray-500 max-w-sm mb-6">
            Clique no botão acima para sincronizar seus dados bancários.
          </p>
        </div>
      ) : transacoesFiltradas.length === 0 ? (
        <div className="p-12 text-center text-gray-500 border border-gray-100 rounded-xl bg-gray-50 min-h-75 flex items-center justify-center">
          Nenhuma transação encontrada para os filtros selecionados.
        </div>
      ) : (
        <div className="overflow-x-auto border border-gray-100 rounded-xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-sm text-gray-500">
                <th className="py-3 px-4 font-medium">Data</th>
                <th className="py-3 px-4 font-medium">Descrição</th>
                <th className="py-3 px-4 font-medium">Categoria</th>
                <th className="py-3 px-4 font-medium">Tipo</th>
                <th className="py-3 px-4 font-medium text-right">Valor</th>
              </tr>
            </thead>
            <tbody>
              {/* ATENÇÃO AQUI: Mudámos de transacoes.map para transacoesFiltradas.map! */}
              {transacoesFiltradas.map((t: any) => (
                <tr key={t.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-4 text-gray-500 text-sm whitespace-nowrap">
                    {new Date(t.dataOcorrencia).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="py-4 px-4">
                    <p className="font-bold text-gray-900">{t.nomeLimpo}</p>
                    <p className="text-xs text-gray-400 font-mono mt-1">{t.descricaoOriginal}</p>
                  </td>
                  <td className="py-4 px-4">
                    <span className="bg-purple-50 text-purple-600 px-3 py-1 rounded-full text-xs font-bold border border-purple-100 whitespace-nowrap">
                      {t.categoria}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-gray-500 text-xs font-bold whitespace-nowrap">
                    {t.tipoPagamento}
                  </td>
                  <td className={`py-4 px-4 text-right font-bold whitespace-nowrap ${t.valor < 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(t.valor)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}