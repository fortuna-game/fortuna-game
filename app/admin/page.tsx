"use client";

import AdminNav from "@/components/AdminNav";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function AdminDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [message, setMessage] = useState("Loading admin dashboard...");

  useEffect(() => {
    async function loadAdmin() {
      const { data: auth } = await supabase.auth.getSession();
      const token = auth.session?.access_token;

      const res = await fetch("/api/admin/dashboard", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const json = await res.json();

      if (!res.ok) {
        const { data: userData } = await supabase.auth.getUser();
        setMessage(`${json.error || "Admin access denied."} Logged in as: ${userData.user?.email || "No email found"}`);
        return;
      }

      setData(json);
      setMessage("");
    }

    void loadAdmin();
  }, []);

  if (!data) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black px-6 text-white">
        <div className="rounded-3xl border border-yellow-400/20 bg-white/5 p-8 text-center">
          {message}
        </div>
      </main>
    );
  }

  const cards = [
    ["Users", data.totalUsers],
    ["Wallet Balance", `GH₵${Number(data.totalWalletBalance).toFixed(2)}`],
    ["Deposits", `GH₵${Number(data.totalDeposits).toFixed(2)}`],
    ["Paid Withdrawals", `GH₵${Number(data.totalWithdrawalsPaid).toFixed(2)}`],
    ["Pending Withdrawals", `${data.pendingWithdrawalsCount} / GH₵${Number(data.pendingWithdrawalsAmount).toFixed(2)}`],
    ["Game Profit", `GH₵${Number(data.estimatedGameProfit).toFixed(2)}`],
  ];

  return (
    <main className="min-h-screen bg-black px-6 py-10 text-white">
      <div className="mx-auto max-w-7xl">
        <AdminNav />
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black text-yellow-400">Fortuna Admin</h1>
            <p className="mt-2 text-white/60">Business overview and money flow dashboard.</p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link href="/admin/users" className="rounded-xl bg-white/10 px-5 py-3 font-black text-white">
              Users
            </Link>

            <Link href="/admin/deposits" className="rounded-xl bg-white/10 px-5 py-3 font-black text-white">
              Deposits
            </Link>

            <Link href="/admin/games" className="rounded-xl bg-white/10 px-5 py-3 font-black text-white">
              Games
            </Link>

            <Link href="/admin/transactions" className="rounded-xl bg-white/10 px-5 py-3 font-black text-white">
              Transactions
            </Link>

            <Link href="/admin/withdrawals" className="rounded-xl bg-yellow-400 px-5 py-3 font-black text-black">
              Manage Withdrawals
            </Link>
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map(([label, value]) => (
            <div key={label} className="rounded-3xl border border-yellow-400/20 bg-white/5 p-6">
              <p className="text-sm text-white/50">{label}</p>
              <h2 className="mt-2 text-3xl font-black">{value}</h2>
            </div>
          ))}
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-2xl font-black text-yellow-400">Recent Transactions</h2>
            <div className="mt-4 space-y-3">
              {data.recentTransactions.map((t: any) => (
                <div key={t.id} className="rounded-2xl bg-black/50 p-4">
                  <p className="font-bold">{String(t.type).replaceAll("_", " ")}</p>
                  <p className="text-sm text-white/60">GH₵{Number(t.amount).toFixed(2)} • {t.status}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-2xl font-black text-yellow-400">Recent Skill Games</h2>
            <div className="mt-4 space-y-3">
              {data.recentGames.map((g: any) => (
                <div key={g.id} className="rounded-2xl bg-black/50 p-4">
                  <p className="font-bold">{String(g.game_slug).replaceAll("-", " ")}</p>
                  <p className="text-sm text-white/60">
                    Stake GH₵{Number(g.stake || 0).toFixed(2)} • {g.result || g.status}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
