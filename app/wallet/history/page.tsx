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

    const { data: profile } = await supabase
      .from("profiles")
      .select("username, first_name")
      .eq("user_id", user.id)
      .maybeSingle();

    const displayName =
      profile?.username || profile?.first_name || "Player";

    const formatFGReference = (dateValue: string) => {
      const d = new Date(dateValue);
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      const yy = String(d.getFullYear()).slice(-2);
      return `FG/${mm}/${dd}/${yy}`;
    };

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
        reference:
          t.type === "skill_game_entry" || t.type === "skill_game_win"
            ? `@${displayName}`
            : t.reference || t.description || null,
        date: t.created_at,
      })),

      ...(deposits || []).map((d: any) => ({
        id: `deposit-${d.id}`,
        title: "Deposit",
        amount: Number(d.amount || 0),
        status: d.status || "completed",
        reference: formatFGReference(d.created_at),
        date: d.created_at,
      })),

      ...(withdrawals || []).map((w: any) => ({
        id: `withdrawal-${w.id}`,
        title: "Withdrawal",
        amount: -Math.abs(Number(w.amount || 0)),
        status: w.status,
        reference: w.reference || formatFGReference(w.created_at),
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
    <main className="min-h-screen bg-white px-6 py-10 text-slate-900">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-3xl sm:text-4xl font-black text-emerald-600">Account History</h1>
        <p className="mt-2 text-slate-500">
          Deposits, cancellations, failed payments, withdrawals, refunds, wins and entry fees.
        </p>

        <div className="mt-8 divide-y divide-slate-200 border-y border-slate-200">
          {items.map((item) => (
            <div key={item.id} className="py-5">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="font-bold capitalize text-slate-900">{item.title}</p>
                  <p className="mt-1 text-sm text-slate-500">{item.reference || "No reference"}</p>
                  <p className="mt-1 text-xs text-slate-400">
                    {new Date(item.date).toLocaleString()}
                  </p>
                </div>

                <div className="text-right">
                  <p className={
                    item.amount >= 0
                      ? "text-2xl font-black text-emerald-600"
                      : "text-2xl font-black text-red-600"
                  }>
                    {item.status === "cancelled"
                      ? `GH₵${Math.abs(item.amount).toFixed(2)}`
                      : `${item.amount >= 0 ? "+" : "-"}GH₵${Math.abs(item.amount).toFixed(2)}`}
                  </p>

                  <p
                    className={
                      item.status === "failed"
                        ? "mt-1 text-sm font-semibold capitalize text-red-600"
                        : item.status === "cancelled"
                        ? "mt-1 text-sm font-semibold capitalize text-orange-500"
                        : item.status === "pending"
                        ? "mt-1 text-sm font-semibold capitalize text-blue-600"
                        : "mt-1 text-sm font-semibold capitalize text-emerald-600"
                    }
                  >
                    {item.status}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {items.length === 0 && (
            <p className="py-10 text-center text-slate-500">
              No account history yet.
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
