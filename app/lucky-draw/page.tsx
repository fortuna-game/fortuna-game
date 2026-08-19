"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Draw = {
  id: string;
  title: string;
  prize_amount: number;
  prize_type?: string | null;
  prize_description?: string | null;
  prize_image?: string | null;
  prize_value?: number | null;
  ticket_price: number;
  status: string;
  totalTickets: number;
};

type Ticket = {
  id: string;
  ticket_number: string;
  amount: number;
  created_at: string;
};

export default function LuckyDrawPage() {
  const [draws, setDraws] = useState<Draw[]>([]);
  const [loading, setLoading] = useState(true);
  const [buyingId, setBuyingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [ticket, setTicket] = useState<Ticket | null>(null);

  const loadDraws = useCallback(
    async (showLoading = false) => {
      if (showLoading) {
        setLoading(true);
      }

      try {
        const res = await fetch("/api/lucky-draw", {
          cache: "no-store",
        });

        const data = await res.json();

        if (!res.ok) {
          setMessage(data.error || "Could not load Lucky Draws.");
          return;
        }

        setDraws(Array.isArray(data.draws) ? data.draws : []);
      } catch {
        setMessage("Could not load Lucky Draws.");
      } finally {
        if (showLoading) {
          setLoading(false);
        }
      }
    },
    []
  );

  useEffect(() => {
    void loadDraws(true);

    const interval = setInterval(() => {
      void loadDraws(false);
    }, 5000);

    return () => clearInterval(interval);
  }, [loadDraws]);

  async function buyTicket(draw: Draw) {
    if (draw.status !== "open" || buyingId) return;

    setBuyingId(draw.id);
    setMessage("");
    setTicket(null);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setMessage("Please log in to buy a ticket.");
        return;
      }

      const res = await fetch("/api/lucky-draw", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          drawId: draw.id,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "Could not buy ticket.");
        return;
      }

      setTicket(data.ticket);
      setMessage(data.message || "Ticket purchased successfully.");

      setDraws((currentDraws) =>
        currentDraws.map((currentDraw) =>
          currentDraw.id === draw.id
            ? {
                ...currentDraw,
                totalTickets: Number(currentDraw.totalTickets || 0) + 1,
              }
            : currentDraw
        )
      );
    } catch {
      setMessage("Could not buy ticket.");
    } finally {
      setBuyingId(null);
    }
  }

  function getPrizeText(draw: Draw) {
    if (draw.prize_type === "cash") {
      return `GH₵${Number(draw.prize_amount).toFixed(2)}`;
    }

    if (draw.prize_type === "rent") {
      return `GH₵${Number(draw.prize_amount).toFixed(2)} Rent Support`;
    }

    return draw.title;
  }

  function getStatusStyle(status: string) {
    if (status === "open") {
      return "border-green-400/30 bg-green-500/10 text-green-300";
    }

    if (status === "paused") {
      return "border-yellow-400/30 bg-yellow-500/10 text-yellow-300";
    }

    return "border-red-400/30 bg-red-500/10 text-red-300";
  }

  function getButtonText(draw: Draw) {
    if (buyingId === draw.id) {
      return "Buying Ticket...";
    }

    if (draw.status === "paused") {
      return "Lucky Draw Paused";
    }

    if (draw.status === "suspended") {
      return "Lucky Draw Suspended";
    }

    return `Buy GH₵${Number(draw.ticket_price).toFixed(2)} Ticket`;
  }

  return (
    <main className="min-h-screen bg-black px-4 py-6 text-white sm:py-8">
      <section className="mx-auto max-w-4xl">
        <div className="mb-6 text-center">
          <div className="text-3xl">🎟️</div>

          <h1 className="mt-2 text-3xl font-black text-yellow-400 sm:text-4xl">
            Lucky Draws
          </h1>

          <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-white/65">
            Get tickets for a chance to win amazing prizes. More tickets
            increase your chances, but winning is not guaranteed.
          </p>
        </div>

        {loading ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center text-white/60">
            Loading Lucky Draws...
          </div>
        ) : draws.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
            <p className="text-white/60">
              No Lucky Draw is currently available.
            </p>

            {message && (
              <p className="mt-3 text-sm text-red-300">{message}</p>
            )}

            <Link
              href="/skill-games"
              className="mt-5 inline-block text-sm font-bold text-yellow-300"
            >
              Back to Games
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {draws.map((draw) => (
              <div
                key={draw.id}
                className="overflow-hidden rounded-2xl border border-yellow-400/25 bg-white/[0.04]"
              >
                {draw.prize_image && (
                  <div className="px-5 pt-5 sm:px-6">
                    <img
                      src={draw.prize_image}
                      alt={draw.title}
                      className="h-48 w-full rounded-xl border border-white/10 object-cover sm:h-64"
                    />
                  </div>
                )}

                <div className="px-5 py-6 sm:px-6">
                  <div className="flex flex-col items-center justify-between gap-3 text-center sm:flex-row sm:text-left">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-yellow-300/70">
                        🎁 Current Prize
                      </p>

                      <h2 className="mt-2 text-2xl font-black text-yellow-400 sm:text-3xl">
                        {draw.title}
                      </h2>

                      <p className="mt-1 text-lg font-bold text-white">
                        {getPrizeText(draw)}
                      </p>

                      {draw.prize_description &&
                        draw.prize_description !== draw.title && (
                          <p className="mt-2 text-sm text-white/60">
                            {draw.prize_description}
                          </p>
                        )}
                    </div>

                    <div
                      className={`rounded-full border px-4 py-2 text-xs font-black uppercase tracking-wide ${getStatusStyle(
                        draw.status
                      )}`}
                    >
                      {draw.status}
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <div className="rounded-xl border border-white/10 bg-black/30 p-4 text-center">
                      <p className="text-xs text-white/50">Prize</p>
                      <p className="mt-1 text-lg font-black text-green-400">
                        {draw.prize_type === "physical"
                          ? draw.title
                          : `GH₵${Number(draw.prize_amount).toFixed(2)}`}
                      </p>
                    </div>

                    <div className="rounded-xl border border-white/10 bg-black/30 p-4 text-center">
                      <p className="text-xs text-white/50">Ticket Price</p>
                      <p className="mt-1 text-lg font-black text-yellow-400">
                        GH₵{Number(draw.ticket_price).toFixed(2)}
                      </p>
                    </div>

                    <div className="rounded-xl border border-white/10 bg-black/30 p-4 text-center">
                      <p className="text-xs text-white/50">Tickets Purchased</p>
                      <p className="mt-1 text-lg font-black text-blue-300">
                        {Number(draw.totalTickets || 0)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 rounded-xl border border-yellow-400/20 bg-yellow-400/10 px-4 py-3">
                    <p className="text-sm font-bold text-yellow-300">
                      🔥 Limited Entry Draw
                    </p>

                    <p className="mt-1 text-xs leading-5 text-white/65">
                      Ticket sales may close once enough entries are received.
                      More tickets increase your chances, but winning is not
                      guaranteed.
                    </p>
                  </div>

                  {draw.status === "paused" && (
                    <div className="mt-4 rounded-xl border border-yellow-400/20 bg-yellow-400/10 px-4 py-3 text-center text-sm font-bold text-yellow-300">
                      ⏸ This Lucky Draw is currently paused. Ticket purchases
                      are temporarily unavailable.
                    </div>
                  )}

                  {draw.status === "suspended" && (
                    <div className="mt-4 rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-center text-sm font-bold text-red-300">
                      ⚠️ This Lucky Draw has been suspended. Ticket purchases
                      are unavailable.
                    </div>
                  )}

                  <button
                    onClick={() => buyTicket(draw)}
                    disabled={
                      buyingId !== null || draw.status !== "open"
                    }
                    className={`mt-5 w-full rounded-xl py-3.5 text-base font-black transition disabled:cursor-not-allowed ${
                      draw.status === "open"
                        ? "bg-yellow-400 text-black hover:bg-yellow-300 disabled:opacity-50"
                        : "bg-white/10 text-white/45"
                    }`}
                  >
                    {getButtonText(draw)}
                  </button>
                </div>
              </div>
            ))}

            {message && (
              <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-center text-sm">
                {message}
              </div>
            )}

            {ticket && (
              <div className="rounded-xl border border-green-400/30 bg-green-500/10 p-4 text-center">
                <p className="text-xs text-green-300">
                  Your Latest Ticket Number
                </p>

                <p className="mt-1 text-xl font-black">
                  {ticket.ticket_number}
                </p>
              </div>
            )}

            <Link
              href="/skill-games"
              className="block py-2 text-center text-sm font-bold text-yellow-300"
            >
              Back to Games
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}
