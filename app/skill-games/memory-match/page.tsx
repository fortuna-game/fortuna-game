"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import RewardsCard from "@/components/RewardsCard";

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
  const [maxMoves, setMaxMoves] = useState(18);
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
    <main className="flex min-h-screen items-center justify-center bg-[#071A33] px-4 py-6 text-white">
      <div className="w-full max-w-xl rounded-3xl border border-[#2A5688] bg-[#0B2545]/70 p-5 text-center">

        <div className="mb-6">
          <RewardsCard />
        </div>
        <div className="text-5xl">🧠</div>
        <h1 className="mt-3 text-3xl font-black text-[#4D94F5]">Memory Match</h1>
        <p className="mt-2 text-sm text-[#9AAAC1]">
          Match all hidden pairs within {maxMoves} moves.
        </p>

        {message && <div className="mt-4 rounded-xl bg-red-500/10 p-3 text-red-300">{message}</div>}

        {!cards.length && !result && (
          <div className="mt-6">
            <div className="mb-5 rounded-2xl border border-[#38BDF8]/15 bg-[#0B2545]/70 p-4 text-left">
              <p className="font-black text-white">
                📋 How to Play
              </p>

              <p className="mt-2 text-sm leading-6 text-[#B4C0D1]">
                Flip the cards and find all 8 matching pairs. Complete the challenge within 18 moves to win.
              </p>
            </div>

            <div className="mb-5 rounded-2xl border border-[#2A5688] bg-[#3F82DD]/10 p-4 text-left">
              <p className="font-black text-[#66A7FF]">
                🏆 Prize Information
              </p>

              <p className="mt-2 text-sm leading-6 text-[#B4C0D1]">
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
              className="w-full rounded-xl border border-[#38BDF8]/15 bg-[#071A33] p-4 text-center text-xl font-bold"
            />

            {Number(stake) > 0 && (
              <div className="rounded-xl border border-green-400/20 bg-green-500/10 p-3 text-center font-black text-green-300">
                Entry Fee GH₵{Number(stake).toFixed(2)} → Possible Win GH₵{(
                  Number(stake) * 2
                ).toFixed(2)}
              </div>
            )}

            <button
              onClick={() => void startGame()}
              disabled={loading || !stake || Number(stake) < 7}
              className="mt-5 w-full rounded-xl bg-[#3F82DD] py-4 font-black text-black disabled:opacity-40"
            >
              {loading ? "Starting..." : "Start Now"}
            </button>
          </div>
        )}

        {cards.length > 0 && !result && (
          <div className="mt-6">
            <div className="flex justify-between text-sm text-[#9AAAC1]">
              <span>Moves: {moves.length}/{maxMoves}</span>
              <span className={timeLeft <= 10 ? "text-red-400" : "text-[#4D94F5]"}>
                ⏱ {timeLeft}s
              </span>
            </div>

            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {cards.map((card) => {
                const open = flipped.includes(card.id) || matched.includes(card.id);
                return (
                  <button
                    key={card.id}
                    onClick={() => flipCard(card.id)}
                    className="flex aspect-square items-center justify-center rounded-2xl border border-[#2A5688] bg-[#071A33] text-3xl font-black"
                  >
                    {open ? card.symbol : "?"}
                  </button>
                );
              })}
            </div>

            <p className="mt-4 text-xs text-[#7185A3]">
              Secure mode: result is checked by server.
            </p>
          </div>
        )}

        {result && (
          <div className="mt-6">
            <div className={result.won ? "rounded-2xl bg-[#3F82DD]/10 p-6 text-green-300" : "rounded-2xl bg-[#0B2545]/70 p-6 text-[#B4C0D1]"}>
              <div className="text-5xl">{result.won ? "🏆" : "🎯"}</div>
              <h2 className="mt-3 text-2xl font-black">
                {result.won ? "Excellent Memory!" : "Challenge Complete"}
              </h2>
              <p className="mt-3">Score: {result.score}/{result.total}</p>
              {result.won && <p className="mt-3 font-black">You won GH₵{Number(result.payout).toFixed(2)}</p>}
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <button onClick={resetGame} className="rounded-xl bg-[#3F82DD] py-3 font-black text-black">
                Play Again
              </button>
              <Link href="/skill-games" className="rounded-xl border border-[#38BDF8]/15 bg-[#0B2545]/70 py-3 font-bold">
                All Games
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
