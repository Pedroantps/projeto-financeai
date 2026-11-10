"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock, Mail } from "lucide-react";

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
          setMensagem({ texto: "Conta criada. Agora é só entrar.", tipo: "sucesso" });
          setIsRegister(false); setSenha("");
        } else {
          localStorage.setItem("finai_userId", data.id);
          localStorage.setItem("finai_userName", data.nome);
          router.push("/");
        }
      } else {
        setMensagem({ texto: data.erro || "E-mail ou senha incorretos.", tipo: "erro" });
      }
    } catch (error) {
      setMensagem({ texto: "Não foi possível falar com o servidor. Verifique se o backend está rodando.", tipo: "erro" });
    }
    setLoading(false);
  };

  const inputClass = "w-full h-12 bg-surface-2 rounded-full text-sm placeholder:text-mute outline-none focus-visible:ring-2 focus-visible:ring-primary/40";

  return (
    <div className="min-h-screen bg-canvas text-ink flex items-center justify-center p-4">
      <div className="w-full max-w-4xl grid md:grid-cols-2 gap-4">
        {/* Painel de marca */}
        <div className="hidden md:flex flex-col justify-between bg-lime text-on-lime rounded-[28px] p-10">
          <Link href="/" className="text-2xl font-bold">FinAI</Link>
          <div>
            <p className="text-3xl font-semibold leading-tight text-balance">Seu extrato, limpo e organizado sem planilha.</p>
            <p className="mt-3 text-on-lime/75">Conexão somente leitura via Open Finance.</p>
          </div>
        </div>

        <div className="bg-surface rounded-[28px] p-7 sm:p-10">
          <Link href="/" className="md:hidden text-xl font-bold block mb-8">FinAI</Link>

          <h1 className="text-3xl font-semibold tracking-tight mb-2">
            {isRegister ? "Crie sua conta" : "Bem-vindo de volta"}
          </h1>
          <p className="text-mute mb-8">
            {isRegister ? "Comece a controlar suas finanças." : "Entre para acessar o seu painel."}
          </p>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {isRegister && (
              <div className="space-y-1.5">
                <label htmlFor="nome" className="text-sm font-medium ml-1">Nome completo</label>
                <input
                  id="nome" type="text" required autoComplete="name" value={nome} onChange={(e) => setNome(e.target.value)}
                  placeholder="João da Silva"
                  className={`${inputClass} px-5`}
                />
              </div>
            )}

            <div className="space-y-1.5">
              <label htmlFor="email" className="text-sm font-medium ml-1">E-mail</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-mute pointer-events-none" />
                <input
                  id="email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className={`${inputClass} pl-11 pr-5`}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="senha" className="text-sm font-medium ml-1">Senha</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-mute pointer-events-none" />
                <input
                  id="senha" type="password" required autoComplete={isRegister ? "new-password" : "current-password"} value={senha} onChange={(e) => setSenha(e.target.value)}
                  placeholder="••••••••"
                  className={`${inputClass} pl-11 pr-5`}
                />
              </div>
            </div>

            {mensagem.texto && (
              <p role="status" className={`px-4 py-3 rounded-2xl text-sm ${mensagem.tipo === "erro" ? "bg-neg/10 text-neg" : "bg-lime/40 text-on-lime dark:bg-lime/15 dark:text-lime"}`}>
                {mensagem.texto}
              </p>
            )}

            <button type="submit" disabled={loading} className="w-full h-12 rounded-full bg-primary text-on-primary font-semibold hover:opacity-90 transition-opacity disabled:opacity-60">
              {loading ? "Aguarde..." : (isRegister ? "Criar conta" : "Entrar")}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-mute">
            {isRegister ? "Já tem uma conta?" : "Não tem uma conta?"}{" "}
            <button type="button" onClick={() => { setIsRegister(!isRegister); setMensagem({ texto: "", tipo: "" }); }} className="font-semibold text-ink underline underline-offset-4">
              {isRegister ? "Fazer login" : "Cadastre-se"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
