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
};

export default function MathRushPage() {
  const [stake, setStake] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<{ id: string; answer: string }[]>([]);
  const [current, setCurrent] = useState(0);
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [timeLeft, setTimeLeft] = useState(45);

  async function startGame() {
    setMessage("");
    setTimeLeft(45);
    setLoading(true);

    const { data: auth } = await supabase.auth.getSession();
    const token = auth.session?.access_token;

    if (!token) {
      setMessage("Please log in to play.");
      setLoading(false);
      return;
    }

    const res = await fetch("/api/skill-games/math-rush/start", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ stake: Number(stake) }),
    });

    const data = await res.json();

    if (!res.ok) {
      setMessage(data.error || "Could not start game.");
      setLoading(false);
      return;
    }

    setSessionId(data.sessionId);
    setQuestions(data.questions || []);
    setAnswers([]);
    setCurrent(0);
    setResult(null);
    setTimeLeft(45);
    setLoading(false);
  }

  async function finishGame(finalAnswers: { id: string; answer: string }[]) {
    setLoading(true);

    const { data: auth } = await supabase.auth.getSession();
    const token = auth.session?.access_token;

    const res = await fetch("/api/skill-games/math-rush/finish", {
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

    const data = await res.json();

    if (!res.ok) {
      setMessage(data.error || "Could not finish game.");
      setLoading(false);
      return;
    }

    setResult(data);
    setLoading(false);
  }

  async function chooseAnswer(answer: string) {
    const q = questions[current];
    const nextAnswers = [...answers, { id: q.id, answer }];
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
    setTimeLeft(45);
  }


  const playing = questions.length > 0 && !result;
  const q = questions[current];

  useEffect(() => {
    if (!playing || result) return;

    const warning = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "Your active game may be lost if you leave.";
    };

    window.addEventListener("beforeunload", warning);

    return () => window.removeEventListener("beforeunload", warning);
  }, [playing, result]);

  useEffect(() => {
    if (!playing || result || loading) return;

    if (timeLeft <= 0) {
      void finishGame(answers);
      return;
    }

    const timer = setTimeout(() => {
      setTimeLeft((t) => t - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [playing, result, loading, timeLeft, answers]);


  const payout = Number(stake || 0) * 2;

  return (
    <main className="flex min-h-screen items-center justify-center bg-black px-4 py-6 text-white">
      <div className="w-full max-w-xl rounded-3xl border border-blue-400/20 bg-white/5 p-5 text-center shadow-2xl sm:p-6">

        <div className="mb-6">
          <RewardsCard />
        </div>
        <div className="text-5xl">➗</div>

        <h1 className="mt-3 text-3xl font-black text-blue-400">
          Math Rush
        </h1>

        <p className="mt-2 text-sm text-white/60">
          Solve at least 8 out of 10 math challenges correctly to win a 2x prize.
        </p>

        {message && (
          <p className="mt-4 rounded-xl border border-red-400/30 bg-red-500/10 p-3 text-red-300">
            {message}
          </p>
        )}

        {!playing && !result && (
          <div className="mt-6">
            <div className="mb-5 rounded-2xl border border-white/10 bg-white/5 p-4 text-left">
              <p className="font-black text-white">
                📋 How to Play
              </p>

              <p className="mt-2 text-sm leading-6 text-white/70">
                Solve the math questions before time runs out. Get at least 8 answers correct to win.
              </p>
            </div>

            <div className="mb-5 rounded-2xl border border-pink-500/20 bg-pink-500/10 p-4 text-left">
              <p className="font-black text-pink-400">
                🏆 Prize Information
              </p>

              <p className="mt-2 text-sm leading-6 text-white/70">
                A minimum entry fee of GH₵7 is required to play. You may enter
                GH₵7 or any higher amount. Complete the challenge successfully
                to win a prize equal to 2x your entry fee.
              </p>
            </div>

            <input
              type="number"
              min="7"
                            value={stake}
              onChange={(e) => setStake(e.target.value)}
              placeholder="Enter entry fee GH₵7 or above"
              className="w-full rounded-xl border border-white/10 bg-black p-4 text-center text-xl font-bold outline-none focus:border-blue-400"
            />

            {Number(stake) > 0 && (
              <div className="mt-4 rounded-xl bg-pink-500/10 p-3 text-green-300">
                Entry Fee GH₵{Number(stake).toFixed(2)} → Prize GH₵{payout.toFixed(2)}
              </div>
            )}

            <button
              onClick={() => void startGame()}
              disabled={loading || !stake || Number(stake) < 7}
              className="mt-5 w-full rounded-xl bg-blue-400 py-4 font-black text-black disabled:opacity-40"
            >
              {loading ? "Starting..." : "Start Real Game"}
            </button>

            <p className="mt-3 text-xs text-white/40">
              Your entry fee is deducted from your wallet when the game starts.
            </p>
          </div>
        )}

        {playing && q && (
          <div className="mt-6">
            <div className="flex justify-between text-sm text-white/50">
              <span>Question {current + 1}/{questions.length}</span>
              <span className={timeLeft <= 20 ? "text-red-300" : "text-blue-300"}>
                Time: {timeLeft}s
              </span>
            </div>

            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full bg-blue-400 transition-all"
                style={{ width: `${((current + 1) / questions.length) * 100}%` }}
              />
            </div>

            <h2 className="mt-6 text-2xl font-black leading-snug">
              {q.question}
            </h2>

            <div className="mt-6 grid gap-3">
              {q.options.map((option) => (
                <button
                  key={option}
                  disabled={loading}
                  onClick={() => void chooseAnswer(option)}
                  className="rounded-xl border border-white/10 bg-black/60 p-4 font-bold transition hover:border-blue-400 hover:bg-blue-400/10 disabled:opacity-50"
                >
                  {option}
                </button>
              ))}
            </div>

            {loading && (
              <p className="mt-4 text-sm text-blue-300">
                Checking result securely...
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
                  Congratulations!
                </h2>
                <p className="mt-3">
                  You scored {result.score}/{result.total}.
                </p>
                <p className="mt-3 text-xl font-black text-green-300">
                  You won GH₵{Number(result.payout).toFixed(2)}
                </p>
              </div>
            ) : (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <div className="text-5xl">🎮</div>
                <h2 className="mt-3 text-2xl font-black">
                  Good Attempt
                </h2>
                <p className="mt-3 text-white/70">
                  You scored {result.score}/{result.total}.
                </p>
                <p className="mt-2 text-white/50">
                  You needed 8 correct answers to win. Sharpen your speed and try again.
                </p>
              </div>
            )}

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <button
                onClick={resetGame}
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
      </div>
    </main>
  );
}
