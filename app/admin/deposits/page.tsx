"use client";

import AdminNav from "@/components/AdminNav";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function AdminDepositsPage() {
  const [deposits, setDeposits] = useState<any[]>([]);
  const [message, setMessage] = useState("Loading deposits...");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    async function loadDeposits() {
      const { data: auth } = await supabase.auth.getSession();
      const token = auth.session?.access_token;

      const res = await fetch("/api/admin/deposits", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const json = await res.json();

      if (!res.ok) {
        setMessage(json.error || "Admin access denied.");
        return;
      }

      setDeposits(json.deposits || []);
      setMessage("");
    }

    void loadDeposits();
  }, []);

  const visibleDeposits = useMemo(() => {
    if (filter === "all") return deposits;
    return deposits.filter((d) => d.status === filter);
  }, [deposits, filter]);

  const totalCompleted = deposits
    .filter((d) => d.status === "completed" || d.status === "paid")
    .reduce((sum, d) => sum + Number(d.amount || 0), 0);

  const totalPending = deposits
    .filter((d) => d.status === "pending")
    .reduce((sum, d) => sum + Number(d.amount || 0), 0);

  const totalFailed = deposits
    .filter((d) => d.status === "failed")
    .reduce((sum, d) => sum + Number(d.amount || 0), 0);

  return (
    <main className="min-h-screen bg-[#071A33] px-6 py-10 text-white">
      <div className="mx-auto max-w-7xl">
        <AdminNav />
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black text-[#4D94F5]">Deposits Management</h1>
            <p className="mt-2 text-[#9AAAC1]">Track all wallet deposits and Hubtel references.</p>
          </div>

          <Link href="/admin" className="rounded-xl bg-[#3F82DD] px-5 py-3 font-black text-black">
            Back to Admin
          </Link>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="min-w-0 rounded-3xl border border-blue-400/20 bg-[#3F82DD]/10 p-6">
            <p className="text-sm text-[#9AAAC1]">Completed Deposits</p>
            <h2 className="mt-2 text-3xl font-black text-green-300">GH₵{totalCompleted.toFixed(2)}</h2>
          </div>

          <div className="min-w-0 rounded-3xl border border-[#2A5688] bg-[#2C63B3]/10 p-6">
            <p className="text-sm text-[#9AAAC1]">Pending Deposits</p>
            <h2 className="mt-2 text-3xl font-black text-[#66A7FF]">GH₵{totalPending.toFixed(2)}</h2>
          </div>

          <div className="min-w-0 rounded-3xl border border-red-400/20 bg-red-500/10 p-6">
            <p className="text-sm text-[#9AAAC1]">Failed Deposits</p>
            <h2 className="mt-2 text-3xl font-black text-red-300">GH₵{totalFailed.toFixed(2)}</h2>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {["all", "completed", "pending", "failed"].map((item) => (
            <button
              key={item}
              onClick={() => setFilter(item)}
              className={`rounded-full px-5 py-2 font-bold ${
                filter === item ? "bg-[#3F82DD] text-black" : "bg-[#0F2F57]/80 text-white"
              }`}
            >
              {item.toUpperCase()}
            </button>
          ))}
        </div>

        {message && <div className="mt-8 min-w-0 rounded-3xl border border-[#2A5688] bg-[#0B2545]/70 p-6">{message}</div>}

        {!message && (
          <div className="mt-8 overflow-x-auto min-w-0 rounded-3xl border border-[#2A5688]">
            <div className="w-full overflow-x-auto rounded-xl"><table className="w-full min-w-[1100px] text-left">
              <thead className="bg-[#3F82DD] text-black">
                <tr>
                  <th className="p-4">User</th>
                  <th className="p-4">Phone</th>
                  <th className="p-4">Reference</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Date</th>
                </tr>
              </thead>

              <tbody>
                {visibleDeposits.map((d) => (
                  <tr key={d.id} className="border-t border-[#38BDF8]/15">
                    <td className="p-4">
                      <p className="font-black">@{d.username}</p>
                      <p className="text-sm text-[#8295B0]">{d.first_name}</p>
                    </td>
                    <td className="p-4">{d.phone || "-"}</td>
                    <td className="p-4 font-bold text-[#66A7FF]">{d.reference}</td>
                    <td className="p-4 font-bold">GH₵{Number(d.amount).toFixed(2)}</td>
                    <td className="p-4">{String(d.status).toUpperCase()}</td>
                    <td className="p-4">{d.created_at ? new Date(d.created_at).toLocaleString() : "-"}</td>
                  </tr>
                ))}

                {visibleDeposits.length === 0 && (
                  <tr>
                    <td className="p-6 text-[#9AAAC1]" colSpan={6}>No deposits found.</td>
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
