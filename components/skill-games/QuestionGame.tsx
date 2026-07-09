"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import RewardsCard from "@/components/RewardsCard";

type Question = {
  id: string;
  question: string;
  options: string[];
};

type Result = {
  score: number;
  total: number;
  won: boolean;
  payout: number;
  gameName: string;
};

type Props = {
  slug: string;
  name: string;
  icon: string;
  description: string;
  seconds?: number;
};

export default function QuestionGame({
  slug,
  name,
  icon,
  description,
  seconds = 30,
}: Props) {
  const [stake, setStake] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<{ id: string; answer: string }[]>([]);
  const [current, setCurrent] = useState(0);
  const [minScore, setMinScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(seconds);
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const playing = questions.length > 0 && !result;
  const question = questions[current];

  async function startGame() {
    setLoading(true);
    setMessage("");

    const { data: auth } = await supabase.auth.getSession();
    const token = auth.session?.access_token;

    if (!token) {
      setMessage("Please log in to play.");
      setLoading(false);
      return;
    }

    const response = await fetch("/api/skill-games/question/start", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        gameSlug: slug,
        stake: Number(stake),
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      setMessage(data.error || "Could not start game.");
      setLoading(false);
      return;
    }

    setSessionId(data.sessionId);
    setQuestions(data.questions || []);
    setMinScore(data.minScore);
    setAnswers([]);
    setCurrent(0);
    setResult(null);
    setTimeLeft(seconds);
    setLoading(false);
  }

  async function finishGame(
    finalAnswers: { id: string; answer: string }[]
  ) {
    if (loading) return;

    setLoading(true);

    const { data: auth } = await supabase.auth.getSession();
    const token = auth.session?.access_token;

    const response = await fetch("/api/skill-games/question/finish", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        sessionId,
        answers: finalAnswers,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      setMessage(data.error || "Could not finish game.");
      setLoading(false);
      return;
    }

    setResult(data);
    setLoading(false);
  }

  async function chooseAnswer(answer: string) {
    if (!question || loading) return;

    const nextAnswers = [
      ...answers,
      {
        id: question.id,
        answer,
      },
    ];

    setAnswers(nextAnswers);

    if (current + 1 < questions.length) {
      setCurrent((value) => value + 1);
      return;
    }

    await finishGame(nextAnswers);
  }

  function resetGame() {
    setStake("");
    setSessionId("");
    setQuestions([]);
    setAnswers([]);
    setCurrent(0);
    setResult(null);
    setMessage("");
    setTimeLeft(seconds);
  }

  useEffect(() => {
    if (!playing) return;

    const warning = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", warning);

    return () => {
      window.removeEventListener("beforeunload", warning);
    };
  }, [playing]);

  useEffect(() => {
    if (!playing || loading) return;

    if (timeLeft <= 0) {
      void finishGame(answers);
      return;
    }

    const timer = window.setTimeout(() => {
      setTimeLeft((value) => value - 1);
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [playing, loading, timeLeft, answers]);

  const payout = Number(stake || 0) * 2;

  return (
    <>
      <div className="mx-auto max-w-5xl px-4 pt-6 sm:px-6">
        <RewardsCard />
      </div>
    <main className="flex min-h-screen items-center justify-center bg-black px-4 py-6 text-white">
      <div className="w-full max-w-xl rounded-3xl border border-pink-500/20 bg-white/5 p-5 text-center shadow-2xl sm:p-7">
        <div className="text-5xl">{icon}</div>

        <h1 className="mt-3 text-3xl font-black text-pink-500">
          {name}
        </h1>

        <p className="mt-2 text-sm text-white/60">
          {description}
        </p>

        {message && (
          <div className="mt-4 rounded-xl border border-red-400/20 bg-red-500/10 p-3 text-sm text-red-300">
            {message}
          </div>
        )}

        {!playing && !result && (
          <div className="mt-6">
            <div className="mb-5 rounded-2xl border border-white/10 bg-white/5 p-4 text-left">
              <p className="font-black text-white">
                📋 How to Play
              </p>

              <p className="mt-2 text-sm leading-6 text-white/70">
                Answer the questions before time runs out. Get at least{" "}
                <span className="font-black text-pink-400">
                  {minScore}
                </span>{" "}
                answers correct to win.
              </p>
            </div>

            <div className="mb-5 rounded-2xl border border-pink-500/20 bg-pink-500/10 p-4 text-left">
              <p className="font-black text-pink-400">
                🏆 Prize Information
              </p>

              <p className="mt-2 text-sm leading-6 text-white/70">
                Choose an entry fee from GH₵7 to GH₵50. Complete the
                challenge successfully to win a prize equal to 2x your
                entry fee.
              </p>
            </div>

            <input
              type="number"
              min="7"
              max="50"
              value={stake}
              onChange={(event) => setStake(event.target.value)}
              placeholder="Enter entry fee (minimum GH₵7)"
              className="w-full rounded-xl border border-white/10 bg-black p-4 text-center text-xl font-bold outline-none focus:border-pink-500"
            />

            {Number(stake) > 0 && (
              <div className="mt-4 rounded-xl bg-pink-500/10 p-3 font-bold text-green-300">
                Entry Fee GH₵{Number(stake).toFixed(2)} → Prize GH₵
                {payout.toFixed(2)}
              </div>
            )}

            <button
              onClick={() => void startGame()}
              disabled={
                loading ||
                !stake ||
                Number(stake) < 7 ||
                Number(stake) > 50
              }
              className="mt-5 w-full rounded-xl bg-pink-500 py-4 font-black text-black disabled:opacity-40"
            >
              {loading ? "Starting..." : "Play Now"}
            </button>

            <p className="mt-3 text-xs text-white/40">
              Your entry fee is deducted when the game starts.
            </p>
          </div>
        )}

        {playing && question && (
          <div className="mt-6">
            <div className="flex items-center justify-between text-sm font-bold">
              <span className="text-white/60">
                {current + 1}/{questions.length}
              </span>

              <span
                className={
                  timeLeft <= 10 ? "text-red-400" : "text-pink-500"
                }
              >
                ⏱ {timeLeft}s
              </span>
            </div>

            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full bg-pink-500 transition-all duration-300"
                style={{
                  width: `${((current + 1) / questions.length) * 100}%`,
                }}
              />
            </div>

            <h2 className="mt-7 text-2xl font-black leading-snug">
              {question.question}
            </h2>

            <div className="mt-6 grid gap-3">
              {question.options.map((option) => (
                <button
                  key={option}
                  onClick={() => void chooseAnswer(option)}
                  disabled={loading}
                  className="rounded-xl border border-white/10 bg-black/60 p-4 font-bold transition hover:border-pink-500 hover:bg-pink-500/10 active:scale-[0.98] disabled:opacity-50"
                >
                  {option}
                </button>
              ))}
            </div>

            {loading && (
              <p className="mt-4 text-sm font-bold text-pink-400">
                Checking your result...
              </p>
            )}
          </div>
        )}

        {result && (
          <div className="mt-6">
            {result.won ? (
              <div className="rounded-2xl border border-pink-400/30 bg-pink-500/10 p-6">
                <div className="text-5xl">🏆</div>

                <h2 className="mt-3 text-3xl font-black text-pink-400">
                  Excellent Performance!
                </h2>

                <p className="mt-3">
                  Score: {result.score}/{result.total}
                </p>

                <p className="mt-3 text-xl font-black text-green-300">
                  You won GH₵{Number(result.payout).toFixed(2)}
                </p>
              </div>
            ) : (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <div className="text-5xl">🎯</div>

                <h2 className="mt-3 text-2xl font-black">
                  Challenge Complete
                </h2>

                <p className="mt-3 text-white/70">
                  You scored {result.score}/{result.total}.
                </p>

                <p className="mt-2 text-white/50">
                  The target was {minScore} correct answers. Build your skill
                  and challenge yourself again.
                </p>
              </div>
            )}

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <button
                onClick={resetGame}
                className="rounded-xl bg-pink-500 py-3 font-black text-black"
              >
                Play Again
              </button>

              <Link
                href="/skill-games"
                className="rounded-xl border border-white/10 bg-white/5 py-3 font-bold"
              >
                All Games
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
    </>
  );
}
