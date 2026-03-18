"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  // Controle de estado para alternar entre Login e Cadastro
  const router = useRouter();
  const [isRegister, setIsRegister] = useState(false);
  
  // Dados do formulário
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  
  // Feedback para o usuário
  const [loading, setLoading] = useState(false);
  const [mensagem, setMensagem] = useState({ texto: "", tipo: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Evita que a página recarregue
    setLoading(true);
    setMensagem({ texto: "", tipo: "" });

    if (isRegister) {
      // 🚀 FLUXO DE CADASTRO (Batendo na sua API Node.js)
      try {
        const response = await fetch("http://localhost:3000/api/cadastro", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nome, email, senha }),
        });

        const data = await response.json();

        if (response.ok) {
          setMensagem({ texto: "Conta criada com sucesso! Agora você pode entrar.", tipo: "sucesso" });
          setIsRegister(false); // Muda para a tela de login automaticamente
          setSenha(""); // Limpa a senha por segurança
        } else {
          setMensagem({ texto: data.erro || "Erro ao cadastrar.", tipo: "erro" });
        }
      } catch (error) {
        setMensagem({ texto: "Falha na comunicação com o servidor.", tipo: "erro" });
      }
    } else {
      // 🚀 FLUXO DE LOGIN REAL
      try {
        const response = await fetch("http://localhost:3000/api/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, senha }),
        });

        const data = await response.json();

        if (response.ok) {
          // Salva o "crachá" do usuário no navegador (localStorage)
          localStorage.setItem("finai_userId", data.id);
          localStorage.setItem("finai_userName", data.nome);
          
          setMensagem({ texto: "Entrando...", tipo: "sucesso" });
          
          // Redireciona o usuário para a área logada!
          router.push("/"); 
        } else {
          setMensagem({ texto: data.erro || "Acesso negado.", tipo: "erro" });
        }
      } catch (error) {
        setMensagem({ texto: "Falha na comunicação com o servidor.", tipo: "erro" });
      }
    }
    
    setLoading(false);
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-indigo-100 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-blue-600 mb-2">FinAI</h1>
          <p className="text-gray-500">
            {isRegister ? "Crie sua conta para começar" : "Bem-vindo de volta às suas finanças"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* O campo NOME só aparece se for Cadastro */}
          {isRegister && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
              <input
                type="text"
                required={isRegister}
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="w-full px-4 py-2 text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                placeholder="João da Silva"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="seu@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
            <input
              type="password"
              required
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="w-full px-4 py-2 text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="••••••••"
            />
          </div>

          {/* Mensagens de Feedback */}
          {mensagem.texto && (
            <div className={`p-3 rounded-lg text-sm font-medium ${
              mensagem.tipo === "sucesso" ? "bg-green-100 text-green-700" :
              mensagem.tipo === "erro" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"
            }`}>
              {mensagem.texto}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:opacity-70"
          >
            {loading ? "Processando..." : (isRegister ? "Criar Conta" : "Entrar")}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          {isRegister ? "Já tem uma conta?" : "Ainda não tem uma conta?"}{" "}
          <button
            type="button"
            onClick={() => {
              setIsRegister(!isRegister);
              setMensagem({ texto: "", tipo: "" }); // Limpa mensagens ao trocar de tela
            }}
            className="text-blue-600 font-semibold hover:underline"
          >
            {isRegister ? "Faça login" : "Cadastre-se"}
          </button>
        </div>

      </div>
    </main>
  );
}