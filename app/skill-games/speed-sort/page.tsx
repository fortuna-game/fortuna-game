"use client";

import { useState } from "react";
import Link from "next/link";

const challenges = [
  { item: "🍎", left: "Food", right: "Animal", answer: "left" },
  { item: "🐘", left: "Animal", right: "Food", answer: "left" },
  { item: "🚗", left: "Vehicle", right: "Fruit", answer: "left" },
  { item: "🍌", left: "Animal", right: "Fruit", answer: "right" },
  { item: "✈️", left: "Vehicle", right: "Food", answer: "left" },
  { item: "🐶", left: "Fruit", right: "Animal", answer: "right" },
  { item: "🍕", left: "Food", right: "Vehicle", answer: "left" },
  { item: "🚲", left: "Animal", right: "Vehicle", answer: "right" },
];

export default function SpeedSortPreview() {
  const [stake, setStake] = useState("");
  const [started, setStarted] = useState(false);
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [selected, setSelected] = useState("");

  const payout = Number(stake || 0) * 2;
  const won = score >= 7;

  function startGame() {
    if (!stake || Number(stake) <= 0) return;

    setStarted(true);
    setCurrent(0);
    setScore(0);
    setFinished(false);
    setSelected("");
  }

  function chooseSide(side: string) {
    if (selected) return;

    setSelected(side);

    const correct = side === challenges[current].answer;
    const newScore = correct ? score + 1 : score;

    setScore(newScore);

    setTimeout(() => {
      if (current + 1 >= challenges.length) {
        setFinished(true);
      } else {
        setCurrent((value) => value + 1);
        setSelected("");
      }
    }, 450);
  }

  function playAgain() {
    setStake("");
    setStarted(false);
    setCurrent(0);
    setScore(0);
    setFinished(false);
    setSelected("");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-black px-4 py-6 text-white">
      <div className="w-full max-w-xl rounded-3xl border border-orange-400/20 bg-white/5 p-6 text-center">

        <div className="text-5xl">⚡</div>

        <h1 className="mt-3 text-3xl font-black text-orange-400">
          Speed Sort
        </h1>

        <p className="mt-2 text-sm text-white/60">
          Quickly send each item to the correct category.
          Get at least 7 out of 8 correct to win.
        </p>

        {!started && (
          <div className="mt-6">
            <input
              type="number"
              min="1"
              value={stake}
              onChange={(e) => setStake(e.target.value)}
              placeholder="Enter amount"
              className="w-full rounded-xl border border-white/10 bg-black p-4 text-center text-xl font-bold outline-none focus:border-orange-400"
            />

            {Number(stake) > 0 && (
              <div className="mt-4 rounded-xl bg-green-500/10 p-3 text-green-300">
                Win and receive GH₵{payout.toFixed(2)} total payout.
              </div>
            )}

            <button
              onClick={startGame}
              disabled={!stake || Number(stake) <= 0}
              className="mt-5 w-full rounded-xl bg-orange-400 py-4 font-black text-black disabled:opacity-40"
            >
              Start Speed Sort
            </button>
          </div>
        )}

        {started && !finished && (
          <div className="mt-6">

            <div className="flex justify-between text-sm text-white/50">
              <span>
                Item {current + 1}/{challenges.length}
              </span>

              <span>
                Score: {score}
              </span>
            </div>

            <div className="mt-8 rounded-3xl border border-white/10 bg-black/60 p-8">
              <p className="text-sm uppercase tracking-widest text-white/40">
                Where Does This Belong?
              </p>

              <div className="mt-5 text-8xl">
                {challenges[current].item}
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4">

              <button
                onClick={() => chooseSide("left")}
                disabled={Boolean(selected)}
                className="rounded-2xl border border-blue-400/30 bg-blue-500/10 p-6 text-xl font-black text-blue-300 hover:bg-blue-500/20"
              >
                ← {challenges[current].left}
              </button>

              <button
                onClick={() => chooseSide("right")}
                disabled={Boolean(selected)}
                className="rounded-2xl border border-purple-400/30 bg-purple-500/10 p-6 text-xl font-black text-purple-300 hover:bg-purple-500/20"
              >
                {challenges[current].right} →
              </button>

            </div>
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
                  You sorted {score}/{challenges.length} correctly.
                </p>

                <p className="mt-3 text-xl font-black text-green-300">
                  You won GH₵{payout.toFixed(2)}
                </p>
              </div>
            ) : (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <div className="text-5xl">⚡</div>

                <h2 className="mt-3 text-2xl font-black">
                  Speed Challenge Complete
                </h2>

                <p className="mt-3 text-white/70">
                  You scored {score}/{challenges.length}.
                </p>

                <p className="mt-2 text-white/50">
                  You needed 7 correct answers to win. Stay sharp and try again.
                </p>
              </div>
            )}

            <div className="mt-5 grid gap-3 sm:grid-cols-2">

              <button
                onClick={playAgain}
                className="rounded-xl bg-orange-400 py-3 font-black text-black"
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
