"use client";

import { useEffect, useState } from "react";

type LuckyDrawResult = {
  id: string;
  title: string;
  prize_amount: number;
  prize_type: string | null;
  prize_description: string | null;
  prize_image: string | null;
  prize_value: number | null;
  draw_at: string | null;
  created_at: string;
  winner_username: string;
};

export default function WinnersPage() {
  const [results, setResults] = useState<LuckyDrawResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadResults() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/winners");

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error || "Could not load Lucky Draw results."
          );
        }

        setResults(data.results || []);
      } catch (error) {
        console.error("LOAD PUBLIC WINNERS ERROR:", error);

        setError(
          error instanceof Error
            ? error.message
            : "Could not load Lucky Draw results."
        );
      } finally {
        setLoading(false);
      }
    }

    loadResults();
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

  function getPrizeName(result: LuckyDrawResult) {
    const prizeType = result.prize_type || "cash";

    if (prizeType === "cash") {
      return `${formatMoney(result.prize_amount)} Cash Prize`;
    }

    if (prizeType === "rent") {
      return `${formatMoney(result.prize_amount)} Rent Support`;
    }

    return result.title;
  }

  return (
    <main className="min-h-screen bg-black px-4 py-8 text-white sm:px-6 sm:py-12">
      <div className="mx-auto max-w-6xl">
        <div className="text-center">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-pink-400">
            Fortuna Play
          </p>

          <h1 className="mt-2 text-3xl font-black sm:text-5xl">
            Lucky Draw Winners 
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-white/60">
            Every completed Lucky Draw and winner is published here
            to promote transparency while protecting winner privacy.
          </p>
        </div>

        {loading && (
          <div className="py-20 text-center text-white/60">
            Loading Lucky Draw results...
          </div>
        )}

        {!loading && error && (
          <div className="mx-auto mt-10 max-w-xl rounded-2xl border border-red-500/30 bg-red-500/10 p-5 text-center text-red-300">
            {error}
          </div>
        )}

        {!loading && !error && results.length === 0 && (
          <div className="mx-auto mt-10 max-w-xl rounded-3xl border border-white/10 bg-white/5 p-10 text-center">
            <div className="text-5xl text-yellow-400">TROPHY</div>

            <h2 className="mt-4 text-xl font-bold">
              No completed draws yet
            </h2>

            <p className="mt-2 text-white/50">
              Completed Lucky Draw winners will automatically
              appear here.
            </p>
          </div>
        )}

        {!loading && !error && results.length > 0 && (
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {results.map((result) => {
              const prizeType = result.prize_type || "cash";

              const isCashBased =
                prizeType === "cash" || prizeType === "rent";

              return (
                <article
                  key={result.id}
                  className="overflow-hidden rounded-3xl border border-white/10 bg-white/5"
                >
                  {!isCashBased && result.prize_image && (
                    <div className="aspect-[16/10] w-full overflow-hidden bg-black/40">
                      <img
                        src={result.prize_image}
                        alt={result.title}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}

                  <div className="p-6">
                    <div className="flex items-center justify-between gap-3">
                      <span className="rounded-full bg-green-500/15 px-3 py-1 text-xs font-black text-green-300">
                        ✓ COMPLETED
                      </span>

                      <span className="text-sm text-white/40">
                        {formatDate(
                          result.draw_at || result.created_at
                        )}
                      </span>
                    </div>

                    <h2 className="mt-5 text-2xl font-black">
                      {getPrizeName(result)}
                    </h2>

                    {!isCashBased &&
                      result.prize_description && (
                        <p className="mt-3 text-sm leading-6 text-white/60">
                          {result.prize_description}
                        </p>
                      )}

                    <div className="mt-6 rounded-2xl border border-pink-500/20 bg-pink-500/10 p-4">
                      <p className="text-xs font-bold uppercase tracking-wider text-pink-300">
                        WINNER
                      </p>

                      <p className="mt-2 text-lg font-black">
                        @{result.winner_username}
                      </p>

                      <p className="mt-1 text-xs text-white/40">
                        Username partially hidden for privacy
                      </p>
                    </div>

                    {isCashBased ? (
                      <p className="mt-5 text-sm text-green-300">
                        ✓ Prize credited to winner&apos;s Fortuna wallet
                      </p>
                    ) : (
                      <p className="mt-5 text-sm text-yellow-300">
                        🎁 Physical prize delivery or collection in progress
                      </p>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
