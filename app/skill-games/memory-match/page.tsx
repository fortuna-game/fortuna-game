"use client";

import { useState } from "react";
import Link from "next/link";

const symbols = ["🍎", "⭐", "💎", "🔥", "🍎", "⭐", "💎", "🔥"];

export default function MemoryMatchPreview() {
  const [stake, setStake] = useState("");
  const [started, setStarted] = useState(false);
  const [cards, setCards] = useState(symbols);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [finished, setFinished] = useState(false);

  const payout = Number(stake || 0) * 2;
  const won = matched.length === cards.length && moves <= 8;

  function startGame() {
    if (!stake || Number(stake) <= 0) return;
    setCards([...symbols].sort(() => Math.random() - 0.5));
    setStarted(true);
    setFlipped([]);
    setMatched([]);
    setMoves(0);
    setFinished(false);
  }

  function flipCard(index: number) {
    if (flipped.includes(index) || matched.includes(index) || flipped.length === 2) return;

    const next = [...flipped, index];
    setFlipped(next);

    if (next.length === 2) {
      setMoves((m) => m + 1);
      const [a, b] = next;

      setTimeout(() => {
        if (cards[a] === cards[b]) {
          const newMatched = [...matched, a, b];
          setMatched(newMatched);
          if (newMatched.length === cards.length) setFinished(true);
        }
        setFlipped([]);
      }, 700);
    }
  }

  function playAgain() {
    setStake("");
    setStarted(false);
    setFinished(false);
    setFlipped([]);
    setMatched([]);
    setMoves(0);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-black px-4 py-6 text-white">
      <div className="w-full max-w-xl rounded-3xl border border-pink-400/20 bg-white/5 p-6 text-center">
        <div className="text-5xl">🧩</div>
        <h1 className="mt-3 text-3xl font-black text-pink-400">Memory Match</h1>
        <p className="mt-2 text-sm text-white/60">
          Match all pairs in 8 moves or less to win.
        </p>

        {!started && (
          <div className="mt-6">
            <input
              type="number"
              min="1"
              value={stake}
              onChange={(e) => setStake(e.target.value)}
              placeholder="Enter amount"
              className="w-full rounded-xl border border-white/10 bg-black p-4 text-center text-xl font-bold outline-none focus:border-pink-400"
            />

            {Number(stake) > 0 && (
              <div className="mt-4 rounded-xl bg-green-500/10 p-3 text-green-300">
                Win this game and receive GH₵{payout.toFixed(2)} total payout.
              </div>
            )}

            <button
              onClick={startGame}
              disabled={!stake || Number(stake) <= 0}
              className="mt-5 w-full rounded-xl bg-pink-400 py-4 font-black text-black disabled:opacity-40"
            >
              Start Memory Match
            </button>
          </div>
        )}

        {started && !finished && (
          <div className="mt-6">
            <p className="text-sm text-white/50">Moves: {moves}/8</p>

            <div className="mt-5 grid grid-cols-4 gap-3">
              {cards.map((card, index) => {
                const open = flipped.includes(index) || matched.includes(index);

                return (
                  <button
                    key={index}
                    onClick={() => flipCard(index)}
                    className={`flex aspect-square items-center justify-center rounded-2xl border text-4xl font-black ${
                      open
                        ? "border-pink-400 bg-pink-500/20"
                        : "border-white/10 bg-black"
                    }`}
                  >
                    {open ? card : "?"}
                  </button>
                );
              })}
            </div>

            {moves > 8 && matched.length < cards.length && (
              <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-5">
                <h2 className="text-2xl font-black">Game Over</h2>
                <p className="mt-2 text-white/60">
                  You used more than 8 moves. Please try again.
                </p>
                <button onClick={playAgain} className="mt-4 rounded-xl bg-pink-400 px-6 py-3 font-black text-black">
                  Play Again
                </button>
              </div>
            )}
          </div>
        )}

        {finished && (
          <div className="mt-6">
            {won ? (
              <div className="rounded-2xl border border-green-400/30 bg-green-500/10 p-6">
                <div className="text-5xl">🏆</div>
                <h2 className="mt-3 text-3xl font-black text-green-400">Congratulations!</h2>
                <p className="mt-3">You completed it in {moves} moves.</p>
                <p className="mt-3 text-xl font-black text-green-300">You won GH₵{payout.toFixed(2)}</p>
              </div>
            ) : (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <h2 className="text-2xl font-black">Good Attempt</h2>
                <p className="mt-2 text-white/60">Try to finish in 8 moves or less.</p>
              </div>
            )}

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <button onClick={playAgain} className="rounded-xl bg-pink-400 py-3 font-black text-black">
                Play Again
              </button>
              <Link href="/skill-games" className="rounded-xl border border-white/10 bg-white/5 py-3 font-bold">
                Skill Games
              </Link>
            </div>
          </div>
        )}

        <p className="mt-5 text-xs text-white/30">Preview Mode — wallet balance is not affected.</p>
      </div>
    </main>
  );
}
