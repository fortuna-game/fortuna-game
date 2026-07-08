"use client";

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
    <main className="min-h-screen bg-black px-6 py-10 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black text-yellow-400">Users Management</h1>
            <p className="mt-2 text-white/60">View users, wallet balances, deposits, withdrawals and game activity.</p>
          </div>

          <Link href="/admin" className="rounded-xl bg-yellow-400 px-5 py-3 font-black text-black">
            Back to Admin
          </Link>
        </div>

        {message && <div className="mt-8 rounded-3xl border border-yellow-400/20 bg-white/5 p-6">{message}</div>}

        {!message && (
          <div className="mt-8 overflow-x-auto rounded-3xl border border-yellow-400/20">
            <table className="w-full min-w-[1200px] text-left">
              <thead className="bg-yellow-400 text-black">
                <tr>
                  <th className="p-4">User</th>
                  <th className="p-4">Phone</th>
                  <th className="p-4">Balance</th>
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
                  <tr key={u.user_id} className="border-t border-white/10">
                    <td className="p-4">
                      <Link href={`/admin/users/${u.user_id}`} className="font-black text-yellow-300 hover:underline">@{u.username}</Link>
                      <p className="text-sm text-white/50">{u.first_name}</p>
                    </td>
                    <td className="p-4">{u.phone || "-"}</td>
                    <td className="p-4 font-bold">GH₵{Number(u.balance).toFixed(2)}</td>
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
                    <td className="p-6 text-white/60" colSpan={9}>No users found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
