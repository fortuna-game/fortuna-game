"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Withdrawal = {
  id: string;
  amount: number;
  network: string | null;
  momo_number: string;
  status: string;
  reference: string | null;
  created_at: string;
};

export default function WithdrawalHistoryPage() {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);

  async function loadWithdrawals() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("withdrawals")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    setWithdrawals(data || []);
  }

  useEffect(() => {
    void loadWithdrawals();

    const timer = setInterval(() => {
      void loadWithdrawals();
    }, 4000);

    return () => clearInterval(timer);
  }, []);

  function label(status: string) {
    if (status === "paid") return "Paid";
    if (status === "failed") return "Failed";
    return "Processing";
  }

  return (
    <main className="min-h-screen bg-black px-6 py-12 text-white">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-4xl font-black text-pink-500">Withdrawal History</h1>
        <p className="mt-2 text-white/60">Live status of your withdrawals.</p>

        <div className="mt-8 space-y-4">
          {withdrawals.map((w) => (
            <div key={w.id} className="rounded-3xl border border-pink-500/20 bg-white/5 p-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="font-bold text-pink-400">{w.reference}</p>
                  <p className="mt-2 text-2xl font-black">GH₵{Number(w.amount).toFixed(2)}</p>
                  <p className="mt-1 text-white/60">{w.network} • {w.momo_number}</p>
                </div>

                <span className={`rounded-full px-4 py-2 text-sm font-bold ${
                  w.status === "paid"
                    ? "bg-pink-500/20 text-green-300"
                    : w.status === "failed"
                    ? "bg-red-500/20 text-red-300"
                    : "bg-pink-600/20 text-pink-400"
                }`}>
                  {label(w.status)}
                </span>
              </div>

              <p className="mt-4 text-sm text-white/40">
                {new Date(w.created_at).toLocaleString()}
              </p>
            </div>
          ))}

          {withdrawals.length === 0 && (
            <p className="rounded-3xl border border-white/10 bg-white/5 p-6 text-white/60">
              No withdrawals yet.
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
