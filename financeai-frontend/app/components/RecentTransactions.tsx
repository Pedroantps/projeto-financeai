"use client";

import Link from "next/link";
import { ReceiptText } from "lucide-react";

interface RecentTransactionsProps {
  transacoes: Array<{ id: string; nomeLimpo: string; categoria: string; valor: number; dataOcorrencia: string }>;
}

const brl = (v: number) => Math.abs(v).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export function RecentTransactions({ transacoes }: RecentTransactionsProps) {
  return (
    <section className="bg-surface rounded-[28px] p-6 flex flex-col">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <span className="w-10 h-10 rounded-full border border-line flex items-center justify-center">
            <ReceiptText className="w-4 h-4" />
          </span>
          <h2 className="text-lg font-medium">Últimas transações</h2>
        </div>
        <Link href="/transacoes" className="text-sm font-medium text-mute hover:text-ink underline underline-offset-4 decoration-line">
          Ver todas
        </Link>
      </div>

      {transacoes.length === 0 ? (
        <div className="flex-1 min-h-40 flex flex-col items-center justify-center text-center text-mute">
          <p className="font-medium text-ink">Nenhuma transação ainda</p>
          <p className="text-sm mt-1">Conecte um banco para importar o extrato.</p>
        </div>
      ) : (
        <ul className="divide-y divide-line">
          {transacoes.map((tx) => {
            const entrada = tx.valor > 0;
            return (
              <li key={tx.id} className="flex items-center gap-3 py-3">
                <span className="w-10 h-10 rounded-full bg-surface-2 flex items-center justify-center text-sm font-semibold shrink-0">
                  {tx.nomeLimpo.charAt(0).toUpperCase()}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{tx.nomeLimpo}</p>
                  <p className="text-xs text-mute truncate">
                    {tx.categoria}, {new Date(tx.dataOcorrencia).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
                  </p>
                </div>
                <span className={`text-sm font-semibold shrink-0 ${entrada ? "text-pos" : "text-neg"}`}>
                  {entrada ? "+" : "−"}{brl(tx.valor)}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
