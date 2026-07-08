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
    <main className="min-h-screen bg-black px-6 py-10 text-white">
      <div className="mx-auto max-w-7xl">
        <AdminNav />
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black text-yellow-400">Transactions</h1>
            <p className="mt-2 text-white/60">All wallet movements across the platform.</p>
          </div>

          <Link href="/admin" className="rounded-xl bg-yellow-400 px-5 py-3 font-black text-black">
            Back to Admin
          </Link>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-4">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <p className="text-sm text-white/60">Transactions</p>
            <h2 className="mt-2 text-3xl font-black">{summary.totalTransactions}</h2>
          </div>

          <div className="rounded-3xl border border-green-400/20 bg-green-500/10 p-6">
            <p className="text-sm text-white/60">Credits</p>
            <h2 className="mt-2 text-3xl font-black text-green-300">GH₵{Number(summary.totalCredit || 0).toFixed(2)}</h2>
          </div>

          <div className="rounded-3xl border border-red-400/20 bg-red-500/10 p-6">
            <p className="text-sm text-white/60">Debits</p>
            <h2 className="mt-2 text-3xl font-black text-red-500">GH₵{Number(summary.totalDebit || 0).toFixed(2)}</h2>
          </div>

          <div className="rounded-3xl border border-yellow-400/20 bg-yellow-500/10 p-6">
            <p className="text-sm text-white/60">Net Flow</p>
            <h2 className="mt-2 text-3xl font-black text-yellow-300">GH₵{Number(summary.netFlow || 0).toFixed(2)}</h2>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {["all", "deposit", "withdrawal", "skill_game", "refund"].map((item) => (
            <button
              key={item}
              onClick={() => setFilter(item)}
              className={`rounded-full px-5 py-2 font-bold ${
                filter === item ? "bg-yellow-400 text-black" : "bg-white/10 text-white"
              }`}
            >
              {item.toUpperCase()}
            </button>
          ))}
        </div>

        {message && <div className="mt-8 rounded-3xl border border-yellow-400/20 bg-white/5 p-6">{message}</div>}

        {!message && (
          <div className="mt-8 overflow-x-auto rounded-3xl border border-yellow-400/20">
            <table className="w-full min-w-[1300px] text-left">
              <thead className="bg-yellow-400 text-black">
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
                  <tr key={t.id} className="border-t border-white/10">
                    <td className="p-4">
                      <p className="font-black">@{t.username}</p>
                      <p className="text-sm text-white/50">{t.first_name}</p>
                    </td>
                    <td className="p-4">{t.phone || "-"}</td>
                    <td className="p-4 font-bold capitalize">{String(t.type).replaceAll("_", " ")}</td>
                    <td className={Number(t.amount) >= 0 ? "p-4 font-black text-green-300" : "p-4 font-black text-red-500"}>
                      {Number(t.amount) >= 0 ? "+" : "-"}GH₵{Math.abs(Number(t.amount || 0)).toFixed(2)}
                    </td>
                    <td className="p-4">{String(t.status).toUpperCase()}</td>
                    <td className="p-4 text-yellow-300">{t.reference || "-"}</td>
                    <td className="p-4">{t.description || "-"}</td>
                    <td className="p-4">{t.created_at ? new Date(t.created_at).toLocaleString() : "-"}</td>
                  </tr>
                ))}

                {visibleTransactions.length === 0 && (
                  <tr>
                    <td className="p-6 text-white/60" colSpan={8}>No transactions found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
