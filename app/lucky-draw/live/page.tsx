"use client";

import LiveTicketMachine from "@/components/lucky-draw/LiveTicketMachine";
import { useEffect, useState } from "react";
import Link from "next/link";

type Winner = {
  id: string;
  winner_position: number;
  selected_at: string;
  name: string;
};

type Draw = {
  id: string;
  title: string;
  prize_amount: number | null;
  prize_type: string | null;
  prize_description: string | null;
  prize_image: string | null;
  prize_value: number | null;
  status: string;
  winner_count: number;
  selection_started_at: string | null;
  participant_count: number;
  selected_winners: Winner[];
};

export default function LiveLuckyDrawPage() {
  const [draws, setDraws] = useState<Draw[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatedAt, setUpdatedAt] = useState("");

  async function loadResults() {
    try {
      const res = await fetch("/api/lucky-draw/results", {
        cache: "no-store",
      });

      const data = await res.json();

      if (res.ok) {
        setDraws(data.draws || []);
        setUpdatedAt(new Date().toLocaleTimeString());
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadResults();

    const interval = setInterval(() => {
      loadResults();
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <main className="min-h-screen bg-[#071A33] px-4 py-8 text-white sm:px-6 lg:px-4 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-[#FFD54A]">
              ● LIVE TRANSPARENT SELECTION
            </p>

            <h1 className="mt-2 text-3xl font-black sm:text-3xl sm:text-3xl sm:text-4xl lg:text-5xl">
              Lucky Draw Live
            </h1>

            <p className="mt-3 text-[#9AAAC1]">
              Winners appear automatically as they are securely selected.
            </p>
          </div>

        <LiveTicketMachine />

          <Link
            href="/lucky-draw"
            className="rounded-xl border border-[#38BDF8]/20 bg-[#0B2545] px-5 py-3 font-bold"
          >
            ← Lucky Draw
          </Link>
        </div>

        <div className="mb-6 rounded-2xl border border-green-400/20 bg-green-500/10 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3 gap-4">
            <div>
              <p className="font-black text-green-300">
                🟢 LIVE RESULTS
              </p>
              <p className="mt-1 text-sm text-[#9AAAC1]">
                This page refreshes automatically every 2 seconds.
              </p>
            </div>

            <p className="text-xs text-[#8295B0]">
              Updated: {updatedAt || "Loading..."}
            </p>
          </div>
        </div>

        {loading && (
          <div className="rounded-3xl border border-[#38BDF8]/15 bg-[#0B2545]/70 p-5 sm:p-7 lg:p-10 text-center text-[#9AAAC1]">
            Loading live Lucky Draw...
          </div>
        )}

        {!loading &&
          draws.map((draw) => {
            const selected =
              draw.selected_winners.length;

            const total =
              Number(draw.winner_count || 1);

            const selecting =
              draw.status === "selecting";

            const completed =
              draw.status === "completed";

            return (
              <section
                key={draw.id}
                className="mb-6 overflow-hidden rounded-3xl border border-[#38BDF8]/15 bg-[#0B2545]/70"
              >
                {draw.prize_image && (
                  <img
                    src={draw.prize_image}
                    alt={draw.title}
                    className="mx-auto h-56 w-full max-w-md rounded-2xl object-cover sm:h-64 lg:h-72"
                  />
                )}

                <div className="p-6 sm:p-5 sm:p-6 lg:p-8">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-bold text-[#FFD54A]">
                        LUCKY DRAW
                      </p>

                      <h2 className="mt-2 text-2xl font-black sm:text-3xl">
                        {draw.title}
                      </h2>

                      {draw.prize_description && (
                        <p className="mt-3 text-[#9AAAC1]">
                          {draw.prize_description}
                        </p>
                      )}
                    </div>

                    <div
                      className={`rounded-full px-4 py-2 text-sm font-black ${
                        selecting
                          ? "bg-yellow-400/15 text-yellow-300"
                          : completed
                          ? "bg-green-400/15 text-green-300"
                          : "bg-blue-400/15 text-blue-300"
                      }`}
                    >
                      {selecting
                        ? "🟡 SELECTION IN PROGRESS"
                        : completed
                        ? "🎉 DRAW COMPLETED"
                        : "🔵 WAITING FOR SELECTION"}
                    </div>
                  </div>

                  <div className="mt-6 grid gap-4 sm:grid-cols-3">
                    <div className="rounded-2xl border border-white/10 bg-[#071A33] p-4">
                      <p className="text-xs text-[#8295B0]">
                        Participants
                      </p>
                      <p className="mt-1 text-2xl font-black">
                        {draw.participant_count}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-[#071A33] p-4">
                      <p className="text-xs text-[#8295B0]">
                        Winners Selected
                      </p>
                      <p className="mt-1 text-2xl font-black">
                        {selected} / {total}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-[#071A33] p-4">
                      <p className="text-xs text-[#8295B0]">
                        Selection Started
                      </p>
                      <p className="mt-1 text-sm font-bold">
                        {draw.selection_started_at
                          ? new Date(
                              draw.selection_started_at
                            ).toLocaleString()
                          : "Not started"}
                      </p>
                    </div>
                  </div>

                  {selecting && (
                    <div className="mt-6 rounded-2xl border border-yellow-400/30 bg-yellow-400/10 p-5 text-center">
                      <div className="text-3xl">🎰</div>
                      <p className="mt-2 font-black text-yellow-300">
                        Secure winner selection is in progress...
                      </p>
                      <p className="mt-1 text-sm text-[#9AAAC1]">
                        The next winner will appear here automatically.
                      </p>
                    </div>
                  )}

                  <div className="mt-6">
                    <h3 className="text-xl font-black">
                      Selected Winners
                    </h3>

                    {draw.selected_winners.length === 0 ? (
                      <div className="mt-4 rounded-2xl border border-white/10 bg-[#071A33] p-5 text-[#9AAAC1]">
                        No winner has been selected yet.
                      </div>
                    ) : (
                      <div className="mt-4 space-y-3">
                        {draw.selected_winners.map(
                          (winner) => (
                            <div
                              key={winner.id}
                              className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-yellow-400/20 bg-yellow-400/10 p-5"
                            >
                              <div>
                                <p className="text-xs font-bold text-[#FFD54A]">
                                  🏆 WINNER {winner.winner_position}
                                </p>

                                <h4 className="mt-1 text-xl font-black">
                                  {winner.name}
                                </h4>
                              </div>

                              <div className="text-right">
                                <p className="text-xs text-[#8295B0]">
                                  Selected
                                </p>
                                <p className="mt-1 text-sm font-bold">
                                  {new Date(
                                    winner.selected_at
                                  ).toLocaleString()}
                                </p>
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    )}
                  </div>

                  {completed && (
                    <div className="mt-6 rounded-2xl border border-green-400/30 bg-green-500/10 p-6 text-center">
                      <p className="text-2xl font-black text-green-300">
                        🎉 DRAW COMPLETED
                      </p>
                      <p className="mt-2 text-[#9AAAC1]">
                        All {total} configured winner
                        {total === 1 ? "" : "s"} have been selected.
                      </p>
                    </div>
                  )}
                </div>
              </section>
            );
          })}

        {!loading && draws.length === 0 && (
          <div className="rounded-3xl border border-[#38BDF8]/15 bg-[#0B2545]/70 p-5 sm:p-7 lg:p-10 text-center text-[#9AAAC1]">
            There are currently no Lucky Draw results available.
          </div>
        )}
      </div>
    </main>
  );
}
