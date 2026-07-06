"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type GameResult = {
  id: string;
  game_slug: string;
  score: number;
  prize_amount: number;
  won: boolean;
  created_at: string;
};

export default function GameHistoryPage() {
  const [results, setResults] = useState<GameResult[]>([]);

  async function loadResults() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("game_results")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    setResults(data || []);
  }

  useEffect(() => {
    void loadResults();

    const timer = setInterval(() => {
      void loadResults();
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  return (
    <main className="min-h-screen bg-black px-6 py-10 text-white">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-4xl font-black text-yellow-400">Game History</h1>
        <p className="mt-2 text-white/60">Your played games, scores, wins and losses.</p>

        <div className="mt-8 space-y-4">
          {results.map((r) => (
            <div key={r.id} className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xl font-black capitalize">
                    {r.game_slug.replaceAll("-", " ")}
                  </p>

                  <p className="mt-1 text-sm text-white/50">
                    Score: {r.score}
                  </p>

                  <p className="mt-1 text-xs text-white/40">
                    {new Date(r.created_at).toLocaleString()}
                  </p>
                </div>

                <div className="text-right">
                  <p className={r.won ? "text-2xl font-black text-green-400" : "text-2xl font-black text-red-300"}>
                    {r.won ? "Won" : "Lost"}
                  </p>

                  <p className="mt-1 text-sm text-white/50">
                    Prize: GH₵{Number(r.prize_amount || 0).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {results.length === 0 && (
            <p className="rounded-2xl border border-white/10 bg-white/5 p-6 text-white/60">
              No games played yet.
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
