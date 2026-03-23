"use client";

import { useState, useEffect } from "react";
import dynamic from 'next/dynamic';
import { Plus, Trash2, CheckCircle2, AlertCircle, Clock, Building2, RefreshCw } from "lucide-react";

// Importa o Pluggy dinamicamente (evita erros no Next.js)
const PluggyConnect = dynamic(
  () => import('react-pluggy-connect').then((mod) => mod.PluggyConnect),
  { ssr: false }
);

const getEstiloBanco = (nome: string) => {
  const nomeLower = nome.toLowerCase();
  if (nomeLower.includes("itaú") || nomeLower.includes("itau")) return { bg: "bg-orange-500", text: "text-white" };
  if (nomeLower.includes("nubank")) return { bg: "bg-purple-600", text: "text-white" };
  if (nomeLower.includes("bradesco")) return { bg: "bg-red-600", text: "text-white" };
  if (nomeLower.includes("brasil") || nomeLower.includes("bb")) return { bg: "bg-yellow-400", text: "text-slate-900" };
  if (nomeLower.includes("santander")) return { bg: "bg-red-500", text: "text-white" };
  if (nomeLower.includes("inter")) return { bg: "bg-orange-400", text: "text-white" };
  return { bg: "bg-blue-600", text: "text-white" };
};

export default function BancosPage() {
  const [bancos, setBancos] = useState<any[]>([]);
  const [loadingBancos, setLoadingBancos] = useState(true);
  const [isPluggyOpen, setIsPluggyOpen] = useState(false);
  const [connectToken, setConnectToken] = useState("");
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  // Pega o ID do utilizador assim que a página carrega
  useEffect(() => {
    const id = localStorage.getItem("finai_userId");
    setUserId(id);
    if (id) {
      carregarBancos(id);
    } else {
      setLoadingBancos(false);
    }
  }, []);

  // 1. BUSCAR BANCOS REAIS DO PRISMA
  const carregarBancos = async (idUsuario: string) => {
    setLoadingBancos(true);
    try {
      const res = await fetch(`http://localhost:3333/api/bancos/usuario/${idUsuario}`);
      if (res.ok) {
        const data = await res.json();
        setBancos(data);
      }
    } catch (error) {
      console.error("Erro ao carregar bancos", error);
    }
    setLoadingBancos(false);
  };

  // 2. GERAR TOKEN REAL DA PLUGGY
  const handleConectarBanco = async () => {
    try {
      const response = await fetch("http://localhost:3333/api/pluggy/token");
      const data = await response.json();
      
      if (data.accessToken) {
        setConnectToken(data.accessToken);
        setIsPluggyOpen(true);
      } else {
        alert("Erro ao gerar token da Pluggy.");
      }
    } catch (error) {
      alert("Falha de comunicação com o servidor.");
    }
  };

  // 3. SALVAR O BANCO NOVO NO PRISMA APÓS CONECTAR
  const handlePluggySuccess = async (itemData: any) => {
    setIsPluggyOpen(false);
    if (!userId) return;

    try {
      await fetch("http://localhost:3333/api/bancos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pluggyItemId: itemData.item.id,
          banco: itemData.item.connector.name,
          usuarioId: userId
        })
      });
      carregarBancos(userId); // Recarrega a grelha
    } catch (error) {
      alert("Erro ao guardar o banco no sistema.");
    }
  };

  // 4. APAGAR BANCO EM CASCATA
  const handleDelete = async (bancoId: string) => {
    if (!confirm("Tem a certeza que deseja remover este banco e todas as suas transações?")) return;
    
    setIsDeleting(bancoId);
    try {
      const res = await fetch(`http://localhost:3333/api/bancos/${bancoId}`, { method: "DELETE" });
      if (res.ok) {
        setBancos(bancos.filter(b => b.id !== bancoId));
      }
    } catch (error) {
      alert("Erro ao remover banco.");
    }
    setIsDeleting(null);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out fill-mode-both relative">
      
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white mb-1">
            Conexões Bancárias
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Gerencie as suas contas ligadas via Open Finance de forma segura.
          </p>
        </div>
        <button onClick={handleConectarBanco} className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl text-sm font-medium shadow-lg shadow-blue-600/20 transition-all group cursor-pointer">
          <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
          Conectar Novo Banco
        </button>
      </div>

      {loadingBancos ? (
        <div className="flex justify-center items-center h-40">
          <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bancos.map((bank) => {
            const estilo = getEstiloBanco(bank.banco);
            return (
              <div key={bank.id} className={`group relative bg-white/80 dark:bg-[#0F172A]/80 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/50 p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.02)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] transition-all duration-300 ${isDeleting === bank.id ? 'opacity-50 scale-95' : 'hover:shadow-lg hover:-translate-y-1'}`}>
                <button onClick={() => handleDelete(bank.id)} disabled={isDeleting === bank.id} className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10 dark:hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all disabled:opacity-0 cursor-pointer">
                  <Trash2 className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-4 mb-5">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner ${estilo.bg}`}>
                    <Building2 className={`w-7 h-7 ${estilo.text}`} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">{bank.banco}</h3>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Conta Sincronizada</p>
                  </div>
                </div>
                <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800/50 pt-4 mt-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Ativo e Seguro</span>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Cartão "Adicionar Novo" */}
          <button onClick={handleConectarBanco} className="flex flex-col items-center justify-center gap-3 bg-slate-50/50 dark:bg-slate-900/30 border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-blue-500/50 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 p-6 rounded-3xl transition-all group min-h-40 cursor-pointer">
            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors">
              <Plus className="w-6 h-6 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-500 transition-colors" />
            </div>
            <span className="text-sm font-semibold text-slate-500 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400">Adicionar nova conta</span>
          </button>
        </div>
      )}

      {isPluggyOpen && connectToken && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300">
          <div className="w-full max-w-md h-150 bg-white rounded-3xl overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-300">
             <PluggyConnect connectToken={connectToken} includeSandbox={false} onSuccess={handlePluggySuccess} onError={(error: any) => console.error(error)} onClose={() => setIsPluggyOpen(false)} />
          </div>
        </div>
      )}
    </div>
  );
}