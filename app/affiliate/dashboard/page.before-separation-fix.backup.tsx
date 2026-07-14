"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Affiliate = {
  id: string;
  full_name: string;
  phone: string;
  referral_code: string;
  status: string;
  total_qualified_referrals: number;
  available_balance: number;
  total_paid: number;
};

type Referral = {
  id: string;
  qualified: boolean;
  signup_at: string;
  total_game_stakes: number;
};

export default function AffiliatePage() {
  const [affiliate, setAffiliate] =
    useState<Affiliate | null>(null);

  const [referrals, setReferrals] =
    useState<Referral[]>([]);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [momoNumber, setMomoNumber] = useState("");
  const [momoNetwork, setMomoNetwork] = useState("MTN");

  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState("");
  const [copied, setCopied] = useState(false);

  async function getToken() {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token;
  }

  async function loadAffiliate() {
    const token = await getToken();

    if (!token) {
      setMessage("Please log in.");
      setLoading(false);
      return;
    }

    const res = await fetch("/api/affiliate", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();

    if (!res.ok) {
      setMessage(data.error || "Could not load affiliate account.");
      setLoading(false);
      return;
    }

    setAffiliate(data.affiliate);
    setReferrals(data.referrals || []);
    setLoading(false);
  }

  async function createAffiliate(
    e: React.FormEvent
  ) {
    e.preventDefault();

    setCreating(true);
    setMessage("");

    const token = await getToken();

    if (!token) {
      setMessage("Please log in.");
      setCreating(false);
      return;
    }

    const res = await fetch("/api/affiliate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        fullName,
        phone,
        paymentMethod: "momo",
        momoNumber,
        momoNetwork,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setMessage(data.error || "Could not join affiliate program.");
      setCreating(false);
      return;
    }

    setCreating(false);
    await loadAffiliate();
  }

  async function copyLink() {
    if (!affiliate) return;

    const link =
      `${window.location.origin}/signup?ref=${affiliate.referral_code}`;

    await navigator.clipboard.writeText(link);

    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 2000);
  }

  useEffect(() => {
    void loadAffiliate();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-black p-8 text-white">
        Loading Affiliate Program...
      </main>
    );
  }

  if (!affiliate) {
    return (
      <main className="min-h-screen bg-black px-5 py-8 text-white">
        <div className="mx-auto max-w-xl">

          <Link
            href="/dashboard"
            className="text-sm font-bold text-pink-400"
          >
            ← Back to Dashboard
          </Link>

          <div className="mt-6 rounded-3xl border border-pink-500/20 bg-white/5 p-6">

            <div className="text-5xl">
              🤝
            </div>

            <h1 className="mt-4 text-3xl font-black text-pink-500">
              Join Fortuna Affiliate Program
            </h1>

            <p className="mt-3 leading-7 text-white/60">
              Share your unique Fortuna link and earn GH₵1 for every
              qualified player you bring.
            </p>

            <div className="mt-5 rounded-2xl bg-pink-500/10 p-4 text-sm leading-7 text-white/70">
              A referral qualifies after registering through your link,
              making a successful deposit and playing at least GH₵20
              worth of games.
            </div>

            {message && (
              <p className="mt-4 rounded-xl bg-red-500/10 p-3 text-red-300">
                {message}
              </p>
            )}

            <form
              onSubmit={createAffiliate}
              className="mt-6 grid gap-4"
            >
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Full Name"
                required
                className="rounded-xl border border-white/10 bg-black p-4 outline-none focus:border-pink-500"
              />

              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Phone Number"
                required
                className="rounded-xl border border-white/10 bg-black p-4 outline-none focus:border-pink-500"
              />

              <select
                value={momoNetwork}
                onChange={(e) => setMomoNetwork(e.target.value)}
                className="rounded-xl border border-white/10 bg-black p-4 outline-none focus:border-pink-500"
              >
                <option value="MTN">MTN MoMo</option>
                <option value="Telecel">Telecel Cash</option>
                <option value="AT">AT Money</option>
              </select>

              <input
                value={momoNumber}
                onChange={(e) => setMomoNumber(e.target.value)}
                placeholder="MoMo Number"
                required
                className="rounded-xl border border-white/10 bg-black p-4 outline-none focus:border-pink-500"
              />

              <button
                disabled={creating}
                className="rounded-xl bg-pink-500 py-4 font-black text-black disabled:opacity-40"
              >
                {creating
                  ? "Creating Account..."
                  : "Join Affiliate Program"}
              </button>
            </form>
          </div>
        </div>
      </main>
    );
  }

  const qualified =
    referrals.filter((referral) => referral.qualified).length;

  const referralLink =
    typeof window !== "undefined"
      ? `${window.location.origin}/signup?ref=${affiliate.referral_code}`
      : "";

  return (
    <main className="min-h-screen bg-black px-5 py-8 text-white">
      <div className="mx-auto max-w-6xl">

        <Link
          href="/dashboard"
          className="text-sm font-bold text-pink-400"
        >
          ← Back to Dashboard
        </Link>

        <section className="mt-6 rounded-3xl border border-pink-500/20 bg-gradient-to-br from-pink-600/15 via-black to-purple-950/30 p-6">

          <p className="text-xs font-black uppercase tracking-widest text-pink-400">
            Fortuna Affiliate Program
          </p>

          <h1 className="mt-3 text-3xl font-black">
            Welcome, {affiliate.full_name}
          </h1>

          <p className="mt-2 text-white/50">
            Share your link. Bring real players. Earn GH₵1 per qualified referral.
          </p>
        </section>

        <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm text-white/50">
              Total Referrals
            </p>

            <p className="mt-2 text-3xl font-black">
              {referrals.length}
            </p>
          </div>

          <div className="rounded-2xl border border-green-500/20 bg-green-500/10 p-5">
            <p className="text-sm text-white/50">
              Qualified Players
            </p>

            <p className="mt-2 text-3xl font-black text-green-400">
              {qualified}
            </p>
          </div>

          <div className="rounded-2xl border border-pink-500/20 bg-pink-500/10 p-5">
            <p className="text-sm text-white/50">
              Available Earnings
            </p>

            <p className="mt-2 text-3xl font-black text-pink-500">
              GH₵{Number(affiliate.available_balance).toFixed(2)}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm text-white/50">
              Total Paid
            </p>

            <p className="mt-2 text-3xl font-black">
              GH₵{Number(affiliate.total_paid).toFixed(2)}
            </p>
          </div>
        </section>

        <section className="mt-6 rounded-3xl border border-pink-500/20 bg-white/5 p-6">

          <h2 className="text-xl font-black text-pink-500">
            Your Referral Link
          </h2>

          <div className="mt-4 break-all rounded-xl bg-black p-4 text-sm text-white/70">
            {referralLink}
          </div>

          <button
            onClick={() => void copyLink()}
            className="mt-4 w-full rounded-xl bg-pink-500 py-4 font-black text-black sm:w-auto sm:px-8"
          >
            {copied ? "✓ Link Copied" : "Copy Referral Link"}
          </button>
        </section>

        <section className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-6">

          <h2 className="text-xl font-black">
            How You Earn
          </h2>

          <p className="mt-3 leading-7 text-white/60">
            You earn GH₵1 when a new player joins through your link,
            deposits successfully and plays at least GH₵20 worth of games.
            Each player can qualify only once.
          </p>
        </section>
      </div>
    </main>
  );
}
