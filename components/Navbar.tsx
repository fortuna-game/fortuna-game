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

  if (
    pathname.startsWith("/admin") ||
    pathname.startsWith("/affiliate")
  ) {
    return null;
  }

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    const previousPaddingRight = document.body.style.paddingRight;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.paddingRight = previousPaddingRight;
    };
  }, [open]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 1024px)");

    const handleChange = () => {
      if (mediaQuery.matches) {
        setOpen(false);
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

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

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      void loadUser();
    });

    return () => subscription.unsubscribe();
  }, []);

  async function handleLogout() {
    await signOut();
    window.location.href = "/";
  }

  const name = profile?.username || profile?.first_name || "Player";

  const userLinks = [
    ["Games", "/skill-games"],
    ["My Results", "/game-history"],
    ["Transactions", "/wallet/history"],
    ["Support", "/support"],
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-blue-700/20 bg-[#071A33]/95 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-4 sm:px-6">
        <Link
          href="/"
          className="text-xl font-black tracking-wide text-[#4D94F5] sm:text-3xl"
        >
          Fortuna <span className="text-white">Play</span>
        </Link>

        {loading ? null : profile ? (
          <>
            <nav className="hidden items-center gap-4 text-sm font-bold lg:flex">
              {userLinks.map(([label, href]) => (
                <Link
                  key={href}
                  href={href}
                  className="text-white/80 hover:text-[#4D94F5]"
                >
                  {label}
                </Link>
              ))}

              <Link
                href="/wallet/deposit"
                className="rounded-full bg-[#3F82DD] px-5 py-2 font-black text-black"
              >
                Deposit
              </Link>

              <Link
                href="/wallet/withdraw"
                className="rounded-full bg-[#3F82DD] px-5 py-2 font-black text-black"
              >
                Withdraw
              </Link>

              <Link
                href="/dashboard"
                className="rounded-full bg-[#0F2F57]/80 px-4 py-2 font-bold"
              >
                @{name}
              </Link>

              <button
                onClick={() => void handleLogout()}
                className="rounded-full bg-[#2C63B3] px-4 py-2 font-bold text-white"
              >
                Logout
              </button>
            </nav>

            <button
              onClick={() => setOpen(!open)}
              className="rounded-xl border border-[#32659D] px-4 py-2 font-black text-[#4D94F5] lg:hidden"
            >
              Menu
            </button>
          </>
        ) : (
          <div className="flex items-center gap-2 text-xs sm:text-sm">
            <Link
              href="/login"
              className="rounded-full border border-blue-500 px-4 py-2 font-bold text-[#4D94F5]"
            >
              Login
            </Link>

            <Link
              href="/signup"
              className="rounded-full bg-[#3F82DD] px-4 py-2 font-black text-black"
            >
              Sign Up
            </Link>
          </div>
        )}
      </div>

      {!loading && profile && open && (
        <div className="fixed inset-x-0 bottom-0 top-[73px] z-50 overflow-y-auto overscroll-contain border-t border-[#38BDF8]/15 bg-[#071A33]/98 px-4 pb-6 lg:hidden">
          <div className="grid gap-2 pt-4">
            {userLinks.map(([label, href]) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className="rounded-xl bg-[#0B2545]/70 px-4 py-3 font-bold"
              >
                {label}
              </Link>
            ))}

            <div className="grid grid-cols-2 gap-2">
              <Link
                href="/wallet/deposit"
                onClick={() => setOpen(false)}
                className="rounded-xl bg-[#3F82DD] px-4 py-3 text-center font-black text-black"
              >
                Deposit
              </Link>

              <Link
                href="/wallet/withdraw"
                onClick={() => setOpen(false)}
                className="rounded-xl bg-[#3F82DD] px-4 py-3 text-center font-black text-black"
              >
                Withdraw
              </Link>
            </div>

            <Link
              href="/dashboard"
              onClick={() => setOpen(false)}
              className="rounded-xl bg-[#0F2F57]/80 px-4 py-3 font-bold"
            >
              @{name}
            </Link>

            <button
              onClick={() => void handleLogout()}
              className="rounded-xl bg-[#2C63B3] px-4 py-3 font-bold text-white"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
