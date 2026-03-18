"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { Home, LayoutDashboard, Landmark, ReceiptText, LogOut } from "lucide-react";
import ThemeToggle from "./themetoggle";
import React from "react";

export default function Sidebar() {
  const [isMounted, setIsMounted] = useState(false);
  const [isRetracted, setIsRetracted] = useState(false);
  const pathname = usePathname();
  
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    setIsMounted(true); // 👈 Avisa que o componente montou
    const userId = localStorage.getItem("finai_userId");
    if (userId) {
      setIsLoggedIn(true);
      setUserName(localStorage.getItem("finai_userName") || "Usuário");
    }
  }, []);

  // 👇 Função de Logout adicionada
  const handleLogout = () => {
    localStorage.removeItem("finai_userId");
    localStorage.removeItem("finai_userName");
    window.location.href = "/login";
  };

  const menuItems = [
    { name: "Início", href: "/", icon: Home },
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Meus Bancos", href: "/bancos", icon: Landmark },
    { name: "Transações", href: "/transacoes", icon: ReceiptText },
  ];

  // Previne o erro de hidratação (fantasma do F5)
  if (!isMounted) return <aside className="w-64 h-screen bg-white border-r border-gray-100 hidden md:block"></aside>;

  return (
    <aside 
      className={`bg-white border-r border-gray-100 transition-all duration-300 flex flex-col h-screen sticky top-0 ${
        isRetracted ? "w-20" : "w-64"
      }`}
    >
      <div className={`p-6 flex items-center ${isRetracted ? "justify-center" : "justify-between"}`}>
        {/* 👇 LOGO USANDO NEXT/IMAGE */}
        {!isRetracted && (
          <Link href="/">
            <Image 
              src="/assets/financeai.png" 
              alt="FinanceAI" 
              width={130} 
              height={32} 
              className="h-auto w-40" 
              priority 
            />
          </Link>
        )}
        
        {/* BOTÃO COM AS 3 LISTRAS */}
        <div className={`flex items-center gap-2 ${isRetracted ? "flex-col" : ""}`}>
          <ThemeToggle /> {/* 👈 O NOSSO BOTÃO MÁGICO AQUI */}
          
          <button 
            onClick={() => setIsRetracted(!isRetracted)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-500 transition-colors"
            title={isRetracted ? "Expandir menu" : "Recolher menu"}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              title={isRetracted ? item.name : ""} // Mostra o nome ao passar o mouse se estiver fechado
              className={`flex items-center gap-4 p-3 rounded-xl transition-colors ${
                isActive 
                  ? "bg-blue-50 text-blue-600 shadow-sm" 
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              {/* 👇 INJEÇÃO DA CLASSE W-5 H-5 NO LUCIDE */}
              <span className="flex items-center justify-center">
                {React.createElement(item.icon, { className: "w-5 h-5" })}
              </span>
              {!isRetracted && <span className="font-medium">{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Rodapé Dinâmico */}
      <div className="p-4 border-t border-gray-50 flex flex-col gap-2">
        
        {/* 👇 BOTÃO DE SAIR (Só aparece se logado) */}
        {isLoggedIn && (
          <button 
            onClick={handleLogout}
            title={isRetracted ? "Sair da Conta" : ""}
            className={`flex items-center gap-4 p-3 rounded-xl text-red-500 hover:bg-red-50 transition-colors ${isRetracted ? "justify-center" : ""}`}
          >
            <LogOut className="w-5 h-5" />
            {!isRetracted && <span className="font-medium">Sair da Conta</span>}
          </button>
        )}

        <div className={`flex items-center gap-3 mt-2 ${isRetracted ? "justify-center" : ""}`}>
           {isLoggedIn ? (
             <>
               <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600 shrink-0">
                 {userName.charAt(0).toUpperCase()}
               </div>
               {!isRetracted && (
                 <div className="flex flex-col">
                   <span className="text-xs font-bold text-gray-900 truncate w-32">{userName}</span>
                   <span className="text-[10px] text-gray-400">Plano Grátis</span>
                 </div>
               )}
             </>
           ) : (
             <>
               <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-400 shrink-0">
                 ?
               </div>
               {!isRetracted && (
                 <Link href="/login" className="text-xs font-bold text-blue-600 hover:underline">
                   Fazer Login
                 </Link>
               )}
             </>
           )}
        </div>
      </div>
    </aside>
  );
}