"use client";

import { useState } from "react";
import Link from "next/link";

const questions = [
  {
    question: "What is the capital city of Ghana?",
    options: ["Kumasi", "Accra", "Takoradi", "Tamale"],
    answer: "Accra",
  },
  {
    question: "How many days are in one week?",
    options: ["5", "6", "7", "8"],
    answer: "7",
  },
  {
    question: "Which planet is known as the Red Planet?",
    options: ["Earth", "Venus", "Mars", "Jupiter"],
    answer: "Mars",
  },
  {
    question: "What is 12 × 5?",
    options: ["50", "55", "60", "65"],
    answer: "60",
  },
  {
    question: "Which ocean is the largest?",
    options: ["Atlantic", "Indian", "Pacific", "Arctic"],
    answer: "Pacific",
  },
];

export default function TriviaSprintPreview() {
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
      <div className="w-full max-w-xl rounded-3xl border border-yellow-400/20 bg-white/5 p-6 text-center">

        <div className="text-5xl">🧠</div>

        <h1 className="mt-3 text-3xl font-black text-yellow-400">
          Trivia Sprint
        </h1>

        <p className="mt-2 text-sm text-white/60">
          Answer at least 4 out of 5 questions correctly to win.
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
              className="mt-3 w-full rounded-xl border border-white/10 bg-black p-4 text-center text-xl font-bold outline-none focus:border-yellow-400"
            />

            {Number(stake) > 0 && (
              <div className="mt-4 rounded-xl bg-green-500/10 p-3 text-green-300">
                Win this game and receive GH₵{payout.toFixed(2)} total payout.
              </div>
            )}

            <button
              onClick={startGame}
              disabled={!stake || Number(stake) <= 0}
              className="mt-5 w-full rounded-xl bg-yellow-400 py-4 font-black text-black disabled:opacity-40"
            >
              Start Game
            </button>
          </div>
        )}

        {started && !finished && (
          <div className="mt-6">
            <div className="flex items-center justify-between text-sm text-white/50">
              <span>
                Question {current + 1} of {questions.length}
              </span>

              <span>
                Score: {score}
              </span>
            </div>

            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full bg-yellow-400 transition-all"
                style={{
                  width: `${((current + 1) / questions.length) * 100}%`,
                }}
              />
            </div>

            <h2 className="mt-6 text-2xl font-black">
              {questions[current].question}
            </h2>

            <div className="mt-6 grid gap-3">
              {questions[current].options.map((option) => (
                <button
                  key={option}
                  onClick={() => answerQuestion(option)}
                  className="rounded-xl border border-white/10 bg-black/60 p-4 font-bold transition hover:border-yellow-400 hover:bg-yellow-400/10"
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

                <p className="mt-3 text-white">
                  You scored {score}/{questions.length}.
                </p>

                <p className="mt-3 text-xl font-black text-green-300">
                  You won GH₵{payout.toFixed(2)}
                </p>
              </div>
            ) : (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <div className="text-5xl">🎮</div>

                <h2 className="mt-3 text-2xl font-black">
                  Good Attempt
                </h2>

                <p className="mt-3 text-white/70">
                  You scored {score}/{questions.length}.
                </p>

                <p className="mt-2 text-white/50">
                  You needed 4 correct answers to win. Try again and beat the challenge.
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
