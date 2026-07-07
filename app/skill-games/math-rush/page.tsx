"use client";

import { useState } from "react";
import Link from "next/link";

const questions = [
  { question: "12 + 8", options: ["18", "20", "22", "24"], answer: "20" },
  { question: "7 × 6", options: ["36", "40", "42", "48"], answer: "42" },
  { question: "50 - 17", options: ["31", "32", "33", "34"], answer: "33" },
  { question: "81 ÷ 9", options: ["7", "8", "9", "10"], answer: "9" },
  { question: "15 + 18", options: ["31", "32", "33", "35"], answer: "33" },
];

export default function MathRushPreview() {
  const [stake, setStake] = useState("");
  const [started, setStarted] = useState(false);
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  function startGame() {
    if (!stake || Number(stake) <= 0) return;

    setStarted(true);
    setCurrent(0);
    setScore(0);
    setFinished(false);
  }

  function answerQuestion(selected: string) {
    const correct = selected === questions[current].answer;
    const newScore = correct ? score + 1 : score;

    if (current + 1 >= questions.length) {
      setScore(newScore);
      setFinished(true);
      return;
    }

    setScore(newScore);
    setCurrent(current + 1);
  }

  function playAgain() {
    setStarted(false);
    setFinished(false);
    setCurrent(0);
    setScore(0);
    setStake("");
  }

  const won = score >= 4;
  const payout = Number(stake || 0) * 2;

  return (
    <main className="flex min-h-screen items-center justify-center bg-black px-4 py-6 text-white">
      <div className="w-full max-w-xl rounded-3xl border border-blue-400/20 bg-white/5 p-6 text-center">
        <div className="text-5xl">➗</div>

        <h1 className="mt-3 text-3xl font-black text-blue-400">
          Math Rush
        </h1>

        <p className="mt-2 text-sm text-white/60">
          Solve at least 4 out of 5 math challenges correctly to win.
        </p>

        {!started && (
          <div className="mt-6">
            <label className="text-sm text-white/60">
              How much do you want to play with?
            </label>

            <input
              type="number"
              min="1"
              value={stake}
              onChange={(e) => setStake(e.target.value)}
              placeholder="Enter amount"
              className="mt-3 w-full rounded-xl border border-white/10 bg-black p-4 text-center text-xl font-bold outline-none focus:border-blue-400"
            />

            {Number(stake) > 0 && (
              <div className="mt-4 rounded-xl bg-green-500/10 p-3 text-green-300">
                Win this game and receive GH₵{payout.toFixed(2)} total payout.
              </div>
            )}

            <button
              onClick={startGame}
              disabled={!stake || Number(stake) <= 0}
              className="mt-5 w-full rounded-xl bg-blue-400 py-4 font-black text-black disabled:opacity-40"
            >
              Start Math Rush
            </button>
          </div>
        )}

        {started && !finished && (
          <div className="mt-6">
            <div className="flex justify-between text-sm text-white/50">
              <span>Challenge {current + 1} of {questions.length}</span>
              <span>Score: {score}</span>
            </div>

            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full bg-blue-400 transition-all"
                style={{
                  width: `${((current + 1) / questions.length) * 100}%`,
                }}
              />
            </div>

            <p className="mt-7 text-sm font-bold uppercase tracking-widest text-white/40">
              Solve
            </p>

            <h2 className="mt-3 text-5xl font-black">
              {questions[current].question}
            </h2>

            <div className="mt-7 grid grid-cols-2 gap-3">
              {questions[current].options.map((option) => (
                <button
                  key={option}
                  onClick={() => answerQuestion(option)}
                  className="rounded-2xl border border-white/10 bg-black/60 p-5 text-xl font-black transition hover:border-blue-400 hover:bg-blue-400/10"
                >
                  {option}
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

                <h2 className="mt-3 text-3xl font-black text-green-400">
                  Congratulations!
                </h2>

                <p className="mt-3">
                  You solved {score}/{questions.length} challenges correctly.
                </p>

                <p className="mt-3 text-xl font-black text-green-300">
                  You won GH₵{payout.toFixed(2)}
                </p>
              </div>
            ) : (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <div className="text-5xl">🧮</div>

                <h2 className="mt-3 text-2xl font-black">
                  Challenge Complete
                </h2>

                <p className="mt-3 text-white/70">
                  You scored {score}/{questions.length}.
                </p>

                <p className="mt-2 text-white/50">
                  You needed 4 correct answers to win. Sharpen your skills and try again.
                </p>
              </div>
            )}

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <button
                onClick={playAgain}
                className="rounded-xl bg-blue-400 py-3 font-black text-black"
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
