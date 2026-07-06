"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function WalletPage() {
  const paymentSuccess =
    typeof window !== "undefined" &&
    window.location.search.includes("payment=success");

  const paymentFailed =
    typeof window !== "undefined" &&
    window.location.search.includes("payment=failed");

  const [balance, setBalance] = useState("0.00");
  const [verifying, setVerifying] = useState(false);
  const [username, setUsername] = useState("");

  async function loadWallet() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

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
  }, [paymentSuccess]);

  return (
    <main className="min-h-screen bg-black px-6 py-10 text-white">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-4xl font-black text-yellow-400">Wallet</h1>
        <p className="mt-2 text-white/60">@{username}</p>

        {verifying && (
          <div className="mt-5 rounded-xl border border-green-400/30 bg-green-500/10 p-4 text-green-300">
            Deposit successful. Verifying payment... your wallet will update shortly.
          </div>
        )}

        {paymentFailed && (
          <div className="mt-5 rounded-xl border border-red-400/30 bg-red-500/10 p-4 text-red-300">
            Transaction failed or was cancelled. Your wallet was not credited.
          </div>
        )}

        <section className="mt-6 rounded-3xl border border-yellow-400/20 bg-yellow-500/10 p-6">
          <p className="text-white/60">Available Balance</p>
          <h2 className="mt-2 text-5xl font-black text-yellow-400">₵{balance}</h2>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <Link href="/wallet/deposit" className="rounded-xl bg-green-500 py-3 text-center font-black text-black">
              Deposit
            </Link>
            <Link href="/wallet/withdraw" className="rounded-xl bg-green-500 py-3 text-center font-black text-black">
              Withdraw
            </Link>
            <Link href="/wallet/history" className="rounded-xl border border-white/10 bg-white/5 py-3 text-center font-bold">
              Account History
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
