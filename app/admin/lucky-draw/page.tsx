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

  async function loadData() {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      setMessage("Admin login required.");
      setLoading(false);
      return;
    }

    const res = await fetch("/api/admin/lucky-draw", {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
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
  const [completing, setCompleting] = useState(false);

  async function completeDraw() {
    if (!openDraw) {
      setMessage("No open Lucky Draw found.");
      return;
    }

    const confirmed = window.confirm(
      "Select a random winner, close this draw, and pay the GH₵500 prize?"
    );

    if (!confirmed) return;

    setCompleting(true);
    setMessage("");

    const {
      data: { session },
    } = await supabase.auth.getSession();

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
      `🏆 Winner selected! Ticket ${data.result.ticket_number} won GH₵${Number(
        data.result.prize_amount
      ).toFixed(2)}.`
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
              Manage Lucky Draw tickets and participants.
            </p>
          </div>

          <Link
            href="/admin"
            className="rounded-xl border border-white/10 bg-white/5 px-5 py-3 font-bold"
          >
            Back to Admin
          </Link>
        </div>

        {openDraw && (
          <div className="mt-8 rounded-3xl border border-yellow-400/30 bg-yellow-400/10 p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-yellow-400">
                  Current Draw Is Open
                </h2>
                <p className="mt-2 text-sm text-white/60">
                  Closing the draw will randomly select one ticket and pay the winner.
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
          </div>
        )}

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-yellow-400/20 bg-yellow-400/10 p-6">
            <p className="text-white/60">Current Prize</p>
            <h2 className="mt-2 text-3xl font-black text-yellow-400">
              GH₵{Number(openDraw?.prize_amount || 0).toFixed(2)}
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

        {loading && (
          <p className="mt-8 text-white/60">Loading Lucky Draw...</p>
        )}

        {message && (
          <div className="mt-8 rounded-2xl border border-red-500/20 bg-red-500/10 p-5 text-red-300">
            {message}
          </div>
        )}

        {!loading && !message && (
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
                      <p className="font-black">
                        @{ticket.username}
                      </p>
                      <p className="text-sm text-white/50">
                        {ticket.first_name} {ticket.last_name}
                      </p>
                    </td>

                    <td className="p-4">
                      {ticket.phone || "-"}
                    </td>

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
                    <td colSpan={5} className="p-8 text-center text-white/50">
                      No Lucky Draw tickets purchased yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
