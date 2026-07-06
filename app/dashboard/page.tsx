"use client";

import { useEffect, useState } from "react";
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
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return;
      }

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

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <h1 className="text-5xl font-black text-yellow-400">
          Welcome, {profile?.first_name || profile?.username || "Player"}
        </h1>

        <p className="mt-2 text-white/60">Your Fortuna Play dashboard.</p>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          <div className="rounded-3xl border border-yellow-400/20 bg-yellow-500/10 p-6">
            <p className="text-white/60">Wallet Balance</p>
            <h2 className="mt-4 text-4xl font-black text-yellow-400">
              ₵{balance}
            </h2>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <p className="text-white/60">Games Available</p>
            <h2 className="mt-4 text-4xl font-black">13</h2>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <p className="text-white/60">Games Played</p>
            <h2 className="mt-4 text-4xl font-black">0</h2>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <p className="text-white/60">Total Winnings</p>
            <h2 className="mt-4 text-4xl font-black text-green-400">₵0.00</h2>
          </div>
        </div>

        <div className="mt-12 rounded-3xl border border-yellow-400/20 bg-gradient-to-r from-yellow-500/10 via-black to-purple-900/20 p-8">
          <h2 className="text-3xl font-black">Quick Actions</h2>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <a href="/wallet" className="rounded-2xl bg-yellow-400 p-5 text-center font-black text-black">
              Wallet
            </a>

            <a href="/wallet/deposit" className="rounded-2xl border border-green-400/30 bg-green-500/10 p-5 text-center text-green-300">
              Deposit
            </a>

            <a href="/wallet/withdraw" className="rounded-2xl border border-red-400/30 bg-red-500/10 p-5 text-center text-red-300">
              Withdraw
            </a>
            <a href="/games" className="rounded-2xl border border-white/10 bg-white/5 p-5 text-center">
              Play Games
            </a>
            <a href="/winners" className="rounded-2xl border border-white/10 bg-white/5 p-5 text-center">
              Winners
            </a>
            <a href="/profile" className="rounded-2xl border border-white/10 bg-white/5 p-5 text-center">
              Profile
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
