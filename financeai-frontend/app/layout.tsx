import "./globals.css";
import { ThemeProvider } from "./components/ThemeProvider";

export const metadata = {
  title: "FinanceAI - Inteligência Financeira",
  description: "As suas finanças categorizadas por Inteligência Artificial.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      {/* As cores de fundo base ficam logo no body */}
      {/* Define as cores de fundo diretamente no body para garantir a aplicação uniforme em toda a tela */}
      <body className="bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-white transition-colors duration-500">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}