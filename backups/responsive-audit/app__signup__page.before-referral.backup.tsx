"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Trophy } from "lucide-react";
import { signUp } from "@/lib/auth";

export default function SignupPage() {
  const router = useRouter();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [agree, setAgree] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");

    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setMessage("Password must be at least 6 characters.");
      return;
    }

    if (!agree) {
      setMessage("Please accept the Terms and Responsible Gaming Policy.");
      return;
    }

    setLoading(true);

    const { error } = await signUp(email, password, {
      first_name: firstName,
      last_name: lastName,
      username,
      phone,
    });

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-black via-zinc-950 to-yellow-950 px-6 py-10">
      <div className="w-full max-w-2xl rounded-3xl border border-pink-600/20 bg-black/60 p-8 shadow-2xl backdrop-blur-xl">
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-pink-500 text-black">
            <Trophy size={40} />
          </div>

          <h1 className="mt-5 text-4xl font-black text-pink-500">
            Join Fortuna Play
          </h1>

          <p className="mt-2 text-white/60">
            Create your account and start playing your favourite games.
          </p>
        </div>

        <form onSubmit={handleSignup} className="grid gap-5 md:grid-cols-2">
          <input
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="First Name"
            required
            className="rounded-xl border border-white/10 bg-white/5 p-3 text-white outline-none focus:border-pink-500"
          />

          <input
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Last Name"
            required
            className="rounded-xl border border-white/10 bg-white/5 p-3 text-white outline-none focus:border-pink-500"
          />

          <input
            value={username}
            onChange={(e) => setUsername(e.target.value.toLowerCase())}
            placeholder="Username"
            required
            className="rounded-xl border border-white/10 bg-white/5 p-3 text-white outline-none focus:border-pink-500"
          />

          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Phone Number"
            required
            className="rounded-xl border border-white/10 bg-white/5 p-3 text-white outline-none focus:border-pink-500"
          />

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email Address"
            required
            className="rounded-xl border border-white/10 bg-white/5 p-3 text-white outline-none focus:border-pink-500 md:col-span-2"
          />

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              className="w-full rounded-xl border border-white/10 bg-white/5 p-3 pr-12 text-white outline-none focus:border-pink-500"
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-3 text-white/60"
            >
              {showPassword ? <EyeOff /> : <Eye />}
            </button>
          </div>

          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm Password"
              required
              className="w-full rounded-xl border border-white/10 bg-white/5 p-3 pr-12 text-white outline-none focus:border-pink-500"
            />

            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-4 top-3 text-white/60"
            >
              {showConfirmPassword ? <EyeOff /> : <Eye />}
            </button>
          </div>

          <label className="flex items-center gap-3 text-white/70 md:col-span-2">
            <input
              type="checkbox"
              checked={agree}
              onChange={(e) => setAgree(e.target.checked)}
            />
            I agree to the Terms & Conditions and Responsible Gaming Policy.
          </label>

          {message && (
            <p className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-center text-red-300 md:col-span-2">
              {message}
            </p>
          )}

          <button
            disabled={loading}
            className="rounded-xl bg-pink-500 py-3 font-black text-black hover:bg-pink-400 disabled:opacity-60 md:col-span-2"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>

          <div className="text-center text-white/60 md:col-span-2">
            Already have an account?{" "}
            <Link href="/login" className="font-bold text-pink-500">
              Login
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}
