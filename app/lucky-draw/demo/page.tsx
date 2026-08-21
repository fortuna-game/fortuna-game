"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

const DEMO_TICKETS = [
  "LD-DEMO-001",
  "LD-DEMO-002",
  "LD-DEMO-003",
  "LD-DEMO-004",
  "LD-DEMO-005",
  "LD-DEMO-006",
  "LD-DEMO-007",
  "LD-DEMO-008",
  "LD-DEMO-009",
  "LD-DEMO-010",
  "LD-DEMO-011",
  "LD-DEMO-012",
];

const ROLL_SECONDS = 60;
const REVEAL_SECONDS = 25;
const TOTAL_SECONDS = ROLL_SECONDS + REVEAL_SECONDS;

const CARD_WIDTH = 160;
const GAP = 16;
const STEP = CARD_WIDTH + GAP;

export default function LuckyDrawDemoPage() {
  const [running, setRunning] = useState(false);
  const [revealing, setRevealing] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [position, setPosition] = useState(0);

  const startRef = useRef<number | null>(null);
  const frameRef = useRef<number | null>(null);

  const selectedWinner = useMemo(
    () =>
      DEMO_TICKETS[
        Math.floor(Math.random() * DEMO_TICKETS.length)
      ],
    [running]
  );

  const repeatedTickets = useMemo(
    () => [
      ...DEMO_TICKETS,
      ...DEMO_TICKETS,
      ...DEMO_TICKETS,
      ...DEMO_TICKETS,
      ...DEMO_TICKETS,
      ...DEMO_TICKETS,
    ],
    []
  );

  useEffect(() => {
    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, []);

  function startDemo() {
    if (running) return;

    setRunning(true);
    setRevealing(false);
    setWinner(null);
    setElapsed(0);
    setPosition(0);

    startRef.current = performance.now();

    const animate = (time: number) => {
      if (startRef.current == null) return;

      const seconds =
        (time - startRef.current) / 1000;

      const clamped =
        Math.min(seconds, TOTAL_SECONDS);

      setElapsed(clamped);

      if (seconds < ROLL_SECONDS) {
        setRevealing(false);

        /*
         * Slow readable movement.
         * The real draw still has the same 60-second
         * rolling phase, but this demo deliberately
         * moves gently enough for users to read tickets.
         */
        const pixelsPerSecond = 105;
        const loopWidth =
          DEMO_TICKETS.length * STEP;

        const nextPosition =
          (seconds * pixelsPerSecond) % loopWidth;

        setPosition(nextPosition);

        frameRef.current =
          requestAnimationFrame(animate);

        return;
      }

      if (seconds < TOTAL_SECONDS) {
        setRevealing(true);

        // Keep the selected ticket visible during
        // the 25-second reveal phase.
        setWinner(selectedWinner);

        frameRef.current =
          requestAnimationFrame(animate);

        return;
      }

      setRevealing(true);
      setWinner(selectedWinner);
      setElapsed(TOTAL_SECONDS);
      setRunning(false);
      frameRef.current = null;
    };

    frameRef.current =
      requestAnimationFrame(animate);
  }

  const remaining = Math.max(
    0,
    Math.ceil(
      (revealing
        ? TOTAL_SECONDS - elapsed
        : ROLL_SECONDS - elapsed)
    )
  );

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;

  const countdown =
    `${String(minutes).padStart(2, "0")}:${String(
      seconds
    ).padStart(2, "0")}`;

  return (
    <main className="min-h-screen bg-[#071A33] px-4 py-10 text-white sm:px-6">
      <div className="mx-auto max-w-5xl">
        <div className="text-center">
          <p className="text-xs font-black uppercase tracking-[0.3em] text-[#FFD54A]">
            🎬 DEMONSTRATION
          </p>

          <h1 className="mt-3 text-4xl font-black sm:text-5xl">
            How the Lucky Draw Works
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-[#9AAAC1]">
            This is a demonstration only. The tickets and winner shown here
            are fictional and are not connected to a real Lucky Draw.
          </p>
        </div>

        <section className="mt-10 overflow-hidden rounded-[32px] border border-[#32659D] bg-gradient-to-br from-[#0B2545] to-[#071A33] p-5 shadow-2xl sm:p-8">
          <div className="text-center">
            <span className="inline-flex rounded-full bg-[#FFD54A] px-4 py-2 text-xs font-black text-black">
              DEMO ONLY
            </span>

            <h2 className="mt-4 text-2xl font-black sm:text-3xl">
              Transparent Winner Selection
            </h2>

            <p className="mt-2 text-sm text-[#9AAAC1]">
              The demo follows the same 60-second selection and
              25-second winner reveal timing used by the real draw.
            </p>
          </div>

          <div className="mx-auto mt-8 w-full max-w-5xl overflow-hidden rounded-[28px] border border-[#32659D] bg-[#071A33] p-4 sm:p-5">
            <div className="mb-4 flex items-center justify-between gap-4">
              <span className="text-sm font-black text-[#9AAAC1]">
                {revealing
                  ? "WINNER REVEAL"
                  : running
                  ? "TICKET MACHINE RUNNING"
                  : winner
                  ? "DEMO COMPLETE"
                  : "READY FOR DEMO"}
              </span>

              <span className="font-black text-[#FFD54A]">
                {running ? countdown : winner ? "00:00" : "01:00"}
              </span>
            </div>

            <div className="relative overflow-hidden rounded-2xl border border-[#F5B700]/30 bg-black/20 p-3 sm:p-4">
              {/* Fixed centre selector */}
              <div className="pointer-events-none absolute inset-y-3 left-1/2 z-30 w-[min(11rem,72%)] -translate-x-1/2 rounded-3xl border-2 border-[#FFD54A] bg-[#FFD54A]/[0.04] shadow-[0_0_35px_rgba(250,204,21,0.25)] sm:inset-y-4 sm:w-52" />

              {revealing && winner ? (
                <div className="flex h-28 w-full items-center justify-center sm:h-32">
                  <div className="flex h-24 w-[min(10rem,68%)] max-w-40 flex-col items-center justify-center rounded-2xl border-2 border-[#FFD54A] bg-gradient-to-br from-[#FFD54A] to-yellow-500 text-black shadow-[0_0_40px_rgba(250,204,21,0.6)] sm:h-28 sm:w-44">
                    <span className="text-2xl sm:text-3xl">
                      🏆
                    </span>

                    <span className="mt-1 text-[10px] font-black uppercase">
                      Demo Winner
                    </span>

                    <span className="mt-2 max-w-full truncate px-2 text-sm font-black sm:text-base">
                      {winner}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="w-full overflow-hidden rounded-xl">
                  <div
                    className="flex w-max shrink-0 gap-4 will-change-transform"
                    style={{
                      transform: `translateX(-${position}px)`,
                    }}
                  >
                    {repeatedTickets.map(
                      (ticket, index) => (
                        <div
                          key={`${ticket}-${index}`}
                          className="flex h-24 w-40 shrink-0 items-center justify-center rounded-2xl border border-[#32659D] bg-gradient-to-br from-[#0B2545] to-[#071A33] text-base font-black text-white shadow-lg sm:h-28 sm:w-40 sm:text-lg"
                        >
                          <div className="flex min-w-0 flex-col items-center gap-1">
                            <span className="text-xl sm:text-2xl">
                              🎟️
                            </span>

                            <span className="max-w-full truncate px-2">
                              {ticket}
                            </span>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-5 grid grid-cols-3 gap-2 text-center text-[11px] sm:gap-3 sm:text-xs">
              <div className="rounded-xl bg-[#0B2545] p-3">
                <p className="text-[#8295B0]">Demo Tickets</p>
                <p className="mt-1 text-lg font-black">
                  {DEMO_TICKETS.length}
                </p>
              </div>

              <div className="rounded-xl bg-[#0B2545] p-3">
                <p className="text-[#8295B0]">Participants</p>
                <p className="mt-1 text-lg font-black">
                  {DEMO_TICKETS.length}
                </p>
              </div>

              <div className="rounded-xl bg-[#0B2545] p-3">
                <p className="text-[#8295B0]">Winners</p>
                <p className="mt-1 text-lg font-black">
                  1
                </p>
              </div>
            </div>

            <div className="mt-5 rounded-xl border border-[#32659D] bg-[#0B2545] p-4 text-center">
              <p className="text-xs text-[#8295B0]">
                Selection timing
              </p>

              <p className="mt-1 font-black">
                60 seconds rolling + 25 seconds reveal
              </p>
            </div>

            {winner && !running && (
              <div className="mt-6 rounded-2xl border border-green-400/30 bg-green-500/10 p-4 text-center">
                <p className="font-black text-green-300">
                  🏆 Demo winner selected
                </p>

                <p className="mt-1 text-sm text-[#9AAAC1]">
                  Winner: {winner}
                </p>
              </div>
            )}

            <button
              type="button"
              onClick={startDemo}
              disabled={running}
              className="mt-6 w-full rounded-2xl bg-[#FFD54A] px-6 py-4 font-black text-black transition hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {running
                ? "Demo Selection Running..."
                : winner
                ? "▶ Run Demo Again"
                : "▶ Run Demo"}
            </button>
          </div>
        </section>

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            href="/lucky-draw"
            className="rounded-xl border border-[#32659D] bg-[#0B2545] px-5 py-3 font-bold"
          >
            ← Lucky Draws
          </Link>

          <Link
            href="/lucky-draw/replays"
            className="rounded-xl border border-[#32659D] bg-[#0B2545] px-5 py-3 font-bold"
          >
            🏆 Previous Winners
          </Link>
        </div>
      </div>
    </main>
  );
}
