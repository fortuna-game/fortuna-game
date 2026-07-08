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
    <main className="flex min-h-screen items-center justify-center bg-black px-6 text-white">
      <form onSubmit={login} className="w-full max-w-md rounded-3xl border border-yellow-400/20 bg-white/5 p-8">
        <div className="text-center">
          <div className="text-5xl">🛡️</div>
          <h1 className="mt-4 text-3xl font-black text-yellow-400">Fortuna Admin Login</h1>
          <p className="mt-2 text-sm text-white/60">Super admin access only.</p>
        </div>

        <input
          className="mt-6 w-full rounded-xl border border-white/10 bg-black p-4 outline-none focus:border-yellow-400"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Admin email"
          type="email"
        />

        <input
          className="mt-4 w-full rounded-xl border border-white/10 bg-black p-4 outline-none focus:border-yellow-400"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Admin password"
          type="password"
        />

        {message && <p className="mt-4 text-center text-sm text-yellow-300">{message}</p>}

        <button className="mt-6 w-full rounded-xl bg-yellow-400 py-4 font-black text-black">
          Login to Admin
        </button>
      </form>
    </main>
  );
}
