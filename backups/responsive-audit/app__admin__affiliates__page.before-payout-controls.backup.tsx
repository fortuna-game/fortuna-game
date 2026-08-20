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
};

type Affiliate = {
  id: string;
  full_name: string;
  phone: string;
  email: string | null;
  referral_code: string;
  payment_method: string;
  momo_number: string | null;
  momo_network: string | null;
  bank_name: string | null;
  bank_account_name: string | null;
  bank_account_number: string | null;
  status: string;
  total_qualified_referrals: number;
  available_balance: number;
  total_paid: number;
  referral_count: number;
  qualified_count: number;
  available_earnings: number;
  paid_earnings: number;
  payout_count: number;
  pending_payout_count: number;
  created_at: string;
};

export default function AdminAffiliatesPage() {
  const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
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
        setMessage(
          data.error || "Could not load affiliates."
        );
        setLoading(false);
        return;
      }

      setAffiliates(data.affiliates || []);
      setTotals(data.totals || null);
      setLoading(false);
    } catch {
      setMessage("Could not connect to affiliate admin.");
      setLoading(false);
    }
  }

  async function updateAffiliate(
    affiliateId: string,
    action: "activate" | "suspend" | "mark_paid"
  ) {
    setMessage("");
    setSuccessMessage("");

    if (
      action === "mark_paid" &&
      !window.confirm(
        "Confirm that you have paid this affiliate?"
      )
    ) {
      return;
    }

    setActionLoading(`${affiliateId}-${action}`);

    const token = await getToken();

    if (!token) {
      setMessage("Admin session expired.");
      setActionLoading("");
      return;
    }

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
        setMessage(
          data.error || "Could not update affiliate."
        );
        setActionLoading("");
        return;
      }

      setSuccessMessage(
        data.message || "Affiliate updated."
      );
      setActionLoading("");
      await loadAffiliates();
    } catch {
      setMessage("Could not connect to affiliate admin.");
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
        affiliate.momo_number,
        affiliate.momo_network,
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
      ]
    : [];

  return (
    <main className="min-h-screen bg-black px-6 py-10 text-white">
      <div className="mx-auto max-w-7xl">
        <AdminNav />

        <div>
          <h1 className="text-4xl font-black text-green-400">
            Affiliate Management
          </h1>

          <p className="mt-2 text-white/60">
            View affiliates, referral performance, earnings and
            payment details.
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

        <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {summaryCards.map(([label, value]) => (
            <div
              key={String(label)}
              className="rounded-3xl border border-green-500/20 bg-white/5 p-6"
            >
              <p className="text-sm text-white/50">
                {label}
              </p>

              <h2 className="mt-2 text-3xl font-black">
                {value}
              </h2>
            </div>
          ))}
        </section>

        <div className="mt-8">
          <input
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search name, phone, email or referral code"
            className="w-full rounded-xl border border-white/10 bg-white/5 p-4 outline-none focus:border-green-500"
          />
        </div>

        <section className="mt-6 grid gap-5">
          {visibleAffiliates.map((affiliate) => (
            <article
              key={affiliate.id}
              className="rounded-3xl border border-green-500/20 bg-white/5 p-6"
            >
              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
                <div>
                  <p className="text-xs uppercase text-white/40">
                    Affiliate
                  </p>

                  <p className="mt-1 text-lg font-black">
                    {affiliate.full_name}
                  </p>

                  <p className="mt-1 text-sm text-white/60">
                    {affiliate.email || "No email"}
                  </p>

                  <p className="text-sm text-white/60">
                    {affiliate.phone}
                  </p>
                </div>

                <div>
                  <p className="text-xs uppercase text-white/40">
                    Referral Code
                  </p>

                  <p className="mt-1 font-black text-green-400">
                    {affiliate.referral_code}
                  </p>

                  <p className="mt-2 text-sm text-white/50">
                    Joined{" "}
                    {new Date(
                      affiliate.created_at
                    ).toLocaleDateString()}
                  </p>
                </div>

                <div>
                  <p className="text-xs uppercase text-white/40">
                    Performance
                  </p>

                  <p className="mt-1">
                    Referrals:{" "}
                    <span className="font-black">
                      {affiliate.referral_count}
                    </span>
                  </p>

                  <p className="mt-1">
                    Qualified:{" "}
                    <span className="font-black text-green-300">
                      {affiliate.qualified_count}
                    </span>
                  </p>
                </div>

                <div>
                  <p className="text-xs uppercase text-white/40">
                    Earnings
                  </p>

                  <p className="mt-1 font-black text-yellow-300">
                    Available: GH₵
                    {Number(
                      affiliate.available_balance
                    ).toFixed(2)}
                  </p>

                  <p className="mt-1 text-sm text-white/60">
                    Paid: GH₵
                    {Number(affiliate.total_paid).toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="mt-5 grid gap-4 rounded-2xl border border-white/10 bg-black/40 p-5 md:grid-cols-3">
                <div>
                  <p className="text-xs text-white/40">
                    Payment Method
                  </p>

                  <p className="mt-1 font-bold">
                    {affiliate.payment_method || "momo"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-white/40">
                    MoMo Network
                  </p>

                  <p className="mt-1 font-bold">
                    {affiliate.momo_network || "-"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-white/40">
                    MoMo Number
                  </p>

                  <p className="mt-1 font-bold">
                    {affiliate.momo_number || "-"}
                  </p>
                </div>
              </div>

              <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="mr-auto">
                  <span
                    className={`rounded-full px-4 py-2 text-sm font-black ${
                      affiliate.status === "active"
                        ? "bg-green-500/15 text-green-300"
                        : affiliate.status === "suspended"
                        ? "bg-red-500/15 text-red-300"
                        : "bg-yellow-500/15 text-yellow-300"
                    }`}
                  >
                    {affiliate.status}
                  </span>
                </div>

                {affiliate.status !== "active" && (
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
                    {actionLoading ===
                    `${affiliate.id}-activate`
                      ? "Updating..."
                      : "Activate"}
                  </button>
                )}

                {affiliate.status === "active" && (
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
                    {actionLoading ===
                    `${affiliate.id}-suspend`
                      ? "Updating..."
                      : "Suspend"}
                  </button>
                )}

                <button
                  onClick={() =>
                    void updateAffiliate(
                      affiliate.id,
                      "mark_paid"
                    )
                  }
                  disabled={
                    Boolean(actionLoading) ||
                    Number(affiliate.available_balance) <= 0
                  }
                  className="rounded-xl bg-yellow-400 px-5 py-3 font-black text-black disabled:opacity-40"
                >
                  {actionLoading ===
                  `${affiliate.id}-mark_paid`
                    ? "Processing..."
                    : `Mark GH₵${Number(
                        affiliate.available_balance
                      ).toFixed(2)} Paid`}
                </button>
              </div>
            </article>
          ))}

          {visibleAffiliates.length === 0 && (
            <div className="rounded-3xl border border-green-500/20 bg-white/5 p-8 text-center text-white/50">
              No affiliates found.
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
