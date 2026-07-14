"use client";

import AdminNav from "@/components/AdminNav";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

type Totals = {
  totalAffiliates: number;
  activeAffiliates: number;
  totalReferrals: number;
  totalQualified: number;
  totalAvailable: number;
  totalPaid: number;
  pendingPayouts: number;
  pendingPayoutAmount: number;
};

type Affiliate = {
  id: string;
  full_name: string;
  phone: string;
  email: string | null;
  referral_code: string;
  payment_method: string | null;
  momo_number: string | null;
  momo_network: string | null;
  bank_name: string | null;
  bank_account_name: string | null;
  bank_account_number: string | null;
  status: string;
  available_balance: number;
  total_paid: number;
  referral_count: number;
  qualified_count: number;
  created_at: string;
};

type Payout = {
  id: string;
  affiliate_id: string;
  affiliate_name: string;
  affiliate_phone: string;
  affiliate_email: string;
  amount: number;
  payment_method: string;
  payment_details: Record<string, string | null>;
  status: string;
  failure_reason: string | null;
  admin_note: string | null;
  requested_at: string;
  processed_at: string | null;
};

export default function AdminAffiliatesPage() {
  const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [totals, setTotals] = useState<Totals | null>(null);

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [search, setSearch] = useState("");
  const [actionLoading, setActionLoading] = useState("");

  async function getToken() {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token || "";
  }

  async function loadAffiliates(showLoading = false) {
    if (showLoading) setLoading(true);

    const token = await getToken();

    if (!token) {
      setMessage("Admin session expired. Please login again.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/admin/affiliates", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "Could not load affiliates.");
        setLoading(false);
        return;
      }

      setAffiliates(data.affiliates || []);
      setPayouts(data.payouts || []);
      setTotals(data.totals || null);
      setLoading(false);
    } catch {
      setMessage("Could not connect to affiliate admin.");
      setLoading(false);
    }
  }

  async function updateAffiliate(
    affiliateId: string,
    action: "activate" | "suspend"
  ) {
    setMessage("");
    setSuccessMessage("");
    setActionLoading(`${affiliateId}-${action}`);

    const token = await getToken();

    try {
      const res = await fetch("/api/admin/affiliates", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          affiliateId,
          action,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "Could not update affiliate.");
        setActionLoading("");
        return;
      }

      setSuccessMessage(data.message);
      setActionLoading("");
      await loadAffiliates();
    } catch {
      setMessage("Could not update affiliate.");
      setActionLoading("");
    }
  }

  async function processPayout(
    payout: Payout,
    action: "processing" | "paid" | "failed"
  ) {
    setMessage("");
    setSuccessMessage("");

    let adminNote = "";

    if (action === "paid") {
      const confirmed = window.confirm(
        `Confirm you have sent GH₵${Number(
          payout.amount
        ).toFixed(2)} to ${payout.affiliate_name}?`
      );

      if (!confirmed) return;
    }

    if (action === "failed") {
      const reason = window.prompt(
        "Why did this payment fail? The money will be returned to the affiliate balance."
      );

      if (reason === null) return;

      adminNote = reason.trim();

      if (!adminNote) {
        setMessage("Enter a reason for the failed payment.");
        return;
      }
    }

    setActionLoading(`${payout.id}-${action}`);

    const token = await getToken();

    try {
      const res = await fetch("/api/admin/affiliates", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          payoutId: payout.id,
          action,
          adminNote,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "Could not process withdrawal.");
        setActionLoading("");
        return;
      }

      setSuccessMessage(data.message);
      setActionLoading("");
      await loadAffiliates();
    } catch {
      setMessage("Could not process withdrawal.");
      setActionLoading("");
    }
  }

  useEffect(() => {
    void loadAffiliates(true);

    const timer = setInterval(() => {
      void loadAffiliates();
    }, 10000);

    return () => clearInterval(timer);
  }, []);

  const visibleAffiliates = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) return affiliates;

    return affiliates.filter((affiliate) =>
      [
        affiliate.full_name,
        affiliate.phone,
        affiliate.email,
        affiliate.referral_code,
        affiliate.status,
      ]
        .filter(Boolean)
        .some((value) =>
          String(value).toLowerCase().includes(keyword)
        )
    );
  }, [affiliates, search]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black text-white">
        Loading Affiliates...
      </main>
    );
  }

  const summaryCards = totals
    ? [
        ["Total Affiliates", totals.totalAffiliates],
        ["Active Affiliates", totals.activeAffiliates],
        ["Total Referrals", totals.totalReferrals],
        ["Qualified Players", totals.totalQualified],
        [
          "Available Earnings",
          `GH₵${Number(totals.totalAvailable).toFixed(2)}`,
        ],
        [
          "Total Paid",
          `GH₵${Number(totals.totalPaid).toFixed(2)}`,
        ],
        [
          "Pending Withdrawals",
          `${totals.pendingPayouts} / GH₵${Number(
            totals.pendingPayoutAmount
          ).toFixed(2)}`,
        ],
      ]
    : [];

  return (
    <main className="min-h-screen bg-black px-6 py-10 text-white">
      <div className="mx-auto max-w-7xl">
        <AdminNav />

        <h1 className="text-4xl font-black text-green-400">
          Affiliate Management
        </h1>

        <p className="mt-2 text-white/60">
          Manage affiliates, payment details and withdrawal requests.
        </p>

        {message && (
          <p className="mt-5 rounded-xl bg-red-500/10 p-4 text-red-300">
            {message}
          </p>
        )}

        {successMessage && (
          <p className="mt-5 rounded-xl bg-green-500/10 p-4 text-green-300">
            {successMessage}
          </p>
        )}

        <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {summaryCards.map(([label, value]) => (
            <div
              key={String(label)}
              className="rounded-3xl border border-green-500/20 bg-white/5 p-6"
            >
              <p className="text-sm text-white/50">{label}</p>
              <h2 className="mt-2 text-3xl font-black">{value}</h2>
            </div>
          ))}
        </section>

        <section className="mt-10">
          <h2 className="text-3xl font-black text-yellow-300">
            Affiliate Withdrawal Requests
          </h2>

          <div className="mt-5 grid gap-5">
            {payouts.map((payout) => (
              <article
                key={payout.id}
                className="rounded-3xl border border-yellow-500/20 bg-white/5 p-6"
              >
                <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <p className="text-xs uppercase text-white/40">
                      Affiliate
                    </p>

                    <p className="mt-1 font-black">
                      {payout.affiliate_name}
                    </p>

                    <p className="text-sm text-white/50">
                      {payout.affiliate_phone}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs uppercase text-white/40">
                      Amount
                    </p>

                    <p className="mt-1 text-2xl font-black text-yellow-300">
                      GH₵{Number(payout.amount).toFixed(2)}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs uppercase text-white/40">
                      Payment Details
                    </p>

                    {payout.payment_method === "momo" ? (
                      <>
                        <p className="mt-1 font-bold">
                          {payout.payment_details?.network ||
                            payout.payment_details?.momo_network ||
                            "-"}
                        </p>

                        <p className="text-sm text-white/60">
                          {payout.payment_details?.number ||
                            payout.payment_details?.momo_number ||
                            "-"}
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="mt-1 font-bold">
                          {payout.payment_details?.bank_name || "-"}
                        </p>

                        <p className="text-sm text-white/60">
                          {payout.payment_details?.account_name ||
                            payout.payment_details?.bank_account_name ||
                            "-"}
                        </p>

                        <p className="text-sm text-white/60">
                          {payout.payment_details?.account_number ||
                            payout.payment_details?.bank_account_number ||
                            "-"}
                        </p>
                      </>
                    )}
                  </div>

                  <div>
                    <p className="text-xs uppercase text-white/40">
                      Status
                    </p>

                    <span
                      className={`mt-2 inline-block rounded-full px-4 py-2 text-sm font-black ${
                        payout.status === "paid"
                          ? "bg-green-500/15 text-green-300"
                          : payout.status === "failed"
                          ? "bg-red-500/15 text-red-300"
                          : payout.status === "processing"
                          ? "bg-blue-500/15 text-blue-300"
                          : "bg-yellow-500/15 text-yellow-300"
                      }`}
                    >
                      {payout.status}
                    </span>
                  </div>
                </div>

                <p className="mt-4 text-xs text-white/40">
                  Requested:{" "}
                  {new Date(payout.requested_at).toLocaleString()}
                </p>

                {payout.status === "failed" && (
                  <div className="mt-4 rounded-xl bg-red-500/10 p-4">
                    <p className="font-bold text-red-300">
                      Failure Reason
                    </p>

                    <p className="mt-1 text-sm text-white/60">
                      {payout.failure_reason ||
                        payout.admin_note ||
                        "Payment failed."}
                    </p>

                    <p className="mt-2 text-sm font-bold text-green-300">
                      Money returned to affiliate balance.
                    </p>
                  </div>
                )}

                {(payout.status === "pending" ||
                  payout.status === "processing") && (
                  <div className="mt-5 flex flex-wrap gap-3">
                    {payout.status === "pending" && (
                      <button
                        onClick={() =>
                          void processPayout(payout, "processing")
                        }
                        disabled={Boolean(actionLoading)}
                        className="rounded-xl bg-blue-500 px-5 py-3 font-black text-white disabled:opacity-40"
                      >
                        {actionLoading ===
                        `${payout.id}-processing`
                          ? "Updating..."
                          : "Mark Processing"}
                      </button>
                    )}

                    <button
                      onClick={() =>
                        void processPayout(payout, "paid")
                      }
                      disabled={Boolean(actionLoading)}
                      className="rounded-xl bg-green-500 px-5 py-3 font-black text-black disabled:opacity-40"
                    >
                      {actionLoading === `${payout.id}-paid`
                        ? "Updating..."
                        : "Mark Paid"}
                    </button>

                    <button
                      onClick={() =>
                        void processPayout(payout, "failed")
                      }
                      disabled={Boolean(actionLoading)}
                      className="rounded-xl bg-red-500 px-5 py-3 font-black text-white disabled:opacity-40"
                    >
                      {actionLoading === `${payout.id}-failed`
                        ? "Updating..."
                        : "Mark Failed"}
                    </button>
                  </div>
                )}
              </article>
            ))}

            {payouts.length === 0 && (
              <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-center text-white/50">
                No affiliate withdrawal requests yet.
              </div>
            )}
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-3xl font-black text-green-400">
            All Affiliates
          </h2>

          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search name, phone, email or referral code"
            className="mt-5 w-full rounded-xl border border-white/10 bg-white/5 p-4 outline-none focus:border-green-500"
          />

          <div className="mt-6 grid gap-5">
            {visibleAffiliates.map((affiliate) => (
              <article
                key={affiliate.id}
                className="rounded-3xl border border-green-500/20 bg-white/5 p-6"
              >
                <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <p className="text-lg font-black">
                      {affiliate.full_name}
                    </p>

                    <p className="text-sm text-white/60">
                      {affiliate.phone}
                    </p>

                    <p className="text-sm text-white/60">
                      {affiliate.email || "No email"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-white/40">
                      REFERRAL CODE
                    </p>

                    <p className="mt-1 font-black text-green-400">
                      {affiliate.referral_code}
                    </p>
                  </div>

                  <div>
                    <p>
                      Referrals:{" "}
                      <strong>{affiliate.referral_count}</strong>
                    </p>

                    <p>
                      Qualified:{" "}
                      <strong className="text-green-300">
                        {affiliate.qualified_count}
                      </strong>
                    </p>
                  </div>

                  <div>
                    <p className="font-bold text-yellow-300">
                      Available: GH₵
                      {Number(affiliate.available_balance).toFixed(2)}
                    </p>

                    <p className="text-white/60">
                      Paid: GH₵
                      {Number(affiliate.total_paid).toFixed(2)}
                    </p>
                  </div>
                </div>

                <div className="mt-5 rounded-2xl border border-white/10 bg-black/40 p-5">
                  <p className="text-xs uppercase text-white/40">
                    Preferred Payment Method
                  </p>

                  {affiliate.payment_method === "bank" ? (
                    <div className="mt-2">
                      <p className="font-bold">
                        🏦 {affiliate.bank_name || "Bank Account"}
                      </p>

                      <p className="text-sm text-white/60">
                        {affiliate.bank_account_name || "-"}
                      </p>

                      <p className="text-sm text-white/60">
                        {affiliate.bank_account_number || "-"}
                      </p>
                    </div>
                  ) : (
                    <div className="mt-2">
                      <p className="font-bold">
                        📱 {affiliate.momo_network || "Mobile Money"}
                      </p>

                      <p className="text-sm text-white/60">
                        {affiliate.momo_number || "-"}
                      </p>
                    </div>
                  )}
                </div>

                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <span
                    className={`mr-auto rounded-full px-4 py-2 text-sm font-black ${
                      affiliate.status === "active"
                        ? "bg-green-500/15 text-green-300"
                        : "bg-red-500/15 text-red-300"
                    }`}
                  >
                    {affiliate.status}
                  </span>

                  {affiliate.status !== "active" ? (
                    <button
                      onClick={() =>
                        void updateAffiliate(
                          affiliate.id,
                          "activate"
                        )
                      }
                      disabled={Boolean(actionLoading)}
                      className="rounded-xl bg-green-500 px-5 py-3 font-black text-black disabled:opacity-40"
                    >
                      Activate
                    </button>
                  ) : (
                    <button
                      onClick={() =>
                        void updateAffiliate(
                          affiliate.id,
                          "suspend"
                        )
                      }
                      disabled={Boolean(actionLoading)}
                      className="rounded-xl bg-red-500 px-5 py-3 font-black text-white disabled:opacity-40"
                    >
                      Suspend
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
