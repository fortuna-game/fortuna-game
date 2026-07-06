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

type Profile = {
  user_id: string;
  username: string | null;
};

export default function AdminWithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [profiles, setProfiles] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");
  const [busyId, setBusyId] = useState("");

  async function loadWithdrawals() {
    const { data: withdrawalsData } = await supabase
      .from("withdrawals")
      .select("*")
      .order("created_at", { ascending: false });

    setWithdrawals(withdrawalsData || []);

    const userIds = [...new Set((withdrawalsData || []).map((w) => w.user_id))];

    if (userIds.length) {
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("user_id, username")
        .in("user_id", userIds);

      const map: Record<string, string> = {};
      (profilesData as Profile[] | null)?.forEach((p) => {
        map[p.user_id] = p.username || "Player";
      });

      setProfiles(map);
    }
  }

  async function updateStatus(id: string, status: "sending" | "paid" | "failed") {
    setMessage("");
    setBusyId(id);

    const res = await fetch("/api/admin/withdrawals/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });

    const data = await res.json();
    setMessage(data.message || data.error || "Updated.");
    setBusyId("");

    await loadWithdrawals();
  }

  useEffect(() => {
    void loadWithdrawals();

    const timer = setInterval(() => {
      void loadWithdrawals();
    }, 4000);

    return () => clearInterval(timer);
  }, []);

  function statusLabel(status: string) {
    if (status === "sending") return "Payment Pending";
    if (status === "paid") return "Paid";
    if (status === "failed") return "Failed";
    return "Processing";
  }

  return (
    <main className="min-h-screen bg-black px-6 py-12 text-white">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-4xl font-black text-yellow-400">Admin Withdrawals</h1>
        <p className="mt-2 text-white/60">Live withdrawal requests. Updates every few seconds.</p>

        {message && <p className="mt-5 rounded-xl bg-white/10 p-4">{message}</p>}

        <div className="mt-8 overflow-x-auto rounded-3xl border border-yellow-400/20">
          <table className="w-full min-w-[1100px] text-left">
            <thead className="bg-yellow-400 text-black">
              <tr>
                <th className="p-4">Username</th>
                <th className="p-4">Reference</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Network</th>
                <th className="p-4">Number</th>
                <th className="p-4">Status</th>
                <th className="p-4">Date</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>

            <tbody>
              {withdrawals.map((w) => {
                const processed = w.status === "paid" || w.status === "failed";
                const pending = w.status === "sending";

                return (
                  <tr key={w.id} className="border-t border-white/10">
                    <td className="p-4 font-bold">@{profiles[w.user_id] || "loading"}</td>
                    <td className="p-4 font-bold text-yellow-300">{w.reference}</td>
                    <td className="p-4">GH₵{Number(w.amount).toFixed(2)}</td>
                    <td className="p-4">{w.network}</td>
                    <td className="p-4">{w.momo_number}</td>
                    <td className="p-4">{statusLabel(w.status)}</td>
                    <td className="p-4">{new Date(w.created_at).toLocaleString()}</td>

                    <td className="flex flex-wrap gap-2 p-4">
                      <button
                        disabled={processed || pending || busyId === w.id}
                        onClick={() => void updateStatus(w.id, "sending")}
                        className="rounded-xl bg-yellow-400 px-4 py-2 font-bold text-black disabled:opacity-40"
                      >
                        Send Payment
                      </button>

                      <button
                        disabled={processed || busyId === w.id}
                        onClick={() => void updateStatus(w.id, "paid")}
                        className="rounded-xl bg-green-500 px-4 py-2 font-bold text-black disabled:opacity-40"
                      >
                        Mark Paid
                      </button>

                      <button
                        disabled={processed || busyId === w.id}
                        onClick={() => void updateStatus(w.id, "failed")}
                        className="rounded-xl bg-red-500 px-4 py-2 font-bold text-white disabled:opacity-40"
                      >
                        Failed Payment
                      </button>
                    </td>
                  </tr>
                );
              })}

              {withdrawals.length === 0 && (
                <tr>
                  <td className="p-6 text-white/60" colSpan={8}>
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
