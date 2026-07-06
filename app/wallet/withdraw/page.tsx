"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function WithdrawPage() {
  const [amount, setAmount] = useState("");
  const [momoNumber, setMomoNumber] = useState("");
  const [network, setNetwork] = useState("MTN");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function requestWithdrawal(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setMessage("Please login first.");
        return;
      }

      const res = await fetch("/api/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, amount, momoNumber, network }),
      });

      const text = await res.text();
      let data: any = {};

      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        data = { error: text };
      }

      setMessage(data.message || data.error || "Withdrawal request finished.");
    } catch (error) {
      console.error(error);
      setMessage("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-black px-6 py-12 text-white">
      <form onSubmit={requestWithdrawal} className="mx-auto max-w-xl rounded-3xl border border-red-400/20 bg-red-500/10 p-8">
        <h1 className="text-4xl font-black text-red-400">Withdraw</h1>
        <p className="mt-3 text-white/60">Withdraw winnings to your mobile money account.</p>

        <input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Amount" type="number" className="mt-8 w-full rounded-xl border border-white/10 bg-white/5 p-4 outline-none" />

        <input value={momoNumber} onChange={(e) => setMomoNumber(e.target.value)} placeholder="Mobile Money Number" className="mt-4 w-full rounded-xl border border-white/10 bg-white/5 p-4 outline-none" />

        <select value={network} onChange={(e) => setNetwork(e.target.value)} className="mt-4 w-full rounded-xl border border-white/10 bg-black p-4 outline-none">
          <option>MTN</option>
          <option>Telecel</option>
          <option>AirtelTigo</option>
        </select>

        <button disabled={loading} className="mt-5 w-full rounded-xl bg-red-500 py-4 font-black text-white disabled:opacity-60">
          {loading ? "Submitting..." : "Request Withdrawal"}
        </button>

        {message && <p className="mt-5 rounded-xl bg-white/10 p-4 text-white">{message}</p>}
      </form>
    </main>
  );
}
