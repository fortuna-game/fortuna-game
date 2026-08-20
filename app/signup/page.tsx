"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Trophy } from "lucide-react";
import { signUp } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export default function SignupPage() {
  const router = useRouter();
  const [referralCode, setReferralCode] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = String(params.get("ref") || "")
      .trim()
      .toUpperCase();

    setReferralCode(code);

    if (code) {
      localStorage.setItem("fortuna_referral_code", code);
    } else {
      const savedCode = localStorage.getItem("fortuna_referral_code");

      if (savedCode) {
        setReferralCode(savedCode);
      }
    }
  }, []);

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

    if (referralCode) {
      const { data: auth } = await supabase.auth.getSession();
      const token = auth.session?.access_token;

      if (token) {
        try {
          await fetch("/api/referrals/register", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              referralCode,
            }),
          });
        } catch (referralError) {
          console.error("REFERRAL REGISTRATION ERROR:", referralError);
        }
      }
    }

    router.push("/dashboard");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-black via-zinc-950 to-yellow-950 px-6 py-10">
      <div className="w-full max-w-2xl rounded-3xl border border-blue-700/20 bg-[#071A33]/60 p-8 shadow-2xl backdrop-blur-xl">
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#3F82DD] text-black">
            <Trophy size={40} />
          </div>

          <h1 className="mt-5 text-4xl font-black text-[#4D94F5]">
            Join Fortuna Play
          </h1>

          <p className="mt-2 text-[#9AAAC1]">
            Create your account and start playing your favourite games.
          </p>

          {referralCode && (
            <div className="mt-4 rounded-xl border border-green-400/20 bg-green-500/10 p-3">
              <p className="text-sm font-bold text-green-300">
                🎉 You were invited to Fortuna Play
              </p>

              <p className="mt-1 text-xs text-[#8295B0]">
                Referral code: {referralCode}
              </p>
            </div>
          )}
        </div>

        <form onSubmit={handleSignup} className="grid gap-5 md:grid-cols-2">
          <input
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="First Name"
            required
            className="rounded-xl border border-[#38BDF8]/15 bg-[#0B2545]/70 p-3 text-white outline-none focus:border-blue-500"
          />

          <input
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Last Name"
            required
            className="rounded-xl border border-[#38BDF8]/15 bg-[#0B2545]/70 p-3 text-white outline-none focus:border-blue-500"
          />

          <input
            value={username}
            onChange={(e) => setUsername(e.target.value.toLowerCase())}
            placeholder="Username"
            required
            className="rounded-xl border border-[#38BDF8]/15 bg-[#0B2545]/70 p-3 text-white outline-none focus:border-blue-500"
          />

          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Phone Number"
            required
            className="rounded-xl border border-[#38BDF8]/15 bg-[#0B2545]/70 p-3 text-white outline-none focus:border-blue-500"
          />

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email Address"
            required
            className="rounded-xl border border-[#38BDF8]/15 bg-[#0B2545]/70 p-3 text-white outline-none focus:border-blue-500 md:col-span-2"
          />

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              className="w-full rounded-xl border border-[#38BDF8]/15 bg-[#0B2545]/70 p-3 pr-12 text-white outline-none focus:border-blue-500"
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-3 text-[#9AAAC1]"
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
              className="w-full rounded-xl border border-[#38BDF8]/15 bg-[#0B2545]/70 p-3 pr-12 text-white outline-none focus:border-blue-500"
            />

            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-4 top-3 text-[#9AAAC1]"
            >
              {showConfirmPassword ? <EyeOff /> : <Eye />}
            </button>
          </div>

          <label className="flex items-center gap-3 text-[#B4C0D1] md:col-span-2">
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
            className="rounded-xl bg-[#3F82DD] py-3 font-black text-black hover:bg-blue-400 disabled:opacity-60 md:col-span-2"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>

          <div className="text-center text-[#9AAAC1] md:col-span-2">
            Already have an account?{" "}
            <Link href="/login" className="font-bold text-[#4D94F5]">
              Login
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}
