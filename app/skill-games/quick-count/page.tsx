"use client";

import { useState } from "react";
import Link from "next/link";

const rounds = [
  { count: 7, symbol: "⭐", options: [5, 7, 8, 9] },
  { count: 11, symbol: "🔵", options: [9, 10, 11, 13] },
  { count: 14, symbol: "🍎", options: [12, 14, 15, 16] },
  { count: 9, symbol: "💎", options: [7, 8, 9, 11] },
  { count: 16, symbol: "🔥", options: [14, 15, 16, 18] },
  { count: 12, symbol: "⚽", options: [10, 11, 12, 14] },
];

export default function QuickCountPreview() {
  const [stake, setStake] = useState("");
  const [started, setStarted] = useState(false);
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [showObjects, setShowObjects] = useState(false);
  const [canAnswer, setCanAnswer] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const [finished, setFinished] = useState(false);

  const payout = Number(stake || 0) * 2;
  const won = score >= 5;

  function showRound(roundIndex: number) {
    setCurrent(roundIndex);
    setSelected(null);
    setCanAnswer(false);
    setShowObjects(true);

    setTimeout(() => {
      setShowObjects(false);
      setCanAnswer(true);
    }, 1200);
  }

  function startGame() {
    if (!stake || Number(stake) <= 0) return;

    setStarted(true);
    setScore(0);
    setFinished(false);
    showRound(0);
  }

  function chooseAnswer(answer: number) {
    if (!canAnswer || selected !== null) return;

    setSelected(answer);
    setCanAnswer(false);

    const correct = answer === rounds[current].count;
    const newScore = correct ? score + 1 : score;

    setScore(newScore);

    setTimeout(() => {
      if (current + 1 >= rounds.length) {
        setFinished(true);
      } else {
        showRound(current + 1);
      }
    }, 700);
  }

  function playAgain() {
    setStake("");
    setStarted(false);
    setCurrent(0);
    setScore(0);
    setShowObjects(false);
    setCanAnswer(false);
    setSelected(null);
    setFinished(false);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-black px-4 py-6 text-white">
      <div className="w-full max-w-xl rounded-3xl border border-sky-400/20 bg-white/5 p-6 text-center">

        <div className="text-5xl">👁️</div>

        <h1 className="mt-3 text-3xl font-black text-sky-400">
          Quick Count
        </h1>

        <p className="mt-2 text-sm text-white/60">
          Count the objects before they disappear. Get at least 5 out of 6 correct to win.
        </p>

        {!started && (
          <div className="mt-6">
            <input
              type="number"
              min="1"
              value={stake}
              onChange={(e) => setStake(e.target.value)}
              placeholder="Enter amount"
              className="w-full rounded-xl border border-white/10 bg-black p-4 text-center text-xl font-bold outline-none focus:border-sky-400"
            />

            {Number(stake) > 0 && (
              <div className="mt-4 rounded-xl bg-green-500/10 p-3 text-green-300">
                Win and receive GH₵{payout.toFixed(2)} total payout.
              </div>
            )}

            <button
              onClick={startGame}
              disabled={!stake || Number(stake) <= 0}
              className="mt-5 w-full rounded-xl bg-sky-400 py-4 font-black text-black disabled:opacity-40"
            >
              Start Quick Count
            </button>
          </div>
        )}

        {started && !finished && (
          <div className="mt-6">
            <div className="flex justify-between text-sm text-white/50">
              <span>Round {current + 1}/{rounds.length}</span>
              <span>Score: {score}</span>
            </div>

            <div className="mt-6 flex min-h-72 items-center justify-center rounded-3xl border border-white/10 bg-black p-6">

              {showObjects ? (
                <div className="flex flex-wrap justify-center gap-3">
                  {Array.from({ length: rounds[current].count }).map((_, index) => (
                    <span key={index} className="text-4xl">
                      {rounds[current].symbol}
                    </span>
                  ))}
                </div>
              ) : (
                <div>
                  <div className="text-5xl">❓</div>
                  <h2 className="mt-4 text-2xl font-black">
                    How many did you see?
                  </h2>
                </div>
              )}

            </div>

            {canAnswer && (
              <div className="mt-5 grid grid-cols-2 gap-3">
                {rounds[current].options.map((option) => (
                  <button
                    key={option}
                    onClick={() => chooseAnswer(option)}
                    className="rounded-2xl border border-white/10 bg-black/60 p-5 text-2xl font-black hover:border-sky-400"
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {finished && (
          <div className="mt-6">
            {won ? (
              <div className="rounded-2xl border border-green-400/30 bg-green-500/10 p-6">
                <div className="text-5xl">🏆</div>

                <h2 className="mt-3 text-3xl font-black text-green-400">
                  Congratulations!
                </h2>

                <p className="mt-3">
                  You scored {score}/{rounds.length}.
                </p>

                <p className="mt-3 text-xl font-black text-green-300">
                  You won GH₵{payout.toFixed(2)}
                </p>
              </div>
            ) : (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <div className="text-5xl">👁️</div>

                <h2 className="mt-3 text-2xl font-black">
                  Count Complete
                </h2>

                <p className="mt-3 text-white/70">
                  You scored {score}/{rounds.length}.
                </p>

                <p className="mt-2 text-white/50">
                  Stay focused. Train your eyes and challenge yourself again.
                </p>
              </div>
            )}

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <button
                onClick={playAgain}
                className="rounded-xl bg-sky-400 py-3 font-black text-black"
              >
                Play Again
              </button>

              <Link
                href="/skill-games"
                className="rounded-xl border border-white/10 bg-white/5 py-3 font-bold"
              >
                Skill Games
              </Link>
            </div>
          </div>
        )}

        <p className="mt-5 text-xs text-white/30">
          Preview Mode — wallet balance is not affected.
        </p>

      </div>
    </main>
  );
}
