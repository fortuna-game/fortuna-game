"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import RewardsCard from "@/components/RewardsCard";

type Result = { score: number; total: number; won: boolean; payout: number };

export default function StackBalancePage() {
  const [stake, setStake] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [started, setStarted] = useState(false);
  const [position, setPosition] = useState(50);
  const [direction, setDirection] = useState(1);
  const [placements, setPlacements] = useState<number[]>([]);
  const [targetBlocks, setTargetBlocks] = useState(10);
  const [timeLeft, setTimeLeft] = useState(60);
  const [result, setResult] = useState<Result | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const playing = started && !result;

  async function startGame() {
    setLoading(true);
    setMessage("");

    const { data: auth } = await supabase.auth.getSession();
    const token = auth.session?.access_token;

    const res = await fetch("/api/skill-games/stack-balance/secure-start", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ stake: Number(stake) }),
    });

    const data = await res.json();

    if (!res.ok) {
      setMessage(data.error || "Could not start game.");
      setLoading(false);
      return;
    }

    setSessionId(data.sessionId);
    setTargetBlocks(data.challenge?.targetBlocks || 10);
    setTimeLeft(data.challenge?.timeLimit || 45);
    setPlacements([]);
    setPosition(50);
    setDirection(1);
    setResult(null);
    setStarted(true);
    setLoading(false);
  }

  async function finishGame(finalPlacements: number[]) {
    if (loading || result) return;
    setLoading(true);

    const { data: auth } = await supabase.auth.getSession();
    const token = auth.session?.access_token;

    const res = await fetch("/api/skill-games/stack-balance/secure-finish", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ sessionId, placements: finalPlacements }),
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

  function dropBlock() {
    if (!playing || loading) return;

    const next = [...placements, position];
    setPlacements(next);

    if (next.length >= targetBlocks) {
      void finishGame(next);
    }
  }

  function resetGame() {
    setStake("");
    setSessionId("");
    setStarted(false);
    setPosition(50);
    setDirection(1);
    setPlacements([]);
    setResult(null);
    setMessage("");
    setTimeLeft(60);
  }

  useEffect(() => {
    if (!playing) return;

    const timer = window.setInterval(() => {
      setPosition((current) => {
        let next = current + direction * 7;

        if (next >= 94) {
          setDirection(-1);
          next = 94;
        }

        if (next <= 6) {
          setDirection(1);
          next = 6;
        }

        return next;
      });
    }, 35);

    return () => window.clearInterval(timer);
  }, [playing, direction]);

  useEffect(() => {
    if (!playing || loading) return;

    if (timeLeft <= 0) {
      void finishGame(placements);
      return;
    }

    const timer = window.setTimeout(() => setTimeLeft((v) => v - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [playing, loading, timeLeft, placements]);

  useEffect(() => {
    if (!playing) return;

    const warning = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", warning);
    return () => window.removeEventListener("beforeunload", warning);
  }, [playing]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-black px-4 py-6 text-white">
      <div className="w-full max-w-xl rounded-3xl border border-amber-400/20 bg-white/5 p-5 text-center">

        <div className="mb-6">
          <RewardsCard />
        </div>
        <div className="text-5xl">📦</div>
        <h1 className="mt-3 text-3xl font-black text-amber-400">Stack Balance</h1>
        <p className="mt-2 text-sm text-white/60">Drop moving blocks carefully. Build {targetBlocks} stable blocks to win.</p>

        {message && <div className="mt-4 rounded-xl bg-red-500/10 p-3 text-red-300">{message}</div>}

        {!started && !result && (
          <div className="mt-6">
            <div className="mb-5 rounded-2xl border border-white/10 bg-white/5 p-4 text-left">
              <p className="font-black text-white">
                📋 How to Play
              </p>

              <p className="mt-2 text-sm leading-6 text-white/70">
                Drop each moving block carefully and keep the stack balanced. Successfully stack all 10 blocks to win.
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
              className="w-full rounded-xl border border-white/10 bg-black p-4 text-center text-xl font-bold"
            />

            <button
              onClick={() => void startGame()}
              disabled={loading || !stake || Number(stake) < 7}
              className="mt-5 w-full rounded-xl bg-amber-400 py-4 font-black text-black disabled:opacity-40"
            >
              {loading ? "Starting..." : "Start Now"}
            </button>
          </div>
        )}

        {playing && (
          <div className="mt-6">
            <div className="flex justify-between text-sm text-white/60">
              <span>Blocks: {placements.length}/{targetBlocks}</span>
              <span className={timeLeft <= 10 ? "text-red-400" : "text-amber-400"}>⏱ {timeLeft}s</span>
            </div>

            <div className="relative mt-5 h-80 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-slate-900 to-black">
              <div
                className="absolute top-8 h-10 w-28 -translate-x-1/2 rounded-xl bg-amber-400 shadow-lg"
                style={{ left: `${position}%` }}
              />

              <div className="absolute bottom-5 left-0 right-0 flex flex-col-reverse items-center">
                {placements.map((drop, index) => (
                  <div
                    key={index}
                    className="h-8 w-28 rounded-lg border border-black bg-amber-500"
                    style={{ marginLeft: `${drop - 50}%` }}
                  />
                ))}
              </div>
            </div>

            <button
              onClick={dropBlock}
              disabled={loading}
              className="mt-5 w-full rounded-xl bg-amber-400 py-4 font-black text-black disabled:opacity-40"
            >
              {loading ? "Checking..." : "Drop Block"}
            </button>
          </div>
        )}

        {result && (
          <div className="mt-6">
            <div className={result.won ? "rounded-2xl bg-pink-500/10 p-6 text-green-300" : "rounded-2xl bg-white/5 p-6 text-white/70"}>
              <div className="text-5xl">{result.won ? "🏆" : "📦"}</div>
              <h2 className="mt-3 text-2xl font-black">{result.won ? "Perfect Stack!" : "Stack Collapsed"}</h2>
              <p className="mt-3">Score: {result.score}/{result.total}</p>
              {result.won && <p className="mt-3 font-black">You won GH₵{Number(result.payout).toFixed(2)}</p>}
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <button onClick={resetGame} className="rounded-xl bg-amber-400 py-3 font-black text-black">Play Again</button>
              <Link href="/skill-games" className="rounded-xl border border-white/10 bg-white/5 py-3 font-bold">All Games</Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
