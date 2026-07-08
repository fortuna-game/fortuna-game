"use client";

import AdminNav from "@/components/AdminNav";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Game = {
  id: string;
  username: string;
  first_name: string;
  phone: string;
  game_slug: string;
  stake: number;
  payout: number;
  score: number;
  result: string;
  status: string;
  profit: number;
  created_at: string;
};

type Summary = {
  totalGames: number;
  completedGames: number;
  wins: number;
  losses: number;
  totalStakes: number;
  totalPayouts: number;
  totalProfit: number;
};

export default function AdminGamesPage() {
  const [games, setGames] = useState<Game[]>([]);

  const [summary, setSummary] = useState<Summary>({
    totalGames: 0,
    completedGames: 0,
    wins: 0,
    losses: 0,
    totalStakes: 0,
    totalPayouts: 0,
    totalProfit: 0,
  });

  const [message, setMessage] = useState("Loading games...");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    async function loadGames() {
      const { data: auth } = await supabase.auth.getSession();

      const token = auth.session?.access_token;

      if (!token) {
        window.location.href = "/admin/login";
        return;
      }

      const response = await fetch("/api/admin/games", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error || "Could not load games.");
        return;
      }

      setGames(data.games || []);
      setSummary(data.summary);
      setMessage("");
    }

    void loadGames();
  }, []);

  const visibleGames = useMemo(() => {
    if (filter === "all") return games;

    return games.filter((game) => game.result === filter);
  }, [games, filter]);

  return (
    <main className="min-h-screen bg-black px-6 py-10 text-white">
      <div className="mx-auto max-w-7xl">
        <AdminNav />

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black text-pink-500">
              Game Management
            </h1>

            <p className="mt-2 text-white/60">
              Monitor games, stakes, payouts and platform profit.
            </p>
          </div>

          <Link
            href="/admin"
            className="rounded-xl bg-pink-500 px-5 py-3 font-black text-black"
          >
            Back to Admin
          </Link>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <p className="text-sm text-white/60">
              Total Games
            </p>

            <h2 className="mt-2 text-3xl font-black">
              {summary.totalGames}
            </h2>
          </div>

          <div className="rounded-3xl border border-blue-400/20 bg-blue-500/10 p-6">
            <p className="text-sm text-white/60">
              Total Stakes
            </p>

            <h2 className="mt-2 text-3xl font-black text-blue-300">
              GH₵{summary.totalStakes.toFixed(2)}
            </h2>
          </div>

          <div className="rounded-3xl border border-red-400/20 bg-red-500/10 p-6">
            <p className="text-sm text-white/60">
              Total Payouts
            </p>

            <h2 className="mt-2 text-3xl font-black text-red-300">
              GH₵{summary.totalPayouts.toFixed(2)}
            </h2>
          </div>

          <div className="rounded-3xl border border-pink-400/20 bg-pink-500/10 p-6">
            <p className="text-sm text-white/60">
              Game Profit
            </p>

            <h2
              className={`mt-2 text-3xl font-black ${
                summary.totalProfit >= 0
                  ? "text-green-300"
                  : "text-red-300"
              }`}
            >
              GH₵{summary.totalProfit.toFixed(2)}
            </h2>
          </div>

        </div>

        <div className="mt-6 flex flex-wrap gap-2">

          {["all", "won", "lost", "pending"].map((item) => (
            <button
              key={item}
              onClick={() => setFilter(item)}
              className={`rounded-full px-5 py-2 font-bold ${
                filter === item
                  ? "bg-pink-500 text-black"
                  : "bg-white/10 text-white"
              }`}
            >
              {item.toUpperCase()}
            </button>
          ))}

        </div>

        {message && (
          <div className="mt-8 rounded-3xl border border-pink-500/20 bg-white/5 p-6">
            {message}
          </div>
        )}

        {!message && (
          <div className="mt-8 overflow-x-auto rounded-3xl border border-pink-500/20">

            <table className="w-full min-w-[1300px] text-left">

              <thead className="bg-pink-500 text-black">
                <tr>
                  <th className="p-4">Player</th>
                  <th className="p-4">Game</th>
                  <th className="p-4">Stake</th>
                  <th className="p-4">Score</th>
                  <th className="p-4">Result</th>
                  <th className="p-4">Payout</th>
                  <th className="p-4">Profit</th>
                  <th className="p-4">Date</th>
                </tr>
              </thead>

              <tbody>

                {visibleGames.map((game) => (

                  <tr
                    key={game.id}
                    className="border-t border-white/10"
                  >

                    <td className="p-4">
                      <p className="font-black">
                        @{game.username}
                      </p>

                      <p className="text-sm text-white/50">
                        {game.first_name}
                      </p>
                    </td>

                    <td className="p-4 font-bold capitalize">
                      {game.game_slug?.replaceAll("-", " ")}
                    </td>

                    <td className="p-4">
                      GH₵{game.stake.toFixed(2)}
                    </td>

                    <td className="p-4">
                      {game.score}
                    </td>

                    <td className="p-4">
                      <span
                        className={
                          game.result === "won"
                            ? "font-black text-green-300"
                            : game.result === "lost"
                            ? "font-black text-red-300"
                            : "font-black text-pink-400"
                        }
                      >
                        {game.result.toUpperCase()}
                      </span>
                    </td>

                    <td className="p-4">
                      GH₵{game.payout.toFixed(2)}
                    </td>

                    <td
                      className={`p-4 font-black ${
                        game.profit >= 0
                          ? "text-green-300"
                          : "text-red-300"
                      }`}
                    >
                      GH₵{game.profit.toFixed(2)}
                    </td>

                    <td className="p-4">
                      {game.created_at
                        ? new Date(game.created_at).toLocaleString()
                        : "-"}
                    </td>

                  </tr>

                ))}

                {visibleGames.length === 0 && (
                  <tr>
                    <td
                      colSpan={8}
                      className="p-6 text-white/60"
                    >
                      No games found.
                    </td>
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
