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
        <Link href="/admin" className="text-2xl font-black text-[#4D94F5]">
          Fortuna Admin
        </Link>

        <div className="flex flex-wrap gap-2 text-sm font-bold">
          <Link
            href="/admin/affiliates"
            className="rounded-xl bg-green-500/20 px-4 py-2 text-green-300"
          >
            🤝 Affiliates
          </Link>
          <Link href="/admin/users" className="rounded-xl bg-[#0F2F57]/80 px-4 py-2">Users</Link>
          <Link href="/admin/deposits" className="rounded-xl bg-[#0F2F57]/80 px-4 py-2">Deposits</Link>
          <Link href="/admin/games" className="rounded-xl bg-[#0F2F57]/80 px-4 py-2">Games</Link>
          <Link href="/admin/lucky-draw" className="rounded-xl bg-[#FFD54A]/20 px-4 py-2 text-[#FFE08A]">🎟️ Lucky Draw</Link>
          <Link href="/admin/prize-vault" className="rounded-xl bg-[#3F82DD]/20 px-4 py-2 text-blue-300">🎁 Prize Vault</Link>
          <Link href="/admin/transactions" className="rounded-xl bg-[#0F2F57]/80 px-4 py-2">Transactions</Link>
          <Link href="/admin/support" className="rounded-xl bg-[#0F2F57]/80 px-4 py-2">Support</Link>
          <Link href="/admin/withdrawals" className="rounded-xl bg-[#3F82DD] px-4 py-2 text-black">Withdrawals</Link>
          <button onClick={logout} className="rounded-xl bg-[#2C63B3] px-4 py-2 text-white">
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
