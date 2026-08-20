"use client";

import AdminNav from "@/components/AdminNav";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AdminUserDetailsPage() {
  const params = useParams();
  const id = String(params.id);
  const [data, setData] = useState<any>(null);
  const [message, setMessage] = useState("Loading user details...");

  useEffect(() => {
    async function loadUser() {
      const { data: auth } = await supabase.auth.getSession();
      const token = auth.session?.access_token;

      const res = await fetch(`/api/admin/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const json = await res.json();

      if (!res.ok) {
        setMessage(json.error || "Could not load user.");
        return;
      }

      setData(json);
      setMessage("");
    }

    void loadUser();
  }, [id]);

  if (!data) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#071A33] px-6 text-white">
        <div className="min-w-0 rounded-3xl border border-[#2A5688] bg-[#0B2545]/70 p-8">{message}</div>
      </main>
    );
  }

  const profile = data.profile || {};
  const wallet = data.wallet || {};

  return (
    <main className="min-h-screen bg-[#071A33] px-6 py-10 text-white">
      <div className="mx-auto max-w-7xl">
        <AdminNav />
        <Link href="/admin/users" className="text-[#4D94F5]">← Back to Users</Link>

        <h1 className="mt-6 text-4xl font-black text-[#4D94F5]">@{profile.username || "Player"}</h1>
        <p className="mt-2 text-[#9AAAC1]">{profile.first_name || ""} {profile.last_name || ""}</p>

        <div className="mt-8 grid gap-4 md:grid-cols-4">
          <div className="min-w-0 rounded-3xl border border-[#2A5688] bg-[#0B2545]/70 p-6">
            <p className="text-sm text-[#9AAAC1]">Wallet Balance</p>
            <h2 className="mt-2 text-3xl font-black">GH₵{Number(wallet.balance || 0).toFixed(2)}</h2>
          </div>
          <div className="min-w-0 rounded-3xl border border-blue-400/20 bg-[#3F82DD]/10 p-6">
            <p className="text-sm text-[#9AAAC1]">Deposits</p>
            <h2 className="mt-2 text-3xl font-black text-green-300">{data.deposits.length}</h2>
          </div>
          <div className="min-w-0 rounded-3xl border border-red-400/20 bg-red-500/10 p-6">
            <p className="text-sm text-[#9AAAC1]">Withdrawals</p>
            <h2 className="mt-2 text-3xl font-black text-red-300">{data.withdrawals.length}</h2>
          </div>
          <div className="min-w-0 rounded-3xl border border-blue-400/20 bg-[#3F82DD]/10 p-6">
            <p className="text-sm text-[#9AAAC1]">Games Played</p>
            <h2 className="mt-2 text-3xl font-black text-blue-300">{data.games.length}</h2>
          </div>
        </div>

        <section className="mt-8 min-w-0 rounded-3xl border border-[#38BDF8]/15 bg-[#0B2545]/70 p-6">
          <h2 className="text-2xl font-black text-[#4D94F5]">Profile</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <div><p className="text-[#8295B0]">Phone</p><p className="font-bold">{profile.phone || "-"}</p></div>
            <div><p className="text-[#8295B0]">Verified</p><p className="font-bold">{profile.is_verified ? "Yes" : "No"}</p></div>
            <div><p className="text-[#8295B0]">Username</p><p className="font-bold text-[#66A7FF]">@{profile.username || "Player"}</p></div>
          </div>
        </section>
      </div>
    </main>
  );
}
