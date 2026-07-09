"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Draw = {
  id: string;
  title: string;
  prize_amount: number;
  ticket_price: number;
  status: string;
};

type Ticket = {
  id: string;
  ticket_number: string;
  amount: number;
  created_at: string;
};

export default function LuckyDrawPage() {
  const [draw, setDraw] = useState<Draw | null>(null);
  const [totalTickets, setTotalTickets] = useState(0);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState(false);
  const [message, setMessage] = useState("");
  const [ticket, setTicket] = useState<Ticket | null>(null);

  async function loadDraw() {
    try {
      const res = await fetch("/api/lucky-draw");
      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "Could not load Lucky Draw.");
        return;
      }

      setDraw(data.draw);
      setTotalTickets(Number(data.totalTickets || 0));
    } catch {
      setMessage("Could not load Lucky Draw.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadDraw();
  }, []);

  async function buyTicket() {
    if (!draw || buying) return;

    setBuying(true);
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
      setTotalTickets((value) => value + 1);
    } catch {
      setMessage("Could not buy ticket.");
    } finally {
      setBuying(false);
    }
  }

  return (
    <main className="min-h-screen bg-black px-4 py-10 text-white">
      <section className="mx-auto max-w-3xl rounded-3xl border border-yellow-400/20 bg-white/5 p-6 text-center">
        <div className="text-6xl">🎟️</div>

        <h1 className="mt-4 text-4xl font-black text-yellow-400">
          Lucky Draw
        </h1>

        <p className="mt-3 text-white/70">
          Buy a GH₵20 ticket for a chance to win GH₵500.
          More tickets increase your chances, but winning is not guaranteed.
        </p>

        {loading ? (
          <p className="mt-8 text-white/60">Loading Lucky Draw...</p>
        ) : draw ? (
          <>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-black/40 p-5">
                <p className="text-sm text-white/50">Prize</p>
                <p className="mt-2 text-3xl font-black text-green-400">
                  GH₵{Number(draw.prize_amount).toFixed(2)}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/40 p-5">
                <p className="text-sm text-white/50">Ticket Price</p>
                <p className="mt-2 text-3xl font-black text-yellow-400">
                  GH₵{Number(draw.ticket_price).toFixed(2)}
                </p>
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-white/10 bg-black/40 p-4">
              <p className="text-sm text-white/50">Tickets Purchased</p>
              <p className="mt-1 text-2xl font-black">{totalTickets}</p>
            </div>

            <div className="mt-6 rounded-2xl border border-yellow-400/20 bg-yellow-400/10 p-5 text-left">
              <p className="font-black text-yellow-300">🔥 Limited Entry Draw</p>
              <p className="mt-2 text-sm leading-6 text-white/70">
                Ticket sales can close anytime once enough entries are received.
                Buy your GH₵20 ticket early to secure your chance to win GH₵500.
                More tickets increase your chances, but winning is not guaranteed.
              </p>
            </div>

            {message && (
              <div className="mt-5 rounded-xl border border-white/10 bg-white/5 p-4 text-sm">
                {message}
              </div>
            )}

            {ticket && (
              <div className="mt-5 rounded-2xl border border-green-400/30 bg-green-500/10 p-5">
                <p className="text-sm text-green-300">Your Ticket Number</p>
                <p className="mt-2 text-2xl font-black text-white">
                  {ticket.ticket_number}
                </p>
              </div>
            )}

            <button
              onClick={buyTicket}
              disabled={buying}
              className="mt-6 w-full rounded-xl bg-yellow-400 py-4 font-black text-black disabled:opacity-50"
            >
              {buying ? "Buying Ticket..." : "Buy GH₵20 Ticket"}
            </button>
          </>
        ) : (
          <p className="mt-8 text-white/60">
            No Lucky Draw is currently available.
          </p>
        )}

        <Link
          href="/skill-games"
          className="mt-5 block text-sm font-bold text-yellow-300"
        >
          Back to Games
        </Link>
      </section>
    </main>
  );
}
