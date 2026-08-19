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
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
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

  const isAutoPaidPrize =
    prizeType === "cash" || prizeType === "rent";

  async function uploadPrizeImage(file: File) {
    setUploadingImage(true);
    setMessage("");

    try {
      const session = await getSession();

      if (!session) {
        setMessage("Admin login required.");
        return "";
      }

      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/lucky-draw/upload-image", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        body: formData,
      });

      const responseText = await res.text();

      let data: any = {};

      try {
        data = JSON.parse(responseText);
      } catch {
        console.error("UPLOAD IMAGE RAW RESPONSE:", responseText);
        setMessage(
          `Image upload failed (${res.status}): ${responseText.slice(0, 200)}`
        );
        return "";
      }

      if (!res.ok) {
        console.error("UPLOAD IMAGE ERROR:", data);
        setMessage(data.error || "Could not upload image.");
        return "";
      }

      setPrizeImage(data.url);
      return data.url;
    } catch (error) {
      console.error("UPLOAD IMAGE ERROR:", error);
      setMessage("Could not upload image.");
      return "";
    } finally {
      setUploadingImage(false);
    }
  }

  async function createDraw() {
    setMessage("");

    const ticket = Number(ticketPrice);
    const amount = Number(prizeAmount || 0);
    const value = Number(prizeValue || 0);

    let uploadedImageUrl = prizeImage;

    if (selectedImage) {
      uploadedImageUrl = await uploadPrizeImage(selectedImage);

      if (!uploadedImageUrl) {
        return;
      }
    }

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
          prizeImage: uploadedImageUrl.trim(),
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

  async function updateDrawStatus(
    drawId: string,
    newStatus: "open" | "paused" | "suspended"
  ) {
    const labels = {
      open: "resume",
      paused: "pause",
      suspended: "suspend",
    };

    const confirmed = window.confirm(
      `Are you sure you want to ${labels[newStatus]} this Lucky Draw?`
    );

    if (!confirmed) return;

    setMessage("");

    try {
      const session = await getSession();

      if (!session) {
        setMessage("Admin login required.");
        return;
      }

      const res = await fetch("/api/admin/lucky-draw/update-status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          drawId,
          status: newStatus,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "Could not update Lucky Draw status.");
        return;
      }

      setMessage(`Lucky Draw is now ${newStatus}.`);
      await loadData();
    } catch {
      setMessage("Could not update Lucky Draw status.");
    }
  }

  async function completeDraw(draw: any) {
    const prizeType = draw.prize_type || "cash";
    const isCashOrRent =
      prizeType === "cash" || prizeType === "rent";

    const prizeText = isCashOrRent
      ? `GH₵${Number(draw.prize_amount || 0).toFixed(2)}`
      : draw.title;

    const confirmed = window.confirm(
      isCashOrRent
        ? `Select a random winner, close "${draw.title}", and automatically credit ${prizeText} to the winner's wallet?`
        : `Select a random winner and close "${draw.title}"?

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
          drawId: draw.id,
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
          `🏆 Winner selected! Ticket ${data.result.ticket_number} won ${draw.title}. Contact the winner to arrange collection or delivery.`
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

        {!loading && (
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
                Prize Image
              </label>

              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  setSelectedImage(file);
                  setPrizeImage("");
                }}
                className="mt-2 block w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-sm text-white file:mr-4 file:rounded-lg file:border-0 file:bg-yellow-400 file:px-4 file:py-2 file:font-bold file:text-black hover:file:bg-yellow-300"
              />

              {selectedImage && (
                <p className="mt-2 text-xs text-green-300">
                  ✓ Selected: {selectedImage.name}
                </p>
              )}

              <p className="mt-2 text-xs text-white/40">
                Select an image from your device. It will be uploaded automatically when you create the Lucky Draw.
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

        {draws.length > 0 && (
          <section className="mt-8">
            <div className="mb-5">
              <h2 className="text-3xl font-black text-yellow-400">
                Lucky Draws
              </h2>

              <p className="mt-2 text-white/60">
                Manage each Lucky Draw independently. You can run multiple draws at the same time.
              </p>
            </div>

            <div className="grid gap-6">
              {draws.map((draw) => {
                const drawTickets = tickets.filter(
                  (ticket) => ticket.draw_id === draw.id
                );

                const drawRevenue = drawTickets.reduce(
                  (sum, ticket) => sum + Number(ticket.amount || 0),
                  0
                );

                return (
                <section
                  key={draw.id}
                  className="overflow-hidden rounded-3xl border border-white/10 bg-white/5"
                >
                  {draw.prize_image && (
                    <img
                      src={draw.prize_image}
                      alt={draw.title}
                      className="h-72 w-full bg-black object-contain"
                    />
                  )}

                  <div className="p-6">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <div className="flex flex-wrap items-center gap-3">
                          <p className="text-sm font-bold text-yellow-300">
                            {getPrizeLabel(draw)}
                          </p>

                          <span
                            className={`rounded-full px-3 py-1 text-xs font-black ${
                              draw.status === "open"
                                ? "bg-green-500/20 text-green-300"
                                : draw.status === "paused"
                                ? "bg-yellow-400/20 text-yellow-300"
                                : draw.status === "suspended"
                                ? "bg-red-500/20 text-red-300"
                                : "bg-white/10 text-white/60"
                            }`}
                          >
                            {String(draw.status || "open").toUpperCase()}
                          </span>
                        </div>

                        <h2 className="mt-2 text-3xl font-black text-yellow-400">
                          {draw.title || "Lucky Draw"}
                        </h2>

                        {draw.prize_description && (
                          <p className="mt-3 max-w-2xl text-white/60">
                            {draw.prize_description}
                          </p>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {draw.status === "open" && (
                          <>
                            <button
                              onClick={() => updateDrawStatus(draw.id, "paused")}
                              className="rounded-xl border border-yellow-400/40 px-4 py-2 font-bold text-yellow-300"
                            >
                              ⏸ Pause
                            </button>

                            <button
                              onClick={() => updateDrawStatus(draw.id, "suspended")}
                              className="rounded-xl border border-red-400/40 px-4 py-2 font-bold text-red-300"
                            >
                              ⚠ Suspend
                            </button>

                            <button
                              onClick={() => completeDraw(draw)}
                              disabled={completing}
                              className="rounded-xl bg-yellow-400 px-4 py-2 font-black text-black disabled:opacity-50"
                            >
                              {completing
                                ? "Selecting..."
                                : "🏆 Select Winner & Close"}
                            </button>
                          </>
                        )}

                        {draw.status === "paused" && (
                          <>
                            <button
                              onClick={() => updateDrawStatus(draw.id, "open")}
                              className="rounded-xl bg-green-400 px-4 py-2 font-black text-black"
                            >
                              ▶ Resume
                            </button>

                            <button
                              onClick={() => updateDrawStatus(draw.id, "suspended")}
                              className="rounded-xl border border-red-400/40 px-4 py-2 font-bold text-red-300"
                            >
                              ⚠ Suspend
                            </button>
                          </>
                        )}

                        {draw.status === "suspended" && (
                          <button
                            onClick={() => updateDrawStatus(draw.id, "open")}
                            className="rounded-xl bg-green-400 px-4 py-2 font-black text-black"
                          >
                            ▶ Resume
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="mt-6 grid gap-4 md:grid-cols-5">
                      <div className="rounded-2xl border border-yellow-400/20 bg-yellow-400/10 p-4">
                        <p className="text-sm text-white/60">Prize</p>

                        <h3 className="mt-2 text-xl font-black text-yellow-400">
                          {draw.prize_type === "cash" ||
                          draw.prize_type === "rent"
                            ? `GH₵${Number(draw.prize_amount || 0).toFixed(2)}`
                            : draw.title}
                        </h3>
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                        <p className="text-sm text-white/60">Ticket Price</p>

                        <h3 className="mt-2 text-xl font-black">
                          GH₵{Number(draw.ticket_price || 0).toFixed(2)}
                        </h3>
                      </div>

                      <div className="rounded-2xl border border-blue-400/20 bg-blue-500/10 p-4">
                        <p className="text-sm text-white/60">Tickets Sold</p>

                        <h3 className="mt-2 text-xl font-black text-blue-300">
                          {drawTickets.length}
                        </h3>
                      </div>

                      <div className="rounded-2xl border border-green-400/20 bg-green-500/10 p-4">
                        <p className="text-sm text-white/60">Revenue</p>

                        <h3 className="mt-2 text-xl font-black text-green-300">
                          GH₵{drawRevenue.toFixed(2)}
                        </h3>
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                        <p className="text-sm text-white/60">Status</p>

                        <h3 className="mt-2 text-xl font-black">
                          {String(draw.status || "open").toUpperCase()}
                        </h3>
                      </div>
                    </div>
                  </div>
                </section>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
