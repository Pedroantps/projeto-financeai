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
  return { bg: "bg-surface-2", text: "text-ink" };
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

        // Limpa o cache de insights da IA no localStorage, pois a base de dados mudou
        if (userId) {
          const keysToRemove = [];
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(`finai_insight_${userId}_`)) {
              keysToRemove.push(key);
            }
          }
          keysToRemove.forEach(k => localStorage.removeItem(k));
        }
      }
    } catch (error) {
      alert("Erro ao remover banco.");
    }
    setIsDeleting(null);
  };

  return (
    <div className="space-y-4 sm:space-y-5 relative">

      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pt-2">
        <div>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-1">
            Conexões bancárias
          </h1>
          <p className="text-mute">
            Gerencie as suas contas ligadas via Open Finance de forma segura.
          </p>
        </div>
        <button onClick={handleConectarBanco} className="self-start sm:self-auto flex items-center gap-2 h-11 px-5 rounded-full bg-primary text-on-primary text-sm font-semibold hover:opacity-90 transition-opacity">
          <Plus className="w-4 h-4" />
          Conectar banco
        </button>
      </div>

      {loadingBancos ? (
        <div className="flex justify-center items-center h-40">
          <RefreshCw className="w-7 h-7 text-mute animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {bancos.map((bank) => {
            const estilo = getEstiloBanco(bank.banco);
            return (
              <div key={bank.id} className={`relative bg-surface p-6 rounded-[28px] transition-opacity ${isDeleting === bank.id ? "opacity-50" : ""}`}>
                <button onClick={() => handleDelete(bank.id)} disabled={isDeleting === bank.id} aria-label={`Remover ${bank.banco}`} className="absolute top-5 right-5 w-9 h-9 rounded-full flex items-center justify-center text-mute hover:bg-neg/10 hover:text-neg transition-colors disabled:opacity-0">
                  <Trash2 className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-4 mb-6 pr-10">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${estilo.bg}`}>
                    <Building2 className={`w-5 h-5 ${estilo.text}`} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-lg font-semibold truncate">{bank.banco}</h3>
                    <p className="text-sm text-mute">Conta sincronizada</p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-lime/35 dark:bg-lime/15 text-on-lime dark:text-lime px-3 py-1 text-sm font-medium">
                  <CheckCircle2 className="w-4 h-4" /> Ativa, somente leitura
                </span>
              </div>
            );
          })}

          {/* Cartão "Adicionar Novo" */}
          <button onClick={handleConectarBanco} className="flex flex-col items-center justify-center gap-3 border-2 border-dashed border-line hover:bg-surface p-6 rounded-[28px] transition-colors group min-h-40">
            <span className="w-12 h-12 rounded-full bg-lime text-on-lime flex items-center justify-center">
              <Plus className="w-5 h-5" />
            </span>
            <span className="text-sm font-semibold">Adicionar nova conta</span>
          </button>
        </div>
      )}

      {isPluggyOpen && connectToken && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/40">
          <div className="w-full max-w-md h-150 max-h-[90vh] bg-white rounded-[28px] overflow-hidden shadow-2xl relative">
             <PluggyConnect connectToken={connectToken} includeSandbox={false} onSuccess={handlePluggySuccess} onError={(error: any) => console.error(error)} onClose={() => setIsPluggyOpen(false)} />
          </div>
        </div>
      )}
    </div>
  );
}