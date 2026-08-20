"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Prize = {
  id: string | null;
  name: string;
  emoji: string;
  description: string;
  type: string;
  value: number;
};

type PlayResult = {
  success: boolean;
  playId: string;
  vaultNumber: number;
  entryFee: number;
  won: boolean;
  prize: Prize;
};

export default function PrizeVaultPage() {
  const [selected, setSelected] = useState<number | null>(null);
  const [result, setResult] = useState<PlayResult | null>(null);
  const [opening, setOpening] = useState(false);
  const [message, setMessage] = useState("");

  async function openVault(index: number) {
    if (selected !== null || opening) return;

    setMessage("");
    setOpening(true);
    setSelected(index);

    const { data: auth } = await supabase.auth.getSession();
    const token = auth.session?.access_token;

    if (!token) {
      setMessage("Please log in to play Prize Vault.");
      setSelected(null);
      setOpening(false);
      return;
    }

    try {
      const res = await fetch("/api/skill-games/prize-vault/play", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          vaultNumber: index + 1,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "Could not open Prize Vault.");
        setSelected(null);
        setOpening(false);
        return;
      }

      setTimeout(() => {
        setResult(data);
        setOpening(false);
      }, 1200);
    } catch {
      setMessage("Could not connect to Prize Vault.");
      setSelected(null);
      setOpening(false);
    }
  }

  function playAgain() {
    setSelected(null);
    setResult(null);
    setOpening(false);
    setMessage("");
  }

  const playing = selected === null && !result;

  return (
    <main className="min-h-screen bg-black px-4 py-10 text-white">
      <div className="mx-auto max-w-4xl text-center">
        <div className="text-6xl">🎁</div>

        <h1 className="mt-4 text-4xl font-black text-pink-500">
          Fortuna Prize Vault
        </h1>

        <p className="mt-3 text-white/60">
          Choose one mystery vault for GH₵20 and reveal your result.
        </p>

        {message && (
          <div className="mx-auto mt-6 max-w-xl rounded-2xl border border-red-400/30 bg-red-500/10 p-4 text-red-300">
            {message}
          </div>
        )}

        {playing && (
          <>
            <div className="mx-auto mt-6 max-w-xl rounded-3xl border border-pink-500/20 bg-white/5 p-5 text-left">
              <h2 className="text-xl font-black text-pink-400">
                📋 How to Play
              </h2>

              <p className="mt-3 leading-7 text-white/70">
                Each play costs GH₵20. Choose one of the 12 mystery vaults.
                Your entry fee is deducted when you select a vault. Open your
                chosen vault to discover whether you won a prize.
              </p>
            </div>

            <div className="mx-auto mt-5 max-w-xl rounded-3xl border border-pink-500/20 bg-pink-500/10 p-5">
              <p className="text-sm text-white/60">Entry Fee</p>

              <p className="mt-1 text-3xl font-black text-pink-400">
                GH₵20
              </p>

              <p className="mt-2 text-sm text-white/60">
                Prizes may include smartphones, wigs, vouchers, food,
                data, airtime, cash and surprise gifts.
              </p>
            </div>

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:grid-cols-4">
              {Array.from({ length: 12 }).map((_, index) => (
                <button
                  key={index}
                  disabled={selected !== null || opening}
                  onClick={() => void openVault(index)}
                  className={`group flex aspect-square flex-col items-center justify-center rounded-3xl border font-black transition ${
                    selected === index
                      ? "scale-105 border-pink-400 bg-pink-500/20"
                      : "border-pink-500/20 bg-white/5 hover:scale-105 hover:border-pink-400"
                  } disabled:cursor-not-allowed`}
                >
                  <span className="text-4xl transition group-hover:scale-110">
                    🎁
                  </span>

                  <span className="mt-2 text-sm text-white/60">
                    Vault {index + 1}
                  </span>
                </button>
              ))}
            </div>
          </>
        )}

        {opening && (
          <div className="mx-auto mt-10 max-w-xl rounded-3xl border border-pink-500/30 bg-pink-500/10 p-8">
            <div className="animate-pulse text-7xl">🔓</div>

            <h2 className="mt-4 text-2xl font-black text-pink-400">
              Opening Vault {selected !== null ? selected + 1 : ""}...
            </h2>

            <p className="mt-3 text-white/60">
              Revealing your result.
            </p>
          </div>
        )}

        {result && !opening && (
          <div
            className={`mx-auto mt-10 max-w-xl rounded-3xl border p-8 ${
              result.won
                ? "border-green-400/30 bg-green-500/10"
                : "border-pink-500/30 bg-pink-500/10"
            }`}
          >
            <div className="text-7xl">
              {result.prize?.emoji || "🎁"}
            </div>

            <h2
              className={`mt-4 text-3xl font-black ${
                result.won ? "text-green-300" : "text-pink-400"
              }`}
            >
              {result.won ? "Congratulations!" : "Try Again"}
            </h2>

            <p className="mt-6 text-2xl font-black">
              {result.prize?.name}
            </p>

            <p className="mt-3 text-white/60">
              {result.prize?.description}
            </p>

            {result.won && (
              <div className="mt-5 rounded-2xl border border-green-400/20 bg-black/30 p-4">
                <p className="font-black text-green-300">
                  You won a Fortuna Prize!
                </p>

                <p className="mt-2 text-sm text-white/60">
                  Your prize has been securely recorded on your account.
                </p>
              </div>
            )}

            <button
              onClick={playAgain}
              className="mt-6 w-full rounded-xl bg-pink-500 py-4 font-black text-black"
            >
              Play Again — GH₵20
            </button>
          </div>
        )}

        <Link
          href="/skill-games"
          className="mt-8 inline-block rounded-xl border border-white/10 bg-white/5 px-6 py-3 font-bold"
        >
          ← Back to Skill Games
        </Link>
      </div>
    </main>
  );
}
