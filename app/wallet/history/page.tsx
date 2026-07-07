"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type HistoryItem = {
  id: string;
  title: string;
  amount: number;
  status: string;
  reference: string | null;
  date: string;
};

export default function AccountHistoryPage() {
  const [items, setItems] = useState<HistoryItem[]>([]);

  async function loadHistory() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: txs } = await supabase
      .from("wallet_transactions")
      .select("*")
      .eq("user_id", user.id)
      .neq("status", "processing")
      .order("created_at", { ascending: false });

    const { data: deposits } = await supabase
      .from("deposits")
      .select("*")
      .eq("user_id", user.id)
      .neq("status", "processing")
      .order("created_at", { ascending: false });

    const { data: withdrawals } = await supabase
      .from("withdrawals")
      .select("*")
      .eq("user_id", user.id)
      .in("status", ["paid", "failed"])
      .order("created_at", { ascending: false });

    const history: HistoryItem[] = [
      ...(txs || []).map((t: any) => ({
        id: `tx-${t.id}`,
        title:
          t.description
            ? String(t.description)
                .replace("entry stake", "Entry")
                .replace("win payout", "Win")
            : t.type === "game_entry" || t.type === "skill_game_entry"
            ? `${String(t.reference || "Game").replaceAll("-", " ")} — Entry Fee`
            : t.type === "game_win" || t.type === "skill_game_win"
            ? `${String(t.reference || "Game").replaceAll("-", " ")} — Game Win`
            : String(t.type || "Wallet Activity").replaceAll("_", " "),
        amount:
          t.type === "game_entry"
            ? -Math.abs(Number(t.amount || 0))
            : Number(t.amount || 0),
        status: t.status || "completed",
        reference: t.reference || t.description || null,
        date: t.created_at,
      })),

      ...(deposits || []).map((d: any) => ({
        id: `deposit-${d.id}`,
        title: "Deposit",
        amount: Number(d.amount || 0),
        status: d.status || "completed",
        reference: d.reference || d.provider || null,
        date: d.created_at,
      })),

      ...(withdrawals || []).map((w: any) => ({
        id: `withdrawal-${w.id}`,
        title: "Withdrawal",
        amount: -Math.abs(Number(w.amount || 0)),
        status: w.status,
        reference: w.reference || w.momo_number || null,
        date: w.processed_at || w.created_at,
      })),
    ];

    history.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setItems(history);
  }

  useEffect(() => {
    void loadHistory();
    const timer = setInterval(() => void loadHistory(), 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <main className="min-h-screen bg-black px-6 py-10 text-white">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-4xl font-black text-yellow-400">Account History</h1>
        <p className="mt-2 text-white/60">
          Completed deposits, failed payments, withdrawals, refunds, wins and entry fees.
        </p>

        <div className="mt-8 space-y-4">
          {items.map((item) => (
            <div key={item.id} className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-bold capitalize">{item.title}</p>
                  <p className="mt-1 text-sm text-white/50">{item.reference || "No reference"}</p>
                  <p className="mt-1 text-xs text-white/40">
                    {new Date(item.date).toLocaleString()}
                  </p>
                </div>

                <div className="text-right">
                  <p className={
                    item.amount >= 0
                      ? "text-2xl font-black text-green-400"
                      : "text-2xl font-black text-red-300"
                  }>
                    {item.amount >= 0 ? "+" : "-"}GH₵{Math.abs(item.amount).toFixed(2)}
                  </p>

                  <p className={
                    item.status === "failed"
                      ? "mt-1 text-sm capitalize text-red-300"
                      : "mt-1 text-sm capitalize text-green-300"
                  }>
                    {item.status}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {items.length === 0 && (
            <p className="rounded-2xl border border-white/10 bg-white/5 p-6 text-white/60">
              No account history yet.
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
