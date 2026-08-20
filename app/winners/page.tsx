"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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

      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          setError("Please log in to view your wins.");
          return;
        }

        const res = await fetch("/api/my-wins", {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
          cache: "no-store",
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "Could not load your wins.");
          return;
        }

        setWins(Array.isArray(data.wins) ? data.wins : []);
      } catch {
        setError("Could not load your wins.");
      } finally {
        setLoading(false);
      }
    }

    void loadWins();
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

  function getPrizeText(win: LuckyDrawWin) {
    if (win.prize_type === "cash") {
      return formatMoney(win.prize_amount);
    }

    return win.title;
  }

  return (
    <main className="min-h-screen bg-[#071A33] px-4 py-8 text-white sm:px-6 sm:py-12">
      <div className="mx-auto max-w-5xl">
        <div className="rounded-3xl border border-[#2A5688] bg-[#0B2545]/70 p-6 sm:p-8">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#66A7FF]">
              Fortuna Play
            </p>

            <h1 className="mt-2 text-3xl font-black sm:text-4xl">
              My Wins 🏆
            </h1>

            <p className="mt-3 text-[#9AAAC1]">
              Your Lucky Draw wins are saved here, so you can still see them when you log in later.
            </p>
          </div>

          {loading && (
            <div className="py-16 text-center text-[#9AAAC1]">
              Loading your wins...
            </div>
          )}

          {!loading && error && (
            <div className="mt-8 rounded-2xl border border-red-500/30 bg-red-500/10 p-5 text-center text-red-300">
              {error}
            </div>
          )}

          {!loading && !error && wins.length === 0 && (
            <div className="mt-8 rounded-2xl border border-[#38BDF8]/15 bg-[#071A33]/20 p-8 text-center">
              <p className="text-lg font-bold">No wins yet</p>
              <p className="mt-2 text-sm text-[#8295B0]">
                When you win a Lucky Draw, your winning result will appear here.
              </p>
            </div>
          )}

          {!loading && wins.length > 0 && (
            <div className="mt-8 space-y-6">
              {wins.map((win) => (
                <div
                  key={win.id}
                  className="overflow-hidden rounded-3xl border border-green-400/30 bg-green-500/5"
                >
                  {win.prize_image && (
                    <img
                      src={win.prize_image}
                      alt={win.title}
                      className="h-56 w-full object-cover"
                    />
                  )}

                  <div className="p-6">
                    <div className="rounded-2xl border border-green-400/30 bg-green-500/10 p-5">
                      <p className="text-2xl font-black text-green-300">
                        🎉 Congratulations! You won {getPrizeText(win)}!
                      </p>

                      <p className="mt-3 leading-6 text-white/75">
                        You were selected as a winner of this Lucky Draw.
                        Your win is saved here, so you can return at any time
                        to view your result and continue with your prize claim.
                      </p>
                    </div>

                    <div className="mt-6 flex flex-col gap-5 sm:flex-row">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-[#8295B0]">
                          Winning Prize
                        </p>

                        <h2 className="mt-1 text-2xl font-black text-[#FFE08A]">
                          {getPrizeText(win)}
                        </h2>

                        {win.prize_description && (
                          <p className="mt-3 text-sm leading-6 text-[#9AAAC1]">
                            {win.prize_description}
                          </p>
                        )}

                        <p className="mt-4 text-sm text-[#7185A3]">
                          Draw completed: {formatDate(
                            win.draw_at || win.created_at
                          )}
                        </p>
                      </div>

                      {win.prize_type !== "cash" && (
                        <div className="sm:flex sm:items-end">
                          <Link
                            href={`/lucky-draw/claim-prize?drawId=${win.id}`}
                            className="inline-flex w-full items-center justify-center rounded-xl bg-[#3F82DD] px-6 py-4 text-center font-black text-white transition hover:bg-blue-400 sm:w-auto"
                          >
                            Submit Prize Details
                          </Link>
                        </div>
                      )}
                    </div>

                    {win.prize_type === "cash" && (
                      <div className="mt-6 rounded-xl border border-green-400/20 bg-green-500/10 p-4 text-sm text-green-200">
                        Your cash prize is handled according to the Lucky Draw
                        payout process.
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-8">
            <Link
              href="/lucky-draw"
              className="font-bold text-[#FFE08A]"
            >
              ← Back to Lucky Draws
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
