"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Transaction = {
  id: string;
  type: string;
  amount: number;
  status: string;
  reference: string | null;
  description: string | null;
  created_at: string;
};

export default function AccountHistoryPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    async function loadHistory() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("wallet_transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      setTransactions(data || []);
    }

    void loadHistory();

    const timer = setInterval(() => {
      void loadHistory();
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  return (
    <main className="min-h-screen bg-black px-6 py-10 text-white">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-4xl font-black text-yellow-400">Account History</h1>
        <p className="mt-2 text-white/60">Deposits, withdrawals, wins, refunds and wallet activity.</p>

        <div className="mt-8 space-y-4">
          {transactions.map((tx) => (
            <div key={tx.id} className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-bold capitalize">{tx.type.replaceAll("_", " ")}</p>
                  <p className="mt-1 text-sm text-white/50">{tx.reference || tx.description || "No reference"}</p>
                  <p className="mt-1 text-xs text-white/40">{new Date(tx.created_at).toLocaleString()}</p>
                </div>

                <div className="text-right">
                  <p className={Number(tx.amount) >= 0 ? "text-2xl font-black text-green-400" : "text-2xl font-black text-red-300"}>
                    {Number(tx.amount) >= 0 ? "+" : ""}GH₵{Number(tx.amount).toFixed(2)}
                  </p>
                  <p className="mt-1 text-sm capitalize text-white/50">{tx.status}</p>
                </div>
              </div>
            </div>
          ))}

          {transactions.length === 0 && (
            <p className="rounded-2xl border border-white/10 bg-white/5 p-6 text-white/60">
              No account history yet.
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
