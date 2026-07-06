"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function WalletPage() {
  const paymentSuccess =
    typeof window !== "undefined" &&
    window.location.search.includes("payment=success");
  const [balance, setBalance] = useState("0.00");
  const [verifying, setVerifying] = useState(false);
  const [username, setUsername] = useState("");

  useEffect(() => {
    async function loadWallet() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("username")
        .eq("user_id", user.id)
        .single();

      const { data: wallet } = await supabase
        .from("wallets")
        .select("balance")
        .eq("user_id", user.id)
        .single();

      setUsername(profile?.username || "Player");
      setBalance(Number(wallet?.balance || 0).toFixed(2));
    }

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
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-5xl px-6 py-10">

        <h1 className="text-5xl font-black text-yellow-400">
          Wallet
        </h1>

        <p className="mt-2 text-white/60">
          @{username}
        </p>

        {verifying && (
          <div className="mt-6 rounded-xl border border-green-400/30 bg-green-500/10 p-4 text-green-300">
            Verifying payment... your wallet will update shortly.
          </div>
        )}

        <div className="mt-10 rounded-3xl border border-yellow-400/20 bg-gradient-to-r from-yellow-500/10 via-black to-purple-900/20 p-10">

          <p className="text-white/60">
            Available Balance
          </p>

          <h2 className="mt-3 text-6xl font-black text-yellow-400">
            ₵{balance}
          </h2>

          <div className="mt-10 flex flex-wrap gap-5">

            <Link
              href="/wallet/deposit"
              className="rounded-2xl bg-green-500 px-8 py-4 font-black text-black"
            >
              Deposit Money
            </Link>

            <Link
              href="/wallet/withdraw"
              className="rounded-2xl bg-red-500 px-8 py-4 font-black text-white"
            >
              Withdraw Money
            </Link>

          </div>

        </div>

      </div>
    </main>
  );
}
