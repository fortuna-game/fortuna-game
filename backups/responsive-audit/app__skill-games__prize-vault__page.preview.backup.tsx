"use client";

import { useState } from "react";
import Link from "next/link";

const demoPrizes = [
  "�� Smartphone",
  "💇🏾‍♀️ Premium Wig",
  "🛍️ GH₵100 Shopping Voucher",
  "🍕 Pizza Voucher",
  "🍽️ Lunch Voucher",
  "📶 GH₵50 Data Bundle",
  "🎧 Wireless Earbuds",
  "💵 GH₵50 Cash",
  "📱 GH₵20 Airtime",
  "🎁 Surprise Gift",
  "🛍️ GH₵50 Shopping Voucher",
  "⭐ Try Again",
];

export default function PrizeVaultPage() {
  const [selected, setSelected] = useState<number | null>(null);
  const [prize, setPrize] = useState("");
  const [opening, setOpening] = useState(false);

  function openVault(index: number) {
    if (selected !== null || opening) return;

    setOpening(true);
    setSelected(index);

    setTimeout(() => {
      const randomPrize =
        demoPrizes[Math.floor(Math.random() * demoPrizes.length)];

      setPrize(randomPrize);
      setOpening(false);
    }, 1200);
  }

  function resetGame() {
    setSelected(null);
    setPrize("");
    setOpening(false);
  }

  return (
    <main className="min-h-screen bg-black px-4 py-10 text-white">
      <div className="mx-auto max-w-4xl text-center">

        <div className="text-6xl">🎁</div>

        <h1 className="mt-4 text-4xl font-black text-pink-500">
          Fortuna Prize Vault
        </h1>

        <p className="mt-3 text-white/60">
          Choose one mystery vault and reveal your prize.
        </p>

        {!prize && (
          <>
            <div className="mx-auto mt-6 max-w-xl rounded-3xl border border-pink-500/20 bg-white/5 p-5 text-left">
              <h2 className="text-xl font-black text-pink-400">
                📋 How to Play
              </h2>

              <p className="mt-3 leading-7 text-white/70">
                Pay the entry fee and choose one mystery vault. Your selected
                vault will open and reveal the prize hidden inside.
              </p>
            </div>

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:grid-cols-4">
              {Array.from({ length: 12 }).map((_, index) => (
                <button
                  key={index}
                  disabled={selected !== null}
                  onClick={() => openVault(index)}
                  className={`group flex aspect-square flex-col items-center justify-center rounded-3xl border font-black transition ${
                    selected === index
                      ? "scale-105 border-pink-400 bg-pink-500/20"
                      : "border-pink-500/20 bg-white/5 hover:scale-105 hover:border-pink-400"
                  }`}
                >
                  <span className="text-4xl transition group-hover:scale-110">
                    {selected === index ? "🔓" : "🎁"}
                  </span>

                  <span className="mt-2 text-sm text-white/60">
                    Vault {index + 1}
                  </span>
                </button>
              ))}
            </div>

            {opening && (
              <div className="mt-8 rounded-3xl border border-pink-500/30 bg-pink-500/10 p-6">
                <div className="animate-pulse text-5xl">🔓</div>

                <p className="mt-3 text-xl font-black text-pink-400">
                  Opening your mystery vault...
                </p>
              </div>
            )}
          </>
        )}

        {prize && (
          <div className="mx-auto mt-10 max-w-xl rounded-3xl border border-pink-500/30 bg-pink-500/10 p-8">
            <div className="text-7xl">🎉</div>

            <h2 className="mt-4 text-3xl font-black text-pink-400">
              Prize Revealed!
            </h2>

            <p className="mt-6 text-2xl font-black">
              {prize}
            </p>

            <p className="mt-4 text-sm text-white/60">
              This is currently a preview game. No wallet money or real prizes
              are being used yet.
            </p>

            <button
              onClick={resetGame}
              className="mt-6 w-full rounded-xl bg-pink-500 py-4 font-black text-black"
            >
              Preview Again
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
