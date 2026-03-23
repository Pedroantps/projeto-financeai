"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Lock, Mail, Activity } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [isRegister, setIsRegister] = useState(false);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [mensagem, setMensagem] = useState({ texto: "", tipo: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); 
    setLoading(true);
    setMensagem({ texto: "", tipo: "" });

    try {
      const endpoint = isRegister ? "/api/cadastro" : "/api/login";
      const bodyData = isRegister ? { nome, email, senha } : { email, senha };

      const response = await fetch(`http://localhost:3333${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyData),
      });

      const data = await response.json();

      if (response.ok) {
        if (isRegister) {
          setMensagem({ texto: "Conta criada com sucesso!", tipo: "sucesso" });
          setIsRegister(false); setSenha(""); 
        } else {
          localStorage.setItem("finai_userId", data.id);
          localStorage.setItem("finai_userName", data.nome);
          router.push("/"); 
        }
      } else {
        setMensagem({ texto: data.erro || "Erro de acesso.", tipo: "erro" });
      }
    } catch (error) {
      setMensagem({ texto: "Falha na comunicação com o servidor.", tipo: "erro" });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-50 to-blue-50/50 dark:from-slate-950 dark:to-slate-900 transition-colors duration-500 relative overflow-hidden p-4">
      {/* Cria efeitos de desfoque (blur) no fundo para compor a estética da tela */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 dark:bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/10 dark:bg-emerald-600/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Card principal do formulário implementado com o efeito visual de glassmorphism */}
      <div className="w-full max-w-md bg-white/60 dark:bg-slate-900/60 backdrop-blur-2xl border border-white/40 dark:border-slate-800/50 p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] z-10 relative">
        
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/20">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">FinAI</span>
          </div>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white mb-2">
            {isRegister ? "Crie sua conta" : "Bem-vindo de volta"}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {isRegister ? "Comece a controlar suas finanças." : "Entre para aceder ao seu painel inteligente."}
          </p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          {isRegister && (
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300 ml-1">Nome Completo</label>
              <input
                type="text" required value={nome} onChange={(e) => setNome(e.target.value)}
                placeholder="João da Silva"
                className="w-full px-4 py-2.5 bg-white/50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm"
              />
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300 ml-1">E-mail</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="w-full pl-10 pr-4 py-2.5 bg-white/50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300 ml-1">Senha</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type="password" required value={senha} onChange={(e) => setSenha(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-white/50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm"
              />
            </div>
          </div>

          {mensagem.texto && (
            <div className={`p-3 rounded-xl text-xs font-medium text-center ${mensagem.tipo === "erro" ? "bg-red-100 text-red-600 dark:bg-red-500/10 dark:text-red-400" : "bg-green-100 text-green-600 dark:bg-green-500/10 dark:text-green-400"}`}>
              {mensagem.texto}
            </div>
          )}

          <button type="submit" disabled={loading} className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl text-sm font-medium shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2 group disabled:opacity-70 cursor-pointer">
            {loading ? "Aguarde..." : (isRegister ? "Criar Conta" : "Entrar")}
            {!loading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
          {isRegister ? "Já tem uma conta?" : "Não tem uma conta?"}{" "}
          <button type="button" onClick={() => { setIsRegister(!isRegister); setMensagem({texto:"", tipo:""}); }} className="font-medium text-blue-600 hover:text-blue-500 transition-colors underline cursor-pointer">
            {isRegister ? "Faça login" : "Cadastre-se"}
          </button>
        </p>
      </div>
    </div>
  );
}