"use client";

import { useState } from "react";
import Link from "next/link";

const puzzles = [
  { scrambled: "HNAGA", answer: "GHANA", hint: "A country in West Africa" },
  { scrambled: "ONMEY", answer: "MONEY", hint: "Used to buy goods and services" },
  { scrambled: "EAMG", answer: "GAME", hint: "Something people play" },
  { scrambled: "NWI", answer: "WIN", hint: "The opposite of lose" },
  { scrambled: "LILKS", answer: "SKILL", hint: "Ability gained through practice" },
];

export default function WordPuzzlePreview() {
  const [stake, setStake] = useState("");
  const [started, setStarted] = useState(false);
  const [current, setCurrent] = useState(0);
  const [answer, setAnswer] = useState("");
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [feedback, setFeedback] = useState("");

  const payout = Number(stake || 0) * 2;
  const won = score >= 4;

  function startGame() {
    if (!stake || Number(stake) <= 0) return;

    setStarted(true);
    setCurrent(0);
    setScore(0);
    setAnswer("");
    setFinished(false);
    setFeedback("");
  }

  function submitAnswer() {
    if (!answer.trim()) return;

    const correct =
      answer.trim().toUpperCase() === puzzles[current].answer;

    const newScore = correct ? score + 1 : score;

    setScore(newScore);
    setFeedback(correct ? "Correct! ✓" : "Not correct");

    setTimeout(() => {
      setFeedback("");
      setAnswer("");

      if (current + 1 >= puzzles.length) {
        setFinished(true);
      } else {
        setCurrent((value) => value + 1);
      }
    }, 700);
  }

  function playAgain() {
    setStake("");
    setStarted(false);
    setCurrent(0);
    setScore(0);
    setAnswer("");
    setFinished(false);
    setFeedback("");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-black px-4 py-6 text-white">
      <div className="w-full max-w-xl rounded-3xl border border-purple-400/20 bg-white/5 p-6 text-center">
        <div className="text-5xl">🔤</div>

        <h1 className="mt-3 text-3xl font-black text-purple-400">
          Word Puzzle
        </h1>

        <p className="mt-2 text-sm text-white/60">
          Unscramble at least 4 out of 5 words correctly to win.
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
              className="mt-3 w-full rounded-xl border border-white/10 bg-black p-4 text-center text-xl font-bold outline-none focus:border-purple-400"
            />

            {Number(stake) > 0 && (
              <div className="mt-4 rounded-xl bg-green-500/10 p-3 text-green-300">
                Win this game and receive GH₵{payout.toFixed(2)} total payout.
              </div>
            )}

            <button
              onClick={startGame}
              disabled={!stake || Number(stake) <= 0}
              className="mt-5 w-full rounded-xl bg-purple-400 py-4 font-black text-black disabled:opacity-40"
            >
              Start Word Puzzle
            </button>
          </div>
        )}

        {started && !finished && (
          <div className="mt-6">
            <div className="flex justify-between text-sm text-white/50">
              <span>
                Word {current + 1} of {puzzles.length}
              </span>

              <span>Score: {score}</span>
            </div>

            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full bg-purple-400 transition-all"
                style={{
                  width: `${((current + 1) / puzzles.length) * 100}%`,
                }}
              />
            </div>

            <p className="mt-7 text-sm uppercase tracking-widest text-white/40">
              Unscramble This Word
            </p>

            <div className="mt-4 flex justify-center gap-2">
              {puzzles[current].scrambled.split("").map((letter, index) => (
                <div
                  key={`${letter}-${index}`}
                  className="flex h-14 w-12 items-center justify-center rounded-xl border border-purple-400/30 bg-purple-500/10 text-2xl font-black text-purple-300"
                >
                  {letter}
                </div>
              ))}
            </div>

            <p className="mt-5 text-sm text-yellow-300">
              Hint: {puzzles[current].hint}
            </p>

            <input
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") submitAnswer();
              }}
              placeholder="Type your answer"
              className="mt-5 w-full rounded-xl border border-white/10 bg-black p-4 text-center text-xl font-black uppercase outline-none focus:border-purple-400"
            />

            {feedback && (
              <p
                className={
                  feedback.includes("Correct")
                    ? "mt-3 font-bold text-green-400"
                    : "mt-3 font-bold text-red-300"
                }
              >
                {feedback}
              </p>
            )}

            <button
              onClick={submitAnswer}
              disabled={!answer.trim() || Boolean(feedback)}
              className="mt-4 w-full rounded-xl bg-purple-400 py-4 font-black text-black disabled:opacity-40"
            >
              Submit Answer
            </button>
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
                  You solved {score}/{puzzles.length} words correctly.
                </p>

                <p className="mt-3 text-xl font-black text-green-300">
                  You won GH₵{payout.toFixed(2)}
                </p>
              </div>
            ) : (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <div className="text-5xl">🔤</div>

                <h2 className="mt-3 text-2xl font-black">
                  Puzzle Complete
                </h2>

                <p className="mt-3 text-white/70">
                  You solved {score}/{puzzles.length} words correctly.
                </p>

                <p className="mt-2 text-white/50">
                  You needed 4 correct answers to win. Build your word skills and try again.
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
