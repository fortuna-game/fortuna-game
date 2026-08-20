"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    setMessage(
      "If an account exists for this email, password reset instructions have been sent."
    );
    setLoading(false);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-black via-zinc-950 to-yellow-950 px-6">
      <div className="w-full max-w-md rounded-3xl border border-blue-700/20 bg-[#071A33]/60 p-8 shadow-2xl backdrop-blur-xl">
        <h1 className="text-center text-3xl font-black text-[#4D94F5]">
          Forgot Password
        </h1>

        <p className="mt-3 text-center text-[#9AAAC1]">
          Enter your email address to reset your Fortuna Play password.
        </p>

        <form onSubmit={handleReset} className="mt-8 space-y-5">
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-xl border border-[#38BDF8]/15 bg-[#0B2545]/70 px-4 py-3 text-white outline-none focus:border-blue-500"
          />

          <button
            disabled={loading}
            className="w-full rounded-xl bg-[#3F82DD] py-3 font-black text-black hover:bg-blue-400 disabled:opacity-60"
          >
            {loading ? "Sending..." : "Send Reset Instructions"}
          </button>

          {message && (
            <p className="rounded-xl bg-[#0F2F57]/80 p-4 text-center text-sm text-white">
              {message}
            </p>
          )}

          <div className="text-center">
            <Link href="/login" className="font-bold text-[#4D94F5]">
              Back to Login
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}
