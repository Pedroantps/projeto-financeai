"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, Settings, LogOut, LogIn, Sun, Moon } from "lucide-react";
import { useTheme } from "./ThemeProvider";

interface AppHeaderProps {
  isLogged: boolean;
}

const navItems = [
  { name: "Início", path: "/" },
  { name: "Visão geral", path: "/dashboard" },
  { name: "Transações", path: "/transacoes" },
  { name: "Bancos", path: "/bancos" },
];

const sair = () => {
  localStorage.removeItem("finai_userId");
  window.location.href = "/";
};

export function AppHeader({ isLogged }: AppHeaderProps) {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    setUserName(localStorage.getItem("finai_userName") ?? "");
  }, []);

  const primeiroNome = userName.split(" ")[0];
  const inicial = userName.charAt(0).toUpperCase();

  return (
    <header className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3 py-4 sm:py-6">
      {/* Saudação ou marca */}
      <Link href="/" className="flex items-center gap-3 min-w-0">
        {isLogged ? (
          <>
            <span className="w-10 h-10 shrink-0 rounded-full bg-lime text-on-lime flex items-center justify-center font-bold">
              {inicial}
            </span>
            <span className="text-lg sm:text-xl font-medium truncate">Olá, {primeiroNome}</span>
          </>
        ) : (
          <span className="text-xl font-bold">
            Fin<span className="text-mute font-medium">AI</span>
          </span>
        )}
      </Link>

      {/* Navegação em pílulas: ocupa a linha inteira no celular, centralizada no desktop */}
      <nav
        aria-label="Navegação principal"
        className="order-last md:order-0 w-full md:w-auto overflow-x-auto [scrollbar-width:none]"
      >
        <ul className="flex items-center gap-1 bg-surface rounded-full p-1 w-max md:w-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <li key={item.path}>
                <Link
                  href={item.path}
                  aria-current={isActive ? "page" : undefined}
                  className={`block whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    isActive ? "bg-lime text-on-lime" : "text-mute hover:text-ink"
                  }`}
                >
                  {item.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="flex items-center gap-2 relative">
        <button
          onClick={toggleTheme}
          aria-label={theme === "dark" ? "Ativar modo claro" : "Ativar modo escuro"}
          className="w-10 h-10 rounded-full bg-surface flex items-center justify-center text-ink hover:bg-surface-2 transition-colors"
        >
          {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {isLogged ? (
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            aria-label="Menu da conta"
            aria-expanded={isUserMenuOpen}
            className="w-10 h-10 rounded-full bg-surface flex items-center justify-center hover:bg-surface-2 transition-colors"
          >
            <User className="w-4 h-4" />
          </button>
        ) : (
          <Link
            href="/login"
            className="h-10 px-5 rounded-full bg-primary text-on-primary text-sm font-semibold flex items-center gap-2 hover:opacity-90 transition-opacity"
          >
            <LogIn className="w-4 h-4" /> Entrar
          </Link>
        )}

        {isUserMenuOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsUserMenuOpen(false)} />
            <div className="absolute right-0 top-12 w-60 bg-surface border border-line rounded-2xl shadow-[0_12px_32px_-8px_rgba(20,24,18,0.18)] overflow-hidden z-50">
              <div className="px-4 py-3 border-b border-line">
                <p className="text-sm font-semibold">Minha conta</p>
                <p className="text-xs text-mute truncate mt-0.5">{userName}</p>
              </div>
              <div className="p-1.5">
                <button className="w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-xl hover:bg-surface-2 transition-colors">
                  <User className="w-4 h-4 text-mute" /> Editar perfil
                </button>
                <button className="w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-xl hover:bg-surface-2 transition-colors">
                  <Settings className="w-4 h-4 text-mute" /> Configurações
                </button>
                <button onClick={sair} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-neg rounded-xl hover:bg-surface-2 transition-colors">
                  <LogOut className="w-4 h-4" /> Sair da conta
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
