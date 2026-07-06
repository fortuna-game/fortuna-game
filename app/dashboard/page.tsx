"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Profile = {
  first_name: string | null;
  username: string | null;
};

export default function Dashboard() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [balance, setBalance] = useState("0.00");

  useEffect(() => {
    async function loadDashboard() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profileData } = await supabase
        .from("profiles")
        .select("first_name, username")
        .eq("user_id", user.id)
        .maybeSingle();

      const { data: walletData } = await supabase
        .from("wallets")
        .select("balance")
        .eq("user_id", user.id)
        .maybeSingle();

      setProfile(profileData);
      setBalance(Number(walletData?.balance || 0).toFixed(2));
    }

    void loadDashboard();
  }, []);

  const name = profile?.first_name || profile?.username || "Player";

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-7xl px-6 py-10">

        <section className="rounded-[36px] border border-yellow-400/20 bg-gradient-to-br from-yellow-500/20 via-black to-purple-950/40 p-8 shadow-2xl">
          <p className="text-sm font-bold uppercase tracking-[0.3em] text-yellow-300">
            Fortuna Play Dashboard
          </p>

          <h1 className="mt-4 text-5xl font-black">
            Welcome back, <span className="text-yellow-400">{name}</span>
          </h1>

          <p className="mt-3 max-w-2xl text-white/60">
            Manage your wallet, play games, track withdrawals and view your winnings.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link href="/games" className="rounded-full bg-yellow-400 px-8 py-4 font-black text-black">
              Play Games
            </Link>
            <Link href="/wallet/deposit" className="rounded-full border border-green-400/40 px-8 py-4 font-bold text-green-300">
              Deposit
            </Link>
            <Link href="/wallet/withdraw" className="rounded-full border border-red-400/40 px-8 py-4 font-bold text-red-300">
              Withdraw
            </Link>
          </div>
        </section>

        <section className="mt-8 grid gap-6 md:grid-cols-4">
          <div className="rounded-3xl border border-yellow-400/20 bg-yellow-500/10 p-6">
            <p className="text-white/60">Account Balance</p>
            <h2 className="mt-4 text-5xl font-black text-yellow-400">₵{balance}</h2>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <p className="text-white/60">Games Available</p>
            <h2 className="mt-4 text-5xl font-black">13</h2>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <p className="text-white/60">Withdrawals</p>
            <h2 className="mt-4 text-3xl font-black text-red-300">Track</h2>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <p className="text-white/60">Status</p>
            <h2 className="mt-4 text-3xl font-black text-green-300">Active</h2>
          </div>
        </section>

        <section className="mt-10 grid gap-6 lg:grid-cols-3">
          <div className="rounded-3xl border border-yellow-400/20 bg-white/5 p-6 lg:col-span-2">
            <h2 className="text-3xl font-black text-yellow-400">Quick Actions</h2>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Link href="/wallet" className="rounded-2xl bg-yellow-400 p-5 text-center font-black text-black">
                Wallet
              </Link>
              <Link href="/wallet/deposit" className="rounded-2xl border border-green-400/30 bg-green-500/10 p-5 text-center text-green-300">
                Deposit Money
              </Link>
              <Link href="/wallet/withdraw" className="rounded-2xl border border-red-400/30 bg-red-500/10 p-5 text-center text-red-300">
                Withdraw
              </Link>
              <Link href="/wallet/withdrawals" className="rounded-2xl border border-white/10 bg-white/5 p-5 text-center">
                Withdrawal History
              </Link>
              <Link href="/games" className="rounded-2xl border border-white/10 bg-white/5 p-5 text-center">
                Play Games
              </Link>
              <Link href="/verify" className="rounded-2xl border border-white/10 bg-white/5 p-5 text-center">
                Verify Account
              </Link>
            </div>
          </div>

          <div className="rounded-3xl border border-yellow-400/20 bg-gradient-to-b from-yellow-500/10 to-black p-6">
            <h2 className="text-2xl font-black">Player Tips</h2>
            <p className="mt-4 text-white/60">
              Deposit funds, choose a game, play responsibly, and track every withdrawal from your history page.
            </p>

            <Link href="/wallet/withdrawals" className="mt-6 block rounded-2xl bg-white/10 p-4 text-center font-bold">
              View Withdrawal History
            </Link>
          </div>
        </section>

      </div>
    </main>
  );
}
