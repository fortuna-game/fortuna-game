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

  useEffect(() => {
    void loadData(true);

    const timer = setInterval(() => {
      void loadData();
    }, 10000);

    return () => clearInterval(timer);
  }, []);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black text-white">
        Loading Prize Vault...
      </main>
    );
  }

  if (denied) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black px-6 text-white">
        <div className="rounded-3xl border border-red-400/20 bg-red-500/10 p-8 text-center">
          <h1 className="text-3xl font-black text-red-300">
            Access Denied
          </h1>

          <p className="mt-3 text-white/60">
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
    <main className="min-h-screen bg-black px-6 py-10 text-white">
      <div className="mx-auto max-w-7xl">
        <AdminNav />

        <div>
          <h1 className="text-4xl font-black text-pink-500">
            Admin Prize Vault
          </h1>

          <p className="mt-2 text-white/60">
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
              className="rounded-3xl border border-pink-500/20 bg-white/5 p-6"
            >
              <p className="text-sm text-white/50">{label}</p>

              <h2 className="mt-2 text-3xl font-black">
                {value}
              </h2>
            </div>
          ))}
        </div>

        <section className="mt-10">
          <h2 className="text-2xl font-black text-pink-500">
            Prize Inventory
          </h2>

          <div className="mt-5 overflow-x-auto rounded-3xl border border-pink-500/20">
            <table className="w-full min-w-[1050px] text-left">
              <thead className="bg-pink-500 text-black">
                <tr>
                  <th className="p-4">Prize</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Fulfilment</th>
                  <th className="p-4">Value</th>
                  <th className="p-4">Stock</th>
                  <th className="p-4">Win Weight</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>

              <tbody>
                {prizes.map((prize) => (
                  <tr
                    key={prize.id}
                    className="border-t border-white/10"
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
                  </tr>
                ))}

                {prizes.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="p-8 text-center text-white/50"
                    >
                      No prizes found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-2xl font-black text-pink-500">
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
                  className="rounded-3xl border border-pink-500/20 bg-white/5 p-5"
                >
                  <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
                    <div>
                      <p className="text-xs uppercase text-white/40">
                        Player
                      </p>

                      <p className="mt-1 font-black">
                        @{play.username}
                      </p>

                      <p className="mt-1 text-sm text-white/60">
                        Account Phone: {play.phone || "Not available"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs uppercase text-white/40">
                        Result
                      </p>

                      <p className="mt-1 font-black">
                        {String(play.result).replaceAll("_", " ")}
                      </p>

                      <p className="mt-1 text-sm text-white/60">
                        Entry: GH₵{Number(play.entry_fee || 0).toFixed(2)}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs uppercase text-white/40">
                        Prize
                      </p>

                      <p className="mt-1 font-black">
                        {play.prize_name || "No Prize"}
                      </p>

                      <p className="mt-1 text-sm text-yellow-300">
                        Value: GH₵{Number(play.prize_value || 0).toFixed(2)}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs uppercase text-white/40">
                        Claim Status
                      </p>

                      <p
                        className={`mt-1 font-black ${
                          play.claim_status === "fulfilled"
                            ? "text-green-300"
                            : play.claim_status === "processing"
                            ? "text-yellow-300"
                            : play.claim_status === "submitted"
                            ? "text-blue-300"
                            : "text-white/60"
                        }`}
                      >
                        {String(play.claim_status || "none").replaceAll(
                          "_",
                          " "
                        )}
                      </p>

                      <p className="mt-1 text-sm text-white/50">
                        {new Date(play.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {hasClaimDetails && (
                    <div className="mt-5 rounded-2xl border border-white/10 bg-black/40 p-5">
                      <h3 className="font-black text-pink-400">
                        Player Claim Details
                      </h3>

                      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {play.claim_full_name && (
                          <div>
                            <p className="text-xs text-white/40">
                              Full Name
                            </p>
                            <p className="mt-1 font-bold">
                              {play.claim_full_name}
                            </p>
                          </div>
                        )}

                        {play.claim_phone && (
                          <div>
                            <p className="text-xs text-white/40">
                              Claim Phone
                            </p>
                            <p className="mt-1 font-bold">
                              {play.claim_phone}
                            </p>
                          </div>
                        )}

                        {play.claim_network && (
                          <div>
                            <p className="text-xs text-white/40">
                              Network
                            </p>
                            <p className="mt-1 font-bold">
                              {play.claim_network}
                            </p>
                          </div>
                        )}

                        {play.claim_region && (
                          <div>
                            <p className="text-xs text-white/40">
                              Region
                            </p>
                            <p className="mt-1 font-bold">
                              {play.claim_region}
                            </p>
                          </div>
                        )}

                        {play.claim_city && (
                          <div>
                            <p className="text-xs text-white/40">
                              City / Town
                            </p>
                            <p className="mt-1 font-bold">
                              {play.claim_city}
                            </p>
                          </div>
                        )}

                        {play.claim_address && (
                          <div>
                            <p className="text-xs text-white/40">
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
                          <p className="text-xs text-white/40">
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
                    <div className="mt-5 rounded-2xl border border-white/10 bg-black/30 p-5">
                      <label className="text-sm font-black text-white/70">
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
                        className="mt-2 w-full rounded-xl border border-white/10 bg-black p-4 outline-none focus:border-pink-500"
                      />

                      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                        {canProcess && (
                          <button
                            onClick={() =>
                              void updateClaim(play.id, "processing")
                            }
                            disabled={Boolean(actionLoading)}
                            className="flex-1 rounded-xl bg-yellow-400 px-5 py-3 font-black text-black disabled:opacity-40"
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
                      <div className="mt-4 rounded-xl bg-white/5 p-4">
                        <p className="text-xs text-white/40">
                          Admin Note
                        </p>

                        <p className="mt-1 text-white/70">
                          {play.admin_note}
                        </p>
                      </div>
                    )}
                </div>
              );
            })}

            {plays.length === 0 && (
              <div className="rounded-3xl border border-pink-500/20 bg-white/5 p-8 text-center text-white/50">
                No Prize Vault plays yet.
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
