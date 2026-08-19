"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type LuckyDrawWin = {
  id: string;
  title: string;
  prize_amount: number;
  prize_type: string | null;
  prize_description: string | null;
  prize_image: string | null;
  prize_value: number | null;
  draw_at: string | null;
  created_at: string;
};

export default function WinnersPage() {
  const [wins, setWins] = useState<LuckyDrawWin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadWins() {
      setLoading(true);
      setError("");

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setLoading(false);
        setError("Please log in to view your wins.");
        return;
      }

      const { data, error: winsError } = await supabase
        .from("lucky_draws")
        .select(`
          id,
          title,
          prize_amount,
          prize_type,
          prize_description,
          prize_image,
          prize_value,
          draw_at,
          created_at
        `)
        .eq("winner_user_id", user.id)
        .eq("status", "completed")
        .order("draw_at", { ascending: false });

      if (winsError) {
        console.error("LOAD WINS ERROR:", winsError);
        setError("Could not load your wins.");
      } else {
        setWins((data || []) as LuckyDrawWin[]);
      }

      setLoading(false);
    }

    loadWins();
  }, []);

  function formatMoney(amount: number) {
    return `GH₵${Number(amount || 0).toLocaleString()}`;
  }

  function formatDate(date: string | null) {
    if (!date) return "Recently";

    return new Date(date).toLocaleDateString("en-GH", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  return (
    <main className="min-h-screen bg-black px-4 py-8 text-white sm:px-6 sm:py-12">
      <div className="mx-auto max-w-5xl">
        <div className="rounded-3xl border border-pink-500/20 bg-white/5 p-6 sm:p-8">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-pink-400">
              Fortuna Play
            </p>

            <h1 className="mt-2 text-3xl font-black sm:text-4xl">
              My Wins 🏆
            </h1>

            <p className="mt-3 text-white/60">
              Your Lucky Draw prizes and winnings appear here.
            </p>
          </div>

          {loading && (
            <div className="py-16 text-center text-white/60">
              Loading your wins...
            </div>
          )}

          {!loading && error && (
            <div className="mt-8 rounded-2xl border border-red-500/30 bg-red-500/10 p-5 text-center text-red-300">
              {error}
            </div>
          )}

          {!loading && !error && wins.length === 0 && (
            <div className="mt-8 rounded-2xl border border-white/10 bg-black/30 p-10 text-center">
              <div className="text-5xl">🏆</div>

              <h2 className="mt-4 text-xl font-bold">
                No wins yet
              </h2>

              <p className="mt-2 text-white/50">
                When you win a Lucky Draw, your prize will appear here.
              </p>
            </div>
          )}

          {!loading && !error && wins.length > 0 && (
            <div className="mt-8 grid gap-5 md:grid-cols-2">
              {wins.map((win) => {
                const prizeType = win.prize_type || "cash";

                const isCashBased =
                  prizeType === "cash" || prizeType === "rent";

                return (
                  <div
                    key={win.id}
                    className="overflow-hidden rounded-3xl border border-white/10 bg-black/40"
                  >
                    {!isCashBased && win.prize_image && (
                      <div className="aspect-[16/10] w-full overflow-hidden bg-white/5">
                        <img
                          src={win.prize_image}
                          alt={win.title}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    )}

                    <div className="p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-xs font-bold uppercase tracking-wider text-pink-400">
                            🏆 Lucky Draw Winner
                          </p>

                          <h2 className="mt-2 text-2xl font-black">
                            {isCashBased
                              ? prizeType === "rent"
                                ? `${formatMoney(win.prize_amount)} Rent Support`
                                : `${formatMoney(win.prize_amount)} Cash Prize`
                              : win.title}
                          </h2>
                        </div>

                        <span className="rounded-full bg-pink-500/15 px-3 py-1 text-xs font-bold text-pink-300">
                          WON
                        </span>
                      </div>

                      {!isCashBased && win.prize_description && (
                        <p className="mt-4 text-sm leading-6 text-white/60">
                          {win.prize_description}
                        </p>
                      )}

                      {isCashBased ? (
                        <div className="mt-5 rounded-2xl border border-green-500/20 bg-green-500/10 p-4">
                          <p className="font-bold text-green-300">
                            ✓ Paid to your Fortuna wallet
                          </p>

                          <p className="mt-1 text-sm text-white/50">
                            This prize has been credited to your wallet balance.
                          </p>
                        </div>
                      ) : (
                        <div className="mt-5 rounded-2xl border border-yellow-500/20 bg-yellow-500/10 p-4">
                          <p className="font-bold text-yellow-300">
                            🎁 Prize awaiting delivery or collection
                          </p>

                          <p className="mt-1 text-sm text-white/50">
                            Fortuna Play will contact you regarding your prize.
                          </p>
                        </div>
                      )}

                      <p className="mt-5 text-xs text-white/40">
                        Won on {formatDate(win.draw_at || win.created_at)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
