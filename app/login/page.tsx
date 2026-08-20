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
      <div className="w-full max-w-md rounded-3xl border border-blue-700/20 bg-[#071A33]/60 p-8 backdrop-blur-xl shadow-2xl">

        <div className="mb-8 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#2C63B3] text-black">
            <Trophy size={40} />
          </div>

          <h1 className="mt-5 text-4xl font-black text-[#4D94F5]">
            Fortuna Play
          </h1>

          <p className="mt-2 text-[#9AAAC1]">
            Play. Win. Celebrate.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">

          <input
            type="email"
            placeholder="Email Address"
            className="w-full rounded-xl border border-[#38BDF8]/15 bg-[#0B2545]/70 px-4 py-3 text-white outline-none focus:border-blue-500"
            value={email}
            onChange={(e)=>setEmail(e.target.value)}
            required
          />

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className="w-full rounded-xl border border-[#38BDF8]/15 bg-[#0B2545]/70 px-4 py-3 pr-12 text-white outline-none focus:border-blue-500"
              value={password}
              onChange={(e)=>setPassword(e.target.value)}
              required
            />

            <button
              type="button"
              onClick={()=>setShowPassword(!showPassword)}
              className="absolute right-4 top-3 text-[#9AAAC1]"
            >
              {showPassword ? <EyeOff/> : <Eye/>}
            </button>
          </div>

          <div className="text-right">
            <Link
              href="/forgot-password"
              className="text-sm font-bold text-[#4D94F5] hover:text-[#66A7FF]"
            >
              Forgot Password?
            </Link>
          </div>

          {message && (
            <p className="text-center text-red-400">{message}</p>
          )}

          <button
            disabled={loading}
            className="w-full rounded-xl bg-[#3F82DD] py-3 font-black text-black transition hover:bg-blue-400"
          >
            {loading ? "Signing In..." : "Login"}
          </button>

          <div className="text-center text-[#9AAAC1]">
            Don't have an account?{" "}
            <Link href="/signup" className="font-bold text-[#4D94F5]">
              Sign Up
            </Link>
          </div>

        </form>

      </div>
    </main>
  );
}
