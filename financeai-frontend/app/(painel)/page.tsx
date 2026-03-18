"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function Home() {
  const [isMounted, setIsMounted] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    if (localStorage.getItem("finai_userId")) {
      setIsLoggedIn(true);
    }
  }, []);

  if (!isMounted) return null;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="relative pt-20 pb-16 sm:pt-24 sm:pb-20 text-center px-4">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-6">
          O controle do seu dinheiro, <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-indigo-500">
            movido a Inteligência Artificial.
          </span>
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-500 mb-10">
          Conecte seus bancos e deixe a nossa IA categorizar seus gastos automaticamente.
        </p>
        
        <div className="flex justify-center gap-4">
          {isLoggedIn ? (
            <Link href="/dashboard" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-full text-lg font-bold shadow-lg transition-all">
              Acessar meu Dashboard 🚀
            </Link>
          ) : (
            <Link href="/login" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-full text-lg font-bold shadow-lg transition-all">
              Fazer Login para Começar
            </Link>
          )}
        </div>
      </div>

      <div className="bg-gray-50 py-16 px-8 border-t border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="text-2xl mb-4">🏦</div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Múltiplos Bancos</h3>
            <p className="text-gray-500 text-sm">Itaú, Nubank, Bradesco e mais num só lugar.</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="text-2xl mb-4">🧠</div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">IA Categorizadora</h3>
            <p className="text-gray-500 text-sm">Extratos confusos organizados magicamente.</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="text-2xl mb-4">📊</div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Dashboards</h3>
            <p className="text-gray-500 text-sm">Entenda para onde seu dinheiro está indo.</p>
          </div>
        </div>
      </div>
    </div>
  );
}