"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Zap, BarChart3, ShieldCheck } from "lucide-react";

// Exemplos de como a IA transforma linhas cruas do extrato
const exemplos = [
  { bruto: "PAG*IFOOD 29310 SAO PAULO", limpo: "iFood", categoria: "Alimentação", valor: "−R$ 48,90" },
  { bruto: "UBER *TRIP HELP.UBER.COM", limpo: "Uber", categoria: "Transporte", valor: "−R$ 23,40" },
  { bruto: "TED RECEBIDA 00341 EMPRESA LTDA", limpo: "Salário", categoria: "Recebimento", valor: "+R$ 5.200,00" },
];

const recursos = [
  { icon: Zap, titulo: "Conexão Open Finance", texto: "Sincronização em tempo real com todos os bancos do Brasil." },
  { icon: BarChart3, titulo: "Inteligência Llama 3", texto: "Categorização hiperprecisa sem a necessidade de intervenção humana." },
  { icon: ShieldCheck, titulo: "Segurança total", texto: "Acesso 100% somente leitura. Ninguém movimenta o seu dinheiro." },
];

export default function LandingPage() {
  const [isLogged, setIsLogged] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Verifica o login apenas no client-side, após a montagem do componente
  useEffect(() => {
    setIsMounted(true);
    if (localStorage.getItem("finai_userId")) setIsLogged(true);
  }, []);

  return (
    <div className="space-y-4 sm:space-y-5">
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5">
        <div className="lg:col-span-7 bg-surface rounded-[28px] p-7 sm:p-10 lg:p-12 flex flex-col justify-between gap-10">
          <div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight leading-[1.05] text-balance">
              Chega de planilhas. A IA faz o trabalho sujo.
            </h1>
            <p className="mt-6 text-lg text-mute max-w-xl text-pretty">
              O FinAI liga-se ao seu banco de forma segura, limpa as descrições confusas do seu extrato e categoriza os seus gastos automaticamente.
            </p>
          </div>

          <div className="h-12">
            {isMounted && (
              <Link
                href={isLogged ? "/dashboard" : "/login"}
                className="inline-flex items-center h-12 px-7 rounded-full bg-primary text-on-primary font-semibold hover:opacity-90 transition-opacity"
              >
                {isLogged ? "Abrir meu painel" : "Assuma o controle hoje"}
              </Link>
            )}
          </div>
        </div>

        {/* Demonstração: linha crua do extrato -> nome limpo + categoria */}
        <div className="lg:col-span-5 bg-lime text-on-lime rounded-[28px] p-6 sm:p-8 flex flex-col">
          <h2 className="text-xl font-semibold">Do extrato confuso ao gasto claro</h2>
          <p className="text-on-lime/75 mt-1 mb-6">Assim a IA lê cada linha do seu banco.</p>
          <ul className="space-y-3 mt-auto">
            {exemplos.map((e) => (
              <li key={e.bruto} className="bg-white/50 rounded-2xl p-4">
                <p className="text-xs text-on-lime/70 line-through decoration-on-lime/40 truncate">{e.bruto}</p>
                <div className="flex items-baseline justify-between gap-3 mt-1">
                  <p className="font-semibold">
                    {e.limpo} <span className="font-normal text-on-lime/75">em {e.categoria}</span>
                  </p>
                  <p className="font-semibold shrink-0">{e.valor}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-surface rounded-[28px] grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-line">
        {recursos.map(({ icon: Icon, titulo, texto }) => (
          <div key={titulo} className="p-6 sm:p-8 flex gap-4">
            <span className="w-11 h-11 rounded-full bg-surface-2 flex items-center justify-center shrink-0">
              <Icon className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-semibold text-lg">{titulo}</h3>
              <p className="text-mute mt-1 leading-relaxed">{texto}</p>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
