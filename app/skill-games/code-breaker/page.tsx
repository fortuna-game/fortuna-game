"use client";

import { useState } from "react";
import Link from "next/link";

const rounds = [
  {
    code: ["4", "2", "7"],
    clues: [
      "427 — All 3 numbers are correct and correctly placed",
      "472 — All 3 numbers are correct, but 2 are wrongly placed",
      "429 — 2 numbers are correct and correctly placed",
    ],
    options: ["427", "472", "429", "247"],
    answer: "427",
  },
  {
    code: ["6", "1", "8"],
    clues: [
      "618 — All 3 numbers are correct and correctly placed",
      "681 — All numbers are correct, but 2 are wrongly placed",
      "619 — 2 numbers are correct and correctly placed",
    ],
    options: ["681", "618", "168", "619"],
    answer: "618",
  },
  {
    code: ["3", "9", "5"],
    clues: [
      "395 — All 3 numbers are correct and correctly placed",
      "359 — All numbers are correct, but 2 are wrongly placed",
      "396 — 2 numbers are correct and correctly placed",
    ],
    options: ["359", "395", "935", "396"],
    answer: "395",
  },
  {
    code: ["7", "4", "1"],
    clues: [
      "741 — All 3 numbers are correct and correctly placed",
      "714 — All numbers are correct, but 2 are wrongly placed",
      "742 — 2 numbers are correct and correctly placed",
    ],
    options: ["714", "471", "741", "742"],
    answer: "741",
  },
  {
    code: ["8", "3", "6"],
    clues: [
      "836 — All 3 numbers are correct and correctly placed",
      "863 — All numbers are correct, but 2 are wrongly placed",
      "839 — 2 numbers are correct and correctly placed",
    ],
    options: ["638", "836", "863", "839"],
    answer: "836",
  },
];

export default function CodeBreakerPreview() {
  const [stake, setStake] = useState("");
  const [started, setStarted] = useState(false);
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [finished, setFinished] = useState(false);

  const payout = Number(stake || 0) * 2;
  const won = score >= 4;

  function startGame() {
    if (!stake || Number(stake) <= 0) return;

    setStarted(true);
    setCurrent(0);
    setScore(0);
    setSelected(null);
    setFinished(false);
  }

  function chooseCode(option: string) {
    if (selected !== null) return;

    setSelected(option);

    const correct = option === rounds[current].answer;
    const newScore = correct ? score + 1 : score;

    setScore(newScore);

    setTimeout(() => {
      if (current + 1 >= rounds.length) {
        setFinished(true);
      } else {
        setCurrent((value) => value + 1);
        setSelected(null);
      }
    }, 800);
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
      <div className="w-full max-w-xl rounded-3xl border border-yellow-400/20 bg-white/5 p-6 text-center">

        <div className="text-5xl">🔐</div>

        <h1 className="mt-3 text-3xl font-black text-yellow-400">
          Code Breaker
        </h1>

        <p className="mt-2 text-sm text-white/60">
          Study the clues and crack the secret code.
          Solve at least 4 out of 5 codes to win.
        </p>

        {!started && (
          <div className="mt-6">

            <input
              type="number"
              min="1"
              value={stake}
              onChange={(e) => setStake(e.target.value)}
              placeholder="Enter amount"
              className="w-full rounded-xl border border-white/10 bg-black p-4 text-center text-xl font-bold outline-none focus:border-yellow-400"
            />

            {Number(stake) > 0 && (
              <div className="mt-4 rounded-xl bg-green-500/10 p-3 text-green-300">
                Win and receive GH₵{payout.toFixed(2)} total payout.
              </div>
            )}

            <button
              onClick={startGame}
              disabled={!stake || Number(stake) <= 0}
              className="mt-5 w-full rounded-xl bg-yellow-400 py-4 font-black text-black disabled:opacity-40"
            >
              Start Code Breaker
            </button>

          </div>
        )}

        {started && !finished && (
          <div className="mt-6">

            <div className="flex justify-between text-sm text-white/50">
              <span>
                Code {current + 1}/{rounds.length}
              </span>

              <span>
                Score: {score}
              </span>
            </div>

            <div className="mt-6 rounded-3xl border border-yellow-400/20 bg-black p-5">

              <p className="text-sm font-bold uppercase tracking-widest text-yellow-400">
                Secret Code
              </p>

              <div className="mt-4 flex justify-center gap-3">
                <div className="flex h-16 w-16 items-center justify-center rounded-xl border border-white/20 bg-white/5 text-3xl font-black">
                  ?
                </div>

                <div className="flex h-16 w-16 items-center justify-center rounded-xl border border-white/20 bg-white/5 text-3xl font-black">
                  ?
                </div>

                <div className="flex h-16 w-16 items-center justify-center rounded-xl border border-white/20 bg-white/5 text-3xl font-black">
                  ?
                </div>
              </div>

              <div className="mt-6 space-y-3 text-left">
                {rounds[current].clues.map((clue, index) => (
                  <div
                    key={index}
                    className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white/70"
                  >
                    {clue}
                  </div>
                ))}
              </div>

            </div>

            <p className="mt-5 text-sm text-white/50">
              Choose the correct code
            </p>

            <div className="mt-3 grid grid-cols-2 gap-3">

              {rounds[current].options.map((option) => {
                const correct =
                  selected !== null &&
                  option === rounds[current].answer;

                const wrong =
                  selected === option &&
                  option !== rounds[current].answer;

                return (
                  <button
                    key={option}
                    onClick={() => chooseCode(option)}
                    disabled={selected !== null}
                    className={`rounded-2xl border p-5 text-2xl font-black ${
                      correct
                        ? "border-green-400 bg-green-500/20 text-green-300"
                        : wrong
                        ? "border-red-400 bg-red-500/20 text-red-300"
                        : "border-white/10 bg-black hover:border-yellow-400"
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

                <div className="text-5xl">🏆</div>

                <h2 className="mt-3 text-3xl font-black text-green-400">
                  Code Cracked!
                </h2>

                <p className="mt-3">
                  You solved {score}/{rounds.length} codes.
                </p>

                <p className="mt-3 text-xl font-black text-green-300">
                  You won GH₵{payout.toFixed(2)}
                </p>

              </div>
            ) : (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6">

                <div className="text-5xl">🔒</div>

                <h2 className="mt-3 text-2xl font-black">
                  The Vault Remains Locked
                </h2>

                <p className="mt-3 text-white/70">
                  You solved {score}/{rounds.length} codes.
                </p>

                <p className="mt-2 text-white/50">
                  Study the clues carefully and sharpen your logic for the next challenge.
                </p>

              </div>
            )}

            <div className="mt-5 grid gap-3 sm:grid-cols-2">

              <button
                onClick={playAgain}
                className="rounded-xl bg-yellow-400 py-3 font-black text-black"
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
