"use client";

import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function AdminNav() {
  async function logout() {
    await supabase.auth.signOut();
    window.location.href = "/admin/login";
  }

  return (
    <div className="mb-8 rounded-3xl border border-[#2A5688] bg-[#0B2545]/70 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/admin" className="admin-brand text-2xl font-black">
          Fortuna Admin
        </Link>

        <div className="flex flex-wrap gap-2 text-sm font-bold">
          <Link
            href="/admin/affiliates"
            className="admin-nav-link rounded-xl px-4 py-2 font-bold"
          >
            🤝 Affiliates
          </Link>
          <Link href="/admin/users" className="admin-nav-link rounded-xl px-4 py-2">Users</Link>
          <Link href="/admin/deposits" className="admin-nav-link rounded-xl px-4 py-2">Deposits</Link>
          <Link href="/admin/games" className="admin-nav-link rounded-xl px-4 py-2">Games</Link>
          <Link href="/admin/lucky-draw" className="admin-nav-primary rounded-xl px-4 py-2">🎟️ Lucky Draw</Link>
          <Link href="/admin/prize-vault" className="admin-nav-primary rounded-xl px-4 py-2">🎁 Prize Vault</Link>
          <Link href="/admin/transactions" className="admin-nav-link rounded-xl px-4 py-2">Transactions</Link>
          <Link href="/admin/support" className="admin-nav-link rounded-xl px-4 py-2">Support</Link>
          <Link href="/admin/withdrawals" className="admin-nav-primary rounded-xl px-4 py-2">Withdrawals</Link>
          <button onClick={logout} className="admin-nav-primary rounded-xl px-4 py-2">
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
