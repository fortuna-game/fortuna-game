"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function TargetChallengePreview() {
  const [stake, setStake] = useState("");
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [score, setScore] = useState(0);
  const [shots, setShots] = useState(0);
  const [targetX, setTargetX] = useState(50);
  const [targetY, setTargetY] = useState(50);

  const maxShots = 10;
  const targetScore = 70;
  const payout = Number(stake || 0) * 2;
  const won = score >= targetScore;

  function moveTarget() {
    setTargetX(15 + Math.random() * 70);
    setTargetY(15 + Math.random() * 70);
  }

  function startGame() {
    if (!stake || Number(stake) <= 0) return;

    setScore(0);
    setShots(0);
    setFinished(false);
    setStarted(true);
    moveTarget();
  }

  function hitTarget(points: number) {
    if (finished) return;

    const newShots = shots + 1;
    const newScore = score + points;

    setShots(newShots);
    setScore(newScore);

    if (newShots >= maxShots) {
      setFinished(true);
      return;
    }

    moveTarget();
  }

  function missTarget() {
    if (finished) return;

    const newShots = shots + 1;
    setShots(newShots);

    if (newShots >= maxShots) {
      setFinished(true);
      return;
    }

    moveTarget();
  }

  function playAgain() {
    setStake("");
    setStarted(false);
    setFinished(false);
    setScore(0);
    setShots(0);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-black px-4 py-6 text-white">
      <div className="w-full max-w-xl rounded-3xl border border-red-400/20 bg-white/5 p-6 text-center">
        <div className="text-5xl">🎯</div>

        <h1 className="mt-3 text-3xl font-black text-red-400">
          Target Challenge
        </h1>

        <p className="mt-2 text-sm text-white/60">
          Take 10 shots and score at least 70 points to win.
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
              className="mt-5 w-full rounded-xl bg-red-400 py-4 font-black text-black disabled:opacity-40"
            >
              Start Target Challenge
            </button>
          </div>
        )}

        {started && !finished && (
          <div className="mt-5">
            <div className="flex justify-between text-sm font-bold">
              <span>Score: {score}/{targetScore}</span>
              <span>Shots: {shots}/{maxShots}</span>
            </div>

            <div
              onClick={missTarget}
              className="relative mt-4 h-80 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-slate-900 to-black"
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  hitTarget(10);
                }}
                className="absolute flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-8 border-red-500 bg-white shadow-2xl"
                style={{
                  left: `${targetX}%`,
                  top: `${targetY}%`,
                }}
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-red-500 text-xs font-black text-white">
                  10
                </span>
              </button>
            </div>

            <p className="mt-3 text-xs text-white/40">
              Tap the target. Missing the target still uses one shot.
            </p>
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
                <p className="mt-3">Final Score: {score}</p>
                <p className="mt-3 text-xl font-black text-green-300">
                  You won GH₵{payout.toFixed(2)}
                </p>
              </div>
            ) : (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <div className="text-5xl">🎯</div>
                <h2 className="mt-3 text-2xl font-black">
                  Challenge Complete
                </h2>
                <p className="mt-3 text-white/70">
                  Final Score: {score}
                </p>
                <p className="mt-2 text-white/50">
                  Keep practicing your speed and accuracy and try again.
                </p>
              </div>
            )}

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <button
                onClick={playAgain}
                className="rounded-xl bg-red-400 py-3 font-black text-black"
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
