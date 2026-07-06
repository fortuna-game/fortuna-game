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

  useEffect(() => {
    async function loadUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setProfile(null);
        setLoading(false);
        return;
      }

      const { data: profileData } = await supabase
        .from("profiles")
        .select("username, first_name")
        .eq("user_id", user.id)
        .maybeSingle();

      setProfile(profileData);
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
    <header className="sticky top-0 z-50 border-b border-yellow-500/20 bg-black/90 backdrop-blur-xl">
      <div className="mx-auto flex min-h-20 max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Link href="/" className="text-xl font-black tracking-wide text-yellow-400 sm:text-3xl">
          Fortuna <span className="text-white">Play</span>
        </Link>

        {loading ? null : profile ? (
          <div className="flex flex-wrap items-center justify-end gap-2 text-xs sm:gap-3 sm:text-sm">
            <Link href="/support" className="font-bold">
              Support
            </Link>

            <Link href="/wallet/deposit" className="rounded-full bg-green-500 px-3 py-2 font-black text-black sm:px-5">
              Deposit
            </Link>

            <Link href="/wallet/withdraw" className="rounded-full bg-green-500 px-3 py-2 font-black text-black sm:px-5">
              Withdraw
            </Link>

            <Link href="/dashboard" className="rounded-full bg-white/10 px-3 py-2 font-bold sm:px-4">
              @{name}
            </Link>

            <button
              onClick={() => void handleLogout()}
              className="rounded-full bg-red-600 px-3 py-2 font-bold text-white sm:px-4"
            >
              Logout
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs sm:text-sm">
            <Link href="/login" className="rounded-full border border-yellow-400 px-4 py-2 font-bold text-yellow-400">
              Login
            </Link>

            <Link href="/signup" className="rounded-full bg-yellow-400 px-4 py-2 font-black text-black">
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
