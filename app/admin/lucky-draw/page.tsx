"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function AdminLuckyDrawPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [draws, setDraws] = useState<any[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const [title, setTitle] = useState("");
  const [prizeAmount, setPrizeAmount] = useState("");
  const [ticketPrice, setTicketPrice] = useState("");
  const [creating, setCreating] = useState(false);
  const [completing, setCompleting] = useState(false);

  async function getSession() {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    return session;
  }

  async function loadData() {
    const session = await getSession();

    if (!session) {
      setMessage("Admin login required.");
      setLoading(false);
      return;
    }

    const res = await fetch(`/api/admin/lucky-draw?t=${Date.now()}`, {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
      cache: "no-store",
    });

    const data = await res.json();

    if (!res.ok) {
      setMessage(data.error || "Could not load Lucky Draw.");
      setLoading(false);
      return;
    }

    setTickets(data.tickets || []);
    setDraws(data.draws || []);
    setTotalRevenue(Number(data.totalRevenue || 0));
    setLoading(false);
  }

  useEffect(() => {
    void loadData();
  }, []);

  const openDraw = draws.find((draw) => draw.status === "open");

  async function createDraw() {
    setMessage("");

    const prize = Number(prizeAmount);
    const ticket = Number(ticketPrice);

    if (!Number.isFinite(prize) || prize <= 0) {
      setMessage("Enter a valid prize amount.");
      return;
    }

    if (!Number.isFinite(ticket) || ticket <= 0) {
      setMessage("Enter a valid ticket price.");
      return;
    }

    const confirmed = window.confirm(
      `Create a new Lucky Draw with a GH₵${prize.toFixed(
        2
      )} prize and GH₵${ticket.toFixed(2)} ticket price?`
    );

    if (!confirmed) return;

    setCreating(true);

    const session = await getSession();

    if (!session) {
      setMessage("Admin login required.");
      setCreating(false);
      return;
    }

    const res = await fetch("/api/admin/lucky-draw/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        title: title.trim(),
        prizeAmount: prize,
        ticketPrice: ticket,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setMessage(data.error || "Could not create Lucky Draw.");
      setCreating(false);
      return;
    }

    setTitle("");
    setPrizeAmount("");
    setTicketPrice("");
    setMessage("🎉 New Lucky Draw created successfully.");
    setCreating(false);

    await loadData();
  }

  async function completeDraw() {
    if (!openDraw) {
      setMessage("No open Lucky Draw found.");
      return;
    }

    const confirmed = window.confirm(
      `Select a random winner, close this draw, and pay the GH₵${Number(
        openDraw.prize_amount
      ).toFixed(2)} prize?`
    );

    if (!confirmed) return;

    setCompleting(true);
    setMessage("");

    const session = await getSession();

    if (!session) {
      setMessage("Admin login required.");
      setCompleting(false);
      return;
    }

    const res = await fetch("/api/admin/lucky-draw/complete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        drawId: openDraw.id,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setMessage(data.error || "Could not complete Lucky Draw.");
      setCompleting(false);
      return;
    }

    setMessage(
      `🏆 Winner selected! Ticket ${
        data.result.ticket_number
      } won GH₵${Number(data.result.prize_amount).toFixed(2)}.`
    );

    setCompleting(false);
    await loadData();
  }

  return (
    <main className="min-h-screen bg-black px-6 py-10 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black text-yellow-400">
              Lucky Draw Admin
            </h1>

            <p className="mt-2 text-white/60">
              Create draws, manage tickets and select winners.
            </p>
          </div>

          <Link
            href="/admin"
            className="rounded-xl border border-white/10 bg-white/5 px-5 py-3 font-bold"
          >
            Back to Admin
          </Link>
        </div>

        {message && (
          <div className="mt-8 rounded-2xl border border-yellow-400/20 bg-yellow-400/10 p-5 text-yellow-200">
            {message}
          </div>
        )}

        {loading && (
          <p className="mt-8 text-white/60">Loading Lucky Draw...</p>
        )}

        {!loading && !openDraw && (
          <section className="mt-8 rounded-3xl border border-yellow-400/30 bg-yellow-400/10 p-6">
            <h2 className="text-2xl font-black text-yellow-400">
              Create New Lucky Draw
            </h2>

            <p className="mt-2 text-white/60">
              Set the prize and ticket price for the next draw.
            </p>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <div>
                <label className="text-sm font-bold text-white/60">
                  Draw Title
                </label>

                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Example: Weekend Cash Draw"
                  className="mt-2 w-full rounded-xl border border-white/10 bg-black px-4 py-3 outline-none focus:border-yellow-400"
                />
              </div>

              <div>
                <label className="text-sm font-bold text-white/60">
                  Prize Amount (GH₵)
                </label>

                <input
                  type="number"
                  min="1"
                  step="0.01"
                  value={prizeAmount}
                  onChange={(e) => setPrizeAmount(e.target.value)}
                  placeholder="500"
                  className="mt-2 w-full rounded-xl border border-white/10 bg-black px-4 py-3 outline-none focus:border-yellow-400"
                />
              </div>

              <div>
                <label className="text-sm font-bold text-white/60">
                  Ticket Price (GH₵)
                </label>

                <input
                  type="number"
                  min="1"
                  step="0.01"
                  value={ticketPrice}
                  onChange={(e) => setTicketPrice(e.target.value)}
                  placeholder="5"
                  className="mt-2 w-full rounded-xl border border-white/10 bg-black px-4 py-3 outline-none focus:border-yellow-400"
                />
              </div>
            </div>

            <button
              onClick={createDraw}
              disabled={creating}
              className="mt-6 rounded-xl bg-yellow-400 px-6 py-3 font-black text-black disabled:opacity-50"
            >
              {creating ? "Creating Draw..." : "🎟️ Create & Open Draw"}
            </button>
          </section>
        )}

        {openDraw && (
          <>
            <section className="mt-8 rounded-3xl border border-yellow-400/30 bg-yellow-400/10 p-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-black text-yellow-400">
                    {openDraw.title || "Current Lucky Draw"}
                  </h2>

                  <p className="mt-2 text-white/60">
                    Ticket sales are currently open.
                  </p>
                </div>

                <button
                  onClick={completeDraw}
                  disabled={completing || tickets.length === 0}
                  className="rounded-xl bg-yellow-400 px-6 py-3 font-black text-black disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {completing
                    ? "Selecting Winner..."
                    : "🏆 Select Winner & Close Draw"}
                </button>
              </div>
            </section>

            <div className="mt-8 grid gap-4 md:grid-cols-4">
              <div className="rounded-3xl border border-yellow-400/20 bg-yellow-400/10 p-6">
                <p className="text-white/60">Current Prize</p>

                <h2 className="mt-2 text-3xl font-black text-yellow-400">
                  GH₵{Number(openDraw.prize_amount || 0).toFixed(2)}
                </h2>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
                <p className="text-white/60">Ticket Price</p>

                <h2 className="mt-2 text-3xl font-black">
                  GH₵{Number(openDraw.ticket_price || 0).toFixed(2)}
                </h2>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
                <p className="text-white/60">Tickets Sold</p>

                <h2 className="mt-2 text-3xl font-black">
                  {tickets.length}
                </h2>
              </div>

              <div className="rounded-3xl border border-green-400/20 bg-green-500/10 p-6">
                <p className="text-white/60">Ticket Revenue</p>

                <h2 className="mt-2 text-3xl font-black text-green-300">
                  GH₵{totalRevenue.toFixed(2)}
                </h2>
              </div>
            </div>

            <div className="mt-8 overflow-x-auto rounded-3xl border border-white/10 bg-white/5">
              <table className="w-full min-w-[900px] text-left">
                <thead>
                  <tr className="text-white/50">
                    <th className="p-4">Player</th>
                    <th className="p-4">Phone</th>
                    <th className="p-4">Ticket Number</th>
                    <th className="p-4">Amount</th>
                    <th className="p-4">Purchase Date</th>
                  </tr>
                </thead>

                <tbody>
                  {tickets.map((ticket) => (
                    <tr
                      key={ticket.id}
                      className="border-t border-white/10"
                    >
                      <td className="p-4">
                        <p className="font-black">@{ticket.username}</p>

                        <p className="text-sm text-white/50">
                          {ticket.first_name} {ticket.last_name}
                        </p>
                      </td>

                      <td className="p-4">{ticket.phone || "-"}</td>

                      <td className="p-4 font-black text-yellow-400">
                        {ticket.ticket_number}
                      </td>

                      <td className="p-4 font-black">
                        GH₵{Number(ticket.amount || 0).toFixed(2)}
                      </td>

                      <td className="p-4">
                        {new Date(ticket.created_at).toLocaleString()}
                      </td>
                    </tr>
                  ))}

                  {tickets.length === 0 && (
                    <tr>
                      <td
                        colSpan={5}
                        className="p-8 text-center text-white/50"
                      >
                        No Lucky Draw tickets purchased yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
