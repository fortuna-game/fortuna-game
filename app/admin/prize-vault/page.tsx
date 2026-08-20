"use client";

import AdminNav from "@/components/AdminNav";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Totals = {
  totalPlays: number;
  totalRevenue: number;
  totalWinners: number;
  tryAgainCount: number;
  pendingFulfilmentCount: number;
  totalPrizeValueWon: number;
};

type Prize = {
  id: string;
  name: string;
  emoji: string | null;
  prize_type: string;
  prize_value: number;
  remaining_stock: number;
  win_weight: number;
  is_active: boolean;
  fulfillment_type?: string;
  description?: string | null;
};

type Play = {
  id: string;
  user_id: string;
  prize_id: string | null;
  entry_fee: number;
  result: string;
  prize_name: string | null;
  prize_value: number;
  fulfillment_type: string | null;
  claim_status: string;
  claim_full_name: string | null;
  claim_phone: string | null;
  claim_network: string | null;
  claim_region: string | null;
  claim_city: string | null;
  claim_address: string | null;
  claim_note: string | null;
  admin_note: string | null;
  created_at: string;
  username: string;
  phone: string;
};

export default function AdminPrizeVaultPage() {
  const [totals, setTotals] = useState<Totals | null>(null);
  const [prizes, setPrizes] = useState<Prize[]>([]);
  const [plays, setPlays] = useState<Play[]>([]);
  const [loading, setLoading] = useState(true);
  const [denied, setDenied] = useState(false);
  const [message, setMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [actionLoading, setActionLoading] = useState("");
  const [adminNotes, setAdminNotes] = useState<Record<string, string>>({});
  const [showPrizeForm, setShowPrizeForm] = useState(false);
  const [editingPrizeId, setEditingPrizeId] = useState("");
  const [prizeSaving, setPrizeSaving] = useState(false);

  const [prizeForm, setPrizeForm] = useState({
    name: "",
    emoji: "🎁",
    description: "",
    prizeType: "physical",
    fulfillmentType: "delivery",
    prizeValue: "",
    remainingStock: "",
    winWeight: "",
    isActive: true,
  });

  async function getToken() {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token || "";
  }

  async function loadData(showLoading = false) {
    if (showLoading) setLoading(true);

    const token = await getToken();

    if (!token) {
      setDenied(true);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/admin/prize-vault", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "Could not load Prize Vault.");
        setDenied(res.status === 403);
        setLoading(false);
        return;
      }

      setTotals(data.totals || null);
      setPrizes(data.prizes || []);
      setPlays(data.plays || []);
      setDenied(false);
      setLoading(false);
    } catch {
      setMessage("Could not connect to Prize Vault admin.");
      setLoading(false);
    }
  }

  async function updateClaim(
    playId: string,
    action: "processing" | "fulfilled"
  ) {
    setMessage("");
    setSuccessMessage("");
    setActionLoading(`${playId}-${action}`);

    const token = await getToken();

    if (!token) {
      setMessage("Admin session expired. Please login again.");
      setActionLoading("");
      return;
    }

    try {
      const res = await fetch("/api/admin/prize-vault", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          playId,
          action,
          adminNote: adminNotes[playId] || "",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "Could not update prize claim.");
        setActionLoading("");
        return;
      }

      setSuccessMessage(data.message || "Prize claim updated.");
      setActionLoading("");
      await loadData();
    } catch {
      setMessage("Could not connect to Prize Vault admin.");
      setActionLoading("");
    }
  }

  function resetPrizeForm() {
    setEditingPrizeId("");
    setPrizeForm({
      name: "",
      emoji: "🎁",
      description: "",
      prizeType: "physical",
      fulfillmentType: "delivery",
      prizeValue: "",
      remainingStock: "",
      winWeight: "",
      isActive: true,
    });
    setShowPrizeForm(false);
  }

  function startAddPrize() {
    setMessage("");
    setSuccessMessage("");
    setEditingPrizeId("");
    setPrizeForm({
      name: "",
      emoji: "🎁",
      description: "",
      prizeType: "physical",
      fulfillmentType: "delivery",
      prizeValue: "",
      remainingStock: "",
      winWeight: "",
      isActive: true,
    });
    setShowPrizeForm(true);
  }

  function startEditPrize(prize: Prize) {
    setMessage("");
    setSuccessMessage("");
    setEditingPrizeId(prize.id);
    setPrizeForm({
      name: prize.name || "",
      emoji: prize.emoji || "🎁",
      description: prize.description || "",
      prizeType: prize.prize_type || "physical",
      fulfillmentType: prize.fulfillment_type || "delivery",
      prizeValue: String(prize.prize_value ?? ""),
      remainingStock: String(prize.remaining_stock ?? ""),
      winWeight: String(prize.win_weight ?? ""),
      isActive: Boolean(prize.is_active),
    });
    setShowPrizeForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function savePrize() {
    setMessage("");
    setSuccessMessage("");

    if (!prizeForm.name.trim()) {
      setMessage("Prize name is required.");
      return;
    }

    setPrizeSaving(true);

    const token = await getToken();

    if (!token) {
      setMessage("Admin session expired. Please login again.");
      setPrizeSaving(false);
      return;
    }

    try {
      const editing = Boolean(editingPrizeId);

      const res = await fetch("/api/admin/prize-vault", {
        method: editing ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(
          editing
            ? {
                prizeId: editingPrizeId,
                name: prizeForm.name,
                emoji: prizeForm.emoji,
                description: prizeForm.description,
                prizeType: prizeForm.prizeType,
                fulfillmentType: prizeForm.fulfillmentType,
                prizeValue: Number(prizeForm.prizeValue),
                remainingStock: Number(prizeForm.remainingStock),
                winWeight: Number(prizeForm.winWeight),
                isActive: prizeForm.isActive,
              }
            : {
                name: prizeForm.name,
                emoji: prizeForm.emoji,
                description: prizeForm.description,
                prizeType: prizeForm.prizeType,
                fulfillmentType: prizeForm.fulfillmentType,
                prizeValue: Number(prizeForm.prizeValue),
                stock: Number(prizeForm.remainingStock),
                winWeight: Number(prizeForm.winWeight),
              }
        ),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "Could not save prize.");
        setPrizeSaving(false);
        return;
      }

      setSuccessMessage(data.message || "Prize saved successfully.");
      setPrizeSaving(false);
      resetPrizeForm();
      await loadData();
    } catch {
      setMessage("Could not connect to Prize Vault admin.");
      setPrizeSaving(false);
    }
  }

  useEffect(() => {
    void loadData(true);

    const timer = setInterval(() => {
      void loadData();
    }, 10000);

    return () => clearInterval(timer);
  }, []);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#071A33] text-white">
        Loading Prize Vault...
      </main>
    );
  }

  if (denied) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#071A33] px-6 text-white">
        <div className="min-w-0 rounded-3xl border border-red-400/20 bg-red-500/10 p-8 text-center">
          <h1 className="text-3xl font-black text-red-300">
            Access Denied
          </h1>

          <p className="mt-3 text-[#9AAAC1]">
            Please login through /admin/login again.
          </p>
        </div>
      </main>
    );
  }

  const cards = totals
    ? [
        ["Total Plays", totals.totalPlays],
        ["Game Revenue", `GH₵${Number(totals.totalRevenue).toFixed(2)}`],
        ["Total Winners", totals.totalWinners],
        ["Try Again Results", totals.tryAgainCount],
        ["Pending Fulfilment", totals.pendingFulfilmentCount],
        [
          "Prize Value Won",
          `GH₵${Number(totals.totalPrizeValueWon).toFixed(2)}`,
        ],
      ]
    : [];

  return (
    <main className="min-h-screen bg-[#071A33] px-6 py-10 text-white">
      <div className="mx-auto max-w-7xl">
        <AdminNav />

        <div>
          <h1 className="text-4xl font-black text-[#4D94F5]">
            Admin Prize Vault
          </h1>

          <p className="mt-2 text-[#9AAAC1]">
            Monitor Prize Vault revenue, winners, claims and prize inventory.
          </p>
        </div>

        {message && (
          <p className="mt-5 rounded-xl border border-red-400/20 bg-red-500/10 p-4 text-red-300">
            {message}
          </p>
        )}

        {successMessage && (
          <p className="mt-5 rounded-xl border border-green-400/20 bg-green-500/10 p-4 text-green-300">
            {successMessage}
          </p>
        )}

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map(([label, value]) => (
            <div
              key={String(label)}
              className="min-w-0 rounded-3xl border border-[#2A5688] bg-[#0B2545]/70 p-6"
            >
              <p className="text-sm text-[#8295B0]">{label}</p>

              <h2 className="mt-2 text-3xl font-black">
                {value}
              </h2>
            </div>
          ))}
        </div>

        <section className="mt-10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-black text-[#4D94F5]">
                Prize Management
              </h2>

              <p className="mt-1 text-sm text-[#8295B0]">
                Add new prizes and control existing Prize Vault rewards.
              </p>
            </div>

            <button
              onClick={startAddPrize}
              className="rounded-xl bg-[#3F82DD] px-6 py-3 font-black text-black"
            >
              + Add New Prize
            </button>
          </div>

          {showPrizeForm && (
            <div className="mt-5 min-w-0 rounded-3xl border border-[#2A5688] bg-[#0B2545]/70 p-6">
              <h3 className="text-xl font-black">
                {editingPrizeId ? "Edit Prize" : "Add New Prize"}
              </h3>

              <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <input
                  value={prizeForm.name}
                  onChange={(e) =>
                    setPrizeForm({ ...prizeForm, name: e.target.value })
                  }
                  placeholder="Prize name"
                  className="rounded-xl border border-[#38BDF8]/15 bg-[#071A33] p-4 outline-none focus:border-blue-500"
                />

                <input
                  value={prizeForm.emoji}
                  onChange={(e) =>
                    setPrizeForm({ ...prizeForm, emoji: e.target.value })
                  }
                  placeholder="Emoji"
                  className="rounded-xl border border-[#38BDF8]/15 bg-[#071A33] p-4 outline-none focus:border-blue-500"
                />

                <input
                  type="number"
                  min="0"
                  value={prizeForm.prizeValue}
                  onChange={(e) =>
                    setPrizeForm({
                      ...prizeForm,
                      prizeValue: e.target.value,
                    })
                  }
                  placeholder="Prize value GH₵"
                  className="rounded-xl border border-[#38BDF8]/15 bg-[#071A33] p-4 outline-none focus:border-blue-500"
                />

                <select
                  value={prizeForm.prizeType}
                  onChange={(e) =>
                    setPrizeForm({
                      ...prizeForm,
                      prizeType: e.target.value,
                    })
                  }
                  className="rounded-xl border border-[#38BDF8]/15 bg-[#071A33] p-4 outline-none focus:border-blue-500"
                >
                  <option value="cash">Cash</option>
                  <option value="digital">Digital</option>
                  <option value="voucher">Voucher</option>
                  <option value="physical">Physical</option>
                </select>

                <select
                  value={prizeForm.fulfillmentType}
                  onChange={(e) =>
                    setPrizeForm({
                      ...prizeForm,
                      fulfillmentType: e.target.value,
                    })
                  }
                  className="rounded-xl border border-[#38BDF8]/15 bg-[#071A33] p-4 outline-none focus:border-blue-500"
                >
                  <option value="wallet">Wallet</option>
                  <option value="airtime">Airtime</option>
                  <option value="data">Data</option>
                  <option value="food_delivery">Food Delivery</option>
                  <option value="voucher">Voucher</option>
                  <option value="delivery">Physical Delivery</option>
                </select>

                <input
                  type="number"
                  min="0"
                  step="1"
                  value={prizeForm.remainingStock}
                  onChange={(e) =>
                    setPrizeForm({
                      ...prizeForm,
                      remainingStock: e.target.value,
                    })
                  }
                  placeholder="Stock"
                  className="rounded-xl border border-[#38BDF8]/15 bg-[#071A33] p-4 outline-none focus:border-blue-500"
                />

                <input
                  type="number"
                  min="0"
                  step="1"
                  value={prizeForm.winWeight}
                  onChange={(e) =>
                    setPrizeForm({
                      ...prizeForm,
                      winWeight: e.target.value,
                    })
                  }
                  placeholder="Win weight"
                  className="rounded-xl border border-[#38BDF8]/15 bg-[#071A33] p-4 outline-none focus:border-blue-500"
                />

                <textarea
                  value={prizeForm.description}
                  onChange={(e) =>
                    setPrizeForm({
                      ...prizeForm,
                      description: e.target.value,
                    })
                  }
                  placeholder="Prize description"
                  rows={3}
                  className="rounded-xl border border-[#38BDF8]/15 bg-[#071A33] p-4 outline-none focus:border-blue-500 md:col-span-2"
                />

                {editingPrizeId && (
                  <label className="flex items-center gap-3 rounded-xl border border-[#38BDF8]/15 bg-[#071A33] p-4">
                    <input
                      type="checkbox"
                      checked={prizeForm.isActive}
                      onChange={(e) =>
                        setPrizeForm({
                          ...prizeForm,
                          isActive: e.target.checked,
                        })
                      }
                    />

                    <span className="font-bold">
                      Prize Active
                    </span>
                  </label>
                )}
              </div>

              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={() => void savePrize()}
                  disabled={prizeSaving}
                  className="rounded-xl bg-green-500 px-6 py-3 font-black text-black disabled:opacity-40"
                >
                  {prizeSaving
                    ? "Saving..."
                    : editingPrizeId
                    ? "Save Prize Changes"
                    : "Create Prize"}
                </button>

                <button
                  onClick={resetPrizeForm}
                  disabled={prizeSaving}
                  className="rounded-xl border border-[#38BDF8]/20 px-6 py-3 font-black"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </section>

        <section className="mt-10">
          <h2 className="text-2xl font-black text-[#4D94F5]">
            Prize Inventory
          </h2>

          <div className="mt-5 overflow-x-auto min-w-0 rounded-3xl border border-[#2A5688]">
            <div className="w-full overflow-x-auto rounded-xl"><table className="w-full min-w-[1050px] text-left">
              <thead className="bg-[#3F82DD] text-black">
                <tr>
                  <th className="p-4">Prize</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Fulfilment</th>
                  <th className="p-4">Value</th>
                  <th className="p-4">Stock</th>
                  <th className="p-4">Win Weight</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>

              <tbody>
                {prizes.map((prize) => (
                  <tr
                    key={prize.id}
                    className="border-t border-[#38BDF8]/15"
                  >
                    <td className="p-4 font-bold">
                      {prize.emoji} {prize.name}
                    </td>

                    <td className="p-4">
                      {String(prize.prize_type).replaceAll("_", " ")}
                    </td>

                    <td className="p-4">
                      {String(prize.fulfillment_type || "Not Set").replaceAll(
                        "_",
                        " "
                      )}
                    </td>

                    <td className="p-4">
                      GH₵{Number(prize.prize_value || 0).toFixed(2)}
                    </td>

                    <td className="p-4 font-black">
                      {prize.remaining_stock}
                    </td>

                    <td className="p-4">
                      {prize.win_weight}
                    </td>

                    <td className="p-4">
                      {prize.is_active ? (
                        <span className="font-black text-green-300">
                          Active
                        </span>
                      ) : (
                        <span className="font-black text-red-300">
                          Inactive
                        </span>
                      )}
                    </td>

                    <td className="p-4">
                      <button
                        onClick={() => startEditPrize(prize)}
                        className="rounded-lg bg-[#3F82DD] px-4 py-2 font-black text-black"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}

                {prizes.length === 0 && (
                  <tr>
                    <td
                      colSpan={8}
                      className="p-8 text-center text-[#8295B0]"
                    >
                      No prizes found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table></div>
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-2xl font-black text-[#4D94F5]">
            Prize Claims & Plays
          </h2>

          <div className="mt-5 grid gap-5">
            {plays.map((play) => {
              const canProcess = play.claim_status === "submitted";

              const canFulfill =
                play.claim_status === "submitted" ||
                play.claim_status === "processing";

              const hasClaimDetails =
                play.claim_full_name ||
                play.claim_phone ||
                play.claim_network ||
                play.claim_region ||
                play.claim_city ||
                play.claim_address ||
                play.claim_note;

              return (
                <div
                  key={play.id}
                  className="min-w-0 rounded-3xl border border-[#2A5688] bg-[#0B2545]/70 p-5"
                >
                  <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
                    <div>
                      <p className="text-xs uppercase text-[#7185A3]">
                        Player
                      </p>

                      <p className="mt-1 font-black">
                        @{play.username}
                      </p>

                      <p className="mt-1 text-sm text-[#9AAAC1]">
                        Account Phone: {play.phone || "Not available"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs uppercase text-[#7185A3]">
                        Result
                      </p>

                      <p className="mt-1 font-black">
                        {String(play.result).replaceAll("_", " ")}
                      </p>

                      <p className="mt-1 text-sm text-[#9AAAC1]">
                        Entry: GH₵{Number(play.entry_fee || 0).toFixed(2)}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs uppercase text-[#7185A3]">
                        Prize
                      </p>

                      <p className="mt-1 font-black">
                        {play.prize_name || "No Prize"}
                      </p>

                      <p className="mt-1 text-sm text-[#FFE08A]">
                        Value: GH₵{Number(play.prize_value || 0).toFixed(2)}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs uppercase text-[#7185A3]">
                        Claim Status
                      </p>

                      <p
                        className={`mt-1 font-black ${
                          play.claim_status === "fulfilled"
                            ? "text-green-300"
                            : play.claim_status === "processing"
                            ? "text-[#FFE08A]"
                            : play.claim_status === "submitted"
                            ? "text-blue-300"
                            : "text-[#9AAAC1]"
                        }`}
                      >
                        {String(play.claim_status || "none").replaceAll(
                          "_",
                          " "
                        )}
                      </p>

                      <p className="mt-1 text-sm text-[#8295B0]">
                        {new Date(play.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {hasClaimDetails && (
                    <div className="mt-5 min-w-0 rounded-2xl border border-[#38BDF8]/15 bg-[#071A33]/40 p-5">
                      <h3 className="font-black text-[#66A7FF]">
                        Player Claim Details
                      </h3>

                      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {play.claim_full_name && (
                          <div>
                            <p className="text-xs text-[#7185A3]">
                              Full Name
                            </p>
                            <p className="mt-1 font-bold">
                              {play.claim_full_name}
                            </p>
                          </div>
                        )}

                        {play.claim_phone && (
                          <div>
                            <p className="text-xs text-[#7185A3]">
                              Claim Phone
                            </p>
                            <p className="mt-1 font-bold">
                              {play.claim_phone}
                            </p>
                          </div>
                        )}

                        {play.claim_network && (
                          <div>
                            <p className="text-xs text-[#7185A3]">
                              Network
                            </p>
                            <p className="mt-1 font-bold">
                              {play.claim_network}
                            </p>
                          </div>
                        )}

                        {play.claim_region && (
                          <div>
                            <p className="text-xs text-[#7185A3]">
                              Region
                            </p>
                            <p className="mt-1 font-bold">
                              {play.claim_region}
                            </p>
                          </div>
                        )}

                        {play.claim_city && (
                          <div>
                            <p className="text-xs text-[#7185A3]">
                              City / Town
                            </p>
                            <p className="mt-1 font-bold">
                              {play.claim_city}
                            </p>
                          </div>
                        )}

                        {play.claim_address && (
                          <div>
                            <p className="text-xs text-[#7185A3]">
                              Delivery Address
                            </p>
                            <p className="mt-1 font-bold">
                              {play.claim_address}
                            </p>
                          </div>
                        )}
                      </div>

                      {play.claim_note && (
                        <div className="mt-4">
                          <p className="text-xs text-[#7185A3]">
                            Player Note
                          </p>

                          <p className="mt-1 text-white/80">
                            {play.claim_note}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {(canProcess || canFulfill) && (
                    <div className="mt-5 min-w-0 rounded-2xl border border-[#38BDF8]/15 bg-[#071A33]/30 p-5">
                      <label className="text-sm font-black text-[#B4C0D1]">
                        Admin Note
                      </label>

                      <textarea
                        value={
                          adminNotes[play.id] ??
                          play.admin_note ??
                          ""
                        }
                        onChange={(event) =>
                          setAdminNotes((current) => ({
                            ...current,
                            [play.id]: event.target.value,
                          }))
                        }
                        placeholder="Optional admin note"
                        rows={3}
                        className="mt-2 w-full rounded-xl border border-[#38BDF8]/15 bg-[#071A33] p-4 outline-none focus:border-blue-500"
                      />

                      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                        {canProcess && (
                          <button
                            onClick={() =>
                              void updateClaim(play.id, "processing")
                            }
                            disabled={Boolean(actionLoading)}
                            className="flex-1 rounded-xl bg-[#FFD54A] px-5 py-3 font-black text-black disabled:opacity-40"
                          >
                            {actionLoading === `${play.id}-processing`
                              ? "Updating..."
                              : "Mark Processing"}
                          </button>
                        )}

                        {canFulfill && (
                          <button
                            onClick={() =>
                              void updateClaim(play.id, "fulfilled")
                            }
                            disabled={Boolean(actionLoading)}
                            className="flex-1 rounded-xl bg-green-500 px-5 py-3 font-black text-black disabled:opacity-40"
                          >
                            {actionLoading === `${play.id}-fulfilled`
                              ? "Updating..."
                              : "Mark Fulfilled"}
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {play.admin_note &&
                    !canProcess &&
                    !canFulfill && (
                      <div className="mt-4 rounded-xl bg-[#0B2545]/70 p-4">
                        <p className="text-xs text-[#7185A3]">
                          Admin Note
                        </p>

                        <p className="mt-1 text-[#B4C0D1]">
                          {play.admin_note}
                        </p>
                      </div>
                    )}
                </div>
              );
            })}

            {plays.length === 0 && (
              <div className="min-w-0 rounded-3xl border border-[#2A5688] bg-[#0B2545]/70 p-8 text-center text-[#8295B0]">
                No Prize Vault plays yet.
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
