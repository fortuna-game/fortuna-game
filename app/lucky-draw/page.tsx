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
  winner_user_id?: string | null;
};

type Ticket = {
  id: string;
  ticket_number: string;
  amount: number;
  created_at: string;
};

export default function LuckyDrawPage() {
  const [draws, setDraws] = useState<Draw[]>([]);
  const [myTicketCounts, setMyTicketCounts] = useState<
    Record<string, number>
  >({});
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [buyingId, setBuyingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [confirmDraw, setConfirmDraw] = useState<Draw | null>(null);

  const loadDraws = useCallback(
    async (showLoading = false) => {
      if (showLoading) {
        setLoading(true);
      }

      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        setCurrentUserId(session?.user?.id || null);

        const headers: HeadersInit = {};

        if (session?.access_token) {
          headers.Authorization = `Bearer ${session.access_token}`;
        }

        const res = await fetch("/api/lucky-draw", {
          cache: "no-store",
          headers,
        });

        const data = await res.json();

        if (!res.ok) {
          setMessage(data.error || "Could not load Lucky Draws.");
          return;
        }

        setDraws(
          Array.isArray(data.draws) ? data.draws : []
        );

        setMyTicketCounts(
          data.myTicketCounts &&
            typeof data.myTicketCounts === "object"
            ? data.myTicketCounts
            : {}
        );
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
    }, 3000);

    return () => clearInterval(interval);
  }, [loadDraws]);

  function openPurchaseConfirmation(draw: Draw) {
    if (draw.status !== "open" || buyingId) return;

    setMessage("");
    setTicket(null);
    setConfirmDraw(draw);
  }

  async function buyTicket(draw: Draw) {
    if (draw.status !== "open" || buyingId) return;

    setConfirmDraw(null);
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
        await loadDraws(false);
        return;
      }

      setTicket(data.ticket);
      setMessage(
        data.message ||
          "Ticket purchased successfully."
      );

      setDraws((currentDraws) =>
        currentDraws.map((currentDraw) =>
          currentDraw.id === draw.id
            ? {
                ...currentDraw,
                totalTickets:
                  Number(currentDraw.totalTickets || 0) + 1,
              }
            : currentDraw
        )
      );

      setMyTicketCounts((currentCounts) => ({
        ...currentCounts,
        [draw.id]:
          Number(currentCounts[draw.id] || 0) + 1,
      }));

      await loadDraws(false);
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
      return `GH₵${Number(
        draw.prize_amount
      ).toFixed(2)} Rent Support`;
    }

    return draw.title;
  }

  function getStatusStyle(status: string) {
    if (status === "open") {
      return "border-green-400/30 bg-green-500/10 text-green-300";
    }

    if (status === "paused") {
      return "border-[#FFD54A]/30 bg-[#F5B700]/10 text-[#FFE08A]";
    }

    if (status === "completed") {
      return "border-blue-400/30 bg-[#3F82DD]/10 text-blue-300";
    }

    return "border-red-400/30 bg-red-500/10 text-red-300";
  }

  function getStatusText(status: string) {
    if (status === "open") return "Open";
    if (status === "paused") return "Paused";
    if (status === "suspended") return "Suspended";
    if (status === "completed") return "Completed";
    return status;
  }

  function getButtonText(draw: Draw) {
    if (buyingId === draw.id) {
      return "Buying Ticket...";
    }

    const myTickets = Number(
      myTicketCounts[draw.id] || 0
    );

    if (myTickets > 0) {
      return `Buy Another GH₵${Number(
        draw.ticket_price
      ).toFixed(2)} Ticket`;
    }

    return `Buy GH₵${Number(
      draw.ticket_price
    ).toFixed(2)} Ticket`;
  }

  return (
    <main className="min-h-screen bg-[#071A33] px-4 py-6 text-white sm:py-8">
      <section className="mx-auto max-w-4xl">
        <div className="mb-6 text-center">
          <div className="text-3xl">🎟️</div>

          <h1 className="mt-2 text-3xl font-black text-[#FFD54A] sm:text-4xl">
            Lucky Draws
          </h1>

          <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-white/65">
            Get tickets for a chance to win amazing prizes.
            More tickets increase your chances, but winning
            is not guaranteed.
          </p>
        </div>

        {loading ? (
          <div className="rounded-2xl border border-[#38BDF8]/15 bg-[#0B2545]/70 p-8 text-center text-[#9AAAC1]">
            Loading Lucky Draws...
          </div>
        ) : draws.length === 0 ? (
          <div className="rounded-2xl border border-[#38BDF8]/15 bg-[#0B2545]/70 p-8 text-center">
            <p className="text-[#9AAAC1]">
              No Lucky Draw is currently available.
            </p>

            {message && (
              <p className="mt-3 text-sm text-red-300">
                {message}
              </p>
            )}

            <Link
              href="/skill-games"
              className="mt-5 inline-block text-sm font-bold text-[#FFE08A]"
            >
              Back to Games
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {draws.map((draw) => {
              const myTickets = Number(
                myTicketCounts[draw.id] || 0
              );

              const isCompleted =
                draw.status === "completed";

              const participated = myTickets > 0;

              const isWinner =
                isCompleted &&
                !!currentUserId &&
                draw.winner_user_id === currentUserId;

              return (
                <div
                  key={draw.id}
                  className="overflow-hidden rounded-2xl border border-[#FFD54A]/25 bg-white/[0.04]"
                >
                  {draw.prize_image && (
                    <div className="px-5 pt-5 sm:px-6">
                      <img
                        src={draw.prize_image}
                        alt={draw.title}
                        className="mx-auto aspect-[3/4] w-full max-w-sm rounded-xl border border-[#38BDF8]/15 object-cover"
                      />
                    </div>
                  )}

                  <div className="px-5 py-6 sm:px-6">
                    <div className="flex flex-col items-center justify-between gap-3 text-center sm:flex-row sm:text-left">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-[#FFE08A]/70">
                          🎁 Lucky Draw Prize
                        </p>

                        <h2 className="mt-2 text-2xl font-black text-[#FFD54A] sm:text-3xl">
                          {draw.title}
                        </h2>

                        {draw.prize_type !== "physical" && (
                          <p className="mt-1 text-lg font-bold text-white">
                            {getPrizeText(draw)}
                          </p>
                        )}

                        {draw.prize_description &&
                          draw.prize_description !==
                            draw.title && (
                            <p className="mt-2 text-sm text-[#9AAAC1]">
                              {draw.prize_description}
                            </p>
                          )}
                      </div>

                      <div
                        className={`rounded-full border px-4 py-2 text-xs font-black uppercase tracking-wide ${getStatusStyle(
                          draw.status
                        )}`}
                      >
                        {getStatusText(draw.status)}
                      </div>
                    </div>

                    {isCompleted ? (
                      <div className="mt-6 space-y-4">
                        {isWinner ? (
                          <div className="rounded-2xl border border-green-400/40 bg-green-500/10 p-5">
                            <p className="text-xl font-black text-green-300">
                              🎉 Congratulations! You won{" "}
                              {draw.title}!
                            </p>

                            <p className="mt-2 text-sm leading-6 text-white/75">
                              You were selected as the winner of
                              this Lucky Draw.
                              {draw.prize_type === "physical"
                                ? " Please submit your delivery details so we can arrange your prize."
                                : " Your prize will be processed according to the applicable payout procedure."}
                            </p>

                            {draw.prize_type === "physical" && (
                              <Link
                                href={`/lucky-draw/claim?draw=${draw.id}`}
                                className="mt-4 inline-flex rounded-xl bg-[#FFD54A] px-5 py-3 text-sm font-black text-black transition hover:bg-yellow-300"
                              >
                                Submit Delivery Details
                              </Link>
                            )}
                          </div>
                        ) : participated ? (
                          <div className="rounded-2xl border border-blue-400/30 bg-[#3F82DD]/10 p-4">
                            <p className="font-bold text-blue-200">
                              ℹ️ You participated in this draw.
                            </p>

                            <p className="mt-1 text-sm text-white/65">
                              You purchased{" "}
                              {myTickets} ticket
                              {myTickets === 1 ? "" : "s"}.
                              This draw has now been completed.
                            </p>
                          </div>
                        ) : (
                          <div className="rounded-2xl border border-[#38BDF8]/15 bg-[#0B2545]/70 p-4 text-sm text-[#9AAAC1]">
                            This Lucky Draw has been completed.
                          </div>
                        )}
                      </div>
                    ) : (
                      <>
                        {participated && (
                          <div className="mt-5 rounded-xl border border-[#FFD54A]/20 bg-[#FFD54A]/5 p-4">
                            <p className="text-sm font-bold text-yellow-200">
                              You currently have {myTickets} ticket
                              {myTickets === 1 ? "" : "s"} in this draw.
                            </p>
                          </div>
                        )}

                        <div className="mt-5 rounded-xl border border-orange-400/20 bg-orange-500/5 p-4">
                          <p className="text-sm font-black text-orange-200">
                            �� Limited Entry Draw
                          </p>

                          <p className="mt-1 text-sm leading-6 text-white/65">
                            Ticket sales may close once enough
                            entries are received. More tickets
                            increase your chances, but winning is
                            not guaranteed.
                          </p>
                        </div>

                        {draw.status === "open" && (
                          <button
                            onClick={() =>
                              openPurchaseConfirmation(draw)
                            }
                            disabled={buyingId === draw.id}
                            className="mt-5 w-full rounded-xl bg-[#FFD54A] px-5 py-4 font-black text-black transition hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {getButtonText(draw)}
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })}

            <section className="rounded-2xl border border-[#38BDF8]/15 bg-white/[0.04] p-5 sm:p-6">
              <h2 className="text-xl font-black text-[#FFD54A]">
                How Lucky Draw Works
              </h2>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-[#38BDF8]/15 bg-[#071A33]/20 p-4">
                  <p className="font-bold">1. Buy Tickets</p>
                  <p className="mt-1 text-sm leading-6 text-[#9AAAC1]">
                    Purchase one or more tickets to enter an
                    available Lucky Draw.
                  </p>
                </div>

                <div className="rounded-xl border border-[#38BDF8]/15 bg-[#071A33]/20 p-4">
                  <p className="font-bold">2. Draw Is Completed</p>
                  <p className="mt-1 text-sm leading-6 text-[#9AAAC1]">
                    When the draw closes, one eligible ticket is
                    selected as the winner.
                  </p>
                </div>

                <div className="rounded-xl border border-[#38BDF8]/15 bg-[#071A33]/20 p-4">
                  <p className="font-bold">3. Check Your Result</p>
                  <p className="mt-1 text-sm leading-6 text-[#9AAAC1]">
                    Completed draws remain visible so participants
                    can return later and check whether they won.
                  </p>
                </div>

                <div className="rounded-xl border border-[#38BDF8]/15 bg-[#071A33]/20 p-4">
                  <p className="font-bold">4. Claim Your Prize</p>
                  <p className="mt-1 text-sm leading-6 text-[#9AAAC1]">
                    Winners of physical prizes submit their delivery
                    details so our team can arrange the prize.
                  </p>
                </div>
              </div>
            </section>
          </div>
        )}

        {confirmDraw && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#071A33]/80 px-4">
            <div className="w-full max-w-md rounded-2xl border border-[#FFD54A]/25 bg-zinc-950 p-6">
              <h2 className="text-xl font-black text-[#FFD54A]">
                Confirm Ticket Purchase
              </h2>

              <p className="mt-3 text-sm leading-6 text-[#B4C0D1]">
                Buy a ticket for{" "}
                <span className="font-bold text-white">
                  {confirmDraw.title}
                </span>{" "}
                for{" "}
                <span className="font-bold text-[#FFE08A]">
                  GH₵{Number(
                    confirmDraw.ticket_price
                  ).toFixed(2)}
                </span>
                ?
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  onClick={() => setConfirmDraw(null)}
                  className="flex-1 rounded-xl border border-white/15 px-4 py-3 font-bold text-white/75"
                >
                  Cancel
                </button>

                <button
                  onClick={() => buyTicket(confirmDraw)}
                  className="flex-1 rounded-xl bg-[#FFD54A] px-4 py-3 font-black text-black"
                >
                  Confirm Purchase
                </button>
              </div>
            </div>
          </div>
        )}

        {ticket && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#071A33]/80 px-4">
            <div className="w-full max-w-md rounded-2xl border border-[#FFD54A]/25 bg-zinc-950 p-6 text-center">
              <div className="text-4xl">🎟️</div>

              <h2 className="mt-3 text-xl font-black text-[#FFD54A]">
                Ticket Purchased!
              </h2>

              <p className="mt-3 text-sm text-white/65">
                Your ticket number is
              </p>

              <p className="mt-2 text-2xl font-black text-white">
                {ticket.ticket_number}
              </p>

              <button
                onClick={() => setTicket(null)}
                className="mt-6 w-full rounded-xl bg-[#FFD54A] px-5 py-3 font-black text-black"
              >
                Done
              </button>
            </div>
          </div>
        )}

        {message && !ticket && (
          <div className="mt-5 rounded-xl border border-[#FFD54A]/20 bg-[#FFD54A]/5 p-4 text-center text-sm text-yellow-100">
            {message}
          </div>
        )}
      </section>
    </main>
  );
}
