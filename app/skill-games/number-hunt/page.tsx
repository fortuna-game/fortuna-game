"use client";

import { useState } from "react";
import Link from "next/link";

function makeGrid(target: number) {
  const nums = Array.from({ length: 24 }, () => Math.floor(10 + Math.random() * 90));
  nums.splice(Math.floor(Math.random() * nums.length), 0, target);
  return nums;
}

export default function NumberHuntPreview() {
  const [stake, setStake] = useState("");
  const [started, setStarted] = useState(false);
  const [target, setTarget] = useState(37);
  const [grid, setGrid] = useState<number[]>([]);
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const payout = Number(stake || 0) * 2;
  const won = score >= 4;

  function nextRound(newScore = score) {
    const nextTarget = Math.floor(10 + Math.random() * 90);

    if (round + 1 >= 5) {
      setFinished(true);
      return;
    }

    setRound(round + 1);
    setTarget(nextTarget);
    setGrid(makeGrid(nextTarget));
    setScore(newScore);
  }

  function startGame() {
    if (!stake || Number(stake) <= 0) return;

    const firstTarget = Math.floor(10 + Math.random() * 90);
    setTarget(firstTarget);
    setGrid(makeGrid(firstTarget));
    setStarted(true);
    setRound(0);
    setScore(0);
    setFinished(false);
  }

  function choose(num: number) {
    const newScore = num === target ? score + 1 : score;
    nextRound(newScore);
  }

  function playAgain() {
    setStake("");
    setStarted(false);
    setFinished(false);
    setRound(0);
    setScore(0);
    setGrid([]);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-black px-4 py-6 text-white">
      <div className="w-full max-w-xl rounded-3xl border border-teal-400/20 bg-white/5 p-6 text-center">
        <div className="text-5xl">🔢</div>
        <h1 className="mt-3 text-3xl font-black text-teal-400">Number Hunt</h1>
        <p className="mt-2 text-sm text-white/60">
          Find the target number hidden in the grid. Get 4 out of 5 to win.
        </p>

        {!started && (
          <div className="mt-6">
            <input
              type="number"
              min="1"
              value={stake}
              onChange={(e) => setStake(e.target.value)}
              placeholder="Enter amount"
              className="w-full rounded-xl border border-white/10 bg-black p-4 text-center text-xl font-bold outline-none"
            />

            {Number(stake) > 0 && (
              <div className="mt-4 rounded-xl bg-green-500/10 p-3 text-green-300">
                Win and receive GH₵{payout.toFixed(2)} total payout.
              </div>
            )}

            <button
              onClick={startGame}
              disabled={!stake || Number(stake) <= 0}
              className="mt-5 w-full rounded-xl bg-teal-400 py-4 font-black text-black disabled:opacity-40"
            >
              Start Number Hunt
            </button>
          </div>
        )}

        {started && !finished && (
          <div className="mt-6">
            <div className="flex justify-between text-sm text-white/50">
              <span>Round {round + 1}/5</span>
              <span>Score: {score}</span>
            </div>

            <div className="mt-5 rounded-2xl bg-teal-400/10 p-4">
              <p className="text-sm text-white/50">Find this number:</p>
              <p className="text-5xl font-black text-teal-300">{target}</p>
            </div>

            <div className="mt-5 grid grid-cols-5 gap-2">
              {grid.map((num, index) => (
                <button
                  key={`${num}-${index}`}
                  onClick={() => choose(num)}
                  className="rounded-xl border border-white/10 bg-black p-3 text-lg font-black hover:border-teal-400"
                >
                  {num}
                </button>
              ))}
            </div>
          </div>
        )}

        {finished && (
          <div className="mt-6">
            {won ? (
              <div className="rounded-2xl border border-green-400/30 bg-green-500/10 p-6">
                <div className="text-5xl">🏆</div>
                <h2 className="mt-3 text-3xl font-black text-green-400">Congratulations!</h2>
                <p className="mt-3">You scored {score}/5.</p>
                <p className="mt-3 text-xl font-black text-green-300">You won GH₵{payout.toFixed(2)}</p>
              </div>
            ) : (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <div className="text-5xl">🔢</div>
                <h2 className="mt-3 text-2xl font-black">Hunt Complete</h2>
                <p className="mt-3 text-white/70">You scored {score}/5.</p>
                <p className="mt-2 text-white/50">Stay sharp and try again.</p>
              </div>
            )}

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <button onClick={playAgain} className="rounded-xl bg-teal-400 py-3 font-black text-black">
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
