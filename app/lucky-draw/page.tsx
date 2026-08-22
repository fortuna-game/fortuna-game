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
  prize_media?: Array<{
    type: "image" | "video";
    url: string;
  }> | null;
  prize_value?: number | null;
  rules?: string | null;
  ticket_price: number;
  max_entries?: number | null;
  duration_days?: number | null;
  ends_at?: string | null;
  status: string;
  totalTickets: number;
  starts_at?: string | null;
  selection_at?: string | null;
  isUpcoming?: boolean;
  winner_user_id?: string | null;
};

type Ticket = {
  id: string;
  ticket_number: string;
  amount: number;
  created_at: string;
  draw_title?: string;
};

function formatCountdown(ms: number) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));

  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (days > 0) {
    return `${days}d ${String(hours).padStart(2, "0")}:${String(
      minutes
    ).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }

  return `${String(hours).padStart(2, "0")}:${String(
    minutes
  ).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function normalizePrizeMedia(
  media: any
): Array<{ type: "image" | "video"; url: string }> {
  if (!Array.isArray(media)) return [];

  return media
    .map((item: any) => {
      if (typeof item === "string") {
        const lower = item.toLowerCase();

        return {
          type:
            lower.includes(".mp4") ||
            lower.includes(".webm") ||
            lower.includes(".mov") ||
            lower.includes(".m4v")
              ? "video"
              : "image",
          url: item,
        };
      }

      if (
        item &&
        typeof item.url === "string" &&
        (item.type === "image" || item.type === "video")
      ) {
        return item;
      }

      return null;
    })
    .filter(Boolean) as Array<{
    type: "image" | "video";
    url: string;
  }>;
}

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
  const [now, setNow] = useState(Date.now());
  const [gallery, setGallery] = useState<
    Array<{ type: "image" | "video"; url: string }>
  >([]);
  const [galleryIndex, setGalleryIndex] = useState(0);

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

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  function openPurchaseConfirmation(draw: Draw) {
    if (draw.status !== "open" || buyingId) return;

    const remaining = getRemainingEntries(draw);

    if (remaining !== null && remaining <= 0) {
      setMessage("This Lucky Draw is full.");
      return;
    }

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

  function getDrawCountdown(draw: Draw) {
    const startMs = draw.starts_at
      ? new Date(draw.starts_at).getTime()
      : null;

    const endMs = draw.ends_at
      ? new Date(draw.ends_at).getTime()
      : null;

    if (startMs !== null && now < startMs) {
      return {
        phase: "starts",
        ms: startMs - now,
      };
    }

    if (endMs !== null && now < endMs) {
      return {
        phase: "ends",
        ms: endMs - now,
      };
    }

    return {
      phase: "closed",
      ms: 0,
    };
  }

  function formatDrawCountdown(ms: number) {
    const totalSeconds = Math.max(
      0,
      Math.floor(ms / 1000)
    );

    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor(
      (totalSeconds % 86400) / 3600
    );
    const minutes = Math.floor(
      (totalSeconds % 3600) / 60
    );
    const seconds = totalSeconds % 60;

    if (days > 0) {
      return `${days}d ${String(hours).padStart(
        2,
        "0"
      )}h ${String(minutes).padStart(
        2,
        "0"
      )}m ${String(seconds).padStart(2, "0")}s`;
    }

    return `${String(hours).padStart(
      2,
      "0"
    )}h ${String(minutes).padStart(
      2,
      "0"
    )}m ${String(seconds).padStart(2, "0")}s`;
  }

  function getRemainingEntries(draw: Draw) {
    if (!draw.max_entries) return null;

    return Math.max(
      0,
      Number(draw.max_entries) - Number(draw.totalTickets || 0)
    );
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

  function openMediaGallery(
    media: Array<{ type: "image" | "video"; url: string }>
  ) {
    setGallery(media);
    setGalleryIndex(0);
  }

  function closeMediaGallery() {
    setGallery([]);
    setGalleryIndex(0);
  }

  function nextGalleryItem() {
    setGalleryIndex((current) =>
      gallery.length ? (current + 1) % gallery.length : 0
    );
  }

  function previousGalleryItem() {
    setGalleryIndex((current) =>
      gallery.length
        ? (current - 1 + gallery.length) % gallery.length
        : 0
    );
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

              const startTime = draw.starts_at
                ? new Date(draw.starts_at).getTime()
                : 0;

              const isUpcoming =
                draw.status === "open" &&
                startTime > now;

              const countdown = isUpcoming
                ? formatCountdown(startTime - now)
                : "00:00:00";

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
                  {(() => {
                    const mediaFromDatabase =
                      normalizePrizeMedia(draw.prize_media);

                    const media =
                      mediaFromDatabase.length > 0
                        ? mediaFromDatabase
                        : draw.prize_image
                        ? [{ type: "image" as const, url: draw.prize_image }]
                        : [];

                    if (!media.length) return null;

                    const preview = media[0];

                    return (
                      <div className="px-5 pt-5 sm:px-6">
                        <button
                          type="button"
                          onClick={() => openMediaGallery(media)}
                          className="group relative mx-auto block overflow-hidden rounded-2xl border border-emerald-200 bg-white shadow-sm"
                          aria-label={`View ${draw.title} media`}
                        >
                          {preview.type === "video" ? (
                            <video
                              src={preview.url}
                              muted
                              playsInline
                              preload="metadata"
                              className="h-72 w-56 object-cover transition duration-200 group-hover:scale-[1.02]"
                            />
                          ) : (
                            <img
                              src={preview.url}
                              alt={draw.title}
                              className="h-72 w-56 object-cover transition duration-200 group-hover:scale-[1.02]"
                            />
                          )}

                          <span className="absolute inset-x-3 bottom-3 rounded-xl bg-black/65 px-3 py-2 text-sm font-black text-white">
                            {media.length > 1
                              ? `View all ${media.length} media`
                              : "Tap to view"}
                          </span>
                        </button>
                      </div>
                    );
                  })()}

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

                        {draw.rules &&
                          draw.rules.trim() && (
                            <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4">
                              <h3 className="text-sm font-black text-white">
                                Lucky Draw Rules
                              </h3>

                              <div className="mt-3 whitespace-pre-line text-sm leading-6 text-white/70">
                                {draw.rules}
                              </div>
                            </div>
                          )}
                      </div>

                      <div
                        className={`rounded-full border px-4 py-2 text-xs font-black uppercase tracking-wide ${getStatusStyle(
                          draw.status
                        )}`}
                      >
                        {isUpcoming
                          ? "UPCOMING"
                          : getStatusText(draw.status)}
                      </div>
                    </div>

                    {isUpcoming ? (
                      <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center">
                        <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">
                          Upcoming Lucky Draw
                        </p>

                        <p className="mt-2 text-sm text-slate-600">
                          Ticket sales open when the countdown reaches zero.
                        </p>

                        <div className="mt-4 text-4xl font-black tracking-wider text-emerald-600">
                          {countdown}
                        </div>

                        <p className="mt-2 text-xs font-semibold text-slate-500">
                          Starts {new Date(draw.starts_at as string).toLocaleString()}
                        </p>
                      </div>
                    ) : isCompleted ? (
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

                        {(() => {
                          const countdown =
                            getDrawCountdown(draw);

                          return (
                            <div className="mt-5 rounded-2xl border border-yellow-400/30 bg-yellow-400/10 p-5 text-center">
                              <p className="text-xs font-black uppercase tracking-[0.18em] text-yellow-300">
                                {countdown.phase === "starts"
                                  ? "Draw Starts In"
                                  : countdown.phase === "ends"
                                  ? "Draw Ends In"
                                  : "Entries Closed"}
                              </p>

                              {countdown.phase !== "closed" ? (
                                <p className="mt-2 text-2xl font-black tracking-wide text-white sm:text-3xl">
                                  {formatDrawCountdown(
                                    countdown.ms
                                  )}
                                </p>
                              ) : (
                                <p className="mt-2 text-xl font-black text-red-300">
                                  Entries Closed
                                </p>
                              )}
                            </div>
                          );
                        })()}

                        {(draw.duration_days != null ||
                          draw.starts_at ||
                          draw.ends_at ||
                          draw.selection_at) && (
                          <div className="mt-5 rounded-2xl border border-purple-400/25 bg-purple-500/5 p-4">
                            <div className="flex items-center justify-between gap-4">
                              <div>
                                <p className="text-xs font-black uppercase tracking-wide text-purple-300">
                                  Draw Schedule
                                </p>

                                {draw.duration_days != null && (
                                  <p className="mt-1 text-lg font-black text-white">
                                    {draw.duration_days} day
                                    {draw.duration_days === 1 ? "" : "s"}
                                  </p>
                                )}
                              </div>

                              {draw.ends_at && (
                                <div className="text-right">
                                  <p className="text-xs font-bold text-white/50">
                                    Ends
                                  </p>

                                  <p className="mt-1 text-sm font-black text-purple-200">
                                    {new Date(
                                      draw.ends_at
                                    ).toLocaleString()}
                                  </p>
                                </div>
                              )}
                            </div>

                            <div className="mt-4 grid gap-3 sm:grid-cols-3">
                              {draw.starts_at && (
                                <div className="rounded-xl border border-white/10 bg-black/10 p-3">
                                  <p className="text-[11px] font-black uppercase tracking-wide text-white/45">
                                    Starts
                                  </p>
                                  <p className="mt-1 text-sm font-bold text-white">
                                    {new Date(
                                      draw.starts_at
                                    ).toLocaleString()}
                                  </p>
                                </div>
                              )}

                              {draw.ends_at && (
                                <div className="rounded-xl border border-white/10 bg-black/10 p-3">
                                  <p className="text-[11px] font-black uppercase tracking-wide text-white/45">
                                    Entries Close
                                  </p>
                                  <p className="mt-1 text-sm font-bold text-white">
                                    {new Date(
                                      draw.ends_at
                                    ).toLocaleString()}
                                  </p>
                                </div>
                              )}

                              {draw.selection_at && (
                                <div className="rounded-xl border border-white/10 bg-black/10 p-3">
                                  <p className="text-[11px] font-black uppercase tracking-wide text-white/45">
                                    Winner Selection
                                  </p>
                                  <p className="mt-1 text-sm font-bold text-white">
                                    {new Date(
                                      draw.selection_at
                                    ).toLocaleString()}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {draw.max_entries != null && (
                          <div className="mt-5 rounded-xl border border-emerald-400/25 bg-emerald-500/5 p-4">
                            <div className="flex items-center justify-between gap-4">
                              <div>
                                <p className="text-xs font-black uppercase tracking-wide text-emerald-300">
                                  Entry Limit
                                </p>

                                <p className="mt-1 text-lg font-black text-white">
                                  {draw.totalTickets} / {draw.max_entries}
                                </p>
                              </div>

                              <div className="text-right">
                                <p className="text-xs font-bold text-white/50">
                                  {(() => {
                                    const remaining =
                                      getRemainingEntries(draw);

                                    return remaining !== null &&
                                      remaining > 0
                                      ? "Spots Remaining"
                                      : "Status";
                                  })()}
                                </p>

                                <p className="mt-1 text-sm font-black text-emerald-300">
                                  {(() => {
                                    const remaining =
                                      getRemainingEntries(draw);

                                    return remaining !== null &&
                                      remaining > 0
                                      ? remaining
                                      : "FULL";
                                  })()}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="mt-5 rounded-xl border border-orange-400/20 bg-orange-500/5 p-4">
                          <p className="text-sm font-black text-orange-200">
                            Limited Entry Draw
                          </p>

                          <p className="mt-1 text-sm leading-6 text-white/65">
                            Ticket sales may close once enough
                            entries are received. More tickets
                            increase your chances, but winning is
                            not guaranteed.
                          </p>
                        </div>

                        {draw.status === "open" &&
                          !isUpcoming && (
                          <button
                            onClick={() =>
                              openPurchaseConfirmation(draw)
                            }
                            disabled={(() => {
                              const remaining =
                                getRemainingEntries(draw);

                              return (
                                buyingId === draw.id ||
                                (remaining !== null && remaining <= 0)
                              );
                            })()}
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


        {gallery.length > 0 && (
          <div
            className="fixed inset-0 z-[999] flex items-center justify-center bg-black/90 p-4"
            role="dialog"
            aria-modal="true"
            aria-label="Lucky Draw media gallery"
            onClick={closeMediaGallery}
          >
            <button
              type="button"
              onClick={closeMediaGallery}
              aria-label="Close media gallery"
              className="absolute right-4 top-4 z-[1001] rounded-full bg-white px-4 py-2 text-2xl font-black text-black shadow-lg"
            >
              ×
            </button>

            {gallery.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    previousGalleryItem();
                  }}
                  aria-label="Previous media"
                  className="absolute left-3 top-1/2 z-[1001] -translate-y-1/2 rounded-full bg-white px-4 py-3 text-3xl font-black text-black shadow-lg"
                >
                  ‹
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    nextGalleryItem();
                  }}
                  aria-label="Next media"
                  className="absolute right-3 top-1/2 z-[1001] -translate-y-1/2 rounded-full bg-white px-4 py-3 text-3xl font-black text-black shadow-lg"
                >
                  ›
                </button>
              </>
            )}

            <div
              className="relative flex max-h-[90vh] max-w-[92vw] items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              {gallery[galleryIndex]?.type === "video" ? (
                <video
                  key={gallery[galleryIndex].url}
                  src={gallery[galleryIndex].url}
                  controls
                  autoPlay
                  playsInline
                  className="max-h-[85vh] max-w-[88vw] rounded-2xl object-contain"
                />
              ) : (
                <img
                  key={gallery[galleryIndex]?.url}
                  src={gallery[galleryIndex]?.url}
                  alt="Lucky Draw prize"
                  className="max-h-[85vh] max-w-[88vw] rounded-2xl object-contain"
                />
              )}

              {gallery.length > 1 && (
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/75 px-4 py-2 text-sm font-black text-white">
                  {galleryIndex + 1} / {gallery.length}
                </div>
              )}
            </div>
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

              <div className="mt-6 flex gap-3">
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

              <p className="mt-3 text-sm font-bold text-[#FFD54A]">
                {ticket.draw_title || "Lucky Draw"}
              </p>

              <p className="mt-4 text-sm text-white/65">
                Your ticket number is
              </p>

              <p className="mt-2 text-2xl font-black text-white">
                {ticket.ticket_number}
              </p>

              <p className="mt-2 text-xs text-white/45">
                Entry: GH₵{Number(ticket.amount || 0).toFixed(2)}
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
