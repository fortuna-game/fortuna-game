"use client";

import { useState } from "react";
import Link from "next/link";

const challenges = [
  { word: "RED", display: "text-blue-500", answer: "BLUE" },
  { word: "GREEN", display: "text-red-500", answer: "RED" },
  { word: "BLUE", display: "text-yellow-400", answer: "YELLOW" },
  { word: "YELLOW", display: "text-green-500", answer: "GREEN" },
  { word: "PURPLE", display: "text-red-500", answer: "RED" },
  { word: "BLUE", display: "text-green-500", answer: "GREEN" },
  { word: "RED", display: "text-yellow-400", answer: "YELLOW" },
  { word: "GREEN", display: "text-blue-500", answer: "BLUE" },
];

const choices = ["RED", "BLUE", "GREEN", "YELLOW"];

export default function ColorClashPreview() {
  const [stake, setStake] = useState("");
  const [started, setStarted] = useState(false);
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [finished, setFinished] = useState(false);

  const payout = Number(stake || 0) * 2;
  const won = score >= 7;

  function startGame() {
    if (!stake || Number(stake) <= 0) return;

    setStarted(true);
    setCurrent(0);
    setScore(0);
    setSelected(null);
    setFinished(false);
  }

  function chooseColor(color: string) {
    if (selected !== null) return;

    setSelected(color);

    const correct = color === challenges[current].answer;
    const newScore = correct ? score + 1 : score;

    setScore(newScore);

    setTimeout(() => {
      if (current + 1 >= challenges.length) {
        setFinished(true);
      } else {
        setCurrent((value) => value + 1);
        setSelected(null);
      }
    }, 450);
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
      <div className="w-full max-w-xl rounded-3xl border border-purple-400/20 bg-white/5 p-6 text-center">

        <div className="text-5xl">🎨</div>

        <h1 className="mt-3 text-3xl font-black text-purple-400">
          Color Clash
        </h1>

        <p className="mt-2 text-sm text-white/60">
          Ignore what the word says. Choose the actual color you see.
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
              className="w-full rounded-xl border border-white/10 bg-black p-4 text-center text-xl font-bold outline-none focus:border-purple-400"
            />

            {Number(stake) > 0 && (
              <div className="mt-4 rounded-xl bg-green-500/10 p-3 text-green-300">
                Win and receive GH₵{payout.toFixed(2)} total payout.
              </div>
            )}

            <button
              onClick={startGame}
              disabled={!stake || Number(stake) <= 0}
              className="mt-5 w-full rounded-xl bg-purple-400 py-4 font-black text-black disabled:opacity-40"
            >
              Start Color Clash
            </button>
          </div>
        )}

        {started && !finished && (
          <div className="mt-6">

            <div className="flex justify-between text-sm text-white/50">
              <span>
                Round {current + 1}/{challenges.length}
              </span>

              <span>Score: {score}</span>
            </div>

            <div className="mt-8 rounded-3xl border border-white/10 bg-black p-10">
              <p className="text-xs font-bold uppercase tracking-widest text-white/30">
                Choose The Display Color
              </p>

              <h2
                className={`mt-8 text-6xl font-black ${challenges[current].display}`}
              >
                {challenges[current].word}
              </h2>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              {choices.map((choice) => {
                const correct =
                  selected !== null &&
                  choice === challenges[current].answer;

                const wrong =
                  selected === choice &&
                  choice !== challenges[current].answer;

                return (
                  <button
                    key={choice}
                    onClick={() => chooseColor(choice)}
                    disabled={selected !== null}
                    className={`rounded-2xl border p-5 text-lg font-black transition ${
                      correct
                        ? "border-green-400 bg-green-500/20 text-green-300"
                        : wrong
                        ? "border-red-400 bg-red-500/20 text-red-300"
                        : "border-white/10 bg-black/60 hover:border-purple-400"
                    }`}
                  >
                    {choice}
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
                  You scored {score}/{challenges.length}.
                </p>

                <p className="mt-3 text-xl font-black text-green-300">
                  You won GH₵{payout.toFixed(2)}
                </p>
              </div>
            ) : (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <div className="text-5xl">🎨</div>

                <h2 className="mt-3 text-2xl font-black">
                  Clash Complete
                </h2>

                <p className="mt-3 text-white/70">
                  You scored {score}/{challenges.length}.
                </p>

                <p className="mt-2 text-white/50">
                  Your eyes and brain disagreed this time. Stay focused and try again.
                </p>
              </div>
            )}

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <button
                onClick={playAgain}
                className="rounded-xl bg-purple-400 py-3 font-black text-black"
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
