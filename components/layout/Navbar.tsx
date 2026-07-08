"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { signOut } from "@/lib/auth";

type Profile = {
  username: string | null;
  first_name: string | null;
};

export default function Navbar() {
  const pathname = usePathname();

  if (pathname.startsWith("/admin")) {
    return null;
  }

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser();

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

    return () => listener.subscription.unsubscribe();
  }, []);

  async function handleLogout() {
    await signOut();
    window.location.href = "/";
  }

  const name = profile?.username || profile?.first_name || "Player";

  const userLinks = [
    ["Games", "/skill-games"],
    ["Wallet", "/wallet"],
    ["History", "/wallet/history"],
    ["Support", "/support"],
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-yellow-500/20 bg-black/95 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-4 sm:px-6">
        <Link href="/" className="text-xl font-black tracking-wide text-yellow-400 sm:text-3xl">
          Fortuna <span className="text-white">Play</span>
        </Link>

        {loading ? null : profile ? (
          <>
            <nav className="hidden items-center gap-4 text-sm font-bold lg:flex">
              {userLinks.map(([label, href]) => (
                <Link key={href} href={href} className="text-white/80 hover:text-yellow-400">
                  {label}
                </Link>
              ))}

              <Link href="/wallet/deposit" className="rounded-full bg-green-500 px-5 py-2 font-black text-black">
                Deposit
              </Link>

              <Link href="/wallet/withdraw" className="rounded-full bg-green-500 px-5 py-2 font-black text-black">
                Withdraw
              </Link>

              <Link href="/dashboard" className="rounded-full bg-white/10 px-4 py-2 font-bold">
                @{name}
              </Link>

              <button onClick={() => void handleLogout()} className="rounded-full bg-red-600 px-4 py-2 font-bold text-white">
                Logout
              </button>
            </nav>

            <button
              onClick={() => setOpen(!open)}
              className="rounded-xl border border-yellow-400/30 px-4 py-2 font-black text-yellow-400 lg:hidden"
            >
              Menu
            </button>
          </>
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

      {!loading && profile && open && (
        <div className="border-t border-white/10 px-4 pb-4 lg:hidden">
          <div className="grid gap-2 pt-4">
            {userLinks.map(([label, href]) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className="rounded-xl bg-white/5 px-4 py-3 font-bold"
              >
                {label}
              </Link>
            ))}

            <div className="grid grid-cols-2 gap-2">
              <Link href="/wallet/deposit" onClick={() => setOpen(false)} className="rounded-xl bg-green-500 px-4 py-3 text-center font-black text-black">
                Deposit
              </Link>

              <Link href="/wallet/withdraw" onClick={() => setOpen(false)} className="rounded-xl bg-green-500 px-4 py-3 text-center font-black text-black">
                Withdraw
              </Link>
            </div>

            <Link href="/dashboard" onClick={() => setOpen(false)} className="rounded-xl bg-white/10 px-4 py-3 font-bold">
              @{name}
            </Link>

            <button onClick={() => void handleLogout()} className="rounded-xl bg-red-600 px-4 py-3 font-bold text-white">
              Logout
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
