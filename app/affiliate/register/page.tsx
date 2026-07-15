"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function AffiliateRegisterPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const [paymentMethod, setPaymentMethod] = useState<"momo" | "bank">("momo");

  const [momoNetwork, setMomoNetwork] = useState("MTN");
  const [momoNumber, setMomoNumber] = useState("");

  const [bankName, setBankName] = useState("");
  const [bankAccountName, setBankAccountName] = useState("");
  const [bankAccountNumber, setBankAccountNumber] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleRegister(event: React.FormEvent) {
    event.preventDefault();
    setMessage("");

    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setMessage("Password must be at least 6 characters.");
      return;
    }

    if (paymentMethod === "momo" && !momoNumber.trim()) {
      setMessage("Enter your Mobile Money number.");
      return;
    }

    if (
      paymentMethod === "bank" &&
      (!bankName.trim() ||
        !bankAccountName.trim() ||
        !bankAccountNumber.trim())
    ) {
      setMessage("Complete all bank account details.");
      return;
    }

    if (!agree) {
      setMessage("Please accept the Affiliate Program terms.");
      return;
    }

    setLoading(true);

    const usernameBase = email
      .split("@")[0]
      .replace(/[^a-zA-Z0-9]/g, "")
      .toLowerCase();

    const { data: signUpData, error: signUpError } =
      await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: fullName.split(" ")[0] || fullName,
            last_name: fullName.split(" ").slice(1).join(" "),
            username: `${usernameBase}_${Date.now().toString().slice(-5)}`,
            phone,
            account_type: "affiliate",
          },
        },
      });

    if (signUpError) {
      setMessage(signUpError.message);
      setLoading(false);
      return;
    }

    let token = signUpData.session?.access_token;

    if (!token) {
      const { data: loginData, error: loginError } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      if (loginError || !loginData.session) {
        setMessage(
          "Your account was created. Please confirm your email, then log in."
        );
        setLoading(false);
        return;
      }

      token = loginData.session.access_token;
    }

    const res = await fetch("/api/affiliate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        fullName,
        phone,
        paymentMethod,
        momoNetwork: paymentMethod === "momo" ? momoNetwork : "",
        momoNumber: paymentMethod === "momo" ? momoNumber : "",
        bankName: paymentMethod === "bank" ? bankName : "",
        bankAccountName:
          paymentMethod === "bank" ? bankAccountName : "",
        bankAccountNumber:
          paymentMethod === "bank" ? bankAccountNumber : "",
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setMessage(data.error || "Could not create affiliate account.");
      setLoading(false);
      return;
    }

    router.push("/affiliate/dashboard");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-black px-5 py-10 text-white">
      <div className="w-full max-w-2xl rounded-3xl border border-green-500/20 bg-white/5 p-7 shadow-2xl">
        <div className="text-center">
          <div className="text-6xl">🤝</div>

          <h1 className="mt-4 text-4xl font-black text-green-400">
            Join Fortuna Affiliate Program
          </h1>

          <p className="mt-3 text-white/60">
            Create your affiliate account, receive your unique referral link
            and earn GH₵5 for every qualified player.
          </p>
        </div>

        <div className="mt-6 rounded-2xl border border-green-500/20 bg-green-500/10 p-4 text-sm leading-7 text-white/70">
          A qualified player must register through your link, make a successful
          deposit and play at least GH₵20 worth of games.
        </div>

        {message && (
          <p className="mt-5 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-red-300">
            {message}
          </p>
        )}

        <form
          onSubmit={handleRegister}
          className="mt-6 grid gap-4 md:grid-cols-2"
        >
          <input
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            placeholder="Full Name"
            required
            className="rounded-xl border border-white/10 bg-black p-4 outline-none focus:border-green-500 md:col-span-2"
          />

          <input
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder="Phone Number"
            required
            className="rounded-xl border border-white/10 bg-black p-4 outline-none focus:border-green-500"
          />

          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Email Address"
            required
            className="rounded-xl border border-white/10 bg-black p-4 outline-none focus:border-green-500"
          />

          <div className="md:col-span-2">
            <p className="mb-3 font-black text-green-400">
              Choose How You Want To Receive Payments
            </p>

            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setPaymentMethod("momo")}
                className={`rounded-xl border p-4 font-black ${
                  paymentMethod === "momo"
                    ? "border-green-500 bg-green-500 text-black"
                    : "border-white/10 bg-black text-white"
                }`}
              >
                📱 Mobile Money
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod("bank")}
                className={`rounded-xl border p-4 font-black ${
                  paymentMethod === "bank"
                    ? "border-green-500 bg-green-500 text-black"
                    : "border-white/10 bg-black text-white"
                }`}
              >
                🏦 Bank Account
              </button>
            </div>
          </div>

          {paymentMethod === "momo" && (
            <>
              <select
                value={momoNetwork}
                onChange={(event) => setMomoNetwork(event.target.value)}
                className="rounded-xl border border-white/10 bg-black p-4 outline-none focus:border-green-500"
              >
                <option value="MTN">MTN Mobile Money</option>
                <option value="Telecel">Telecel Cash</option>
                <option value="AT">AT Money</option>
              </select>

              <input
                value={momoNumber}
                onChange={(event) => setMomoNumber(event.target.value)}
                placeholder="Mobile Money Number"
                required={paymentMethod === "momo"}
                className="rounded-xl border border-white/10 bg-black p-4 outline-none focus:border-green-500"
              />
            </>
          )}

          {paymentMethod === "bank" && (
            <>
              <input
                value={bankName}
                onChange={(event) => setBankName(event.target.value)}
                placeholder="Bank Name"
                required={paymentMethod === "bank"}
                className="rounded-xl border border-white/10 bg-black p-4 outline-none focus:border-green-500"
              />

              <input
                value={bankAccountName}
                onChange={(event) => setBankAccountName(event.target.value)}
                placeholder="Account Holder Name"
                required={paymentMethod === "bank"}
                className="rounded-xl border border-white/10 bg-black p-4 outline-none focus:border-green-500"
              />

              <input
                value={bankAccountNumber}
                onChange={(event) => setBankAccountNumber(event.target.value)}
                placeholder="Bank Account Number"
                required={paymentMethod === "bank"}
                className="rounded-xl border border-white/10 bg-black p-4 outline-none focus:border-green-500 md:col-span-2"
              />
            </>
          )}

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

          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Confirm Password"
              required
              className="w-full rounded-xl border border-white/10 bg-black p-4 pr-12 outline-none focus:border-green-500"
            />

            <button
              type="button"
              onClick={() => setShowConfirmPassword((value) => !value)}
              className="absolute right-4 top-4 text-white/50"
            >
              {showConfirmPassword ? (
                <EyeOff size={20} />
              ) : (
                <Eye size={20} />
              )}
            </button>
          </div>

          <label className="flex items-start gap-3 text-sm text-white/60 md:col-span-2">
            <input
              type="checkbox"
              checked={agree}
              onChange={(event) => setAgree(event.target.checked)}
              className="mt-1"
            />

            <span>
              I agree that only genuine players who deposit and play at least
              GH₵20 qualify for commission. Fake accounts and self-referrals are
              prohibited.
            </span>
          </label>

          <button
            disabled={loading}
            className="rounded-xl bg-green-500 py-4 font-black text-black disabled:opacity-40 md:col-span-2"
          >
            {loading
              ? "Creating Affiliate Account..."
              : "Create Affiliate Account"}
          </button>
        </form>

        <div className="mt-6 text-center text-white/60">
          Already an affiliate?{" "}
          <Link
            href="/affiliate/login"
            className="font-black text-green-400"
          >
            Affiliate Login
          </Link>
        </div>

        <div className="mt-3 text-center">
          <Link href="/" className="text-sm text-white/40">
            ← Back to Fortuna Play
          </Link>
        </div>
      </div>
    </main>
  );
}
