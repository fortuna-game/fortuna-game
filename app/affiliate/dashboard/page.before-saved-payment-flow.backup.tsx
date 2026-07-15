"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Affiliate = {
  id: string;
  full_name: string;
  phone: string;
  referral_code: string;
  status: string;
  available_balance: number;
  total_paid: number;
  payment_method: string | null;
  momo_number: string | null;
  momo_network: string | null;
  bank_name: string | null;
  bank_account_name: string | null;
  bank_account_number: string | null;
};

type Referral = {
  id: string;
  referred_user_id: string;
  successful_deposit_amount: number;
  total_game_stakes: number;
  qualified: boolean;
  qualified_at: string | null;
  commission_amount: number;
  commission_status: string;
  created_at: string;
  profiles: {
    username: string | null;
    first_name: string | null;
  } | null;
};

type Payout = {
  id: string;
  amount: number;
  payment_method: string;
  payment_details: Record<string, string | null>;
  status: string;
  failure_reason: string | null;
  admin_note: string | null;
  requested_at: string;
  processed_at: string | null;
};

export default function AffiliatePage() {
  const router = useRouter();

  const [affiliate, setAffiliate] =
    useState<Affiliate | null>(null);

  const [referrals, setReferrals] =
    useState<Referral[]>([]);

  const [payouts, setPayouts] =
    useState<Payout[]>([]);

  const [paymentMethod, setPaymentMethod] =
    useState("momo");

  const [momoNetwork, setMomoNetwork] =
    useState("MTN");

  const [momoNumber, setMomoNumber] =
    useState("");

  const [bankName, setBankName] =
    useState("");

  const [bankAccountName, setBankAccountName] =
    useState("");

  const [bankAccountNumber, setBankAccountNumber] =
    useState("");

  const [withdrawAmount, setWithdrawAmount] =
    useState("");

  const [loading, setLoading] = useState(true);
  const [savingPayment, setSavingPayment] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);

  const [message, setMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [copied, setCopied] = useState(false);

  async function getToken() {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token;
  }

  async function loadAffiliate() {
    const token = await getToken();

    if (!token) {
      router.replace("/affiliate/login");
      return;
    }

    try {
      const res = await fetch("/api/affiliate", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(
          data.error || "Could not load affiliate account."
        );
        setLoading(false);
        return;
      }

      if (!data.affiliate) {
        router.replace("/affiliate/register");
        return;
      }

      setAffiliate(data.affiliate);
      setReferrals(data.referrals || []);
      setPayouts(data.payouts || []);

      setPaymentMethod(
        data.affiliate.payment_method || "momo"
      );

      setMomoNetwork(
        data.affiliate.momo_network || "MTN"
      );

      setMomoNumber(
        data.affiliate.momo_number || ""
      );

      setBankName(
        data.affiliate.bank_name || ""
      );

      setBankAccountName(
        data.affiliate.bank_account_name || ""
      );

      setBankAccountNumber(
        data.affiliate.bank_account_number || ""
      );

      setLoading(false);
    } catch {
      setMessage("Could not connect to affiliate account.");
      setLoading(false);
    }
  }

  async function savePaymentDetails(
    event: React.FormEvent
  ) {
    event.preventDefault();

    setSavingPayment(true);
    setMessage("");
    setSuccessMessage("");

    const token = await getToken();

    if (!token) {
      router.replace("/affiliate/login");
      return;
    }

    try {
      const res = await fetch("/api/affiliate", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          paymentMethod,
          momoNetwork,
          momoNumber,
          bankName,
          bankAccountName,
          bankAccountNumber,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(
          data.error || "Could not save payment details."
        );
        setSavingPayment(false);
        return;
      }

      setSuccessMessage(
        data.message || "Payment details saved."
      );

      setSavingPayment(false);
      await loadAffiliate();
    } catch {
      setMessage("Could not save payment details.");
      setSavingPayment(false);
    }
  }

  async function requestWithdrawal(
    event: React.FormEvent
  ) {
    event.preventDefault();

    setWithdrawing(true);
    setMessage("");
    setSuccessMessage("");

    const amount = Number(withdrawAmount);

    if (!Number.isFinite(amount) || amount <= 0) {
      setMessage("Enter a valid withdrawal amount.");
      setWithdrawing(false);
      return;
    }

    const token = await getToken();

    if (!token) {
      router.replace("/affiliate/login");
      return;
    }

    try {
      const res = await fetch("/api/affiliate", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(
          data.error || "Could not request withdrawal."
        );
        setWithdrawing(false);
        return;
      }

      setSuccessMessage(
        data.message || "Withdrawal requested successfully."
      );

      setWithdrawAmount("");
      setWithdrawing(false);

      await loadAffiliate();
    } catch {
      setMessage("Could not request withdrawal.");
      setWithdrawing(false);
    }
  }

  async function logoutAffiliate() {
    await supabase.auth.signOut();
    router.replace("/affiliate/login");
    router.refresh();
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

    const timer = setInterval(() => {
      void loadAffiliate();
    }, 10000);

    return () => clearInterval(timer);
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-black p-8 text-white">
        Loading Affiliate Dashboard...
      </main>
    );
  }

  if (!affiliate) {
    return null;
  }

  const qualified =
    referrals.filter(
      (referral) => referral.qualified
    ).length;

  const hasPendingWithdrawal =
    payouts.some(
      (payout) =>
        payout.status === "pending" ||
        payout.status === "processing"
    );

  const referralLink =
    typeof window !== "undefined"
      ? `${window.location.origin}/signup?ref=${affiliate.referral_code}`
      : "";

  return (
    <main className="min-h-screen bg-black px-5 py-8 text-white">
      <div className="mx-auto max-w-6xl">

        <header className="flex flex-col gap-4 rounded-2xl border border-green-500/20 bg-white/5 p-4 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href="/affiliate/dashboard"
            className="text-2xl font-black text-green-400"
          >
            Fortuna Affiliate
          </Link>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/affiliate/dashboard"
              className="rounded-xl border border-green-500/20 px-4 py-2 font-bold text-green-400"
            >
              Dashboard
            </Link>

            <button
              onClick={() => void logoutAffiliate()}
              className="rounded-xl bg-green-500 px-5 py-2 font-black text-black"
            >
              Logout
            </button>
          </div>
        </header>

        <section className="mt-6 rounded-3xl border border-pink-500/20 bg-gradient-to-br from-pink-600/15 via-black to-purple-950/30 p-6">
          <p className="text-xs font-black uppercase tracking-widest text-pink-400">
            Fortuna Affiliate Program
          </p>

          <h1 className="mt-3 text-3xl font-black">
            Welcome, {affiliate.full_name}
          </h1>

          <p className="mt-2 text-white/50">
            Share your link. Bring real players. Earn GH₵5 per qualified player.
          </p>
        </section>

        {message && (
          <p className="mt-5 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-red-300">
            {message}
          </p>
        )}

        {successMessage && (
          <p className="mt-5 rounded-xl border border-green-500/20 bg-green-500/10 p-4 text-green-300">
            {successMessage}
          </p>
        )}

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

        <section className="mt-6 rounded-3xl border border-blue-500/20 bg-white/5 p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-black text-blue-300">
                Referral Progress
              </h2>

              <p className="mt-2 text-sm text-white/50">
                Track every referred player’s deposit, gameplay and GH₵5 qualification progress.
              </p>
            </div>

            <p className="text-sm font-bold text-white/50">
              {qualified} of {referrals.length} qualified
            </p>
          </div>

          <div className="mt-6 grid gap-5">
            {referrals.map((referral, index) => {
              const depositAmount = Number(
                referral.successful_deposit_amount || 0
              );

              const gameAmount = Number(
                referral.total_game_stakes || 0
              );

              const depositProgress = Math.min(
                (depositAmount / 20) * 100,
                100
              );

              const gameProgress = Math.min(
                (gameAmount / 20) * 100,
                100
              );

              const depositRemaining = Math.max(
                20 - depositAmount,
                0
              );

              const gameRemaining = Math.max(
                20 - gameAmount,
                0
              );

              const playerName =
                referral.profiles?.username ||
                referral.profiles?.first_name ||
                `Player ${index + 1}`;

              let progressMessage =
                "Waiting for the player to begin qualifying.";

              if (referral.qualified) {
                progressMessage =
                  "Qualified successfully. GH₵5 commission earned.";
              } else if (
                depositAmount >= 20 &&
                gameAmount < 20
              ) {
                progressMessage =
                  `Deposit completed. GH₵${gameRemaining.toFixed(
                    2
                  )} more gameplay is needed.`;
              } else if (
                depositAmount < 20 &&
                gameAmount >= 20
              ) {
                progressMessage =
                  `Gameplay completed. GH₵${depositRemaining.toFixed(
                    2
                  )} more successful deposits are needed.`;
              } else if (
                depositAmount > 0 ||
                gameAmount > 0
              ) {
                progressMessage =
                  `Needs GH₵${depositRemaining.toFixed(
                    2
                  )} more deposits and GH₵${gameRemaining.toFixed(
                    2
                  )} more gameplay.`;
              }

              return (
                <article
                  key={referral.id}
                  className={`rounded-3xl border p-5 ${
                    referral.qualified
                      ? "border-green-500/30 bg-green-500/10"
                      : "border-white/10 bg-black/50"
                  }`}
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-xs font-black uppercase tracking-widest text-white/40">
                        Referred Player
                      </p>

                      <h3 className="mt-1 text-xl font-black">
                        @{playerName}
                      </h3>

                      <p className="mt-1 text-xs text-white/40">
                        Joined{" "}
                        {new Date(
                          referral.created_at
                        ).toLocaleString()}
                      </p>
                    </div>

                    <span
                      className={`w-fit rounded-full px-4 py-2 text-sm font-black ${
                        referral.qualified
                          ? "bg-green-500 text-black"
                          : "bg-yellow-400/15 text-yellow-300"
                      }`}
                    >
                      {referral.qualified
                        ? "✓ Qualified"
                        : "In Progress"}
                    </span>
                  </div>

                  <div className="mt-6 grid gap-5 md:grid-cols-2">
                    <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-black">
                          💰 Successful Deposits
                        </p>

                        <p className="text-sm font-black">
                          GH₵{depositAmount.toFixed(2)} / GH₵20
                        </p>
                      </div>

                      <div className="mt-3 h-3 overflow-hidden rounded-full bg-white/10">
                        <div
                          className="h-full rounded-full bg-green-500 transition-all"
                          style={{
                            width: `${depositProgress}%`,
                          }}
                        />
                      </div>

                      <p className="mt-2 text-xs text-white/50">
                        {depositAmount >= 20
                          ? "Deposit requirement completed."
                          : `GH₵${depositRemaining.toFixed(
                              2
                            )} remaining.`}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-black">
                          🎮 Real-Money Gameplay
                        </p>

                        <p className="text-sm font-black">
                          GH₵{gameAmount.toFixed(2)} / GH₵20
                        </p>
                      </div>

                      <div className="mt-3 h-3 overflow-hidden rounded-full bg-white/10">
                        <div
                          className="h-full rounded-full bg-blue-500 transition-all"
                          style={{
                            width: `${gameProgress}%`,
                          }}
                        />
                      </div>

                      <p className="mt-2 text-xs text-white/50">
                        {gameAmount >= 20
                          ? "Gameplay requirement completed."
                          : `GH₵${gameRemaining.toFixed(
                              2
                            )} remaining.`}
                      </p>
                    </div>
                  </div>

                  <div
                    className={`mt-5 rounded-2xl p-4 ${
                      referral.qualified
                        ? "bg-green-500/15"
                        : "bg-yellow-500/10"
                    }`}
                  >
                    <p
                      className={`font-bold ${
                        referral.qualified
                          ? "text-green-300"
                          : "text-yellow-300"
                      }`}
                    >
                      {progressMessage}
                    </p>

                    {referral.qualified && (
                      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-green-500/20 pt-3">
                        <div>
                          <p className="text-xs uppercase text-white/40">
                            Commission Earned
                          </p>

                          <p className="text-2xl font-black text-green-400">
                            GH₵
                            {Number(
                              referral.commission_amount || 5
                            ).toFixed(2)}
                          </p>
                        </div>

                        {referral.qualified_at && (
                          <p className="text-xs text-white/40">
                            Qualified{" "}
                            {new Date(
                              referral.qualified_at
                            ).toLocaleString()}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </article>
              );
            })}

            {referrals.length === 0 && (
              <div className="rounded-2xl border border-white/10 bg-black/40 p-8 text-center">
                <p className="text-lg font-black">
                  No referrals yet
                </p>

                <p className="mt-2 text-sm text-white/50">
                  Share your referral link. New players who register through it will appear here.
                </p>
              </div>
            )}
          </div>
        </section>

        <section className="mt-6 rounded-3xl border border-green-500/20 bg-white/5 p-6">
          <h2 className="text-2xl font-black text-green-400">
            Payment Settings
          </h2>

          <p className="mt-2 text-sm text-white/50">
            Choose how you want to receive your affiliate earnings.
          </p>

          <form
            onSubmit={savePaymentDetails}
            className="mt-6 grid gap-5"
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setPaymentMethod("momo")}
                className={`rounded-2xl border p-5 text-left ${
                  paymentMethod === "momo"
                    ? "border-green-500 bg-green-500/10"
                    : "border-white/10 bg-black"
                }`}
              >
                <p className="font-black">
                  📱 Mobile Money
                </p>

                <p className="mt-1 text-sm text-white/50">
                  MTN, Telecel or AirtelTigo
                </p>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod("bank")}
                className={`rounded-2xl border p-5 text-left ${
                  paymentMethod === "bank"
                    ? "border-green-500 bg-green-500/10"
                    : "border-white/10 bg-black"
                }`}
              >
                <p className="font-black">
                  🏦 Bank Account
                </p>

                <p className="mt-1 text-sm text-white/50">
                  Receive payment into your bank account
                </p>
              </button>
            </div>

            {paymentMethod === "momo" && (
              <div className="grid gap-4 sm:grid-cols-2">
                <select
                  value={momoNetwork}
                  onChange={(event) =>
                    setMomoNetwork(event.target.value)
                  }
                  className="rounded-xl border border-white/10 bg-black p-4 outline-none focus:border-green-500"
                >
                  <option value="MTN">
                    MTN Mobile Money
                  </option>

                  <option value="Telecel">
                    Telecel Cash
                  </option>

                  <option value="AT">
                    AirtelTigo Money
                  </option>
                </select>

                <input
                  value={momoNumber}
                  onChange={(event) =>
                    setMomoNumber(event.target.value)
                  }
                  placeholder="Mobile Money Number"
                  className="rounded-xl border border-white/10 bg-black p-4 outline-none focus:border-green-500"
                />
              </div>
            )}

            {paymentMethod === "bank" && (
              <div className="grid gap-4">
                <input
                  value={bankName}
                  onChange={(event) =>
                    setBankName(event.target.value)
                  }
                  placeholder="Bank Name"
                  className="rounded-xl border border-white/10 bg-black p-4 outline-none focus:border-green-500"
                />

                <input
                  value={bankAccountName}
                  onChange={(event) =>
                    setBankAccountName(event.target.value)
                  }
                  placeholder="Account Name"
                  className="rounded-xl border border-white/10 bg-black p-4 outline-none focus:border-green-500"
                />

                <input
                  value={bankAccountNumber}
                  onChange={(event) =>
                    setBankAccountNumber(event.target.value)
                  }
                  placeholder="Account Number"
                  className="rounded-xl border border-white/10 bg-black p-4 outline-none focus:border-green-500"
                />
              </div>
            )}

            <button
              disabled={savingPayment}
              className="rounded-xl bg-green-500 py-4 font-black text-black disabled:opacity-40"
            >
              {savingPayment
                ? "Saving..."
                : "Save Payment Details"}
            </button>
          </form>
        </section>

        <section className="mt-6 rounded-3xl border border-yellow-500/20 bg-white/5 p-6">
          <h2 className="text-2xl font-black text-yellow-300">
            Withdraw Earnings
          </h2>

          <p className="mt-2 text-white/50">
            Available Balance: GH₵
            {Number(affiliate.available_balance).toFixed(2)}
          </p>

          {hasPendingWithdrawal && (
            <p className="mt-4 rounded-xl bg-yellow-500/10 p-4 text-yellow-300">
              You already have a withdrawal being processed.
            </p>
          )}

          <form
            onSubmit={requestWithdrawal}
            className="mt-5 grid gap-4 sm:grid-cols-[1fr_auto]"
          >
            <input
              type="number"
              min="0.01"
              step="0.01"
              max={affiliate.available_balance}
              value={withdrawAmount}
              onChange={(event) =>
                setWithdrawAmount(event.target.value)
              }
              placeholder="Enter withdrawal amount"
              disabled={hasPendingWithdrawal}
              className="rounded-xl border border-white/10 bg-black p-4 outline-none focus:border-yellow-400 disabled:opacity-40"
            />

            <button
              disabled={
                withdrawing ||
                hasPendingWithdrawal ||
                Number(affiliate.available_balance) <= 0
              }
              className="rounded-xl bg-yellow-400 px-8 py-4 font-black text-black disabled:opacity-40"
            >
              {withdrawing
                ? "Requesting..."
                : "Withdraw"}
            </button>
          </form>
        </section>

        <section className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-2xl font-black">
            Withdrawal History
          </h2>

          <div className="mt-5 grid gap-4">
            {payouts.map((payout) => (
              <article
                key={payout.id}
                className="rounded-2xl border border-white/10 bg-black/50 p-5"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-2xl font-black">
                      GH₵{Number(payout.amount).toFixed(2)}
                    </p>

                    <p className="mt-1 text-sm text-white/50">
                      {payout.payment_method === "momo"
                        ? "Mobile Money"
                        : "Bank Account"}
                    </p>

                    <p className="mt-1 text-xs text-white/40">
                      {new Date(
                        payout.requested_at
                      ).toLocaleString()}
                    </p>
                  </div>

                  <span
                    className={`w-fit rounded-full px-4 py-2 text-sm font-black ${
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

                {payout.status === "failed" && (
                  <div className="mt-4 rounded-xl bg-red-500/10 p-4">
                    <p className="font-bold text-red-300">
                      Payment Failed
                    </p>

                    <p className="mt-1 text-sm text-white/60">
                      {payout.failure_reason ||
                        payout.admin_note ||
                        "The payment could not be completed."}
                    </p>

                    <p className="mt-2 text-sm font-bold text-green-300">
                      GH₵{Number(payout.amount).toFixed(2)} was returned to your available balance.
                    </p>
                  </div>
                )}
              </article>
            ))}

            {payouts.length === 0 && (
              <p className="rounded-xl bg-black/40 p-5 text-center text-white/40">
                No withdrawal history yet.
              </p>
            )}
          </div>
        </section>

        <section className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-xl font-black">
            How You Earn
          </h2>

          <p className="mt-3 leading-7 text-white/60">
            You earn GH₵5 when a genuine new player joins through your link,
            completes successful deposits totalling at least GH₵20 and spends
            at least GH₵20 playing real-money games. Each referred player can
            qualify only once, even if they later deposit or play more.
          </p>
        </section>
      </div>
    
        <section className="mt-8 rounded-3xl border border-green-500/20 bg-green-500/10 p-6">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
            <div>
              <p className="text-sm font-black uppercase tracking-widest text-green-400">
                Affiliate Support
              </p>

              <h2 className="mt-2 text-2xl font-black text-white">
                Need help with your affiliate account?
              </h2>

              <p className="mt-2 text-white/60">
                Contact us about referrals, commissions, withdrawals, payment details or account issues.
              </p>
            </div>

            <Link
              href="/affiliate/support"
              className="inline-flex shrink-0 items-center justify-center rounded-2xl bg-green-500 px-6 py-4 font-black text-black transition hover:bg-green-400"
            >
              Contact Affiliate Support
            </Link>
          </div>
        </section>

</main>
  );
}
