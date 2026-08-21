"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function WalletPage() {
  const paymentSuccess =
    typeof window !== "undefined" &&
    window.location.search.includes("payment=success");

  useEffect(() => {
    if (paymentSuccess) {
      window.history.replaceState({}, "", "/wallet");
    }
  }, [paymentSuccess]);

  const paymentFailed =
    typeof window !== "undefined" &&
    window.location.search.includes("payment=failed");

  const paymentReference =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("reference")
      : null;

  const [balance, setBalance] = useState("0.00");
  const [verifying, setVerifying] = useState(false);
  const [username, setUsername] = useState("");

  async function loadWallet() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.access_token) {
        await fetch("/api/deposit/reconcile", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });
      }
    } catch (error) {
      console.error("Deposit reconciliation failed:", error);
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("username")
      .eq("user_id", user.id)
      .maybeSingle();

    const { data: wallet } = await supabase
      .from("wallets")
      .select("balance")
      .eq("user_id", user.id)
      .maybeSingle();

    setUsername(profile?.username || "Player");
    setBalance(Number(wallet?.balance || 0).toFixed(2));
  }

  useEffect(() => {
    void loadWallet();

    if (paymentSuccess) {
      setVerifying(true);
      const timer = setTimeout(() => {
        void loadWallet();
        setVerifying(false);
      }, 3000);

      return () => clearTimeout(timer);
    }

    if (paymentFailed && paymentReference) {
      async function markCancelled() {
        try {
          const {
            data: { session },
          } = await supabase.auth.getSession();

          if (!session?.access_token) return;

          await fetch("/api/deposit/cancel", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${session.access_token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              reference: paymentReference,
            }),
          });
        } catch (error) {
          console.error("Could not mark cancelled deposit:", error);
        }
      }

      void markCancelled();
    }
  }, [paymentSuccess, paymentFailed, paymentReference]);

  return (
    <main className="min-h-screen bg-white px-6 py-10 text-slate-900">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-3xl sm:text-4xl font-black text-emerald-600">Wallet</h1>
        <p className="mt-2 text-slate-500">@{username}</p>

        {verifying && (
          <div className="mt-5 border-l-4 border-emerald-500 bg-emerald-50 p-4 text-emerald-700">
            Deposit successful. Verifying payment... your wallet will update shortly.
          </div>
        )}

        {paymentFailed && (
          <div className="mt-5 border-l-4 border-red-500 bg-red-50 p-4 text-red-700">
            Transaction failed or was cancelled. Your wallet was not credited.
          </div>
        )}

        <section className="mt-8 border-t border-slate-200 pt-8">
          <p className="text-sm font-semibold text-emerald-600">Available Balance</p>
          <h2 className="mt-2 text-4xl sm:text-5xl font-black text-emerald-600">₵{balance}</h2>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/wallet/deposit" className="rounded-lg bg-emerald-600 px-7 py-3 text-center font-bold text-white transition hover:bg-emerald-700">
              Deposit
            </Link>
            <Link href="/wallet/withdraw" className="rounded-lg bg-emerald-600 px-7 py-3 text-center font-bold text-white transition hover:bg-emerald-700">
              Withdraw
            </Link>
            <Link href="/wallet/history" className="rounded-lg bg-emerald-600 px-7 py-3 text-center font-bold text-white transition hover:bg-emerald-700">
              Account History
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
