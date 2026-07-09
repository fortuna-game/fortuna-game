"use client";

import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function AdminNav() {
  async function logout() {
    await supabase.auth.signOut();
    window.location.href = "/admin/login";
  }

  return (
    <div className="mb-8 rounded-3xl border border-pink-500/20 bg-white/5 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/admin" className="text-2xl font-black text-pink-500">
          Fortuna Admin
        </Link>

        <div className="flex flex-wrap gap-2 text-sm font-bold">
          <Link href="/admin/users" className="rounded-xl bg-white/10 px-4 py-2">Users</Link>
          <Link href="/admin/deposits" className="rounded-xl bg-white/10 px-4 py-2">Deposits</Link>
          <Link href="/admin/games" className="rounded-xl bg-white/10 px-4 py-2">Games</Link>
          <Link href="/admin/lucky-draw" className="rounded-xl bg-yellow-400/20 px-4 py-2 text-yellow-300">🎟️ Lucky Draw</Link>
          <Link href="/admin/transactions" className="rounded-xl bg-white/10 px-4 py-2">Transactions</Link>
          <Link href="/admin/support" className="rounded-xl bg-white/10 px-4 py-2">Support</Link>
          <Link href="/admin/withdrawals" className="rounded-xl bg-pink-500 px-4 py-2 text-black">Withdrawals</Link>
          <button onClick={logout} className="rounded-xl bg-pink-600 px-4 py-2 text-white">
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
