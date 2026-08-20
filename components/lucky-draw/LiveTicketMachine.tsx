"use client";

import { useEffect, useMemo, useState } from "react";

type Winner = {
  winner_username?: string | null;
  username?: string | null;
  title?: string | null;
  prize_title?: string | null;
  prize_amount?: number | null;
  prize_value?: number | null;
};

function extractArray(value: any): any[] {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.winners)) return value.winners;
  if (Array.isArray(value?.results)) return value.results;
  if (Array.isArray(value?.draws)) return value.draws;
  return [];
}

export default function LiveTicketMachine() {
  const [winners, setWinners] = useState<Winner[]>([]);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/winners", { cache: "no-store" });
        const data = await res.json();
        setWinners(extractArray(data));
      } catch {
        setWinners([]);
      }
    }

    void load();

    const refresh = setInterval(() => {
      void load();
    }, 2000);

    return () => clearInterval(refresh);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsed((value) => (value + 1) % 85);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const winner = winners[0];

  const ticketNumbers = useMemo(
    () =>
      Array.from({ length: 40 }, (_, index) =>
        String((index + 1) * 17).padStart(4, "0")
      ),
    []
  );

  const revealing = elapsed >= 60;
  const progress = revealing ? elapsed - 60 : elapsed;

  return (
    <section className="mt-8 overflow-hidden rounded-[32px] border border-[#F5B700]/40 bg-gradient-to-br from-[#0B2545] via-[#071A33] to-[#111D3A] p-5 shadow-2xl sm:p-8">
      <div className="text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-red-500 px-4 py-2 text-xs font-black text-white">
          <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-white" />
          LIVE TICKET SELECTION
        </div>

        <h2 className="mt-4 text-2xl font-black sm:text-4xl">
          Transparent Lucky Draw
        </h2>

        <p className="mx-auto mt-2 max-w-2xl text-sm text-[#9AAAC1]">
          The animation reveals the recorded winner. The machine does not
          choose the winner.
        </p>
      </div>

      <div className="mx-auto mt-8 max-w-3xl rounded-[28px] border border-[#32659D] bg-[#071A33] p-5">
        <div className="mb-4 flex items-center justify-between text-sm">
          <span className="font-bold text-[#9AAAC1]">
            {revealing ? "WINNER REVEAL" : "DRAW IN PROGRESS"}
          </span>

          <span className="font-black text-[#FFD54A]">
            {revealing ? `${25 - progress}s` : `${60 - elapsed}s`}
          </span>
        </div>

        <div className="relative h-36 overflow-hidden rounded-2xl border border-[#F5B700]/30 bg-black/20">
          <div
            className="absolute inset-y-0 flex items-center gap-4 whitespace-nowrap"
            style={{
              transform: `translateX(-${(elapsed * 165) % 1300}px)`,
              transition: revealing
                ? "transform 1.2s ease-out"
                : "transform 0.15s linear",
            }}
          >
            {[...ticketNumbers, ...ticketNumbers].map((ticket, index) => (
              <div
                key={`${ticket}-${index}`}
                className={`flex h-24 w-32 shrink-0 items-center justify-center rounded-2xl border text-xl font-black ${
                  revealing && index === 12
                    ? "border-[#FFD54A] bg-[#FFD54A] text-black shadow-[0_0_35px_rgba(250,204,21,0.45)]"
                    : "border-[#32659D] bg-[#0B2545] text-white"
                }`}
              >
                🎟️ {ticket}
              </div>
            ))}
          </div>
        </div>

        <div className="mx-auto mt-5 h-2 max-w-xl overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full bg-[#FFD54A] transition-all duration-1000"
            style={{
              width: `${revealing ? (progress / 25) * 100 : (elapsed / 60) * 100}%`,
            }}
          />
        </div>
      </div>

      {revealing && winner && (
        <div className="mx-auto mt-7 max-w-2xl rounded-3xl border border-green-400/40 bg-green-500/10 p-6 text-center shadow-xl">
          <div className="text-5xl">🏆</div>

          <p className="mt-3 text-sm font-black uppercase tracking-[0.25em] text-green-300">
            WINNER SELECTED
          </p>

          <h3 className="mt-2 text-3xl font-black text-white">
            @{winner.winner_username || winner.username || "Winner"}
          </h3>

          <p className="mt-2 text-lg font-bold text-[#FFD54A]">
            {winner.title || winner.prize_title || "Lucky Draw Prize"}
          </p>

          {(winner.prize_amount ?? winner.prize_value) != null && (
            <p className="mt-1 text-xl font-black text-green-300">
              GH₵
              {Number(
                winner.prize_amount ?? winner.prize_value ?? 0
              ).toFixed(2)}
            </p>
          )}
        </div>
      )}

      <p className="mt-5 text-center text-xs text-[#7185A3]">
        Winner selection is recorded server-side. This animation only reveals
        the recorded result.
      </p>
    </section>
  );
}
