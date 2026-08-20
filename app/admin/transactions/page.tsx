"use client";

import AdminNav from "@/components/AdminNav";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function AdminTransactionsPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>({
    totalTransactions: 0,
    totalCredit: 0,
    totalDebit: 0,
    netFlow: 0,
  });
  const [message, setMessage] = useState("Loading transactions...");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    async function loadTransactions() {
      const { data: auth } = await supabase.auth.getSession();
      const token = auth.session?.access_token;

      if (!token) {
        window.location.href = "/admin/login";
        return;
      }

      const res = await fetch("/api/admin/transactions", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const json = await res.json();

      if (!res.ok) {
        setMessage(json.error || "Admin access denied.");
        return;
      }

      setTransactions(json.transactions || []);
      setSummary(json.summary || {});
      setMessage("");
    }

    void loadTransactions();
  }, []);

  const visibleTransactions = useMemo(() => {
    if (filter === "all") return transactions;
    return transactions.filter((t) => String(t.type).includes(filter));
  }, [transactions, filter]);

  return (
    <main className="min-h-screen bg-[#071A33] px-6 py-10 text-white">
      <div className="mx-auto max-w-7xl">
        <AdminNav />
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black text-[#4D94F5]">Transactions</h1>
            <p className="mt-2 text-[#9AAAC1]">All wallet movements across the platform.</p>
          </div>

          <Link href="/admin" className="rounded-xl bg-[#3F82DD] px-5 py-3 font-black text-black">
            Back to Admin
          </Link>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-4">
          <div className="min-w-0 rounded-3xl border border-[#38BDF8]/15 bg-[#0B2545]/70 p-6">
            <p className="text-sm text-[#9AAAC1]">Transactions</p>
            <h2 className="mt-2 text-3xl font-black">{summary.totalTransactions}</h2>
          </div>

          <div className="min-w-0 rounded-3xl border border-blue-400/20 bg-[#3F82DD]/10 p-6">
            <p className="text-sm text-[#9AAAC1]">Credits</p>
            <h2 className="mt-2 text-3xl font-black text-green-300">GH₵{Number(summary.totalCredit || 0).toFixed(2)}</h2>
          </div>

          <div className="min-w-0 rounded-3xl border border-red-400/20 bg-red-500/10 p-6">
            <p className="text-sm text-[#9AAAC1]">Debits</p>
            <h2 className="mt-2 text-3xl font-black text-red-500">GH₵{Number(summary.totalDebit || 0).toFixed(2)}</h2>
          </div>

          <div className="min-w-0 rounded-3xl border border-[#2A5688] bg-[#2C63B3]/10 p-6">
            <p className="text-sm text-[#9AAAC1]">Net Flow</p>
            <h2 className="mt-2 text-3xl font-black text-[#66A7FF]">GH₵{Number(summary.netFlow || 0).toFixed(2)}</h2>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {["all", "deposit", "withdrawal", "skill_game", "refund"].map((item) => (
            <button
              key={item}
              onClick={() => setFilter(item)}
              className={`rounded-full px-5 py-2 font-bold ${
                filter === item ? "bg-[#3F82DD] text-black" : "bg-[#0F2F57]/80 text-white"
              }`}
            >
              {item.toUpperCase()}
            </button>
          ))}
        </div>

        {message && <div className="mt-8 min-w-0 rounded-3xl border border-[#2A5688] bg-[#0B2545]/70 p-6">{message}</div>}

        {!message && (
          <div className="mt-8 overflow-x-auto min-w-0 rounded-3xl border border-[#2A5688]">
            <div className="w-full overflow-x-auto rounded-xl"><table className="w-full min-w-[1300px] text-left">
              <thead className="bg-[#3F82DD] text-black">
                <tr>
                  <th className="p-4">User</th>
                  <th className="p-4">Phone</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Reference</th>
                  <th className="p-4">Description</th>
                  <th className="p-4">Date</th>
                </tr>
              </thead>

              <tbody>
                {visibleTransactions.map((t) => (
                  <tr key={t.id} className="border-t border-[#38BDF8]/15">
                    <td className="p-4">
                      <p className="font-black">@{t.username}</p>
                      <p className="text-sm text-[#8295B0]">{t.first_name}</p>
                    </td>
                    <td className="p-4">{t.phone || "-"}</td>
                    <td className="p-4 font-bold capitalize">{String(t.type).replaceAll("_", " ")}</td>
                    <td className={
                      ["game_entry", "skill_game_entry", "lucky_draw_ticket"].includes(String(t.type))
                        ? "p-4 font-black text-red-500"
                        : Number(t.amount) >= 0
                        ? "p-4 font-black text-green-300"
                        : "p-4 font-black text-red-500"
                    }>
                      {["game_entry", "skill_game_entry", "lucky_draw_ticket"].includes(String(t.type))
                        ? "-"
                        : Number(t.amount) >= 0
                        ? "+"
                        : "-"}GH₵{Math.abs(Number(t.amount || 0)).toFixed(2)}
                    </td>
                    <td className="p-4">{String(t.status).toUpperCase()}</td>
                    <td className="p-4 text-[#66A7FF]">{t.reference || "-"}</td>
                    <td className="p-4">{t.description || "-"}</td>
                    <td className="p-4">{t.created_at ? new Date(t.created_at).toLocaleString() : "-"}</td>
                  </tr>
                ))}

                {visibleTransactions.length === 0 && (
                  <tr>
                    <td className="p-6 text-[#9AAAC1]" colSpan={8}>No transactions found.</td>
                  </tr>
                )}
              </tbody>
            </table></div>
          </div>
        )}
      </div>
    </main>
  );
}
