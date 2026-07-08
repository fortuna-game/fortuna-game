"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "@/lib/auth";
import { Eye, EyeOff, Trophy } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);
    setMessage("");

    const { error } = await signIn(email, password);

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-black via-zinc-950 to-yellow-950 px-6">
      <div className="w-full max-w-md rounded-3xl border border-pink-600/20 bg-black/60 p-8 backdrop-blur-xl shadow-2xl">

        <div className="mb-8 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-pink-600 text-black">
            <Trophy size={40} />
          </div>

          <h1 className="mt-5 text-4xl font-black text-pink-500">
            Fortuna Play
          </h1>

          <p className="mt-2 text-white/60">
            Play. Win. Celebrate.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">

          <input
            type="email"
            placeholder="Email Address"
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-pink-500"
            value={email}
            onChange={(e)=>setEmail(e.target.value)}
            required
          />

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 pr-12 text-white outline-none focus:border-pink-500"
              value={password}
              onChange={(e)=>setPassword(e.target.value)}
              required
            />

            <button
              type="button"
              onClick={()=>setShowPassword(!showPassword)}
              className="absolute right-4 top-3 text-white/60"
            >
              {showPassword ? <EyeOff/> : <Eye/>}
            </button>
          </div>

          <div className="text-right">
            <Link
              href="/forgot-password"
              className="text-sm font-bold text-pink-500 hover:text-pink-400"
            >
              Forgot Password?
            </Link>
          </div>

          {message && (
            <p className="text-center text-red-400">{message}</p>
          )}

          <button
            disabled={loading}
            className="w-full rounded-xl bg-pink-500 py-3 font-black text-black transition hover:bg-pink-400"
          >
            {loading ? "Signing In..." : "Login"}
          </button>

          <div className="text-center text-white/60">
            Don't have an account?{" "}
            <Link href="/signup" className="font-bold text-pink-500">
              Sign Up
            </Link>
          </div>

        </form>

      </div>
    </main>
  );
}
