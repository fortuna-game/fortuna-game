"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function AffiliateLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleLogin(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token;

    if (!token) {
      setMessage("Could not verify affiliate session.");
      setLoading(false);
      return;
    }

    const res = await fetch("/api/affiliate", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();

    if (!res.ok || !data.affiliate) {
      await supabase.auth.signOut();
      setMessage("This account is not registered as a Fortuna affiliate.");
      setLoading(false);
      return;
    }

    router.push("/affiliate/dashboard");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-black px-5 py-10 text-white">
      <div className="w-full max-w-md rounded-3xl border border-green-500/20 bg-white/5 p-7">
        <div className="text-center">
          <div className="text-6xl">🤝</div>

          <h1 className="mt-4 text-3xl font-black text-green-400">
            Affiliate Login
          </h1>

          <p className="mt-2 text-white/50">
            Access your referral links, qualified players and earnings.
          </p>
        </div>

        {message && (
          <p className="mt-5 rounded-xl bg-red-500/10 p-4 text-red-300">
            {message}
          </p>
        )}

        <form onSubmit={handleLogin} className="mt-6 grid gap-4">
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Email Address"
            required
            className="rounded-xl border border-white/10 bg-black p-4 outline-none focus:border-green-500"
          />

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Password"
              required
              className="w-full rounded-xl border border-white/10 bg-black p-4 pr-12 outline-none focus:border-green-500"
            />

            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              className="absolute right-4 top-4 text-white/50"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <button
            disabled={loading}
            className="rounded-xl bg-green-500 py-4 font-black text-black disabled:opacity-40"
          >
            {loading ? "Logging In..." : "Login to Affiliate Dashboard"}
          </button>
        </form>

        <div className="mt-6 text-center text-white/60">
          New affiliate?{" "}
          <Link
            href="/affiliate/register"
            className="font-black text-green-400"
          >
            Create Account
          </Link>
        </div>
      </div>
    </main>
  );
}
