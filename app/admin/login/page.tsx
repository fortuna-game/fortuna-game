"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("fortunaplay2025@outlook.com");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setMessage("Checking admin account...");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage(error.message);
      return;
    }

    window.location.href = "/admin";
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#071A33] px-6 text-white">
      <form onSubmit={login} className="w-full max-w-md min-w-0 rounded-3xl border border-[#2A5688] bg-[#0B2545]/70 p-8">
        <div className="text-center">
          <div className="text-5xl">🛡️</div>
          <h1 className="mt-4 text-3xl font-black text-[#4D94F5]">Fortuna Admin Login</h1>
          <p className="mt-2 text-sm text-[#9AAAC1]">Super admin access only.</p>
        </div>

        <input
          className="mt-6 w-full rounded-xl border border-[#38BDF8]/15 bg-[#071A33] p-4 outline-none focus:border-blue-500"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Admin email"
          type="email"
        />

        <input
          className="mt-4 w-full rounded-xl border border-[#38BDF8]/15 bg-[#071A33] p-4 outline-none focus:border-blue-500"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Admin password"
          type="password"
        />

        {message && <p className="mt-4 text-center text-sm text-[#66A7FF]">{message}</p>}

        <button className="mt-6 w-full rounded-xl bg-[#3F82DD] py-4 font-black text-black">
          Login to Admin
        </button>
      </form>
    </main>
  );
}
