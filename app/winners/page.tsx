"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Winner = {
  id?: string;
  winner_username?: string | null;
  username?: string | null;
  title?: string | null;
  prize_title?: string | null;
  prize_amount?: number | null;
  prize_value?: number | null;
  prize_type?: string | null;
  prize_description?: string | null;
  created_at?: string | null;
  completed_at?: string | null;
  selected_at?: string | null;
};

export default function WinnersPage() {
  const [winners, setWinners] = useState<Winner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadWinners() {
      try {
        const res = await fetch("/api/winners", { cache: "no-store" });
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data?.error || "Could not load winners.");
        }

        setWinners(Array.isArray(data) ? data : data.winners || []);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Could not load winners."
        );
      } finally {
        setLoading(false);
      }
    }

    void loadWinners();
  }, []);

  return (
    <main className="min-h-screen bg-[#071A33] px-4 py-10 text-white sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="text-center">
          <p className="text-xs font-black uppercase tracking-[0.3em] text-[#FFD54A]">
            🏆 PUBLIC WINNERS
          </p>

          <h1 className="mt-3 text-4xl font-black sm:text-5xl">
            Fortuna Play Winners
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-[#9AAAC1]">
            See players who have already won Fortuna Play Lucky Draw prizes.
          </p>
        </div>

        {loading && (
          <div className="mt-10 rounded-3xl border border-[#2A5688] bg-[#0B2545]/70 p-8 text-center text-[#9AAAC1]">
            Loading winners...
          </div>
        )}

        {error && !loading && (
          <div className="mt-10 rounded-3xl border border-red-400/30 bg-red-500/10 p-6 text-center text-red-300">
            {error}
          </div>
        )}

        {!loading && !error && winners.length === 0 && (
          <div className="mt-10 rounded-3xl border border-[#2A5688] bg-[#0B2545]/70 p-8 text-center">
            <div className="text-5xl">🏆</div>
            <h2 className="mt-4 text-2xl font-black">
              No winners announced yet
            </h2>
            <p className="mt-2 text-[#9AAAC1]">
              Check back when the next Lucky Draw is completed.
            </p>
          </div>
        )}

        {!loading && !error && winners.length > 0 && (
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {winners.map((winner, index) => {
              const name =
                winner.winner_username ||
                winner.username ||
                "Winner";

              const prize =
                winner.title ||
                winner.prize_title ||
                winner.prize_description ||
                "Prize";

              const value =
                winner.prize_value ??
                winner.prize_amount ??
                null;

              return (
                <div
                  key={winner.id || `${name}-${index}`}
                  className="rounded-3xl border border-[#F5B700]/30 bg-gradient-to-br from-[#0B2545] to-[#071A33] p-6 shadow-xl"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="rounded-full bg-[#FFD54A] px-3 py-1 text-xs font-black text-black">
                      🏆 WINNER
                    </span>

                    <span className="text-3xl">🎉</span>
                  </div>

                  <h2 className="mt-5 text-2xl font-black text-white">
                    @{name}
                  </h2>

                  <p className="mt-3 text-sm uppercase tracking-wider text-[#66A7FF]">
                    Prize Won
                  </p>

                  <p className="mt-1 text-xl font-black text-[#FFD54A]">
                    {prize}
                  </p>

                  {value !== null && (
                    <p className="mt-2 text-lg font-bold text-green-300">
                      GH₵{Number(value).toFixed(2)}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Link
            href="/lucky-draw/live"
            className="rounded-full bg-[#FFD54A] px-6 py-3 font-black text-black"
          >
            🔴 Watch Live Draw
          </Link>

          <Link
            href="/"
            className="rounded-full border border-[#4D94F5] px-6 py-3 font-black"
          >
            ← Back Home
          </Link>
        </div>
      </div>
    </main>
  );
}
