"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type PrizeType =
  | "cash"
  | "rent"
  | "physical"
  | "grocery"
  | "other";

export default function AdminLuckyDrawPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [draws, setDraws] = useState<any[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const [title, setTitle] = useState("");
  const [prizeType, setPrizeType] = useState<PrizeType>("cash");
  const [prizeAmount, setPrizeAmount] = useState("");
  const [prizeValue, setPrizeValue] = useState("");
  const [prizeDescription, setPrizeDescription] = useState("");
  const [prizeImage, setPrizeImage] = useState("");
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

    try {
      const res = await fetch(`/api/admin/lucky-draw?t=${Date.now()}`, {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        cache: "no-store",
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "Could not load Lucky Draw.");
        return;
      }

      setTickets(data.tickets || []);
      setDraws(data.draws || []);
      setTotalRevenue(Number(data.totalRevenue || 0));
    } catch {
      setMessage("Could not load Lucky Draw.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
  }, []);

  const openDraw = draws.find((draw) => draw.status === "open");

  const isAutoPaidPrize =
    prizeType === "cash" || prizeType === "rent";

  async function createDraw() {
    setMessage("");

    const ticket = Number(ticketPrice);
    const amount = Number(prizeAmount || 0);
    const value = Number(prizeValue || 0);

    if (!title.trim()) {
      setMessage("Enter a prize title.");
      return;
    }

    if (!Number.isFinite(ticket) || ticket <= 0) {
      setMessage("Enter a valid ticket price.");
      return;
    }

    if (isAutoPaidPrize && (!Number.isFinite(amount) || amount <= 0)) {
      setMessage("Enter a valid cash or rent prize amount.");
      return;
    }

    if (
      !isAutoPaidPrize &&
      (!Number.isFinite(value) || value <= 0)
    ) {
      setMessage("Enter the estimated value of the prize.");
      return;
    }

    const confirmed = window.confirm(
      `Create this Lucky Draw?

Prize: ${title}
Type: ${prizeType}
Ticket: GH₵${ticket.toFixed(2)}`
    );

    if (!confirmed) return;

    setCreating(true);

    try {
      const session = await getSession();

      if (!session) {
        setMessage("Admin login required.");
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
          prizeType,
          prizeAmount: isAutoPaidPrize ? amount : 0,
          prizeValue: isAutoPaidPrize ? amount : value,
          prizeDescription: prizeDescription.trim(),
          prizeImage: prizeImage.trim(),
          ticketPrice: ticket,
        }),
      });

      const responseText = await res.text();

      let data: any = {};

      try {
        data = JSON.parse(responseText);
      } catch {
        console.error("CREATE DRAW RAW RESPONSE:", responseText);

        setMessage(
          `Server error (${res.status}): ${responseText.slice(0, 300)}`
        );
        return;
      }

      console.log("CREATE DRAW RESPONSE:", {
        status: res.status,
        data,
      });

      if (!res.ok) {
        console.error("CREATE DRAW ERROR:", data);

        setMessage(
          `Error ${res.status}: ${data.error || "Could not create Lucky Draw."}`
        );
        return;
      }

      setTitle("");
      setPrizeType("cash");
      setPrizeAmount("");
      setPrizeValue("");
      setPrizeDescription("");
      setPrizeImage("");
      setTicketPrice("");
      setMessage("🎉 New Lucky Draw created successfully.");

      await loadData();
    } catch {
      setMessage("Could not create Lucky Draw.");
    } finally {
      setCreating(false);
    }
  }

  async function completeDraw() {
    if (!openDraw) {
      setMessage("No open Lucky Draw found.");
      return;
    }

    const prizeType = openDraw.prize_type || "cash";
    const isCashOrRent =
      prizeType === "cash" || prizeType === "rent";

    const prizeText = isCashOrRent
      ? `GH₵${Number(openDraw.prize_amount || 0).toFixed(2)}`
      : openDraw.title;

    const confirmed = window.confirm(
      isCashOrRent
        ? `Select a random winner, close this draw, and automatically credit ${prizeText} to the winner's wallet?`
        : `Select a random winner and close this draw?

The winner will receive: ${prizeText}

No cash will automatically be credited. You will arrange prize delivery or collection manually.`
    );

    if (!confirmed) return;

    setCompleting(true);
    setMessage("");

    try {
      const session = await getSession();

      if (!session) {
        setMessage("Admin login required.");
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
        return;
      }

      if (data.result.prize_paid) {
        setMessage(
          `🏆 Winner selected! Ticket ${data.result.ticket_number} won GH₵${Number(
            data.result.prize_amount
          ).toFixed(2)} and the prize was credited to their wallet.`
        );
      } else {
        setMessage(
          `🏆 Winner selected! Ticket ${data.result.ticket_number} won ${openDraw.title}. Contact the winner to arrange collection or delivery.`
        );
      }

      await loadData();
    } catch {
      setMessage("Could not complete Lucky Draw.");
    } finally {
      setCompleting(false);
    }
  }

  function getPrizeLabel(draw: any) {
    const type = draw.prize_type || "cash";

    if (type === "cash") return "💰 Cash Prize";
    if (type === "rent") return "🏠 Rent Support";
    if (type === "grocery") return "🛒 Grocery Prize";
    if (type === "physical") return "🎁 Physical Prize";

    return "🎁 Other Prize";
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
              Create cash and real prize draws, manage tickets and select winners.
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
              Create a cash prize or a real physical prize.
            </p>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-bold text-white/60">
                  Prize Title
                </label>

                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Example: iPhone 16 Pro Max"
                  className="mt-2 w-full rounded-xl border border-white/10 bg-black px-4 py-3 outline-none focus:border-yellow-400"
                />
              </div>

              <div>
                <label className="text-sm font-bold text-white/60">
                  Prize Type
                </label>

                <select
                  value={prizeType}
                  onChange={(e) =>
                    setPrizeType(e.target.value as PrizeType)
                  }
                  className="mt-2 w-full rounded-xl border border-white/10 bg-black px-4 py-3 outline-none focus:border-yellow-400"
                >
                  <option value="cash">💰 Cash Prize</option>
                  <option value="rent">🏠 Rent Support</option>
                  <option value="physical">🎁 Physical Prize</option>
                  <option value="grocery">🛒 Grocery / Food</option>
                  <option value="other">🎁 Other Prize</option>
                </select>
              </div>

              {isAutoPaidPrize ? (
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
                    placeholder="5000"
                    className="mt-2 w-full rounded-xl border border-white/10 bg-black px-4 py-3 outline-none focus:border-yellow-400"
                  />
                </div>
              ) : (
                <div>
                  <label className="text-sm font-bold text-white/60">
                    Estimated Prize Value (GH₵)
                  </label>

                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    value={prizeValue}
                    onChange={(e) => setPrizeValue(e.target.value)}
                    placeholder="15000"
                    className="mt-2 w-full rounded-xl border border-white/10 bg-black px-4 py-3 outline-none focus:border-yellow-400"
                  />
                </div>
              )}

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
                  placeholder="20"
                  className="mt-2 w-full rounded-xl border border-white/10 bg-black px-4 py-3 outline-none focus:border-yellow-400"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="text-sm font-bold text-white/60">
                Prize Description
              </label>

              <textarea
                value={prizeDescription}
                onChange={(e) => setPrizeDescription(e.target.value)}
                placeholder="Example: Brand new iPhone. Winner can arrange collection or delivery."
                rows={3}
                className="mt-2 w-full rounded-xl border border-white/10 bg-black px-4 py-3 outline-none focus:border-yellow-400"
              />
            </div>

            <div className="mt-4">
              <label className="text-sm font-bold text-white/60">
                Prize Image URL
              </label>

              <input
                type="url"
                value={prizeImage}
                onChange={(e) => setPrizeImage(e.target.value)}
                placeholder="Paste the image URL here"
                className="mt-2 w-full rounded-xl border border-white/10 bg-black px-4 py-3 outline-none focus:border-yellow-400"
              />

              <p className="mt-2 text-xs text-white/40">
                You can add an image URL for now. Next, we can build direct image upload.
              </p>
            </div>

            {prizeImage && (
              <div className="mt-5 overflow-hidden rounded-2xl border border-white/10 bg-black/40">
                <img
                  src={prizeImage}
                  alt={title || "Prize preview"}
                  className="h-64 w-full object-contain"
                />
              </div>
            )}

            <div className="mt-5 rounded-2xl border border-white/10 bg-black/30 p-4 text-sm">
              {isAutoPaidPrize ? (
                <p className="text-green-300">
                  ✓ This prize will automatically be credited to the winner's Fortuna wallet.
                </p>
              ) : (
                <p className="text-yellow-200">
                  ⚠ This is a real prize. The winner will be recorded, but no cash will be automatically paid.
                </p>
              )}
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
            <section className="mt-8 overflow-hidden rounded-3xl border border-yellow-400/30 bg-yellow-400/10">
              {openDraw.prize_image && (
                <img
                  src={openDraw.prize_image}
                  alt={openDraw.title}
                  className="h-72 w-full bg-black object-contain"
                />
              )}

              <div className="p-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-bold text-yellow-300">
                      {getPrizeLabel(openDraw)}
                    </p>

                    <h2 className="mt-2 text-3xl font-black text-yellow-400">
                      {openDraw.title || "Current Lucky Draw"}
                    </h2>

                    {openDraw.prize_description && (
                      <p className="mt-3 max-w-2xl text-white/60">
                        {openDraw.prize_description}
                      </p>
                    )}
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
            </section>

            <div className="mt-8 grid gap-4 md:grid-cols-4">
              <div className="rounded-3xl border border-yellow-400/20 bg-yellow-400/10 p-6">
                <p className="text-white/60">Prize</p>

                <h2 className="mt-2 text-xl font-black text-yellow-400">
                  {openDraw.prize_type === "cash" ||
                  openDraw.prize_type === "rent"
                    ? `GH₵${Number(openDraw.prize_amount || 0).toFixed(2)}`
                    : openDraw.title}
                </h2>
              </div>

              {(openDraw.prize_type === "cash" ||
                openDraw.prize_type === "rent") && (
                <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
                  <p className="text-white/60">Prize Value</p>

                  <h2 className="mt-2 text-2xl font-black">
                    GH₵
                    {Number(
                      openDraw.prize_value ||
                        openDraw.prize_amount ||
                        0
                    ).toFixed(2)}
                  </h2>
                </div>
              )}

              <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
                <p className="text-white/60">Ticket Price</p>

                <h2 className="mt-2 text-2xl font-black">
                  GH₵{Number(openDraw.ticket_price || 0).toFixed(2)}
                </h2>
              </div>

              <div className="rounded-3xl border border-green-400/20 bg-green-500/10 p-6">
                <p className="text-white/60">Tickets Sold</p>

                <h2 className="mt-2 text-3xl font-black text-green-300">
                  {tickets.length}
                </h2>

                <p className="mt-1 text-sm text-white/50">
                  Revenue: GH₵{totalRevenue.toFixed(2)}
                </p>
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
