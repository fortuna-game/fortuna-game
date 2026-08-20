"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import RewardsCard from "@/components/RewardsCard";

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

    const timer = setInterval(() => {
      void loadDashboard();
    }, 4000);

    return () => clearInterval(timer);
  }, []);

  const name = profile?.first_name || profile?.username || "Player";

  return (
    <main className="min-h-screen bg-[#071A33] text-white">
      <div className="mx-auto max-w-7xl px-5 py-8">

        <div className="mb-6">
          <RewardsCard />
        </div>

        <section className="rounded-3xl border border-[#2A5688] bg-gradient-to-br from-blue-700/15 via-[#071A33] to-[#0B2345]/60 p-6 md:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#66A7FF]">
            Fortuna Play Dashboard
          </p>

          <div className="mt-3 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <h1 className="text-3xl font-black md:text-4xl">
                Welcome, <span className="text-[#4D94F5]">{name}</span>
              </h1>

              <p className="mt-2 text-sm text-[#8295B0]">
                Play games, manage your funds and track your activity.
              </p>
            </div>

            <div className="min-w-[220px] rounded-2xl border border-[#2A5688] bg-[#2C63B3]/10 p-5">
              <p className="text-sm text-[#9AAAC1]">Wallet</p>

              <p className="mt-1 text-3xl font-black text-[#4D94F5]">
                ₵{balance}
              </p>


            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <Link
            href="/skill-games"
            className="rounded-2xl border border-[#2A5688] bg-[#2C63B3]/10 p-5 transition hover:border-[#4D94F5]/50"
          >
            <p className="text-xl font-black text-[#4D94F5]">
              Play Games
            </p>

            <p className="mt-2 text-sm text-[#8295B0]">
              Browse available games and start playing.
            </p>
          </Link>

          <Link
            href="/wallet/history"
            className="rounded-2xl border border-[#38BDF8]/15 bg-[#0B2545]/70 p-5 transition hover:border-white/30"
          >
            <p className="text-xl font-black">
              Account History
            </p>

            <p className="mt-2 text-sm text-[#8295B0]">
              View deposits and withdrawals.
            </p>
          </Link>

          <Link
            href="/game-history"
            className="rounded-2xl border border-[#38BDF8]/15 bg-[#0B2545]/70 p-5 transition hover:border-white/30"
          >
            <p className="text-xl font-black">
              Game History
            </p>

            <p className="mt-2 text-sm text-[#8295B0]">
              View games played, wins and losses.
            </p>
          </Link>

          <Link
            href="/profile"
            className="rounded-2xl border border-[#38BDF8]/15 bg-[#0B2545]/70 p-5 transition hover:border-white/30"
          >
            <p className="text-xl font-black">
              Profile
            </p>

            <p className="mt-2 text-sm text-[#8295B0]">
              Manage your Fortuna Play account.
            </p>
          </Link>


        </section>
      </div>
    </main>
  );
}
