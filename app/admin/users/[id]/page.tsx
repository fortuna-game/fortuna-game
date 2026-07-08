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
      <main className="flex min-h-screen items-center justify-center bg-black px-6 text-white">
        <div className="rounded-3xl border border-yellow-400/20 bg-white/5 p-8">{message}</div>
      </main>
    );
  }

  const profile = data.profile || {};
  const wallet = data.wallet || {};

  return (
    <main className="min-h-screen bg-black px-6 py-10 text-white">
      <div className="mx-auto max-w-7xl">
        <AdminNav />
        <Link href="/admin/users" className="text-yellow-400">← Back to Users</Link>

        <h1 className="mt-6 text-4xl font-black text-yellow-400">@{profile.username || "Player"}</h1>
        <p className="mt-2 text-white/60">{profile.first_name || ""} {profile.last_name || ""}</p>

        <div className="mt-8 grid gap-4 md:grid-cols-4">
          <div className="rounded-3xl border border-yellow-400/20 bg-white/5 p-6">
            <p className="text-sm text-white/60">Wallet Balance</p>
            <h2 className="mt-2 text-3xl font-black">GH₵{Number(wallet.balance || 0).toFixed(2)}</h2>
          </div>
          <div className="rounded-3xl border border-green-400/20 bg-green-500/10 p-6">
            <p className="text-sm text-white/60">Deposits</p>
            <h2 className="mt-2 text-3xl font-black text-green-300">{data.deposits.length}</h2>
          </div>
          <div className="rounded-3xl border border-red-400/20 bg-red-500/10 p-6">
            <p className="text-sm text-white/60">Withdrawals</p>
            <h2 className="mt-2 text-3xl font-black text-red-300">{data.withdrawals.length}</h2>
          </div>
          <div className="rounded-3xl border border-blue-400/20 bg-blue-500/10 p-6">
            <p className="text-sm text-white/60">Games Played</p>
            <h2 className="mt-2 text-3xl font-black text-blue-300">{data.games.length}</h2>
          </div>
        </div>

        <section className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-2xl font-black text-yellow-400">Profile</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <div><p className="text-white/50">Phone</p><p className="font-bold">{profile.phone || "-"}</p></div>
            <div><p className="text-white/50">Verified</p><p className="font-bold">{profile.is_verified ? "Yes" : "No"}</p></div>
            <div><p className="text-white/50">Username</p><p className="font-bold text-yellow-300">@{profile.username || "Player"}</p></div>
          </div>
        </section>
      </div>
    </main>
  );
}
