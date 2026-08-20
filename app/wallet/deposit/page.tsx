"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function DepositPage() {
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function startDeposit(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");

    const value = Number(amount);

    if (!value || value < 1) {
      setMessage("Enter a valid amount.");
      return;
    }

    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setMessage("Please login first.");
      setLoading(false);
      return;
    }

    const res = await fetch("/api/deposit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: value,
        userId: user.id,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setMessage(data.error || "Could not start deposit.");
      setLoading(false);
      return;
    }

    if (!data.checkoutUrl) {
      setMessage("Hubtel did not return a checkout URL.");
      setLoading(false);
      return;
    }

    window.location.href = data.checkoutUrl;
  }

  return (
    <main className="min-h-screen bg-[#071A33] px-6 py-12 text-white">
      <form
        onSubmit={startDeposit}
        className="mx-auto max-w-xl rounded-3xl border border-blue-400/20 bg-[#3F82DD]/10 p-5 sm:p-6 lg:p-8"
      >
        <h1 className="text-3xl sm:text-4xl font-black text-[#66A7FF]">Deposit</h1>
        <p className="mt-3 text-[#9AAAC1]">Fund your Fortuna Play wallet.</p>

        <input
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Amount e.g. 50"
          type="number"
          min="1"
          className="mt-8 w-full rounded-xl border border-[#38BDF8]/15 bg-[#0B2545]/70 p-4 outline-none"
        />

        {message && (
          <p className="mt-4 rounded-xl bg-red-500/10 p-3 text-red-300">
            {message}
          </p>
        )}

        <button
          disabled={loading}
          className="mt-5 w-full rounded-xl bg-[#3F82DD] py-4 font-black text-black disabled:opacity-60"
        >
          {loading ? "Starting Payment..." : "Continue to Payment"}
        </button>
      </form>
    </main>
  );
}
