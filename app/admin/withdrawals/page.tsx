"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Withdrawal = {
  id: string;
  user_id: string;
  amount: number;
  momo_number: string;
  network: string | null;
  status: string;
  reference: string | null;
  created_at: string;
};

export default function AdminWithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [message, setMessage] = useState("");

  async function loadWithdrawals() {
    const { data } = await supabase
      .from("withdrawals")
      .select("*")
      .order("created_at", { ascending: false });

    setWithdrawals(data || []);
  }

  async function updateStatus(id: string, status: "paid" | "failed") {
    setMessage("");

    const res = await fetch("/api/admin/withdrawals/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });

    const data = await res.json();
    setMessage(data.message || data.error || "Updated.");
    await loadWithdrawals();
  }

  useEffect(() => {
    void loadWithdrawals();
  }, []);

  return (
    <main className="min-h-screen bg-black px-6 py-12 text-white">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-4xl font-black text-yellow-400">Admin Withdrawals</h1>
        <p className="mt-2 text-white/60">Processing, paid and failed withdrawals.</p>

        {message && <p className="mt-5 rounded-xl bg-white/10 p-4">{message}</p>}

        <div className="mt-8 overflow-x-auto rounded-3xl border border-yellow-400/20">
          <table className="w-full min-w-[900px] text-left">
            <thead className="bg-yellow-400 text-black">
              <tr>
                <th className="p-4">Reference</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Network</th>
                <th className="p-4">Number</th>
                <th className="p-4">Status</th>
                <th className="p-4">Date</th>
                <th className="p-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {withdrawals.map((w) => (
                <tr key={w.id} className="border-t border-white/10">
                  <td className="p-4 font-bold text-yellow-300">{w.reference}</td>
                  <td className="p-4">GH₵{Number(w.amount).toFixed(2)}</td>
                  <td className="p-4">{w.network}</td>
                  <td className="p-4">{w.momo_number}</td>
                  <td className="p-4 capitalize">{w.status}</td>
                  <td className="p-4">{new Date(w.created_at).toLocaleString()}</td>
                  <td className="flex gap-2 p-4">
                    <button
                      onClick={() => void updateStatus(w.id, "paid")}
                      className="rounded-xl bg-green-500 px-4 py-2 font-bold text-black"
                    >
                      Send Payment
                    </button>
                    <button
                      onClick={() => void updateStatus(w.id, "failed")}
                      className="rounded-xl bg-red-500 px-4 py-2 font-bold text-white"
                    >
                      Mark Failed
                    </button>
                  </td>
                </tr>
              ))}

              {withdrawals.length === 0 && (
                <tr>
                  <td className="p-6 text-white/60" colSpan={7}>
                    No withdrawals found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
