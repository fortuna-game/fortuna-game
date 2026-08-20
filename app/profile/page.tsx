"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Profile = {
  first_name: string | null;
  last_name: string | null;
  username: string | null;
  phone: string | null;
  is_verified: boolean | null;
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      setEmail(user.email || "");

      const { data } = await supabase
        .from("profiles")
        .select("first_name, last_name, username, phone, is_verified")
        .eq("user_id", user.id)
        .maybeSingle();

      setProfile(data);
      setLoading(false);
    }

    void loadProfile();
  }, []);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#071A33] text-white">
        Loading profile...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#071A33] px-6 py-10 text-white">
      <div className="mx-auto max-w-4xl">
        <div className="rounded-3xl border border-[#2A5688] bg-[#0B2545]/70 p-6 md:p-8">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-[#4D94F5]">
                Fortuna Play Account
              </p>

              <h1 className="mt-2 text-4xl font-black">
                @{profile?.username || "Player"}
              </h1>

              <p className="mt-2 text-[#8295B0]">
                Manage and view your account information.
              </p>
            </div>

            <span
              className={`w-fit rounded-full px-4 py-2 text-sm font-bold ${
                profile?.is_verified
                  ? "bg-[#3F82DD]/15 text-green-300"
                  : "bg-[#2C63B3]/15 text-[#66A7FF]"
              }`}
            >
              {profile?.is_verified ? "Verified Account" : "Not Verified"}
            </span>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-[#38BDF8]/15 bg-[#071A33]/40 p-5">
              <p className="text-sm text-[#7185A3]">Full Name</p>
              <p className="mt-2 font-bold">
                {[profile?.first_name, profile?.last_name]
                  .filter(Boolean)
                  .join(" ") || "Not provided"}
              </p>
            </div>

            <div className="rounded-2xl border border-[#38BDF8]/15 bg-[#071A33]/40 p-5">
              <p className="text-sm text-[#7185A3]">Username</p>
              <p className="mt-2 font-bold">
                @{profile?.username || "Player"}
              </p>
            </div>

            <div className="rounded-2xl border border-[#38BDF8]/15 bg-[#071A33]/40 p-5">
              <p className="text-sm text-[#7185A3]">Email Address</p>
              <p className="mt-2 break-all font-bold">
                {email || "Not provided"}
              </p>
            </div>

            <div className="rounded-2xl border border-[#38BDF8]/15 bg-[#071A33]/40 p-5">
              <p className="text-sm text-[#7185A3]">Phone Number</p>
              <p className="mt-2 font-bold">
                {profile?.phone || "Not provided"}
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <Link
              href="/dashboard"
              className="rounded-xl bg-[#3F82DD] py-3 text-center font-black text-black"
            >
              Dashboard
            </Link>

            <Link
              href="/wallet/history"
              className="rounded-xl border border-[#38BDF8]/15 bg-[#0B2545]/70 py-3 text-center font-bold"
            >
              Account History
            </Link>

            <Link
              href="/game-history"
              className="rounded-xl border border-[#38BDF8]/15 bg-[#0B2545]/70 py-3 text-center font-bold"
            >
              Game History
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
