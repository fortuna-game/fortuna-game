"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Card = { id: string; symbol: string };
type Result = { score: number; total: number; won: boolean; payout: number };

export default function MemoryMatchPage() {
  const [stake, setStake] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [cards, setCards] = useState<Card[]>([]);
  const [revealed, setRevealed] = useState<Record<string, string>>({});
  const [flipped, setFlipped] = useState<string[]>([]);
  const [matched, setMatched] = useState<string[]>([]);
  const [moves, setMoves] = useState<[string, string][]>([]);
  const [maxMoves, setMaxMoves] = useState(10);
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [timeLeft, setTimeLeft] = useState(75);

  async function startGame() {
    setLoading(true);
    setMessage("");

    const { data: auth } = await supabase.auth.getSession();
    const token = auth.session?.access_token;

    const res = await fetch("/api/skill-games/memory-match/secure-start", {
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
    setCards(data.cards || []);
    setMaxMoves(data.maxMoves || 10);
    setRevealed({});
    setFlipped([]);
    setMatched([]);
    setMoves([]);
    setResult(null);
    setTimeLeft(75);
    setLoading(false);
  }

  async function finishGame(finalMoves: [string, string][]) {
    setLoading(true);

    const { data: auth } = await supabase.auth.getSession();
    const token = auth.session?.access_token;

    const res = await fetch("/api/skill-games/memory-match/secure-finish", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ sessionId, moves: finalMoves }),
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

  function finishNow(finalMoves: [string, string][]) {
    void finishGame(finalMoves);
  }

  function flipCard(id: string) {
    if (loading || result || matched.includes(id) || flipped.includes(id)) return;
    if (flipped.length >= 2) return;

    const next = [...flipped, id];
    setFlipped(next);

    if (next.length === 2) {
      const pair: [string, string] = [next[0], next[1]];
      const nextMoves = [...moves, pair];
      setMoves(nextMoves);

      setTimeout(() => {
        const first = cards.find((c) => c.id === pair[0]);
        const second = cards.find((c) => c.id === pair[1]);

        if (first && second && first.symbol === second.symbol) {
          const nextMatched = [...matched, pair[0], pair[1]];
          setMatched(nextMatched);

          if (nextMatched.length === cards.length) {
            finishNow(nextMoves);
            return;
          }
        }

        setFlipped([]);

        if (nextMoves.length >= maxMoves) {
          finishNow(nextMoves);
        }
      }, 700);
    }
  }

  function resetGame() {
    setStake("");
    setSessionId("");
    setCards([]);
    setRevealed({});
    setFlipped([]);
    setMatched([]);
    setMoves([]);
    setResult(null);
    setMessage("");
    setTimeLeft(75);
  }


  const playing = cards.length > 0 && !result;

  useEffect(() => {
    if (!playing) return;

    const warning = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", warning);
    return () => window.removeEventListener("beforeunload", warning);
  }, [playing]);

  useEffect(() => {
    if (!playing || loading) return;

    if (timeLeft <= 0) {
      void finishGame(moves);
      return;
    }

    const timer = window.setTimeout(() => {
      setTimeLeft((value) => value - 1);
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [playing, loading, timeLeft, moves]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-black px-4 py-6 text-white">
      <div className="w-full max-w-xl rounded-3xl border border-yellow-400/20 bg-white/5 p-5 text-center">
        <div className="text-5xl">🧠</div>
        <h1 className="mt-3 text-3xl font-black text-yellow-400">Memory Match</h1>
        <p className="mt-2 text-sm text-white/60">
          Match all hidden pairs within {maxMoves} moves.
        </p>

        {message && <div className="mt-4 rounded-xl bg-red-500/10 p-3 text-red-300">{message}</div>}

        {!cards.length && !result && (
          <div className="mt-6">
            <input
              type="number"
              min="1"
              max="50"
              value={stake}
              onChange={(e) => setStake(e.target.value)}
              placeholder="Enter stake amount"
              className="w-full rounded-xl border border-white/10 bg-black p-4 text-center text-xl font-bold"
            />

            <button
              onClick={() => void startGame()}
              disabled={loading || !stake || Number(stake) < 1}
              className="mt-5 w-full rounded-xl bg-yellow-400 py-4 font-black text-black disabled:opacity-40"
            >
              {loading ? "Starting..." : "Start Memory Match"}
            </button>
          </div>
        )}

        {cards.length > 0 && !result && (
          <div className="mt-6">
            <div className="flex justify-between text-sm text-white/60">
              <span>Moves: {moves.length}/{maxMoves}</span>
              <span className={timeLeft <= 10 ? "text-red-400" : "text-yellow-400"}>
                ⏱ {timeLeft}s
              </span>
            </div>

            <div className="mt-5 grid grid-cols-4 gap-3">
              {cards.map((card) => {
                const open = flipped.includes(card.id) || matched.includes(card.id);
                return (
                  <button
                    key={card.id}
                    onClick={() => flipCard(card.id)}
                    className="flex aspect-square items-center justify-center rounded-2xl border border-yellow-400/20 bg-black text-3xl font-black"
                  >
                    {open ? card.symbol : "?"}
                  </button>
                );
              })}
            </div>

            <p className="mt-4 text-xs text-white/40">
              Secure mode: result is checked by server.
            </p>
          </div>
        )}

        {result && (
          <div className="mt-6">
            <div className={result.won ? "rounded-2xl bg-green-500/10 p-6 text-green-300" : "rounded-2xl bg-white/5 p-6 text-white/70"}>
              <div className="text-5xl">{result.won ? "🏆" : "🎯"}</div>
              <h2 className="mt-3 text-2xl font-black">
                {result.won ? "Excellent Memory!" : "Challenge Complete"}
              </h2>
              <p className="mt-3">Score: {result.score}/{result.total}</p>
              {result.won && <p className="mt-3 font-black">You won GH₵{Number(result.payout).toFixed(2)}</p>}
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <button onClick={resetGame} className="rounded-xl bg-yellow-400 py-3 font-black text-black">
                Play Again
              </button>
              <Link href="/skill-games" className="rounded-xl border border-white/10 bg-white/5 py-3 font-bold">
                All Games
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
