"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Draw = {
  id: string;
  title: string;
  prize_amount?: number | null;
  prize_value?: number | null;
  prize_description?: string | null;
  prize_image?: string | null;
  status: string;
  created_at?: string | null;
};

export default function DrawReplaysPage() {
  const [draws, setDraws] = useState<Draw[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/lucky-draw/replays", {
          cache: "no-store",
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data?.error || "Could not load previous draws.");
        }

        setDraws(Array.isArray(data?.draws) ? data.draws : []);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Could not load previous draws."
        );
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, []);

  return (
    <main className="min-h-screen bg-[#071A33] px-4 py-10 text-white sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="text-center">
          <p className="text-xs font-black uppercase tracking-[0.3em] text-[#FFD54A]">
            🎬 DRAW HISTORY
          </p>

          <h1 className="mt-3 text-4xl font-black sm:text-5xl">
            Previous Winner Selections
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-[#9AAAC1]">
            Watch real completed Lucky Draw winner selections and their recorded results.
          </p>
        </div>

        {loading && (
          <div className="mt-10 rounded-3xl border border-[#2A5688] bg-[#0B2545]/70 p-8 text-center">
            Loading previous draws...
          </div>
        )}

        {error && !loading && (
          <div className="mt-10 rounded-3xl border border-red-400/30 bg-red-500/10 p-6 text-center text-red-300">
            {error}
          </div>
        )}

        {!loading && !error && draws.length === 0 && (
          <div className="mt-10 rounded-3xl border border-[#2A5688] bg-[#0B2545]/70 p-8 text-center">
            <div className="text-5xl">🏆</div>
            <h2 className="mt-4 text-2xl font-black">
              No previous winner selections yet
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-sm text-[#9AAAC1]">
              Real winner selections will appear here after a Lucky Draw
              closes and a winner is selected.
            </p>

            <Link
              href="/lucky-draw/demo"
              className="mt-6 inline-block rounded-xl bg-[#FFD54A] px-6 py-3 font-black text-black"
            >
              🎬 Watch Demo
            </Link>
          </div>
        )}

        {!loading && !error && draws.length > 0 && (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {draws.map((draw, index) => {
              const prize =
                draw.prize_value ?? draw.prize_amount ?? null;

              return (
                <article
                  key={draw.id}
                  className="overflow-hidden rounded-3xl border border-[#32659D] bg-gradient-to-br from-[#0B2545] to-[#071A33] shadow-2xl"
                >
                  {draw.prize_image && (
                    <img
                      src={draw.prize_image}
                      alt={draw.title}
                      className="h-44 w-full object-cover"
                    />
                  )}

                  <div className="p-5">
                    <div className="flex items-center justify-between gap-3">
                      <span className="rounded-full bg-green-500/15 px-3 py-1 text-xs font-black text-green-300">
                        COMPLETED
                      </span>

                      <span className="text-xs font-bold text-[#8295B0]">
                        Winner Selection
                      </span>
                    </div>

                    <h2 className="mt-4 text-2xl font-black">
                      {draw.title}
                    </h2>

                    {prize != null && (
                      <p className="mt-2 text-lg font-black text-[#FFD54A]">
                        GH₵{Number(prize).toFixed(2)}
                      </p>
                    )}

                    {draw.created_at && (
                      <p className="mt-2 text-xs text-[#7185A3]">
                        {new Date(draw.created_at).toLocaleString()}
                      </p>
                    )}

                    <Link
                      href={`/lucky-draw/live?replay=1&draw=${draw.id}`}
                      className="mt-5 block rounded-xl bg-[#FFD54A] px-5 py-3 text-center font-black text-black transition hover:bg-yellow-300"
                    >
                      ▶ Watch Replay
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        <div className="mt-10 flex justify-center">
          <Link
            href="/lucky-draw/live"
            className="rounded-full border border-blue-500 px-6 py-3 font-black"
          >
            🔴 Back to Live Draw
          </Link>
        </div>
      </div>
    </main>
  );
}
