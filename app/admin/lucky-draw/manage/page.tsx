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

  const [editingDraw, setEditingDraw] = useState<any | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editPrizeType, setEditPrizeType] =
    useState<PrizeType>("cash");
  const [editPrizeAmount, setEditPrizeAmount] = useState("");
  const [editPrizeValue, setEditPrizeValue] = useState("");
  const [editPrizeDescription, setEditPrizeDescription] =
    useState("");
  const [editPrizeImage, setEditPrizeImage] = useState("");
  const [editSelectedImage, setEditSelectedImage] =
    useState<File | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);

  const [claims, setClaims] = useState<any[]>([]);
  const [loadingClaims, setLoadingClaims] = useState(false);
  const [updatingClaimId, setUpdatingClaimId] = useState<string | null>(null);

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
      const res = await fetch(
        `/api/admin/lucky-draw?t=${Date.now()}`,
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
          cache: "no-store",
        }
      );

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

    const interval = window.setInterval(() => {
      void loadData();
    }, 5000);

    return () => window.clearInterval(interval);
  }, []);

  const isAutoPaidPrize =
    prizeType === "cash" || prizeType === "rent";

  const isEditAutoPaidPrize =
    editPrizeType === "cash" || editPrizeType === "rent";

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

      const res = await fetch(
        "/api/admin/lucky-draw/upload-image",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
          body: formData,
        }
      );

      const responseText = await res.text();

      let data: any = {};

      try {
        data = JSON.parse(responseText);
      } catch {
        console.error(
          "UPLOAD IMAGE RAW RESPONSE:",
          responseText
        );
        setMessage(
          `Image upload failed (${res.status}): ${responseText.slice(
            0,
            200
          )}`
        );
        return "";
      }

      if (!res.ok) {
        setMessage(data.error || "Could not upload image.");
        return "";
      }

      return data.url || "";
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

      if (!uploadedImageUrl) return;
    }

    if (!title.trim()) {
      setMessage("Enter a prize title.");
      return;
    }

    if (!Number.isFinite(ticket) || ticket <= 0) {
      setMessage("Enter a valid ticket price.");
      return;
    }

    if (
      isAutoPaidPrize &&
      (!Number.isFinite(amount) || amount <= 0)
    ) {
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

      const res = await fetch(
        "/api/admin/lucky-draw/create",
        {
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
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setMessage(
          data.error || "Could not create Lucky Draw."
        );
        return;
      }

      setTitle("");
      setPrizeType("cash");
      setPrizeAmount("");
      setPrizeValue("");
      setPrizeDescription("");
      setPrizeImage("");
      setSelectedImage(null);
      setTicketPrice("");
      setMessage("🎉 New Lucky Draw created successfully.");

      await loadData();
    } catch {
      setMessage("Could not create Lucky Draw.");
    } finally {
      setCreating(false);
    }
  }

  function startEdit(draw: any) {
    setEditingDraw(draw);
    setEditTitle(draw.title || "");
    setEditPrizeType(draw.prize_type || "cash");
    setEditPrizeAmount(
      String(draw.prize_amount ?? "")
    );
    setEditPrizeValue(
      String(draw.prize_value ?? draw.prize_amount ?? "")
    );
    setEditPrizeDescription(
      draw.prize_description || ""
    );
    setEditPrizeImage(draw.prize_image || "");
    setEditSelectedImage(null);
    setMessage("");
  }

  function cancelEdit() {
    setEditingDraw(null);
    setEditTitle("");
    setEditPrizeType("cash");
    setEditPrizeAmount("");
    setEditPrizeValue("");
    setEditPrizeDescription("");
    setEditPrizeImage("");
    setEditSelectedImage(null);
  }

  async function saveEdit() {
    if (!editingDraw) return;

    setMessage("");

    const amount = Number(editPrizeAmount || 0);
    const value = Number(editPrizeValue || 0);

    if (!editTitle.trim()) {
      setMessage("Enter a prize title.");
      return;
    }

    if (
      isEditAutoPaidPrize &&
      (!Number.isFinite(amount) || amount <= 0)
    ) {
      setMessage("Enter a valid cash or rent prize amount.");
      return;
    }

    if (
      !isEditAutoPaidPrize &&
      (!Number.isFinite(value) || value <= 0)
    ) {
      setMessage("Enter a valid prize value.");
      return;
    }

    const confirmed = window.confirm(
      `Save changes to this Lucky Draw?

Prize: ${editTitle}
Type: ${editPrizeType}`
    );

    if (!confirmed) return;

    setSavingEdit(true);

    try {
      let uploadedImageUrl = editPrizeImage;

      if (editSelectedImage) {
        uploadedImageUrl = await uploadPrizeImage(
          editSelectedImage
        );

        if (!uploadedImageUrl) return;
      }

      const session = await getSession();

      if (!session) {
        setMessage("Admin login required.");
        return;
      }

      const res = await fetch(
        "/api/admin/lucky-draw/edit",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            drawId: editingDraw.id,
            title: editTitle.trim(),
            prizeType: editPrizeType,
            prizeAmount: isEditAutoPaidPrize
              ? amount
              : 0,
            prizeValue: isEditAutoPaidPrize
              ? amount
              : value,
            prizeDescription:
              editPrizeDescription.trim(),
            prizeImage: uploadedImageUrl.trim(),
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setMessage(
          data.error || "Could not update Lucky Draw."
        );
        return;
      }

      setMessage("✅ Lucky Draw updated successfully.");
      cancelEdit();
      await loadData();
    } catch {
      setMessage("Could not update Lucky Draw.");
    } finally {
      setSavingEdit(false);
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

      const res = await fetch(
        "/api/admin/lucky-draw/update-status",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            drawId,
            status: newStatus,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setMessage(
          data.error ||
            "Could not update Lucky Draw status."
        );
        return;
      }

      setMessage(`Lucky Draw is now ${newStatus}.`);
      await loadData();
    } catch {
      setMessage("Could not update Lucky Draw status.");
    }
  }

  async function loadClaims() {
    setLoadingClaims(true);

    try {
      const session = await getSession();

      if (!session) {
        setMessage("Admin login required.");
        return;
      }

      const res = await fetch(
        "/api/admin/lucky-draw/claims",
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
          cache: "no-store",
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "Could not load prize claims.");
        return;
      }

      setClaims(data.claims || []);
    } catch {
      setMessage("Could not load prize claims.");
    } finally {
      setLoadingClaims(false);
    }
  }

  async function updateClaimStatus(
    claimId: string,
    status: string
  ) {
    setUpdatingClaimId(claimId);
    setMessage("");

    try {
      const session = await getSession();

      if (!session) {
        setMessage("Admin login required.");
        return;
      }

      const res = await fetch(
        "/api/admin/lucky-draw/claims",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            claimId,
            status,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setMessage(
          data.error || "Could not update prize claim."
        );
        return;
      }

      setMessage("Prize claim status updated successfully.");
      await loadClaims();
    } catch {
      setMessage("Could not update prize claim.");
    } finally {
      setUpdatingClaimId(null);
    }
  }

  async function completeDraw(draw: any) {
    const prizeType = draw.prize_type || "cash";
    const isCashOrRent =
      prizeType === "cash" || prizeType === "rent";

    const prizeText = isCashOrRent
      ? `GH₵${Number(
          draw.prize_amount || 0
        ).toFixed(2)}`
      : draw.title;

    const confirmed = window.confirm(
      isCashOrRent
        ? `Select a random winner, close "${draw.title}", and automatically credit ${prizeText} to the winner's wallet?`
        : `Select a random winner and close "${draw.title}"?

The winner will receive: ${prizeText}

No cash will automatically be credited. Delivery or collection details will be requested from the winner.`
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

      const res = await fetch(
        "/api/admin/lucky-draw/complete",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            drawId: draw.id,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setMessage(
          data.error || "Could not complete Lucky Draw."
        );
        return;
      }

      if (data.result?.prize_paid) {
        setMessage(
          `🏆 Winner selected! Ticket ${
            data.result.ticket_number
          } won GH₵${Number(
            data.result.prize_amount
          ).toFixed(2)} and the prize was credited to their wallet.`
        );
      } else {
        setMessage(
          `🏆 Winner selected! Ticket ${
            data.result?.ticket_number
          } won ${draw.title}. The winner can now submit delivery details.`
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
    <main className="min-h-screen bg-[#071A33] px-6 py-10 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black text-[#FFD54A]">
              Lucky Draw Admin
            </h1>

            <p className="mt-2 text-[#9AAAC1]">
              Create, edit and manage Lucky Draw prizes,
              tickets and winners.
            </p>
          </div>

          <Link
            href="/admin"
            className="rounded-xl border border-[#38BDF8]/15 bg-[#0B2545]/70 px-5 py-3 font-bold"
          >
            Back to Admin
          </Link>
        </div>

        {message && (
          <div className="mt-8 rounded-2xl border border-[#FFD54A]/20 bg-[#FFD54A]/10 p-5 text-yellow-200">
            {message}
          </div>
        )}

        {loading && (
          <p className="mt-8 text-[#9AAAC1]">
            Loading Lucky Draw...
          </p>
        )}

        {!loading && (
          <>
            <section className="mt-8 rounded-3xl border border-[#FFD54A]/30 bg-[#FFD54A]/10 p-6">
              <h2 className="text-2xl font-black text-[#FFD54A]">
                Create New Lucky Draw
              </h2>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-bold text-[#9AAAC1]">
                    Prize Title
                  </label>

                  <input
                    value={title}
                    onChange={(e) =>
                      setTitle(e.target.value)
                    }
                    placeholder="Example: iPhone 16 Pro Max"
                    className="mt-2 w-full rounded-xl border border-[#38BDF8]/15 bg-[#071A33] px-4 py-3 outline-none focus:border-[#FFD54A]"
                  />
                </div>

                <div>
                  <label className="text-sm font-bold text-[#9AAAC1]">
                    Prize Type
                  </label>

                  <select
                    value={prizeType}
                    onChange={(e) =>
                      setPrizeType(
                        e.target.value as PrizeType
                      )
                    }
                    className="mt-2 w-full rounded-xl border border-[#38BDF8]/15 bg-[#071A33] px-4 py-3 outline-none focus:border-[#FFD54A]"
                  >
                    <option value="cash">Cash</option>
                    <option value="rent">Rent Support</option>
                    <option value="physical">
                      Physical Item
                    </option>
                    <option value="grocery">Grocery</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                {isAutoPaidPrize ? (
                  <div>
                    <label className="text-sm font-bold text-[#9AAAC1]">
                      Prize Amount
                    </label>

                    <input
                      type="number"
                      value={prizeAmount}
                      onChange={(e) =>
                        setPrizeAmount(e.target.value)
                      }
                      placeholder="Example: 1000"
                      className="mt-2 w-full rounded-xl border border-[#38BDF8]/15 bg-[#071A33] px-4 py-3 outline-none focus:border-[#FFD54A]"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="text-sm font-bold text-[#9AAAC1]">
                      Estimated Prize Value
                    </label>

                    <input
                      type="number"
                      value={prizeValue}
                      onChange={(e) =>
                        setPrizeValue(e.target.value)
                      }
                      placeholder="Example: 5000"
                      className="mt-2 w-full rounded-xl border border-[#38BDF8]/15 bg-[#071A33] px-4 py-3 outline-none focus:border-[#FFD54A]"
                    />
                  </div>
                )}

                <div>
                  <label className="text-sm font-bold text-[#9AAAC1]">
                    Ticket Price
                  </label>

                  <input
                    type="number"
                    value={ticketPrice}
                    onChange={(e) =>
                      setTicketPrice(e.target.value)
                    }
                    placeholder="Example: 10"
                    className="mt-2 w-full rounded-xl border border-[#38BDF8]/15 bg-[#071A33] px-4 py-3 outline-none focus:border-[#FFD54A]"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-sm font-bold text-[#9AAAC1]">
                    Prize Description
                  </label>

                  <textarea
                    value={prizeDescription}
                    onChange={(e) =>
                      setPrizeDescription(e.target.value)
                    }
                    placeholder="Describe the prize"
                    className="mt-2 min-h-28 w-full rounded-xl border border-[#38BDF8]/15 bg-[#071A33] px-4 py-3 outline-none focus:border-[#FFD54A]"
                  />
                </div>

                <div>
                  <label className="text-sm font-bold text-[#9AAAC1]">
                    Prize Image
                  </label>

                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      setSelectedImage(
                        e.target.files?.[0] || null
                      )
                    }
                    className="mt-2 w-full rounded-xl border border-[#38BDF8]/15 bg-[#071A33] px-4 py-3"
                  />
                </div>

              </div>

              <button
                onClick={createDraw}
                disabled={creating || uploadingImage}
                className="mt-6 rounded-xl bg-[#FFD54A] px-6 py-3 font-black text-black disabled:opacity-50"
              >
                {creating || uploadingImage
                  ? "Please wait..."
                  : "Create Lucky Draw"}
              </button>
            </section>

            {editingDraw && (
              <section className="mt-8 rounded-3xl border border-blue-400/30 bg-[#3F82DD]/10 p-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-black text-blue-300">
                      Edit Lucky Draw
                    </h2>
                    <p className="mt-1 text-sm text-[#9AAAC1]">
                      Correct any mistake before completing
                      the draw.
                    </p>
                  </div>

                  <button
                    onClick={cancelEdit}
                    className="rounded-xl border border-[#38BDF8]/20 px-4 py-2 font-bold"
                  >
                    Cancel Edit
                  </button>
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-bold text-[#9AAAC1]">
                      Prize Title
                    </label>

                    <input
                      value={editTitle}
                      onChange={(e) =>
                        setEditTitle(e.target.value)
                      }
                      className="mt-2 w-full rounded-xl border border-[#38BDF8]/15 bg-[#071A33] px-4 py-3"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-bold text-[#9AAAC1]">
                      Prize Type
                    </label>

                    <select
                      value={editPrizeType}
                      onChange={(e) =>
                        setEditPrizeType(
                          e.target.value as PrizeType
                        )
                      }
                      className="mt-2 w-full rounded-xl border border-[#38BDF8]/15 bg-[#071A33] px-4 py-3"
                    >
                      <option value="cash">Cash</option>
                      <option value="rent">
                        Rent Support
                      </option>
                      <option value="physical">
                        Physical Item
                      </option>
                      <option value="grocery">
                        Grocery
                      </option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  {isEditAutoPaidPrize ? (
                    <div>
                      <label className="text-sm font-bold text-[#9AAAC1]">
                        Prize Amount
                      </label>

                      <input
                        type="number"
                        value={editPrizeAmount}
                        onChange={(e) =>
                          setEditPrizeAmount(
                            e.target.value
                          )
                        }
                        className="mt-2 w-full rounded-xl border border-[#38BDF8]/15 bg-[#071A33] px-4 py-3"
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="text-sm font-bold text-[#9AAAC1]">
                        Estimated Prize Value
                      </label>

                      <input
                        type="number"
                        value={editPrizeValue}
                        onChange={(e) =>
                          setEditPrizeValue(
                            e.target.value
                          )
                        }
                        className="mt-2 w-full rounded-xl border border-[#38BDF8]/15 bg-[#071A33] px-4 py-3"
                      />
                    </div>
                  )}

                  <div className="md:col-span-2">
                    <label className="text-sm font-bold text-[#9AAAC1]">
                      Prize Description
                    </label>

                    <textarea
                      value={editPrizeDescription}
                      onChange={(e) =>
                        setEditPrizeDescription(
                          e.target.value
                        )
                      }
                      className="mt-2 min-h-28 w-full rounded-xl border border-[#38BDF8]/15 bg-[#071A33] px-4 py-3"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-bold text-[#9AAAC1]">
                      Replace Prize Image
                    </label>

                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        setEditSelectedImage(
                          e.target.files?.[0] || null
                        )
                      }
                      className="mt-2 w-full rounded-xl border border-[#38BDF8]/15 bg-[#071A33] px-4 py-3"
                    />
                  </div>

                </div>

                <button
                  onClick={saveEdit}
                  disabled={savingEdit || uploadingImage}
                  className="mt-6 rounded-xl bg-blue-400 px-6 py-3 font-black text-black disabled:opacity-50"
                >
                  {savingEdit || uploadingImage
                    ? "Saving..."
                    : "Save Changes"}
                </button>
              </section>
            )}

            <section className="mt-8">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <h2 className="text-2xl font-black text-[#FFD54A]">
                  All Active Lucky Draws
                </h2>

                <div className="rounded-xl border border-[#38BDF8]/15 bg-[#0B2545]/70 px-4 py-2 text-sm text-[#B4C0D1]">
                  Total Revenue: GH₵
                  {totalRevenue.toFixed(2)}
                </div>
              </div>

              <div className="mt-6 grid gap-6 lg:grid-cols-2">
                {draws.map((draw) => {
                  const drawTickets = tickets.filter(
                    (ticket) =>
                      ticket.draw_id === draw.id
                  );

                  const revenue =
                    drawTickets.length *
                    Number(draw.ticket_price || 0);

                  const prizeText =
                    draw.prize_type === "cash" ||
                    draw.prize_type === "rent"
                      ? `GH₵${Number(
                          draw.prize_amount || 0
                        ).toFixed(2)}`
                      : draw.title;

                  return (
                    <div
                      key={draw.id}
                      className="rounded-3xl border border-[#38BDF8]/15 bg-[#0B2545]/70 p-6"
                    >
                      {draw.prize_image && (
                        <img
                          src={draw.prize_image}
                          alt={draw.title}
                          className="h-48 w-full rounded-2xl object-cover"
                        />
                      )}

                      <div className="mt-5 flex flex-wrap items-start justify-between gap-4">
                        <div>
                          <p className="text-sm font-bold text-[#8295B0]">
                            {getPrizeLabel(draw)}
                          </p>

                          <h3 className="mt-1 text-2xl font-black text-[#FFD54A]">
                            {draw.title}
                          </h3>

                          <p className="mt-2 text-sm text-[#9AAAC1]">
                            Status:{" "}
                            <span className="font-bold">
                              {draw.status}
                            </span>
                          </p>
                        </div>

                        <button
                          onClick={() => startEdit(draw)}
                          disabled={draw.status === "completed"}
                          className="rounded-xl border border-blue-400/40 px-4 py-2 font-black text-blue-300 disabled:opacity-40"
                        >
                          ✏ Edit
                        </button>
                      </div>

                      {draw.prize_description && (
                        <p className="mt-4 text-sm text-[#B4C0D1]">
                          {draw.prize_description}
                        </p>
                      )}

                      <div className="mt-6 flex flex-wrap gap-3">
                        {draw.status === "open" && (
                          <>
                            <button
                              onClick={() =>
                                updateDrawStatus(
                                  draw.id,
                                  "paused"
                                )
                              }
                              className="rounded-xl bg-[#FFD54A] px-4 py-2 font-black text-black"
                            >
                              ⏸ Pause
                            </button>

                            <button
                              onClick={() =>
                                updateDrawStatus(
                                  draw.id,
                                  "suspended"
                                )
                              }
                              className="rounded-xl border border-red-400/40 px-4 py-2 font-bold text-red-300"
                            >
                              ⚠ Suspend
                            </button>
                          </>
                        )}

                        {draw.status === "paused" && (
                          <>
                            <button
                              onClick={() =>
                                updateDrawStatus(
                                  draw.id,
                                  "open"
                                )
                              }
                              className="rounded-xl bg-green-400 px-4 py-2 font-black text-black"
                            >
                              ▶ Resume
                            </button>

                            <button
                              onClick={() =>
                                updateDrawStatus(
                                  draw.id,
                                  "suspended"
                                )
                              }
                              className="rounded-xl border border-red-400/40 px-4 py-2 font-bold text-red-300"
                            >
                              ⚠ Suspend
                            </button>
                          </>
                        )}

                        {draw.status === "suspended" && (
                          <button
                            onClick={() =>
                              updateDrawStatus(
                                draw.id,
                                "open"
                              )
                            }
                            className="rounded-xl bg-green-400 px-4 py-2 font-black text-black"
                          >
                            ▶ Resume
                          </button>
                        )}
                      </div>

                      <div className="mt-6 grid gap-4 md:grid-cols-4">
                        <div className="rounded-2xl border border-[#FFD54A]/20 bg-[#FFD54A]/10 p-4">
                          <p className="text-sm text-[#9AAAC1]">
                            Prize
                          </p>
                          <h3 className="mt-2 text-xl font-black text-[#FFD54A]">
                            {prizeText}
                          </h3>
                        </div>

                        <div className="rounded-2xl border border-[#38BDF8]/15 bg-[#071A33]/20 p-4">
                          <p className="text-sm text-[#9AAAC1]">
                            Ticket Price
                          </p>
                          <h3 className="mt-2 text-xl font-black">
                            GH₵
                            {Number(
                              draw.ticket_price || 0
                            ).toFixed(2)}
                          </h3>
                        </div>

                        <div className="rounded-2xl border border-blue-400/20 bg-[#3F82DD]/10 p-4">
                          <p className="text-sm text-[#9AAAC1]">
                            Tickets Sold
                          </p>
                          <h3 className="mt-2 text-xl font-black text-blue-300">
                            {drawTickets.length}
                          </h3>
                        </div>

                        <div className="rounded-2xl border border-green-400/20 bg-green-500/10 p-4">
                          <p className="text-sm text-[#9AAAC1]">
                            Revenue
                          </p>
                          <h3 className="mt-2 text-xl font-black text-green-300">
                            GH₵{revenue.toFixed(2)}
                          </h3>
                        </div>
                      </div>

                      <button
                        onClick={() => completeDraw(draw)}
                        disabled={
                          completing ||
                          drawTickets.length === 0 ||
                          draw.status !== "open"
                        }
                        className="mt-6 w-full rounded-xl bg-green-400 px-5 py-3 font-black text-black disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        {draw.status === "completed"
                          ? "Completed"
                          : completing
                          ? "Selecting Winner..."
                          : drawTickets.length === 0
                          ? "No Tickets Yet"
                          : draw.status !== "open"
                          ? "Draw Must Be Open To Complete"
                          : "🏆 Select Winner & Complete Draw"}
                      </button>
                    </div>
                  );
                })}
              </div>

              {draws.length === 0 && (
                <div className="mt-6 rounded-2xl border border-[#38BDF8]/15 bg-[#0B2545]/70 p-8 text-center text-[#9AAAC1]">
                  No active Lucky Draws yet.
                </div>
              )}
            </section>
          </>
        )}
      </div>


    </main>
  );
}
