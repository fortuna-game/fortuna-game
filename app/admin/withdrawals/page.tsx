"use client";

import AdminNav from "@/components/AdminNav";
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
  refunded_at?: string | null;
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
  const [checkingAdmin, setCheckingAdmin] = useState(true);
  const [denied, setDenied] = useState(false);

  async function getToken() {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token || "";
  }

  async function loadWithdrawals() {
    const token = await getToken();

    if (!token) {
      setDenied(true);
      return;
    }

    const res = await fetch(`/api/admin/withdrawals?t=${Date.now()}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });

    if (!res.ok) {
      setMessage("Could not refresh withdrawals. Please reload or login again.");
      return;
    }

    const data = await res.json();
    setWithdrawals(data.withdrawals || []);

    const map: Record<string, string> = {};
    (data.profiles || []).forEach((p: Profile) => {
      map[p.user_id] = p.username || "Player";
    });

    setProfiles(map);
  }

  async function updateStatus(id: string, status: "sending" | "paid" | "failed") {
    setMessage("");
    setBusyId(id);

    const token = await getToken();

    const res = await fetch("/api/admin/withdrawals/update", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ id, status }),
    });

    const data = await res.json();
    setMessage(data.message || data.error || "Updated.");
    setBusyId("");

    await loadWithdrawals();
  }

  useEffect(() => {
    async function start() {
      const token = await getToken();

      if (!token) {
        setDenied(true);
        setCheckingAdmin(false);
        return;
      }

      const res = await fetch("/api/admin/withdrawals", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        setDenied(true);
        setCheckingAdmin(false);
        return;
      }

      const data = await res.json();
      setWithdrawals(data.withdrawals || []);

      const map: Record<string, string> = {};
      (data.profiles || []).forEach((p: Profile) => {
        map[p.user_id] = p.username || "Player";
      });
      setProfiles(map);

      setDenied(false);
      setCheckingAdmin(false);
    }

    void start();

    const timer = setInterval(() => void loadWithdrawals(), 5000);
    return () => clearInterval(timer);
  }, []);

  function statusLabel(status: string) {
    if (status === "sending") return "Payment Pending";
    if (status === "paid") return "Paid";
    if (status === "failed") return "Failed / Refunded";
    return "Processing";
  }

  if (checkingAdmin) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#071A33] text-white">
        Checking admin access...
      </main>
    );
  }

  if (denied) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#071A33] px-6 text-white">
        <div className="rounded-3xl border border-red-400/20 bg-red-500/10 p-8 text-center">
          <h1 className="text-3xl font-black text-red-300">Access Denied</h1>
          <p className="mt-3 text-[#9AAAC1]">Please login through /admin/login again.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#071A33] px-6 py-12 text-white">
      <div className="mx-auto max-w-7xl">
        <AdminNav />
        <h1 className="text-4xl font-black text-[#4D94F5]">Admin Withdrawals</h1>
        <p className="mt-2 text-[#9AAAC1]">Live withdrawal requests.</p>

        {message && <p className="mt-5 rounded-xl bg-[#0F2F57]/80 p-4">{message}</p>}

        <div className="mt-8 overflow-x-auto rounded-3xl border border-[#2A5688]">
          <table className="w-full min-w-[1100px] text-left">
            <thead className="bg-[#3F82DD] text-black">
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
                  <tr key={w.id} className="border-t border-[#38BDF8]/15">
                    <td className="p-4 font-bold">@{profiles[w.user_id] || "Player"}</td>
                    <td className="p-4 font-bold text-[#66A7FF]">{w.reference}</td>
                    <td className="p-4">GH₵{Number(w.amount).toFixed(2)}</td>
                    <td className="p-4">{w.network}</td>
                    <td className="p-4">{w.momo_number}</td>
                    <td className="p-4">{statusLabel(w.status)}</td>
                    <td className="p-4">{new Date(w.created_at).toLocaleString()}</td>

                    <td className="flex flex-wrap gap-2 p-4">
                      {processed ? (
                        <span className="rounded-xl bg-[#0F2F57]/80 px-4 py-2 font-bold text-[#9AAAC1]">
                          Completed
                        </span>
                      ) : (
                        <>
                          <button
                            disabled={pending || busyId === w.id}
                            onClick={() => void updateStatus(w.id, "sending")}
                            className="rounded-xl bg-[#3F82DD] px-4 py-2 font-bold text-black disabled:opacity-40"
                          >
                            Send Payment
                          </button>

                          <button
                            disabled={busyId === w.id}
                            onClick={() => void updateStatus(w.id, "paid")}
                            className="rounded-xl bg-[#3F82DD] px-4 py-2 font-bold text-black disabled:opacity-40"
                          >
                            Mark Paid
                          </button>

                          <button
                            disabled={busyId === w.id}
                            onClick={() => void updateStatus(w.id, "failed")}
                            className="rounded-xl bg-red-500 px-4 py-2 font-bold text-white disabled:opacity-40"
                          >
                            Failed Payment
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                );
              })}

              {withdrawals.length === 0 && (
                <tr>
                  <td className="p-6 text-[#9AAAC1]" colSpan={8}>No withdrawals found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
