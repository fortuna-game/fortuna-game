"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Ticket = {
  id: string;
  ticket_number: string | number;
};

type Winner = {
  username?: string | null;
  ticket_number?: string | number | null;
  selected_at?: string | null;
};

type LiveData = {
  draw: {
    id: string;
    title: string;
    prize_amount?: number | null;
    prize_value?: number | null;
    status: string;
    selection_started_at?: string | null;
    participant_count: number;
    ticket_count: number;
  } | null;
  tickets: Ticket[];
  winners: Winner[];
  server_time: string;
};

const ROLL_SECONDS = 60;
const REVEAL_SECONDS = 25;
const TOTAL_SECONDS = ROLL_SECONDS + REVEAL_SECONDS;

export default function LiveTicketMachine() {
  const [data, setData] = useState<LiveData | null>(null);
  const [now, setNow] = useState(Date.now());

  const offsetRef = useRef(0);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const winnerRef = useRef<HTMLDivElement | null>(null);
  const revealedForCycleRef = useRef(false);

  async function load() {
    try {
      const response = await fetch("/api/lucky-draw/live", {
        cache: "no-store",
      });

      if (!response.ok) return;

      const json = await response.json();

      if (json.server_time) {
        offsetRef.current =
          new Date(json.server_time).getTime() - Date.now();
      }

      setData(json);
    } catch {
      // Keep existing data during temporary network failures.
    }
  }

  useEffect(() => {
    void load();

    const refresh = setInterval(() => {
      void load();
    }, 2000);

    return () => clearInterval(refresh);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 250);

    return () => clearInterval(timer);
  }, []);

  const tickets = data?.tickets || [];
  const winner = data?.winners?.[0];

  const eventStart = useMemo(() => {
    if (winner?.selected_at) {
      return new Date(winner.selected_at).getTime();
    }

    if (data?.draw?.selection_started_at) {
      return new Date(data.draw.selection_started_at).getTime();
    }

    return data?.draw ? new Date().getTime() : null;
  }, [data?.draw, winner?.selected_at]);

  const serverNow = now + offsetRef.current;

  const rawElapsed =
    eventStart == null
      ? 0
      : Math.max(0, (serverNow - eventStart) / 1000);

  const hasRecordedWinner = Boolean(winner?.ticket_number);

  const cycleElapsed = hasRecordedWinner
    ? rawElapsed % TOTAL_SECONDS
    : Math.min(rawElapsed, ROLL_SECONDS);

  const revealing = cycleElapsed >= ROLL_SECONDS;
  const revealProgress = revealing
    ? cycleElapsed - ROLL_SECONDS
    : 0;

  const remaining = revealing
    ? Math.max(0, REVEAL_SECONDS - revealProgress)
    : Math.max(0, ROLL_SECONDS - cycleElapsed);

  const winningIndex = winner?.ticket_number
    ? tickets.findIndex(
        (ticket) =>
          String(ticket.ticket_number) === String(winner.ticket_number),
      )
    : -1;

  const displayTickets = useMemo(() => {
    if (!tickets.length) return [];
    return [...tickets, ...tickets, ...tickets];
  }, [tickets]);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport || !tickets.length) return;

    if (revealing && winningIndex >= 0) {
      if (!revealedForCycleRef.current) {
        const target = winnerRef.current;

        if (target) {
          viewport.scrollTo({
            left:
              target.offsetLeft -
              viewport.clientWidth / 2 +
              target.clientWidth / 2,
            behavior: "smooth",
          });
        }

        revealedForCycleRef.current = true;
      }

      return;
    }

    if (!revealing) {
      revealedForCycleRef.current = false;

      const loopWidth = Math.max(1, tickets.length * 160);
      const rollDistance = (cycleElapsed * 190) % loopWidth;

      viewport.scrollLeft = rollDistance;
    }
  }, [cycleElapsed, revealing, tickets.length, winningIndex, tickets]);

  if (!data?.draw) {
    return (
      <section className="mt-8 rounded-[32px] border border-[#32659D] bg-[#0B2545]/70 p-8 text-center">
        <div className="text-4xl">🎟️</div>
        <h2 className="mt-3 text-2xl font-black">
          No live draw at the moment
        </h2>
        <p className="mt-2 text-sm text-[#9AAAC1]">
          Check back when the next draw is open.
        </p>
      </section>
    );
  }

  const draw = data.draw;

  return (
    <section className="mt-8 overflow-hidden rounded-[32px] border border-[#F5B700]/40 bg-gradient-to-br from-[#0B2545] via-[#071A33] to-[#111D3A] p-5 shadow-2xl sm:p-8">
    <style>{`
      @keyframes ticket-marquee {
        from { transform: translateX(0); }
        to { transform: translateX(-33.333%); }
      }
    `}</style>

      <div className="text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-red-500 px-4 py-2 text-xs font-black text-white">
          <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-white" />
          {hasRecordedWinner ? "RECORDED DRAW REPLAY" : "LIVE TICKET SELECTION"}
        </div>

        <h2 className="mt-4 text-2xl font-black sm:text-4xl">
          {draw.title}
        </h2>

        <p className="mt-2 text-sm text-[#9AAAC1]">
          {draw.ticket_count} tickets • {draw.participant_count} participants
        </p>
      </div>

      <div className="mx-auto mt-8 w-full max-w-5xl overflow-hidden rounded-[28px] border border-[#32659D] bg-[#071A33] p-4 sm:p-5">
        <div className="mb-4 flex items-center justify-between">
          <span className="text-sm font-black text-[#9AAAC1]">
            {revealing ? "WINNER REVEAL" : "TICKET MACHINE RUNNING"}
          </span>

          <span className="font-black text-[#FFD54A]">
            {remaining}s
          </span>
        </div>

        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-1/2 z-20 w-44 -translate-x-1/2 rounded-3xl border-2 border-[#FFD54A]/90 bg-[#FFD54A]/5 shadow-[0_0_35px_rgba(250,204,21,0.25)] sm:w-52" />

          <div
            ref={viewportRef}
            className="relative w-full max-w-full overflow-hidden rounded-2xl border border-[#F5B700]/30 bg-black/20 p-3 sm:p-4"
          >
            <div
              className={`flex w-max max-w-none shrink-0 gap-3 sm:gap-4 will-change-transform ${
                revealing ? "w-full justify-center" : "animate-[ticket-marquee_1.5s_linear_infinite]"
              }`}
            >
              {revealing && winner && winningIndex >= 0 ? (
                <div
                  ref={winnerRef}
                  className="flex h-28 w-44 shrink-0 items-center justify-center rounded-3xl border-2 border-[#FFD54A] bg-gradient-to-br from-[#FFD54A] to-yellow-500 text-lg font-black text-black shadow-[0_0_45px_rgba(250,204,21,0.65)]"
                >
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-3xl">🎟️</span>
                    <span>{winner.ticket_number}</span>
                  </div>
                </div>
              ) : (
                displayTickets.map((ticket, index) => (
                  <div
                    key={`${ticket.id}-${index}`}
                    className="flex h-24 w-36 shrink-0 items-center justify-center rounded-2xl border border-[#32659D] bg-[#0B2545] text-lg font-black text-white"
                  >
                    🎟️ {ticket.ticket_number}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-2 text-center text-[11px] sm:gap-3 sm:text-xs">
          <div className="rounded-xl bg-[#0B2545] p-3">
            <p className="text-[#8295B0]">Tickets</p>
            <p className="mt-1 text-lg font-black">
              {draw.ticket_count}
            </p>
          </div>

          <div className="rounded-xl bg-[#0B2545] p-3">
            <p className="text-[#8295B0]">Participants</p>
            <p className="mt-1 text-lg font-black">
              {draw.participant_count}
            </p>
          </div>

          <div className="rounded-xl bg-[#0B2545] p-3">
            <p className="text-[#8295B0]">Status</p>
            <p className="mt-1 whitespace-nowrap text-base font-black text-green-300 sm:text-lg">
              {draw.status}
            </p>
          </div>
        </div>
      </div>

      {revealing && winner && (
        <div className="mx-auto mt-7 max-w-2xl rounded-3xl border border-green-400/40 bg-green-500/10 p-7 text-center shadow-xl">
          <div className="text-5xl">🏆</div>

          <p className="mt-3 text-sm font-black uppercase tracking-[0.25em] text-green-300">
            WINNER SELECTED
          </p>

          <h3 className="mt-2 text-3xl font-black">
            @{winner.username || "Winner"}
          </h3>

          <p className="mt-2 text-lg font-black text-[#FFD54A]">
            Winning Ticket #{winner.ticket_number}
          </p>

          {draw.prize_value != null && (
            <p className="mt-1 text-xl font-black text-green-300">
              GH₵{Number(draw.prize_value).toFixed(2)}
            </p>
          )}
        </div>
      )}

      <p className="mt-5 text-center text-xs text-[#7185A3]">
        The ticket pool and recorded winner are loaded from the server.
        The animation does not choose the winner.
      </p>
    </section>
  );
}
