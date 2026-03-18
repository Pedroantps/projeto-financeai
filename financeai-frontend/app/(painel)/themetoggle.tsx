"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  // Espera montar no cliente para saber qual é o tema atual do navegador
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Retorna um espaço vazio do mesmo tamanho para o layout não pular
    return <div className="w-10 h-10"></div>;
  }

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="p-2.5 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-400 transition-colors flex items-center justify-center"
      title={theme === "dark" ? "Mudar para Claro" : "Mudar para Escuro"}
    >
      {theme === "dark" ? (
        <Sun className="w-5 h-5 text-yellow-500" />
      ) : (
        <Moon className="w-5 h-5 text-blue-600" />
      )}
    </button>
  );
}