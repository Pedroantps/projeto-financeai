import "./globals.css";
import { Urbanist } from "next/font/google";
import { ThemeProvider } from "./components/ThemeProvider";

const urbanist = Urbanist({
  subsets: ["latin"],
  variable: "--font-urbanist",
  display: "swap",
});

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
    <html lang="pt-BR" className={urbanist.variable} suppressHydrationWarning>
      <body className="font-sans">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
