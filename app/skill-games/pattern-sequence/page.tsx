"use client";

import { useState } from "react";
import Link from "next/link";

const challenges = [
  {
    pattern: ["2", "4", "6", "8", "?"],
    options: ["9", "10", "11", "12"],
    answer: "10",
  },
  {
    pattern: ["🔴", "🔵", "🔴", "🔵", "?"],
    options: ["🟢", "🔴", "🟡", "🔵"],
    answer: "🔴",
  },
  {
    pattern: ["3", "6", "12", "24", "?"],
    options: ["30", "36", "48", "50"],
    answer: "48",
  },
  {
    pattern: ["▲", "●", "▲", "●", "?"],
    options: ["■", "▲", "◆", "●"],
    answer: "▲",
  },
  {
    pattern: ["1", "4", "9", "16", "?"],
    options: ["20", "24", "25", "30"],
    answer: "25",
  },
  {
    pattern: ["5", "10", "20", "40", "?"],
    options: ["50", "60", "70", "80"],
    answer: "80",
  },
];

export default function PatternSequencePreview() {
  const [stake, setStake] = useState("");
  const [started, setStarted] = useState(false);
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);

  const payout = Number(stake || 0) * 2;
  const won = score >= 5;

  function startGame() {
    if (!stake || Number(stake) <= 0) return;

    setStarted(true);
    setCurrent(0);
    setScore(0);
    setFinished(false);
    setSelected(null);
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
    setFinished(false);
    setSelected(null);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-black px-4 py-6 text-white">
      <div className="w-full max-w-xl rounded-3xl border border-cyan-400/20 bg-white/5 p-6 text-center">

        <div className="text-5xl">🧩</div>

        <h1 className="mt-3 text-3xl font-black text-cyan-400">
          Pattern Sequence
        </h1>

        <p className="mt-2 text-sm text-white/60">
          Study each pattern and choose what comes next.
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
              className="w-full rounded-xl border border-white/10 bg-black p-4 text-center text-xl font-bold outline-none focus:border-cyan-400"
            />

            {Number(stake) > 0 && (
              <div className="mt-4 rounded-xl bg-green-500/10 p-3 text-green-300">
                Win this game and receive GH₵{payout.toFixed(2)} total payout.
              </div>
            )}

            <button
              onClick={startGame}
              disabled={!stake || Number(stake) <= 0}
              className="mt-5 w-full rounded-xl bg-cyan-400 py-4 font-black text-black disabled:opacity-40"
            >
              Start Pattern Challenge
            </button>

          </div>
        )}

        {started && !finished && (
          <div className="mt-6">

            <div className="flex justify-between text-sm text-white/50">
              <span>
                Pattern {current + 1} of {challenges.length}
              </span>

              <span>
                Score: {score}
              </span>
            </div>

            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full bg-cyan-400 transition-all"
                style={{
                  width: `${((current + 1) / challenges.length) * 100}%`,
                }}
              />
            </div>

            <p className="mt-7 text-sm font-bold uppercase tracking-widest text-white/40">
              What Comes Next?
            </p>

            <div className="mt-6 flex flex-wrap justify-center gap-3">
              {challenges[current].pattern.map((item, index) => (
                <div
                  key={index}
                  className={`flex h-16 min-w-16 items-center justify-center rounded-2xl border px-4 text-2xl font-black ${
                    item === "?"
                      ? "border-yellow-400 bg-yellow-400/10 text-yellow-300"
                      : "border-cyan-400/20 bg-cyan-400/10"
                  }`}
                >
                  {item}
                </div>
              ))}
            </div>

            <div className="mt-7 grid grid-cols-2 gap-3">
              {challenges[current].options.map((option) => {
                const isSelected = selected === option;
                const isCorrect =
                  selected !== null &&
                  option === challenges[current].answer;

                return (
                  <button
                    key={option}
                    onClick={() => chooseAnswer(option)}
                    disabled={selected !== null}
                    className={`rounded-2xl border p-5 text-xl font-black transition ${
                      isCorrect
                        ? "border-green-400 bg-green-500/20 text-green-300"
                        : isSelected
                        ? "border-red-400 bg-red-500/20 text-red-300"
                        : "border-white/10 bg-black/60 hover:border-cyan-400"
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
                  Congratulations!
                </h2>

                <p className="mt-3">
                  You solved {score}/{challenges.length} patterns correctly.
                </p>

                <p className="mt-3 text-xl font-black text-green-300">
                  You won GH₵{payout.toFixed(2)}
                </p>

              </div>
            ) : (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6">

                <div className="text-5xl">🧩</div>

                <h2 className="mt-3 text-2xl font-black">
                  Challenge Complete
                </h2>

                <p className="mt-3 text-white/70">
                  You scored {score}/{challenges.length}.
                </p>

                <p className="mt-2 text-white/50">
                  You needed 5 correct answers to win. Study the sequences carefully and challenge yourself again.
                </p>

              </div>
            )}

            <div className="mt-5 grid gap-3 sm:grid-cols-2">

              <button
                onClick={playAgain}
                className="rounded-xl bg-cyan-400 py-3 font-black text-black"
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
