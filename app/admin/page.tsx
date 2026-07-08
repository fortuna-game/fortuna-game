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
        <div className="rounded-3xl border border-pink-500/20 bg-white/5 p-8 text-center">
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
    ["Active Players 7 Days", data.activePlayers7Days],
    ["Top Game", data.topGame ? String(data.topGame.slug).replaceAll("-", " ") : "No games yet"],
  ];

  return (
    <main className="min-h-screen bg-black px-6 py-10 text-white">
      <div className="mx-auto max-w-7xl">
        <AdminNav />
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black text-pink-500">Fortuna Admin</h1>
            <p className="mt-2 text-white/60">Business overview and money flow dashboard.</p>
          </div>

        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map(([label, value]) => (
            <div key={label} className="rounded-3xl border border-pink-500/20 bg-white/5 p-6">
              <p className="text-sm text-white/50">{label}</p>
              <h2 className="mt-2 text-3xl font-black">{value}</h2>
            </div>
          ))}
        </div>

        <div className="mt-10 rounded-3xl border border-pink-500/20 bg-white/5 p-6">
          <h2 className="text-2xl font-black text-pink-500">Profit Overview</h2>
          <p className="mt-2 text-white/60">Today, 7 days, 30 days and all-time business movement.</p>

          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[900px] text-left">
              <thead className="bg-pink-500 text-black">
                <tr>
                  <th className="p-4">Period</th>
                  <th className="p-4">Deposits</th>
                  <th className="p-4">Withdrawals</th>
                  <th className="p-4">Games</th>
                  <th className="p-4">Stakes</th>
                  <th className="p-4">Payouts</th>
                  <th className="p-4">Game Profit</th>
                  <th className="p-4">Net Cash</th>
                </tr>
              </thead>
              <tbody>
                {(data.ranges || []).map((r: any) => (
                  <tr key={r.label} className="border-t border-white/10">
                    <td className="p-4 font-black">{r.label}</td>
                    <td className="p-4 text-green-300">GH₵{Number(r.deposits).toFixed(2)}</td>
                    <td className="p-4 text-red-300">GH₵{Number(r.withdrawals).toFixed(2)}</td>
                    <td className="p-4">{r.games}</td>
                    <td className="p-4">GH₵{Number(r.stakes).toFixed(2)}</td>
                    <td className="p-4">GH₵{Number(r.payouts).toFixed(2)}</td>
                    <td className={Number(r.gameProfit) >= 0 ? "p-4 font-black text-green-300" : "p-4 font-black text-red-300"}>
                      GH₵{Number(r.gameProfit).toFixed(2)}
                    </td>
                    <td className={Number(r.netCash) >= 0 ? "p-4 font-black text-green-300" : "p-4 font-black text-red-300"}>
                      GH₵{Number(r.netCash).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-2xl font-black text-pink-500">Recent Transactions</h2>
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
            <h2 className="text-2xl font-black text-pink-500">Recent Skill Games</h2>
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
