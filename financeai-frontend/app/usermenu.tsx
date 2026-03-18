"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Settings, User, LogOut } from "lucide-react";

export default function UserMenu() {
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null); // Referência para detectar cliques fora
  const [menuOpen, setMenuOpen] = useState(false);
  const [userName, setUserName] = useState("");

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const isLoggedIn = !!localStorage.getItem("finai_userId");
    setIsLoggedIn(isLoggedIn);
    // Carrega o nome do usuário logado
    setUserName(localStorage.getItem("finai_userName") || "Usuário");

    // Lógica para fechar o menu ao clicar fora dele
    const handleOutsideClick = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("finai_userId");
    localStorage.removeItem("finai_userName");
    setIsLoggedIn(false);
    window.location.href = "/";
  };

  return isLoggedIn ? (
    <div className="relative" ref={menuRef}>
      {/* 🔘 O BOTÃO DO ÍCONE DE PERFIL (Gatilho) */}
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="flex items-center gap-2 group outline-none"
      >
        <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors">
          {userName}
        </span>
        {/* Ícone de Avatar Simples */}
        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-lg border-2 border-transparent group-hover:border-blue-600 transition-all">
          {userName.charAt(0).toUpperCase()}
        </div>
      </button>

      {/* 🔽 O MENU DROPDOWN (Só aparece se estiver aberto) */}
      {menuOpen && (
        <div className="absolute right-0 mt-3 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50 transform origin-top-right transition-all">
          <div className="px-4 py-2 border-b border-gray-100 mb-2">
            <p className="text-xs text-gray-500">Logado como</p>
            <p className="text-sm font-semibold text-gray-900 truncate">
              {userName}
            </p>
          </div>

          <Link
            href="/perfil"
            onClick={() => setMenuOpen(false)}
            className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <User className="w-4 h-4 text-gray-500" />
            Editar Perfil
          </Link>
          
          <Link
            href="/configuracoes"
            onClick={() => setMenuOpen(false)}
            className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Settings className="w-4 h-4 text-gray-500" />
            Configurações
          </Link>

          <div className="border-t border-gray-100 mt-2 pt-2">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
            >
              <LogOut className="w-4 h-4" />
              Sair
            </button>
          </div>
        </div>
      )}
    </div>
  ) : (
    <Link 
      href="/login" 
      className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded-full transition-colors shadow-sm"
    >
      Fazer Login
    </Link>
  );
}