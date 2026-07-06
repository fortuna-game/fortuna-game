"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function VerifyPage() {
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function sendCode() {
    setMessage("");
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setMessage("Please login first.");
      setLoading(false);
      return;
    }

    const res = await fetch("/api/verify/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.id, phone }),
    });

    const data = await res.json();
    setMessage(data.message || data.error);
    setLoading(false);
  }

  async function verifyCode() {
    setMessage("");
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setMessage("Please login first.");
      setLoading(false);
      return;
    }

    const res = await fetch("/api/verify/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.id, code }),
    });

    const data = await res.json();

    if (res.ok) {
      setMessage("Account verified successfully.");
    } else {
      setMessage(data.error || "Verification failed.");
    }

    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-black px-6 py-12 text-white">
      <div className="mx-auto max-w-xl rounded-3xl border border-yellow-400/20 bg-white/5 p-8">
        <h1 className="text-4xl font-black text-yellow-400">Verify Account</h1>
        <p className="mt-3 text-white/60">
          Verify your phone number before withdrawals.
        </p>

        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Mobile Money Number e.g. 233541456133"
          className="mt-8 w-full rounded-xl border border-white/10 bg-white/5 p-4 outline-none"
        />

        <button
          onClick={sendCode}
          disabled={loading || !phone}
          className="mt-4 w-full rounded-xl bg-yellow-400 py-4 font-black text-black disabled:opacity-60"
        >
          {loading ? "Please wait..." : "Send Verification Code"}
        </button>

        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Enter Code"
          className="mt-6 w-full rounded-xl border border-white/10 bg-white/5 p-4 outline-none"
        />

        <button
          onClick={verifyCode}
          disabled={loading || !code}
          className="mt-4 w-full rounded-xl bg-green-500 py-4 font-black text-black disabled:opacity-60"
        >
          Verify
        </button>

        {message && (
          <p className="mt-5 rounded-xl bg-white/10 p-4 text-white">
            {message}
          </p>
        )}
      </div>
    </main>
  );
}
