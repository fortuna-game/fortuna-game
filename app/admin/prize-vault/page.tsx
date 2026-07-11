"use client";

import AdminNav from "@/components/AdminNav";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Totals = {
  totalPlays: number;
  totalRevenue: number;
  totalWinners: number;
  tryAgainCount: number;
  pendingFulfilmentCount: number;
  totalPrizeValueWon: number;
};

type Prize = {
  id: string;
  name: string;
  emoji: string | null;
  prize_type: string;
  prize_value: number;
  remaining_stock: number;
  win_weight: number;
  is_active: boolean;
};

type Play = {
  id: string;
  user_id: string;
  prize_id: string | null;
  entry_fee: number;
  result: string;
  prize_name: string | null;
  prize_value: number;
  created_at: string;
  username: string;
  phone: string;
};

export default function AdminPrizeVaultPage() {
  const [totals, setTotals] = useState<Totals | null>(null);
  const [prizes, setPrizes] = useState<Prize[]>([]);
  const [plays, setPlays] = useState<Play[]>([]);
  const [loading, setLoading] = useState(true);
  const [denied, setDenied] = useState(false);
  const [message, setMessage] = useState("");

  async function getToken() {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token || "";
  }

  async function loadData() {
    const token = await getToken();

    if (!token) {
      setDenied(true);
      setLoading(false);
      return;
    }

    const res = await fetch("/api/admin/prize-vault", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();

    if (!res.ok) {
      setMessage(data.error || "Could not load Prize Vault.");
      setDenied(res.status === 403);
      setLoading(false);
      return;
    }

    setTotals(data.totals || null);
    setPrizes(data.prizes || []);
    setPlays(data.plays || []);
    setDenied(false);
    setLoading(false);
  }

  useEffect(() => {
    void loadData();

    const timer = setInterval(() => {
      void loadData();
    }, 10000);

    return () => clearInterval(timer);
  }, []);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black text-white">
        Loading Prize Vault...
      </main>
    );
  }

  if (denied) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black px-6 text-white">
        <div className="rounded-3xl border border-red-400/20 bg-red-500/10 p-8 text-center">
          <h1 className="text-3xl font-black text-red-300">
            Access Denied
          </h1>

          <p className="mt-3 text-white/60">
            Please login through /admin/login again.
          </p>
        </div>
      </main>
    );
  }

  const cards = totals
    ? [
        ["Total Plays", totals.totalPlays],
        ["Game Revenue", `GH₵${Number(totals.totalRevenue).toFixed(2)}`],
        ["Total Winners", totals.totalWinners],
        ["Try Again Results", totals.tryAgainCount],
        ["Pending Fulfilment", totals.pendingFulfilmentCount],
        [
          "Prize Value Won",
          `GH₵${Number(totals.totalPrizeValueWon).toFixed(2)}`,
        ],
      ]
    : [];

  return (
    <main className="min-h-screen bg-black px-6 py-10 text-white">
      <div className="mx-auto max-w-7xl">
        <AdminNav />

        <div>
          <h1 className="text-4xl font-black text-pink-500">
            Admin Prize Vault
          </h1>

          <p className="mt-2 text-white/60">
            Monitor Prize Vault revenue, winners and prize inventory.
          </p>
        </div>

        {message && (
          <p className="mt-5 rounded-xl bg-red-500/10 p-4 text-red-300">
            {message}
          </p>
        )}

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map(([label, value]) => (
            <div
              key={String(label)}
              className="rounded-3xl border border-pink-500/20 bg-white/5 p-6"
            >
              <p className="text-sm text-white/50">{label}</p>

              <h2 className="mt-2 text-3xl font-black">
                {value}
              </h2>
            </div>
          ))}
        </div>

        <section className="mt-10">
          <h2 className="text-2xl font-black text-pink-500">
            Prize Inventory
          </h2>

          <div className="mt-5 overflow-x-auto rounded-3xl border border-pink-500/20">
            <table className="w-full min-w-[900px] text-left">
              <thead className="bg-pink-500 text-black">
                <tr>
                  <th className="p-4">Prize</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Value</th>
                  <th className="p-4">Remaining Stock</th>
                  <th className="p-4">Win Weight</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>

              <tbody>
                {prizes.map((prize) => (
                  <tr
                    key={prize.id}
                    className="border-t border-white/10"
                  >
                    <td className="p-4 font-bold">
                      {prize.emoji} {prize.name}
                    </td>

                    <td className="p-4">
                      {String(prize.prize_type).replaceAll("_", " ")}
                    </td>

                    <td className="p-4">
                      GH₵{Number(prize.prize_value || 0).toFixed(2)}
                    </td>

                    <td className="p-4 font-black">
                      {prize.remaining_stock}
                    </td>

                    <td className="p-4">
                      {prize.win_weight}
                    </td>

                    <td className="p-4">
                      {prize.is_active ? "Active" : "Inactive"}
                    </td>
                  </tr>
                ))}

                {prizes.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="p-8 text-center text-white/50"
                    >
                      No prizes found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-2xl font-black text-pink-500">
            Recent Prize Vault Plays
          </h2>

          <div className="mt-5 overflow-x-auto rounded-3xl border border-pink-500/20">
            <table className="w-full min-w-[1100px] text-left">
              <thead className="bg-pink-500 text-black">
                <tr>
                  <th className="p-4">Player</th>
                  <th className="p-4">Phone</th>
                  <th className="p-4">Entry Fee</th>
                  <th className="p-4">Result</th>
                  <th className="p-4">Prize</th>
                  <th className="p-4">Prize Value</th>
                  <th className="p-4">Date</th>
                </tr>
              </thead>

              <tbody>
                {plays.map((play) => (
                  <tr
                    key={play.id}
                    className="border-t border-white/10"
                  >
                    <td className="p-4 font-bold">
                      @{play.username}
                    </td>

                    <td className="p-4">
                      {play.phone || "Not available"}
                    </td>

                    <td className="p-4">
                      GH₵{Number(play.entry_fee || 0).toFixed(2)}
                    </td>

                    <td
                      className={
                        play.result === "won"
                          ? "p-4 font-black text-green-300"
                          : "p-4 font-black text-white/60"
                      }
                    >
                      {String(play.result).replaceAll("_", " ")}
                    </td>

                    <td className="p-4">
                      {play.prize_name || "No Prize"}
                    </td>

                    <td className="p-4">
                      GH₵{Number(play.prize_value || 0).toFixed(2)}
                    </td>

                    <td className="p-4">
                      {new Date(play.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}

                {plays.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="p-8 text-center text-white/50"
                    >
                      No Prize Vault plays yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
