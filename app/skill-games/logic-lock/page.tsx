"use client";

import { useState } from "react";
import Link from "next/link";

const challenges = [
  {
    question: "All Zips are Lops. All Lops are Meks. Is every Zip a Mek?",
    options: ["Yes", "No", "Cannot Know", "Sometimes"],
    answer: "Yes",
  },
  {
    question: "Ama is older than Kojo. Kojo is older than Yaw. Who is youngest?",
    options: ["Ama", "Kojo", "Yaw", "Cannot Know"],
    answer: "Yaw",
  },
  {
    question: "If 2 cats catch 2 mice in 2 minutes, how many cats are needed to catch 6 mice in 2 minutes?",
    options: ["2", "3", "6", "12"],
    answer: "6",
  },
  {
    question: "A farmer has 17 sheep. All but 9 run away. How many remain?",
    options: ["8", "9", "17", "26"],
    answer: "9",
  },
  {
    question: "Which number comes next: 2, 6, 12, 20, 30, ?",
    options: ["36", "40", "42", "44"],
    answer: "42",
  },
  {
    question: "Kofi is facing north. He turns right, then right again. Which direction is he facing?",
    options: ["North", "South", "East", "West"],
    answer: "South",
  },
];

export default function LogicLockPreview() {
  const [stake, setStake] = useState("");
  const [started, setStarted] = useState(false);
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [finished, setFinished] = useState(false);

  const payout = Number(stake || 0) * 2;
  const won = score >= 5;

  function startGame() {
    if (!stake || Number(stake) <= 0) return;

    setStarted(true);
    setCurrent(0);
    setScore(0);
    setSelected(null);
    setFinished(false);
  }

  function chooseAnswer(option: string) {
    if (selected !== null) return;

    setSelected(option);

    const correct = option === challenges[current].answer;
    const newScore = correct ? score + 1 : score;

    setScore(newScore);

    setTimeout(() => {
      if (current + 1 >= challenges.length) {
        setFinished(true);
      } else {
        setCurrent((value) => value + 1);
        setSelected(null);
      }
    }, 700);
  }

  function playAgain() {
    setStake("");
    setStarted(false);
    setCurrent(0);
    setScore(0);
    setSelected(null);
    setFinished(false);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-black px-4 py-6 text-white">
      <div className="w-full max-w-xl rounded-3xl border border-indigo-400/20 bg-white/5 p-6 text-center">

        <div className="text-5xl">🔐</div>

        <h1 className="mt-3 text-3xl font-black text-indigo-400">
          Logic Lock
        </h1>

        <p className="mt-2 text-sm text-white/60">
          Solve the logic challenges and unlock the vault.
          Get at least 5 out of 6 correct to win.
        </p>

        {!started && (
          <div className="mt-6">

            <input
              type="number"
              min="1"
              value={stake}
              onChange={(e) => setStake(e.target.value)}
              placeholder="Enter amount"
              className="w-full rounded-xl border border-white/10 bg-black p-4 text-center text-xl font-bold outline-none focus:border-indigo-400"
            />

            {Number(stake) > 0 && (
              <div className="mt-4 rounded-xl bg-green-500/10 p-3 text-green-300">
                Win and receive GH₵{payout.toFixed(2)} total payout.
              </div>
            )}

            <button
              onClick={startGame}
              disabled={!stake || Number(stake) <= 0}
              className="mt-5 w-full rounded-xl bg-indigo-400 py-4 font-black text-black disabled:opacity-40"
            >
              Start Logic Lock
            </button>

          </div>
        )}

        {started && !finished && (
          <div className="mt-6">

            <div className="flex justify-between text-sm text-white/50">
              <span>
                Lock {current + 1}/{challenges.length}
              </span>

              <span>
                Score: {score}
              </span>
            </div>

            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full bg-indigo-400 transition-all"
                style={{
                  width: `${((current + 1) / challenges.length) * 100}%`,
                }}
              />
            </div>

            <div className="mt-7 rounded-3xl border border-indigo-400/20 bg-black p-6">

              <div className="text-5xl">
                🔒
              </div>

              <p className="mt-5 text-xl font-black leading-relaxed">
                {challenges[current].question}
              </p>

            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">

              {challenges[current].options.map((option) => {
                const correct =
                  selected !== null &&
                  option === challenges[current].answer;

                const wrong =
                  selected === option &&
                  option !== challenges[current].answer;

                return (
                  <button
                    key={option}
                    onClick={() => chooseAnswer(option)}
                    disabled={selected !== null}
                    className={`rounded-2xl border p-5 font-black transition ${
                      correct
                        ? "border-green-400 bg-green-500/20 text-green-300"
                        : wrong
                        ? "border-red-400 bg-red-500/20 text-red-300"
                        : "border-white/10 bg-black/60 hover:border-indigo-400"
                    }`}
                  >
                    {option}
                  </button>
                );
              })}

            </div>

          </div>
        )}

        {finished && (
          <div className="mt-6">

            {won ? (
              <div className="rounded-2xl border border-green-400/30 bg-green-500/10 p-6">

                <div className="text-5xl">
                  🏆
                </div>

                <h2 className="mt-3 text-3xl font-black text-green-400">
                  Vault Unlocked!
                </h2>

                <p className="mt-3">
                  You solved {score}/{challenges.length} logic challenges.
                </p>

                <p className="mt-3 text-xl font-black text-green-300">
                  You won GH₵{payout.toFixed(2)}
                </p>

              </div>
            ) : (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6">

                <div className="text-5xl">
                  🔒
                </div>

                <h2 className="mt-3 text-2xl font-black">
                  Vault Still Locked
                </h2>

                <p className="mt-3 text-white/70">
                  You solved {score}/{challenges.length} challenges.
                </p>

                <p className="mt-2 text-white/50">
                  You needed 5 correct answers. Sharpen your reasoning and challenge the vault again.
                </p>

              </div>
            )}

            <div className="mt-5 grid gap-3 sm:grid-cols-2">

              <button
                onClick={playAgain}
                className="rounded-xl bg-indigo-400 py-3 font-black text-black"
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
