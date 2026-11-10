"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Lock, LogIn } from "lucide-react";
import { ThemeProvider } from "../components/ThemeProvider";
import { AppHeader } from "../components/AppHeader";

function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isLogged, setIsLogged] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    setIsLogged(!!localStorage.getItem("finai_userId"));
    setIsChecking(false);
  }, [pathname]);

  if (isChecking) return null;

  return (
    <div className="min-h-screen w-full bg-canvas text-ink">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-12">
        <AppHeader isLogged={isLogged} />

        <main>
          {!isLogged && pathname !== "/" ? (
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-full bg-lime text-on-lime flex items-center justify-center mb-6">
                <Lock className="w-7 h-7" />
              </div>
              <h2 className="text-2xl font-semibold mb-2">Acesso restrito</h2>
              <p className="text-mute max-w-sm mb-8">
                Esta área é exclusiva para utilizadores registados. Faça login para acessar os seus dados financeiros.
              </p>
              <Link
                href="/login"
                className="flex items-center gap-2 px-6 h-12 rounded-full bg-primary text-on-primary font-semibold hover:opacity-90 transition-opacity"
              >
                <LogIn className="w-5 h-5" />
                Fazer login
              </Link>
            </div>
          ) : (
            children
          )}
        </main>
      </div>
    </div>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <LayoutContent>{children}</LayoutContent>
    </ThemeProvider>
  );
}
