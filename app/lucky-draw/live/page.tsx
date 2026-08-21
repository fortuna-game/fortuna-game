"use client";

import LiveTicketMachine from "@/components/lucky-draw/LiveTicketMachine";
import { useEffect, useState } from "react";
import Link from "next/link";

type LiveState = {
  ready: boolean;
  hasDraw: boolean;
  replayId: string | null;
  openDrawCount: number;
};

export default function LiveLuckyDrawPage() {
  const [state, setState] = useState<LiveState>({
    ready: false,
    hasDraw: false,
    replayId: null,
    openDrawCount: 0,
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const isReplay = params.get("replay") === "1";
    const replayId = isReplay ? params.get("draw") : null;

    async function checkDraw() {
      try {
        const endpoint = replayId
          ? `/api/lucky-draw/live?draw=${encodeURIComponent(replayId)}`
          : "/api/lucky-draw/live";

        const response = await fetch(endpoint, {
          cache: "no-store",
        });

        if (!response.ok) {
          setState({
            ready: true,
            hasDraw: false,
            replayId,
            openDrawCount: 0,
          });
          return;
        }

        const data = await response.json();

        setState({
          ready: true,
          hasDraw: Boolean(data?.draw),
          replayId,
          openDrawCount: Number(data?.open_draw_count || 0),
        });
      } catch {
        setState({
          ready: true,
          hasDraw: false,
          replayId,
          openDrawCount: 0,
        });
      }
    }

    void checkDraw();

    const refresh = window.setInterval(checkDraw, 3000);

    return () => window.clearInterval(refresh);
  }, []);

  return (
    <main className="min-h-screen bg-[#071A33] px-4 py-8 text-white sm:px-6 lg:px-10">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-[#FFD54A]">
              ● LIVE TRANSPARENT SELECTION
            </p>

            <h1 className="mt-2 text-3xl font-black sm:text-4xl lg:text-5xl">
              Lucky Draw Live
            </h1>

            <p className="mt-3 text-[#9AAAC1]">
              Winners appear automatically as they are securely selected.
            </p>
          </div>

          <Link
            href="/lucky-draw"
            className="rounded-xl border border-[#38BDF8]/20 bg-[#0B2545] px-5 py-3 font-bold"
          >
            ← Lucky Draw
          </Link>
        </div>

        {!state.ready && (
          <div className="rounded-3xl border border-[#38BDF8]/15 bg-[#0B2545]/70 p-8 text-center text-[#9AAAC1]">
            Checking for a live draw...
          </div>
        )}

        {state.ready && state.hasDraw && (
          <>
            <LiveTicketMachine
              drawId={state.replayId || undefined}
            />

            <div className="mt-6 rounded-2xl border border-green-400/20 bg-green-500/10 p-4 text-center">
              <p className="font-black text-green-300">
                🟢 {state.replayId ? "RECORDED DRAW REPLAY" : "LIVE RESULTS"}
              </p>

              <p className="mt-1 text-sm text-[#9AAAC1]">
                {state.replayId
                  ? "You are watching a recorded draw replay."
                  : "This page checks for an active draw automatically."}
              </p>
            </div>
          </>
        )}

        {state.ready && !state.hasDraw && (
          <section className="mx-auto max-w-3xl rounded-[32px] border border-[#F5B700]/30 bg-gradient-to-br from-[#0B2545] via-[#071A33] to-[#111D3A] p-6 text-center shadow-2xl sm:p-10">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-[#F5B700]/30 bg-[#F5B700]/10 text-4xl">
              🎟️
            </div>

            <p className="mt-5 text-xs font-black uppercase tracking-[0.3em] text-[#FFD54A]">
              NO LIVE WINNER SELECTION
            </p>

            <h2 className="mt-3 text-3xl font-black sm:text-4xl">
              There is no live winner selection right now
            </h2>

            <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-[#9AAAC1] sm:text-base">
              {state.openDrawCount > 0
                ? `${state.openDrawCount} Lucky Draw${
                    state.openDrawCount === 1 ? "" : "s"
                  } ${
                    state.openDrawCount === 1 ? "is" : "are"
                  } currently open for entries. The live winner selection will appear here after a draw closes and selection begins.`
                : "There are no Lucky Draws currently open for entries. The live winner selection will appear here when a draw closes and selection begins."}
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <Link
                href="/lucky-draw/replays"
                className="rounded-2xl border border-[#4D94F5]/40 bg-[#4D94F5]/10 p-5 transition hover:border-[#4D94F5] hover:bg-[#4D94F5]/20"
              >
                <div className="text-3xl">🎬</div>
                <p className="mt-3 font-black">Watch Previous</p>
                <p className="mt-1 text-xs text-[#8295B0]">
                  Replay completed draws
                </p>
              </Link>

              <Link
                href="/winners"
                className="rounded-2xl border border-[#F5B700]/40 bg-[#F5B700]/10 p-5 transition hover:border-[#F5B700] hover:bg-[#F5B700]/20"
              >
                <div className="text-3xl">🏆</div>
                <p className="mt-3 font-black">View Winners</p>
                <p className="mt-1 text-xs text-[#8295B0]">
                  See public winners
                </p>
              </Link>

              <Link
                href="/"
                className="rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:border-white/30 hover:bg-white/10"
              >
                <div className="text-3xl">🏠</div>
                <p className="mt-3 font-black">Come Back Later</p>
                <p className="mt-1 text-xs text-[#8295B0]">
                  Return when a draw is live
                </p>
              </Link>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
