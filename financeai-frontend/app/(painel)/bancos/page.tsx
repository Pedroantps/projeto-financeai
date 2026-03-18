"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

// Importa a Pluggy de forma segura (só carrega no navegador do usuário)
const PluggyConnect = dynamic(
  () => import("react-pluggy-connect").then((mod) => mod.PluggyConnect),
  { ssr: false }
);

export default function BancosPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  // Estados da Pluggy
  const [connectToken, setConnectToken] = useState("");
  const [isPluggyOpen, setIsPluggyOpen] = useState(false);
  const [bancosConectados, setBancosConectados] = useState([]);

  const [isLoading, setIsLoading] = useState(true);

  const carregarBancos = async (userId: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:3000/api/bancos/${userId}`);
      const data = await response.json();
      setBancosConectados(data);
    } catch (error) {
      console.error("Erro ao carregar os bancos:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // 3. FUNÇÃO PARA ELIMINAR O BANCO
  const handleDeletarBanco = async (conexaoId: string, nomeBanco: string) => {
    // Confirmação de segurança nativa do navegador
    const confirmacao = window.confirm(`Tem a certeza que deseja desconectar o ${nomeBanco}?`);
    
    if (!confirmacao) return; // Se a pessoa clicar em "Cancelar", não faz nada.

    try {
      const response = await fetch(`http://localhost:3000/api/bancos/${conexaoId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        alert("Banco removido com sucesso!");
        
        // Recarrega a lista para o cartão sumir da tela instantaneamente
        const userId = localStorage.getItem("finai_userId");
        if (userId) carregarBancos(userId);
      } else {
        alert("Erro ao tentar remover o banco.");
      }
    } catch (error) {
      console.error("Erro ao apagar banco:", error);
      alert("Falha de comunicação com o servidor.");
    }
  };

  useEffect(() => {
    setIsMounted(true);
    const userId = localStorage.getItem("finai_userId");

    if (userId) {
      setIsLoggedIn(true);
      carregarBancos(userId); // 👈 Chama a função assim que a página abre!
    }
  }, []);

  // 1. CHAMA O NODE.JS PARA PEGAR A CHAVE DE ACESSO DA PLUGGY
  const handleAbrirPluggy = async () => {
    try {
      // ⚠️ Ajuste essa URL para a sua rota exata que gera o token da Pluggy no backend!
      const response = await fetch("http://localhost:3000/api/token"); 
      const data = await response.json();
      
      setConnectToken(data.accessToken); // ou data.token, dependendo de como você fez no Node
      setIsPluggyOpen(true);
    } catch (error) {
      alert("Erro ao iniciar conexão segura com o banco.");
    }
  };

  // 2. QUANDO O USUÁRIO DIGITA A SENHA DO ITAÚ/NUBANK COM SUCESSO
  const handlePluggySuccess = async (itemData: any) => {
    console.log("Sucesso na Pluggy!", itemData);
    
    const userId = localStorage.getItem("finai_userId");
    const pluggyItemId = itemData.item.id;
    const nomeDoBanco = itemData.item.connector.name; // Pega o nome real do banco

    try {
      // Envia os dados para salvar no PostgreSQL
      await fetch("http://localhost:3000/api/bancos/conectar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          usuarioId: userId,
          pluggyItemId: pluggyItemId,
          banco: nomeDoBanco
        }),
      });
      alert(`A conta do ${nomeDoBanco} foi conectada com sucesso!`);
      setIsPluggyOpen(false); // Fecha a janelinha

      if (userId) {
        carregarBancos(userId); 
      }
      
    } catch (error) {
      alert("Erro ao salvar o banco no sistema.");
    }
  };

  if (!isMounted) return null;

  if (!isLoggedIn) {
    // ... (Visual do cadeado continua igualzinho) ...
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

  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 min-h-[70vh] relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Meus Bancos</h1>
          <p className="text-gray-500 mt-1">Gerencie suas contas conectadas.</p>
        </div>
        
        {/* BOTÃO QUE INICIA A MÁGICA */}
        <button 
          onClick={handleAbrirPluggy}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-sm flex items-center gap-2 cursor-pointer"
        >
          <span>+</span> Conectar Nova Conta
        </button>
      </div>

      {/* WIDGET DA PLUGGY (Só aparece se tiver o token e estiver aberto) */}
      {isPluggyOpen && connectToken && (
        <div className="absolute top-0 left-0 w-full h-full z-50 bg-white/90 rounded-2xl flex items-center justify-center">
          <PluggyConnect
            connectToken={connectToken}
            includeSandbox={true}
            onSuccess={handlePluggySuccess}
            onError={(error) => console.error("Erro na Pluggy:", error)}
            onClose={() => setIsPluggyOpen(false)}
          />
        </div>
      )}

      {/* ÁREA DA LISTA DE BANCOS */}
      {isLoading ? (
        <div className="border-2 border-dashed border-gray-200 rounded-2xl p-12 text-center flex flex-col items-center justify-center min-h-75">
          <Loader2 className="animate-spin w-12 h-12 text-blue-600 mb-4" />
          <h3 className="text-lg font-bold text-gray-900 mb-2">Buscando bancos cadastrados...</h3>
          <p className="text-gray-500 max-w-sm">
            Aguarde um momento enquanto conectamos com segurança ao seu banco de dados.
          </p>
        </div>
      ) : bancosConectados.length === 0 && !isPluggyOpen ? (
        <div className="border-2 border-dashed border-gray-200 rounded-2xl p-12 text-center flex flex-col items-center justify-center">
          {}
          <div className="text-5xl mb-4 grayscale opacity-50">🏦</div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Nenhum banco conectado</h3>
          <p className="text-gray-500 max-w-sm">Conecte sua primeira conta bancária.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bancosConectados.map((conexao: any) => (
            <div key={conexao.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
              {/* Detalhe de cor no topo do cartão */}
              <div className="absolute top-0 left-0 w-full h-1 bg-blue-500"></div>
              
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-xl shadow-inner">
                  🏛️
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">{conexao.banco}</h3>
                  <p className="text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded-md inline-block mt-1">
                    Sincronizado
                  </p>
                </div>
              </div>
              
              <div className="pt-4 border-t border-gray-50 flex justify-between items-center">
                <p className="text-xs text-gray-400">
                  Adicionado em: {new Date(conexao.criadoEm).toLocaleDateString('pt-BR')}
                </p>
                <button 
                onClick={() => handleDeletarBanco(conexao.id, conexao.banco)}
                className="text-gray-400 hover:text-red-500 transition-colors cursor-pointer" title="Desconectar">
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}