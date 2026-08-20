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
  const [replayDrawId, setReplayDrawId] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setReplayDrawId(params.get("draw"));
  }, []);

  async function loadResults() {
    try {
      const endpoint = replayDrawId
        ? `/api/lucky-draw/live?draw=${encodeURIComponent(replayDrawId)}`
        : "/api/lucky-draw/live";

      const res = await fetch(endpoint, {
        cache: "no-store",
      });

      const data = await res.json();

      if (res.ok && data?.draw) {
        const draw = data.draw;

        const isAllowed =
          replayDrawId ||
          draw.status === "open" ||
          draw.status === "selecting";

        if (!isAllowed) {
          setDraws([]);
        } else {
          setDraws([
            {
              id: draw.id,
              title: draw.title,
              prize_amount: draw.prize_amount ?? null,
              prize_type: draw.prize_type ?? null,
              prize_description: draw.prize_description ?? null,
              prize_image: draw.prize_image ?? null,
              prize_value: draw.prize_value ?? null,
              status: draw.status,
              winner_count: Number(draw.winner_count || 1),
              selection_started_at: draw.selection_started_at ?? null,
              participant_count: Number(draw.participant_count || 0),
              selected_winners: (data.winners || []).map(
                (winner: {
                  id: string;
                  winner_position: number;
                  selected_at: string;
                  username?: string | null;
                }) => ({
                  id: winner.id,
                  winner_position: winner.winner_position,
                  selected_at: winner.selected_at,
                  name: winner.username || "Winner",
                })
              ),
            },
          ]);
        }
      } else {
        setDraws([]);
      }

      setUpdatedAt(new Date().toLocaleTimeString());
    } catch (error) {
      console.error(error);
      setDraws([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (replayDrawId === null) {
      const params = new URLSearchParams(window.location.search);
      if (params.has("draw")) {
        return;
      }
    }

    loadResults();

    const interval = setInterval(() => {
      loadResults();
    }, 2000);

    return () => clearInterval(interval);
  }, [replayDrawId]);

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

        {!loading && (replayDrawId || draws.length > 0) && (
          <LiveTicketMachine drawId={replayDrawId || undefined} />
        )}

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
          <section className="mx-auto max-w-3xl rounded-[32px] border border-[#F5B700]/30 bg-gradient-to-br from-[#0B2545] via-[#071A33] to-[#111D3A] p-6 text-center shadow-2xl sm:p-10">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-[#F5B700]/30 bg-[#F5B700]/10 text-4xl">
              🎟️
            </div>

            <p className="mt-5 text-xs font-black uppercase tracking-[0.3em] text-[#FFD54A]">
              NO LIVE DRAW
            </p>

            <h2 className="mt-3 text-3xl font-black sm:text-4xl">
              There is no active draw right now
            </h2>

            <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-[#9AAAC1] sm:text-base">
              The next Lucky Draw will appear here when it goes live.
              You can watch a previous recorded draw or check the public winners list while you wait.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <a
                href="/lucky-draw/replays"
                className="rounded-2xl border border-[#4D94F5]/40 bg-[#4D94F5]/10 p-5 text-center transition hover:border-[#4D94F5] hover:bg-[#4D94F5]/20"
              >
                <div className="text-3xl">🎬</div>
                <p className="mt-3 font-black text-white">
                  Watch Previous
                </p>
                <p className="mt-1 text-xs text-[#8295B0]">
                  Replay completed draws
                </p>
              </a>

              <a
                href="/winners"
                className="rounded-2xl border border-[#F5B700]/40 bg-[#F5B700]/10 p-5 text-center transition hover:border-[#F5B700] hover:bg-[#F5B700]/20"
              >
                <div className="text-3xl">🏆</div>
                <p className="mt-3 font-black text-white">
                  View Winners
                </p>
                <p className="mt-1 text-xs text-[#8295B0]">
                  See public winners
                </p>
              </a>

              <a
                href="/"
                className="rounded-2xl border border-white/10 bg-white/5 p-5 text-center transition hover:border-white/30 hover:bg-white/10"
              >
                <div className="text-3xl">🏠</div>
                <p className="mt-3 font-black text-white">
                  Come Back Later
                </p>
                <p className="mt-1 text-xs text-[#8295B0]">
                  Return when a draw is live
                </p>
              </a>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
