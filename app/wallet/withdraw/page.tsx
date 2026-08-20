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
      const { data: auth } = await supabase.auth.getSession();
      const token = auth.session?.access_token;

      if (!token) {
        setMessage("Please log in before withdrawing.");
        return;
      }

      const res = await fetch("/api/withdraw", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ amount, momoNumber, network }),
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
    <main className="min-h-screen bg-[#071A33] px-6 py-10 text-white">
      <form
        onSubmit={requestWithdrawal}
        className="mx-auto max-w-md rounded-3xl border border-blue-400/20 bg-[#3F82DD]/10 p-6"
      >
        <h1 className="text-3xl font-black text-[#66A7FF]">Withdraw</h1>

        <p className="mt-2 text-sm text-[#9AAAC1]">
          Withdraw your winnings securely to your Mobile Money account.
        </p>

        <div className="mt-5 rounded-xl border border-[#2A5688] bg-[#3F82DD]/10 p-3 text-sm text-white">
          Please ensure that the Mobile Money number and network provided are correct. Fortuna Play will not be responsible for payments sent to an incorrect number as a result of inaccurate information submitted by the user.
        </div>

        <input
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Amount"
          type="number"
          className="mt-6 w-full rounded-xl border border-[#38BDF8]/15 bg-[#0B2545]/70 p-4 outline-none"
        />

        <input
          value={momoNumber}
          onChange={(e) => setMomoNumber(e.target.value)}
          placeholder="Mobile Money Number"
          className="mt-4 w-full rounded-xl border border-[#38BDF8]/15 bg-[#0B2545]/70 p-4 outline-none"
        />

        <select
          value={network}
          onChange={(e) => setNetwork(e.target.value)}
          className="mt-4 w-full rounded-xl border border-[#38BDF8]/15 bg-[#071A33] p-4 outline-none"
        >
          <option value="">Select Network</option>
          <option value="MTN">MTN</option>
          <option value="Telecel">Telecel</option>
          <option value="AirtelTigo">AirtelTigo</option>
        </select>

        <button
          disabled={loading || submitted}
          className="mt-5 w-full rounded-xl bg-[#3F82DD] py-4 font-black text-white disabled:opacity-60"
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
            className="mt-3 w-full rounded-xl border border-[#38BDF8]/15 bg-[#0B2545]/70 py-3 font-bold text-white"
          >
            Make Another Withdrawal
          </button>
        )}

        {message && (
          <p className="mt-5 whitespace-pre-line rounded-xl bg-[#0F2F57]/80 p-4 text-sm text-white">
            {message}
          </p>
        )}
      </form>
    </main>
  );
}
