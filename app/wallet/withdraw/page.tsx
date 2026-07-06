"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function WithdrawPage() {
  const [amount, setAmount] = useState("");
  const [momoNumber, setMomoNumber] = useState("");
  const [network, setNetwork] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function requestWithdrawal(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");

    if (!network) {
      setMessage("Please select your Mobile Money network.");
      return;
    }

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

      if (res.ok) {
        setSubmitted(true);
      }
    } catch {
      setMessage("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-black px-6 py-10 text-white">
      <form
        onSubmit={requestWithdrawal}
        className="mx-auto max-w-md rounded-3xl border border-green-400/20 bg-green-500/10 p-6"
      >
        <h1 className="text-3xl font-black text-green-400">Withdraw</h1>

        <p className="mt-2 text-sm text-white/60">
          Withdraw your winnings securely to your Mobile Money account.
        </p>

        <div className="mt-5 rounded-xl border border-yellow-400/20 bg-yellow-400/10 p-3 text-sm text-yellow-200">
          Please ensure that the Mobile Money number and network provided are correct. Fortuna Play will not be responsible for payments sent to an incorrect number as a result of inaccurate information submitted by the user.
        </div>

        <input
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Amount"
          type="number"
          className="mt-6 w-full rounded-xl border border-white/10 bg-white/5 p-4 outline-none"
        />

        <input
          value={momoNumber}
          onChange={(e) => setMomoNumber(e.target.value)}
          placeholder="Mobile Money Number"
          className="mt-4 w-full rounded-xl border border-white/10 bg-white/5 p-4 outline-none"
        />

        <select
          value={network}
          onChange={(e) => setNetwork(e.target.value)}
          className="mt-4 w-full rounded-xl border border-white/10 bg-black p-4 outline-none"
        >
          <option value="">Select Network</option>
          <option value="MTN">MTN</option>
          <option value="Telecel">Telecel</option>
          <option value="AirtelTigo">AirtelTigo</option>
        </select>

        <button
          disabled={loading || submitted}
          className="mt-5 w-full rounded-xl bg-green-500 py-4 font-black text-white disabled:opacity-60"
        >
          {submitted ? "Withdrawal Request Sent" : loading ? "Submitting..." : "Request Withdrawal"}
        </button>

        {submitted && (
          <button
            type="button"
            onClick={() => {
              setSubmitted(false);
              setAmount("");
              setMomoNumber("");
              setNetwork("");
              setMessage("");
            }}
            className="mt-3 w-full rounded-xl border border-white/10 bg-white/5 py-3 font-bold text-white"
          >
            Make Another Withdrawal
          </button>
        )}

        {message && (
          <p className="mt-5 whitespace-pre-line rounded-xl bg-white/10 p-4 text-sm text-white">
            {message}
          </p>
        )}
      </form>
    </main>
  );
}
