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

        <Link
          href="/lucky-draw/live"
          className="mt-6 block overflow-hidden rounded-3xl border border-red-500/40 bg-gradient-to-r from-red-600/25 via-[#0B2545] to-[#071A33] p-6 shadow-xl transition hover:-translate-y-1 hover:border-red-400"
        >
          <div className="flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-center">
            <div>
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-2 rounded-full bg-red-500 px-3 py-1 text-xs font-black text-white">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-white" />
                  LIVE NOW
                </span>

                <span className="text-3xl">📺</span>
              </div>

              <h2 className="mt-4 text-2xl font-black sm:text-3xl">
                Watch the Live Draw & See Who Wins
              </h2>

              <p className="mt-2 max-w-2xl text-sm text-[#B4C0D1] sm:text-base">
                Watch the latest Lucky Draw results live and see the winners as they are announced.
              </p>
            </div>

            <div className="rounded-2xl bg-red-500 px-6 py-4 font-black text-white">
              Watch Live Draw →
            </div>
          </div>
        </Link>

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
