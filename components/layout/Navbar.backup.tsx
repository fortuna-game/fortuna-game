"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { signOut } from "@/lib/auth";

type Profile = {
  username: string | null;
  first_name: string | null;
};

export default function Navbar() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [balance, setBalance] = useState("0.00");

  useEffect(() => {
    async function loadUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      const { data: profileData } = await supabase
        .from("profiles")
        .select("username, first_name")
        .eq("user_id", user.id)
        .maybeSingle();

      const { data: walletData } = await supabase
        .from("wallets")
        .select("balance")
        .eq("user_id", user.id)
        .maybeSingle();

      setProfile(profileData);
      setBalance(Number(walletData?.balance || 0).toFixed(2));
      setLoading(false);
    }

    void loadUser();

    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      void loadUser();
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  async function handleLogout() {
    await signOut();
    window.location.href = "/";
  }

  const name = profile?.username || profile?.first_name || "Player";

  return (
    <header className="sticky top-0 z-50 border-b border-pink-600/20 bg-black/80 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="text-3xl font-black tracking-wide text-pink-500">
          Fortuna <span className="text-white">Play</span>
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-semibold lg:flex">
          <Link href="/">Home</Link>
          <Link href="/games">Games</Link>
          <Link href="/winners">Winners</Link>
          <Link href="/promotions">Promotions</Link>
          <Link href="/support">Support</Link>
        </nav>

        {loading ? null : profile ? (
          <div className="flex items-center gap-3">
            <Link
              href="/wallet"
              className="rounded-full border border-pink-500/30 px-4 py-2 text-sm font-bold text-pink-400"
            >
              ₵{balance}
            </Link>

            <Link
              href="/dashboard"
              className="rounded-full bg-white/10 px-4 py-2 text-sm font-bold"
            >
              @{name}
            </Link>

            <button
              onClick={() => void handleLogout()}
              className="rounded-full bg-pink-600 px-4 py-2 text-sm font-bold text-white"
            >
              Logout
            </button>
          </div>
        ) : (
          <div className="flex gap-3">
            <Link
              href="/login"
              className="rounded-full border border-pink-500 px-5 py-2 text-pink-500"
            >
              Login
            </Link>

            <Link
              href="/signup"
              className="rounded-full bg-pink-500 px-5 py-2 font-bold text-black"
            >
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
