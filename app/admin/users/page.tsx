"use client";

import AdminNav from "@/components/AdminNav";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [message, setMessage] = useState("Loading users...");

  useEffect(() => {
    async function loadUsers() {
      const { data: auth } = await supabase.auth.getSession();
      const token = auth.session?.access_token;

      const res = await fetch("/api/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const json = await res.json();

      if (!res.ok) {
        setMessage(json.error || "Admin access denied.");
        return;
      }

      setUsers(json.users || []);
      setMessage("");
    }

    void loadUsers();
  }, []);

  return (
    <main className="min-h-screen bg-[#071A33] px-6 py-10 text-white">
      <div className="mx-auto max-w-7xl">
        <AdminNav />
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black text-[#4D94F5]">Users Management</h1>
            <p className="mt-2 text-[#9AAAC1]">View users, wallet balances, deposits, withdrawals and game activity.</p>
          </div>

          <Link href="/admin" className="rounded-xl bg-[#3F82DD] px-5 py-3 font-black text-black">
            Back to Admin
          </Link>
        </div>

        {message && <div className="mt-8 min-w-0 rounded-3xl border border-[#2A5688] bg-[#0B2545]/70 p-6">{message}</div>}

        {!message && (
          <div className="mt-8 overflow-x-auto min-w-0 rounded-3xl border border-[#2A5688]">
            <div className="w-full overflow-x-auto rounded-xl"><table className="w-full min-w-[1200px] text-left">
              <thead className="bg-[#3F82DD] text-black">
                <tr>
                  <th className="p-4">User</th>
                  <th className="p-4">Phone</th>
                  <th className="p-4">Wallet Balance</th>
                  <th className="p-4">Deposits</th>
                  <th className="p-4">Withdrawals</th>
                  <th className="p-4">Games</th>
                  <th className="p-4">Wins</th>
                  <th className="p-4">Losses</th>
                  <th className="p-4">Joined</th>
                </tr>
              </thead>

              <tbody>
                {users.map((u) => (
                  <tr key={u.user_id} className="border-t border-[#38BDF8]/15">
                    <td className="p-4">
                      <Link
                        href={`/admin/users/${u.user_id}`}
                        className="font-black text-[#66A7FF] hover:underline"
                      >
                        @{u.username || "Incomplete"}
                      </Link>

                      <p className="text-sm text-[#8295B0]">
                        {u.first_name || u.last_name
                          ? [u.first_name, u.last_name].filter(Boolean).join(" ")
                          : "Name missing"}
                      </p>

                      {!u.profile_complete && (
                        <span className="mt-1 inline-block rounded-full bg-yellow-400/10 px-2 py-1 text-[10px] font-black text-yellow-300">
                          ⚠ Incomplete Profile
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      {u.phone || (
                        <span className="text-yellow-300">
                          Missing
                        </span>
                      )}
                    </td>
                    <td className="p-4">
  <div className="font-black text-[#FFD54A]">
    GH₵{Number(u.balance).toFixed(2)}
  </div>
  <div className="text-xs text-[#8295B0]">
    Available wallet balance
  </div>
</td>
                    <td className="p-4">GH₵{Number(u.deposits).toFixed(2)}</td>
                    <td className="p-4">GH₵{Number(u.withdrawals).toFixed(2)}</td>
                    <td className="p-4">{u.games}</td>
                    <td className="p-4 text-green-300">{u.wins}</td>
                    <td className="p-4 text-red-300">{u.losses}</td>
                    <td className="p-4">{u.created_at ? new Date(u.created_at).toLocaleDateString() : "-"}</td>
                  </tr>
                ))}

                {users.length === 0 && (
                  <tr>
                    <td className="p-6 text-[#9AAAC1]" colSpan={9}>No users found.</td>
                  </tr>
                )}
              </tbody>
            </table></div>
          </div>
        )}
      </div>
    </main>
  );
}
